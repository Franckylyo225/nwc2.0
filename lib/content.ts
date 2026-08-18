import "server-only";

import { site } from "@/content/site";
import { isDatabaseConfigured, prisma } from "./db";
import type { ProductStatus } from "./generated/prisma";

/**
 * Couche de lecture du contenu public.
 *
 * Règle : tant que DATABASE_URL n'est pas définie, on sert les contenus
 * statiques de content/site.ts. Le site reste donc consultable et
 * constructible avant même la création de la base.
 *
 * En revanche, si une base EST configurée et qu'une requête échoue, l'erreur
 * remonte : un repli silencieux masquerait une panne en production.
 */

/* ------------------------------------------------------------- Types --- */

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  /** Illustration de l'onglet. Sans elle, un dégradé prend la même place. */
  image: string | null;
};

export type WorkItem = {
  id: string;
  name: string;
  year: string;
  /** Rôle tenu sur le projet. */
  category: string;
  summary: string;
  /** Prestations livrées. Vide, la colonne disparaît de la fiche. */
  services: string[];
  href: string;
  image: string | null;
};

export type ProductItem = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: string;
  tags: string[];
  href: string;
  image: string | null;
};

export type TestimonialItem = {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
};

/** Rubrique telle que l'affiche le site : seuls le nom et le slug servent. */
export type CategoryRef = { name: string; slug: string };

export type ArticleSummary = {
  id: string;
  title: string;
  slug: string;
  category: CategoryRef;
  excerpt: string;
  cover: string | null;
  author: string | null;
  publishedAt: Date | null;
};

export type ArticleFull = ArticleSummary & { content: string };

/** Libellés affichés pour les statuts produit. */
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ONLINE: "En ligne",
  BETA: "Bêta",
  SOON: "Bientôt",
};

/**
 * Rubriques du journal, dans leur ordre d'affichage.
 *
 * Sert au filtre du journal comme à la liste déroulante de l'administration :
 * une seule source, donc aucun risque de proposer à la saisie une rubrique que
 * le site ne sait pas filtrer.
 */
export async function getArticleCategories() {
  if (!isDatabaseConfigured()) return [];

  return prisma.articleCategory.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { articles: true } } },
  });
}

/* ---------------------------------------------------------- Lectures --- */

export async function getServices(): Promise<ServiceItem[]> {
  if (!isDatabaseConfigured()) {
    return site.services.items.map((item, i) => ({
      id: `static-${i}`,
      title: item.title,
      description: item.description,
      bullets: [...item.bullets],
      image: item.image,
    }));
  }

  const rows = await prisma.service.findMany({
    where: { published: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    bullets: row.bullets,
    image: row.image,
  }));
}

export async function getWorks(): Promise<WorkItem[]> {
  if (!isDatabaseConfigured()) {
    return site.works.items.map((item, i) => ({
      id: `static-${i}`,
      name: item.name,
      year: item.year,
      category: item.category,
      summary: item.summary,
      services: [...item.services],
      href: item.href,
      image: item.image,
    }));
  }

  const rows = await prisma.work.findMany({
    where: { published: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    year: row.year,
    category: row.category,
    summary: row.summary,
    services: row.services,
    href: row.href ?? "#",
    image: row.image,
  }));
}

export async function getProducts(): Promise<ProductItem[]> {
  if (!isDatabaseConfigured()) {
    return site.products.items.map((item, i) => ({
      id: `static-${i}`,
      name: item.name,
      tagline: item.tagline,
      description: item.description,
      status: item.status,
      tags: [...item.tags],
      href: item.href,
      image: item.image,
    }));
  }

  const rows = await prisma.product.findMany({
    where: { published: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    status: PRODUCT_STATUS_LABELS[row.status],
    tags: row.tags,
    href: row.href ?? "#",
    image: row.image,
  }));
}

export async function getTestimonials(): Promise<TestimonialItem[]> {
  if (!isDatabaseConfigured()) {
    return site.testimonials.items.map((item, i) => ({
      id: `static-${i}`,
      quote: item.quote,
      author: item.author,
      role: item.role,
      company: item.company,
    }));
  }

  const rows = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    quote: row.quote,
    author: row.author,
    role: row.role,
    company: row.company,
  }));
}

/**
 * Articles publiés. Aucun équivalent statique n'existe : sans base, la
 * rubrique est simplement vide et les sections concernées ne s'affichent pas.
 */
export async function getArticles(options?: {
  /** Slug de rubrique — c'est lui qui circule dans l'URL du journal. */
  category?: string;
  limit?: number;
}): Promise<ArticleSummary[]> {
  if (!isDatabaseConfigured()) return [];

  const rows = await prisma.article.findMany({
    where: {
      published: true,
      ...(options?.category ? { category: { slug: options.category } } : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: options?.limit,
    include: { category: { select: { name: true, slug: true } } },
  });

  return rows.map(toSummary);
}

export async function getArticleBySlug(slug: string): Promise<ArticleFull | null> {
  if (!isDatabaseConfigured()) return null;

  const row = await prisma.article.findFirst({
    where: { slug, published: true },
    include: { category: { select: { name: true, slug: true } } },
  });
  if (!row) return null;

  return { ...toSummary(row), content: row.content };
}

/** Slugs publiés — sert à pré-générer les pages d'articles au build. */
export async function getArticleSlugs(): Promise<string[]> {
  if (!isDatabaseConfigured()) return [];

  const rows = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

function toSummary(row: {
  id: string;
  title: string;
  slug: string;
  category: CategoryRef;
  excerpt: string;
  cover: string | null;
  author: string | null;
  publishedAt: Date | null;
}): ArticleSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    excerpt: row.excerpt,
    cover: row.cover,
    author: row.author,
    publishedAt: row.publishedAt,
  };
}
