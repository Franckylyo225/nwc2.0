import type { Field } from "@/components/admin/fields";

/**
 * Description des formulaires de chaque collection.
 * Le rendu est assuré par components/admin/ResourceForm.tsx.
 */

const position: Field = {
  type: "number",
  name: "position",
  label: "Ordre d'affichage",
  help: "Les plus petits nombres apparaissent en premier.",
};

const published: Field = {
  type: "checkbox",
  name: "published",
  label: "Publié sur le site",
};

export const serviceFields: Field[] = [
  { type: "text", name: "title", label: "Titre" },
  { type: "textarea", name: "description", label: "Description", rows: 3 },
  {
    type: "lines",
    name: "bullets",
    label: "Points clés",
    rows: 4,
    help: "Un par ligne, ou séparés par des virgules. Ils s'affichent en pastilles sous la description — garde-les courts, trois ou quatre suffisent.",
  },
  {
    type: "image",
    name: "image",
    label: "Illustration",
    help: "Montrée en grand quand l'onglet du service est ouvert. Format conseillé : paysage, 1600 × 1000 px. Sans image, un dégradé prend la même place.",
  },
  position,
  published,
];

export const workFields: Field[] = [
  { type: "text", name: "name", label: "Nom du projet", slugSource: true },
  {
    type: "slug",
    name: "slug",
    label: "Slug",
    help: "Identifiant unique. Rempli automatiquement à partir du nom.",
  },
  {
    type: "text",
    name: "category",
    label: "Rôle",
    placeholder: "Site vitrine & identité",
    help: "Ce que vous avez été sur ce projet. Affiché tel quel dans la fiche.",
  },
  { type: "text", name: "year", label: "Année", placeholder: "2026" },
  { type: "textarea", name: "summary", label: "Résumé", rows: 3 },
  {
    type: "lines",
    name: "services",
    label: "Prestations",
    rows: 4,
    help: "Une par ligne, ou séparées par des virgules — Branding, Design, Développement… Elles s'affichent en liste sur la fiche. Vide, la colonne n'apparaît pas.",
  },
  {
    type: "url",
    name: "href",
    label: "Lien",
    help: "Vers le site du client, ou une étude de cas. Laisser vide si aucun.",
  },
  {
    type: "image",
    name: "image",
    label: "Visuel",
    help: "Format conseillé : 1600 × 1000 px. Sans image, un dégradé s'affiche.",
  },
  position,
  published,
];

export const productFields: Field[] = [
  { type: "text", name: "name", label: "Nom du produit", slugSource: true },
  { type: "slug", name: "slug", label: "Slug" },
  { type: "text", name: "tagline", label: "Accroche", placeholder: "Ce que fait le produit, en une ligne" },
  { type: "textarea", name: "description", label: "Description", rows: 4 },
  {
    type: "select",
    name: "status",
    label: "Statut",
    options: [
      { value: "ONLINE", label: "En ligne" },
      { value: "BETA", label: "Bêta" },
      { value: "SOON", label: "Bientôt" },
    ],
    help: "« En ligne » affiche une pastille colorée ; les autres restent en gris.",
  },
  {
    type: "lines",
    name: "tags",
    label: "Étiquettes",
    rows: 3,
    help: "Une par ligne. Ex. : SaaS, Santé, Éducation.",
  },
  { type: "url", name: "href", label: "Lien vers le produit" },
  {
    type: "image",
    name: "image",
    label: "Aperçu",
    help: "Capture d'écran du produit. Format conseillé : 1600 × 1000 px.",
  },
  position,
  published,
];

/**
 * Champs de l'article. C'est une fonction et non une constante : la liste des
 * rubriques vit en base, elle n'est donc connue qu'à l'exécution. La proposer
 * depuis la même source que le filtre du journal évite d'offrir à la saisie une
 * rubrique que le site public ne saurait pas filtrer.
 */
export const articleFields = (
  categories: { id: string; name: string }[],
): Field[] => [
  { type: "text", name: "title", label: "Titre", slugSource: true },
  {
    type: "slug",
    name: "slug",
    label: "Slug",
    help: "Apparaît dans l'URL : /blog/mon-article.",
  },
  {
    type: "select",
    name: "categoryId",
    label: "Rubrique",
    options: categories.map((c) => ({ value: c.id, label: c.name })),
    help: "Les rubriques se gèrent depuis la page Paramètres.",
  },
  {
    type: "textarea",
    name: "excerpt",
    label: "Chapô",
    rows: 3,
    help: "Deux ou trois lignes. Affiché dans la liste et sur les réseaux sociaux.",
  },
  {
    type: "textarea",
    name: "content",
    label: "Contenu",
    rows: 18,
    mono: true,
    help: "Markdown accepté : ## titre, **gras**, *italique*, - liste, [lien](url).",
  },
  { type: "image", name: "cover", label: "Image de couverture" },
  { type: "text", name: "author", label: "Auteur" },
  {
    type: "date",
    name: "publishedAt",
    label: "Date de publication",
    help: "Sert au tri. Laisser vide utilise la date de création.",
  },
  published,
];

export const testimonialFields: Field[] = [
  { type: "textarea", name: "quote", label: "Citation", rows: 4 },
  { type: "text", name: "author", label: "Nom" },
  { type: "text", name: "role", label: "Fonction" },
  { type: "text", name: "company", label: "Entreprise" },
  {
    type: "image",
    name: "avatar",
    label: "Photo",
    help: "Optionnelle. Sans photo, les initiales s'affichent.",
  },
  position,
  published,
];
