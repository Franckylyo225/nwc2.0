import { notFound } from "next/navigation";
import { saveArticle } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { prisma } from "@/lib/db";
import { storageMode } from "@/lib/upload";
import { articleFields } from "../fields";

/**
 * Corps du formulaire, partagé par la page pleine et le panneau latéral.
 * Sans `id`, c'est une création.
 */
export async function ArticleForm({
  id,
  variant = "page",
}: {
  id?: string;
  variant?: "page" | "drawer";
}) {
  const row = id ? await prisma.article.findUnique({ where: { id } }) : null;
  if (id && !row) notFound();

  return (
    <ResourceForm
      fields={articleFields}
      values={
        row
          ? {
            title: row.title,
            slug: row.slug,
            category: row.category,
            excerpt: row.excerpt,
            content: row.content,
            cover: row.cover,
            author: row.author,
            published: row.published,
            /* <input type="date"> attend impérativement AAAA-MM-JJ. */
            publishedAt: row.publishedAt?.toISOString().slice(0, 10) ?? "",
          }
          : {
            category: "NEWS",
            published: false,
            publishedAt: new Date().toISOString().slice(0, 10),
          }
      }
      action={saveArticle.bind(null, row?.id ?? null)}
      variant={variant}
      storage={storageMode() === "blob" ? "blob" : "server"}
      backHref="/admin/articles"
      submitLabel={row ? "Enregistrer" : "Créer l'article"}
    />
  );
}
