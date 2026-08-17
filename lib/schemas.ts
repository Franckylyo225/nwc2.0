import { z } from "zod";
import { site } from "@/content/site";

/**
 * Schémas de validation partagés entre les formulaires admin et les actions
 * serveur. Les messages sont en français : ils sont affichés tels quels.
 */

const text = (label: string, max = 500) =>
  z
    .string()
    .trim()
    .min(1, `${label} est obligatoire.`)
    .max(max, `${label} dépasse ${max} caractères.`);

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable();

/**
 * Facultatif mais borné. À préférer à `optionalText` partout où la saisie
 * vient du public : sans plafond, un champ laissé libre accepte un mégaoctet.
 */
const optionalBounded = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${label} dépasse ${max} caractères.`)
    .transform((value) => (value === "" ? null : value))
    .nullable();

/** Facultatif, et limité aux choix proposés par le formulaire. */
const optionalChoice = (label: string, choices: readonly string[]) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .refine((value) => value === null || choices.includes(value), {
      message: `${label} ne fait pas partie des choix proposés.`,
    });

/** Découpe une saisie « un élément par ligne » en tableau. */
export const linesToArray = z
  .string()
  .transform((value) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );

/**
 * Comme `linesToArray`, mais la virgule sépare aussi.
 *
 * Réservé aux listes d'**étiquettes courtes** — prestations, mots-clés. Devant
 * un champ qui attend « Design, Développement, SEO », on tape naturellement la
 * ligne d'un trait ; n'accepter que le retour chariot produit alors une seule
 * entrée, et la mise en page à l'écran s'effondre en un bloc de texte.
 *
 * À ne surtout pas appliquer à `linesToArray` : les puces de services sont des
 * phrases, et la virgule y est de la ponctuation, pas un séparateur.
 */
export const labelsToArray = z
  .string()
  .transform((value) =>
    value
      .split(/[\n,]/)
      .map((label) => label.trim())
      .filter(Boolean),
  );

const position = z.coerce.number().int().min(0).max(999).default(0);
const published = z
  .union([z.literal("on"), z.literal("true"), z.literal("")])
  .optional()
  .transform((value) => value === "on" || value === "true");

/** Slug URL : minuscules, chiffres et tirets. */
export const slug = z
  .string()
  .trim()
  .min(1, "Le slug est obligatoire.")
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Le slug ne peut contenir que des minuscules, des chiffres et des tirets.",
  );

export const serviceSchema = z.object({
  title: text("Le titre", 120),
  description: text("La description", 600),
  bullets: linesToArray,
  position,
  published,
});

export const workSchema = z.object({
  name: text("Le nom du projet", 120),
  slug,
  year: text("L'année", 20),
  category: text("Le rôle", 80),
  summary: text("Le résumé", 600),
  services: labelsToArray,
  href: optionalText,
  image: optionalText,
  position,
  published,
});

export const productSchema = z.object({
  name: text("Le nom du produit", 120),
  slug,
  tagline: text("L'accroche", 200),
  description: text("La description", 800),
  status: z.enum(["ONLINE", "BETA", "SOON"]),
  tags: linesToArray,
  href: optionalText,
  image: optionalText,
  position,
  published,
});

export const articleSchema = z.object({
  title: text("Le titre", 200),
  slug,
  category: z.enum(["NEWS", "POST"]),
  excerpt: text("Le chapô", 400),
  content: text("Le contenu", 60000),
  cover: optionalText,
  author: optionalText,
  published,
  publishedAt: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : new Date(value)))
    .nullable()
    .refine((date) => date === null || !Number.isNaN(date.getTime()), {
      message: "Date de publication invalide.",
    }),
});

export const testimonialSchema = z.object({
  quote: text("La citation", 800),
  author: text("Le nom", 120),
  role: text("La fonction", 120),
  company: text("L'entreprise", 120),
  avatar: optionalText,
  position,
  published,
});

export const settingsSchema = z.object({
  maintenanceMode: published,
  maintenanceTitle: text("Le titre", 120),
  maintenanceMessage: text("Le message", 600),
  maintenanceEta: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : new Date(value)))
    .nullable()
    .refine((date) => date === null || !Number.isNaN(date.getTime()), {
      message: "Date d'ouverture invalide.",
    }),
  showContact: published,
  heroImage1: optionalText,
  heroImage2: optionalText,
  heroImage3: optionalText,
  aboutBannerImage: optionalText,
  aboutStudioImage: optionalText,
});

/**
 * Champs image des réglages. Une seule liste, parcourue par `saveSettings`
 * pour traiter les envois de fichiers : ajouter une image au site se résume
 * donc à compléter le schéma ci-dessus et cette liste.
 */
export const SETTINGS_IMAGE_FIELDS = [
  "heroImage1",
  "heroImage2",
  "heroImage3",
  "aboutBannerImage",
  "aboutStudioImage",
] as const;

/**
 * Message du formulaire de contact public.
 *
 * Seul schéma dont les données viennent d'un inconnu : chaque champ est borné,
 * et les deux listes déroulantes n'acceptent que les choix de content/site.ts.
 * Le corps exige quelques mots — « ok » n'est pas une demande, et c'est ce que
 * postent les robots qui passent les autres filtres.
 */
export const messageSchema = z.object({
  name: text("Le nom", 120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(200, "L'adresse e-mail dépasse 200 caractères.")
    .email("Adresse e-mail invalide."),
  phone: optionalBounded("Le téléphone", 40),
  company: optionalBounded("L'entreprise", 120),
  projectType: optionalChoice("Le type de projet", site.contact.form.projectTypes),
  budget: optionalChoice("Le budget", site.contact.form.budgets),
  body: z
    .string()
    .trim()
    .min(20, "Décrivez votre projet en quelques mots (20 caractères minimum).")
    .max(5000, "Le message dépasse 5000 caractères."),
});

/**
 * Noms des deux champs pièges du formulaire de contact. Ils sont posés par le
 * composant et relus par l'action serveur : la constante évite qu'un renommage
 * d'un côté désarme silencieusement le piège de l'autre.
 *
 * Le leurre est invisible à l'écran mais présent dans le HTML — un robot qui
 * remplit tout le formulaire le remplit aussi, un visiteur non. Son nom
 * compte : les robots visent les champs qui ressemblent à des vrais.
 */
export const HONEYPOT_FIELD = "site-web";

/** Horodatage d'affichage du formulaire, posé par le navigateur. */
export const RENDERED_AT_FIELD = "affiche-a";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide."),
  password: z.string().min(1, "Le mot de passe est obligatoire."),
});

/** Met à plat les erreurs zod en un objet champ → message. */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    result[key] ??= issue.message;
  }
  return result;
}

/** Fabrique un slug lisible à partir d'un titre. */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
