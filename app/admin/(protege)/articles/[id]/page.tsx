import { notFound } from "next/navigation";
import { saveArticle } from "@/app/admin/actions";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { FormShell } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import { articleFields } from "../../fields";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <FormShell
      title="Modifier l'article"
      description={article.published ? `En ligne sur /blog/${article.slug}` : undefined}
    >
      <ResourceForm
        fields={articleFields}
        values={{
          title: article.title,
          slug: article.slug,
          category: article.category,
          excerpt: article.excerpt,
          content: article.content,
          cover: article.cover,
          author: article.author,
          published: article.published,
          /* <input type="date"> attend impérativement AAAA-MM-JJ. */
          publishedAt: article.publishedAt?.toISOString().slice(0, 10) ?? "",
        }}
        action={saveArticle.bind(null, article.id)}
        backHref="/admin/articles"
      />
    </FormShell>
  );
}
