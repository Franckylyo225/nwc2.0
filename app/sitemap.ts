import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getArticles } from "@/lib/content";

/**
 * `/sitemap.xml`, généré par la convention de route Next.js.
 *
 * Les articles sont relus à chaque requête (`getArticles` ne filtre que les
 * publiés) : un article dépublié depuis l'administration sort donc du plan
 * du site sans redéploiement.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.brand.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cgv`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const articles = await getArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}/blog/${article.slug}`,
    lastModified: article.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes];
}
