"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { createSession, destroySession, requireUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { MessageStatus } from "@/lib/generated/prisma";
import {
  SETTINGS_IMAGE_FIELDS,
  articleCategorySchema,
  articleSchema,
  fieldErrorsOf,
  loginSchema,
  settingsSchema,
  productSchema,
  serviceSchema,
  slugify,
  testimonialSchema,
  workSchema,
} from "@/lib/schemas";
import { SETTINGS_ID } from "@/lib/settings";
import { uploadImage } from "@/lib/upload";

/**
 * Toutes les actions renvoient la même forme, que les formulaires affichent
 * telle quelle via `useActionState`.
 */
export type ActionState = {
  error?: string;
  /** Erreurs par champ, pour les afficher au bon endroit. */
  fieldErrors?: Record<string, string>;
  /** Vrai après un enregistrement réussi — sert à confirmer à l'écran. */
  ok?: boolean;
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

/* -------------------------------------------------------------- Réglages --- */

/**
 * Enregistre les réglages du site. La table n'a qu'une ligne, d'identifiant
 * fixe : un `upsert` la crée à la première sauvegarde puis la met à jour.
 */
export async function saveSettings(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  try {
    const raw = Object.fromEntries(formData.entries());

    /* Toutes les images des réglages : un fichier envoyé l'emporte sur l'URL
       saisie ; sans fichier, l'URL existante est conservée. */
    for (const field of SETTINGS_IMAGE_FIELDS) {
      const file = formData.get(`${field}File`);
      const uploaded = await uploadImage(file instanceof File ? file : null);
      if (uploaded) raw[field] = uploaded;
      delete raw[`${field}File`];
    }

    const parsed = settingsSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        error: "Certains champs sont invalides.",
        fieldErrors: fieldErrorsOf(parsed.error),
      };
    }

    await prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...parsed.data },
      update: parsed.data,
    });
  } catch (error) {
    return toMessage(error);
  }

  /* Le mode maintenance vit dans le layout du site : il faut invalider tout
     l'arbre public, pas seulement la page d'accueil. */
  revalidatePath("/", "layout");
  revalidatePath("/admin/parametres");
  return { ok: true };
}

/* ------------------------------------------------- Rubriques du journal --- */

/**
 * Les rubriques ne passent pas par la fabrique de collections : elles ne se
 * publient pas, n'ont pas d'image, et leur suppression demande une garde que
 * les autres n'ont pas.
 */
export async function saveArticleCategory(
  id: string | null,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const raw = Object.fromEntries(formData.entries());
  /* Le slug se déduit du nom quand il est laissé vide : on ne demande pas à
     l'utilisateur de composer une chaîne d'URL pour ajouter une rubrique. */
  if (!raw.slug) raw.slug = slugify(String(raw.name ?? ""));

  const parsed = articleCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Certains champs sont invalides.",
      fieldErrors: fieldErrorsOf(parsed.error),
    };
  }

  try {
    if (id) {
      await prisma.articleCategory.update({ where: { id }, data: parsed.data });
    } else {
      await prisma.articleCategory.create({ data: parsed.data });
    }
  } catch (error) {
    return toMessage(error);
  }

  revalidateCategories();
  return { ok: true };
}

export async function removeArticleCategory(id: string): Promise<ActionState> {
  await requireUser();

  /* Refus explicite plutôt que l'erreur de contrainte brute : la base dirait
     « Foreign key constraint failed », ce qui ne dit pas quoi faire. */
  const used = await prisma.article.count({ where: { categoryId: id } });
  if (used > 0) {
    return {
      error: `Cette rubrique classe encore ${used} article${used > 1 ? "s" : ""}. Déplacez-les dans une autre rubrique avant de la supprimer.`,
    };
  }

  const remaining = await prisma.articleCategory.count();
  if (remaining <= 1) {
    return {
      error: "Gardez au moins une rubrique : un article ne peut pas exister sans.",
    };
  }

  try {
    await prisma.articleCategory.delete({ where: { id } });
  } catch (error) {
    return toMessage(error);
  }

  revalidateCategories();
  return {};
}

/** Le journal et son filtre dépendent des rubriques, l'admin aussi. */
function revalidateCategories() {
  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/admin/parametres");
  revalidatePath("/admin/articles");
}

/* -------------------------------------------------------------- Messages --- */

/**
 * Les messages reçus ne passent pas par la fabrique ci-dessous : ils ne se
 * publient pas, ne s'ordonnent pas, et ne se créent pas depuis l'admin. Ils
 * ne se lisent, ne se rangent et ne se suppriment — et aucune page publique
 * n'a besoin d'être rafraîchie.
 */
export async function setMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<ActionState> {
  await requireUser();

  try {
    await prisma.message.update({ where: { id }, data: { status } });
  } catch (error) {
    return toMessage(error);
  }

  revalidateInbox();
  return {};
}

export async function removeMessage(id: string): Promise<ActionState> {
  await requireUser();

  try {
    await prisma.message.delete({ where: { id } });
  } catch (error) {
    return toMessage(error);
  }

  revalidateInbox();
  return {};
}

/** La pastille des non-lus vit dans le menu, donc dans le layout de l'admin. */
function revalidateInbox() {
  revalidatePath("/admin", "layout");
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

      /* Pas de `redirect` ici : depuis une route interceptée, il ne referme
         pas le panneau. C'est ResourceForm qui navigue, selon qu'il est
         affiché en page pleine ou en panneau latéral. */
      return { ok: true };
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
  imageField: "image",
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
