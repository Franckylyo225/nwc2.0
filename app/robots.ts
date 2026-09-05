import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * `/robots.txt`, généré par la convention de route Next.js.
 *
 * `/admin` est aussi protégé par son propre `robots: { index: false }` (voir
 * app/admin/layout.tsx) : la double barrière évite qu'un moteur qui ignore
 * la balise mais lit ce fichier finisse quand même par l'indexer.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${site.brand.url}/sitemap.xml`,
  };
}
