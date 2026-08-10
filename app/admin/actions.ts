"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { createSession, destroySession, requireUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  articleSchema,
  loginSchema,
  productSchema,
  serviceSchema,
  testimonialSchema,
  workSchema,
} from "@/lib/schemas";
import { uploadImage } from "@/lib/upload";

/**
 * Toutes les actions renvoient la même forme, que les formulaires affichent
 * telle quelle via `useActionState`.
 */
export type ActionState = {
  error?: string;
  /** Erreurs par champ, pour les afficher au bon endroit. */
  fieldErrors?: Record<string, string>;
};

/* ------------------------------------------------------ Authentification --- */

export async function login(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Adresse e-mail ou mot de passe invalide." };
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });

  /* Message identique que l'e-mail existe ou non : sinon, le formulaire
     devient un moyen de découvrir les comptes valides. */
  const genericError = { error: "Adresse e-mail ou mot de passe incorrect." };
  if (!user) return genericError;

  const valid = await verifyPassword(parsed.data.password, user.password);
  if (!valid) return genericError;

  await createSession(user.id);

  const next = formData.get("suite");
  redirect(typeof next === "string" && next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/connexion");
}

/* ------------------------------------------------------------- Fabrique --- */

/** Chemins publics à rafraîchir après une écriture. */
const PUBLIC_PATHS = ["/", "/blog"];

type Collection = "service" | "work" | "product" | "article" | "testimonial";

const ADMIN_PATH: Record<Collection, string> = {
  service: "/admin/services",
  work: "/admin/realisations",
  product: "/admin/produits",
  article: "/admin/articles",
  testimonial: "/admin/temoignages",
};

function revalidateAll(collection: Collection) {
  for (const path of PUBLIC_PATHS) revalidatePath(path);
  revalidatePath(ADMIN_PATH[collection]);
}

/** Traduit une erreur Prisma en message lisible. */
function toMessage(error: unknown): ActionState {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Unique constraint") || message.includes("P2002")) {
    return { error: "Ce slug est déjà utilisé par un autre contenu." };
  }
  if (message.includes("DATABASE_URL")) {
    return {
      error:
        "La base de données n'est pas configurée. Renseigne DATABASE_URL dans .env, puis relance le serveur.",
    };
  }
  return { error: message };
}

/** Met à plat les erreurs zod en un objet champ → message. */
function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    result[key] ??= issue.message;
  }
  return result;
}

/**
 * Construit les quatre actions (créer / modifier / supprimer / basculer la
 * publication) d'une collection. Les cinq collections partagent exactement la
 * même mécanique : seuls le schéma et la table changent.
 */
function makeActions<S extends z.ZodType>(options: {
  collection: Collection;
  schema: S;
  /** Champ image du modèle, s'il en a un. */
  imageField?: string;
  delegate: () => {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => Promise<unknown>;
    delete: (args: { where: { id: string } }) => Promise<unknown>;
    findUnique: (args: {
      where: { id: string };
    }) => Promise<Record<string, unknown> | null>;
  };
}) {
  const { collection, schema, imageField, delegate } = options;

  async function parse(formData: FormData) {
    const raw = Object.fromEntries(formData.entries());

    /* Une image nouvellement envoyée l'emporte sur l'URL saisie à la main. */
    if (imageField) {
      const file = formData.get(`${imageField}File`);
      const uploaded = await uploadImage(file instanceof File ? file : null);
      if (uploaded) raw[imageField] = uploaded;
      delete raw[`${imageField}File`];
    }

    return schema.safeParse(raw);
  }

  return {
    async save(
      id: string | null,
      _previous: ActionState,
      formData: FormData,
    ): Promise<ActionState> {
      await requireUser();

      try {
        const parsed = await parse(formData);
        if (!parsed.success) {
          return {
            error: "Certains champs sont invalides.",
            fieldErrors: fieldErrorsOf(parsed.error),
          };
        }

        const data = parsed.data as Record<string, unknown>;

        if (id) {
          await delegate().update({ where: { id }, data });
        } else {
          await delegate().create({ data });
        }
      } catch (error) {
        return toMessage(error);
      }

      revalidateAll(collection);
      redirect(ADMIN_PATH[collection]);
    },

    async remove(id: string): Promise<ActionState> {
      await requireUser();

      try {
        await delegate().delete({ where: { id } });
      } catch (error) {
        return toMessage(error);
      }

      revalidateAll(collection);
      return {};
    },

    async togglePublished(id: string): Promise<ActionState> {
      await requireUser();

      try {
        const current = await delegate().findUnique({ where: { id } });
        if (!current) return { error: "Contenu introuvable." };

        await delegate().update({
          where: { id },
          data: { published: !current.published },
        });
      } catch (error) {
        return toMessage(error);
      }

      revalidateAll(collection);
      return {};
    },
  };
}

/* --------------------------------------------------------- Collections --- */

const services = makeActions({
  collection: "service",
  schema: serviceSchema,
  delegate: () => prisma.service as never,
});

const works = makeActions({
  collection: "work",
  schema: workSchema,
  imageField: "image",
  delegate: () => prisma.work as never,
});

const products = makeActions({
  collection: "product",
  schema: productSchema,
  imageField: "image",
  delegate: () => prisma.product as never,
});

const articles = makeActions({
  collection: "article",
  schema: articleSchema,
  imageField: "cover",
  delegate: () => prisma.article as never,
});

const testimonials = makeActions({
  collection: "testimonial",
  schema: testimonialSchema,
  imageField: "avatar",
  delegate: () => prisma.testimonial as never,
});

/* Les Server Actions doivent être des fonctions `async` exportées une par une :
   une arrow function assignée à une const n'est pas reconnue par le compilateur. */

export async function saveService(id: string | null, p: ActionState, f: FormData) {
  return services.save(id, p, f);
}
export async function removeService(id: string) {
  return services.remove(id);
}
export async function toggleService(id: string) {
  return services.togglePublished(id);
}

export async function saveWork(id: string | null, p: ActionState, f: FormData) {
  return works.save(id, p, f);
}
export async function removeWork(id: string) {
  return works.remove(id);
}
export async function toggleWork(id: string) {
  return works.togglePublished(id);
}

export async function saveProduct(id: string | null, p: ActionState, f: FormData) {
  return products.save(id, p, f);
}
export async function removeProduct(id: string) {
  return products.remove(id);
}
export async function toggleProduct(id: string) {
  return products.togglePublished(id);
}

export async function saveArticle(id: string | null, p: ActionState, f: FormData) {
  return articles.save(id, p, f);
}
export async function removeArticle(id: string) {
  return articles.remove(id);
}
export async function toggleArticle(id: string) {
  return articles.togglePublished(id);
}

export async function saveTestimonial(id: string | null, p: ActionState, f: FormData) {
  return testimonials.save(id, p, f);
}
export async function removeTestimonial(id: string) {
  return testimonials.remove(id);
}
export async function toggleTestimonial(id: string) {
  return testimonials.togglePublished(id);
}
