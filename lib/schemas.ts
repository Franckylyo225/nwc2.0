import { z } from "zod";

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

/** Découpe une saisie « un élément par ligne » en tableau. */
export const linesToArray = z
  .string()
  .transform((value) =>
    value
      .split("\n")
      .map((line) => line.trim())
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
  category: text("La catégorie", 80),
  summary: text("Le résumé", 600),
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

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide."),
  password: z.string().min(1, "Le mot de passe est obligatoire."),
});

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
