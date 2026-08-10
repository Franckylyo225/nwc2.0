import { removeArticle, toggleArticle } from "@/app/admin/actions";
import { RowActions } from "@/components/admin/RowActions";
import { List, PageHeader, Row } from "@/components/admin/shell";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/content";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Actualités & blog"
        description="Une seule liste, deux rubriques : les actualités et les articles de fond se distinguent par leur catégorie."
        action={{ href: "/admin/articles/nouveau", label: "Écrire un article" }}
      />

      <List empty="Aucun article pour l'instant.">
        {articles.map((article) => (
          <Row
            key={article.id}
            title={article.title}
            muted={!article.published}
            meta={
              <>
                <span>{ARTICLE_CATEGORY_LABELS[article.category]}</span>
                <span aria-hidden>·</span>
                <span>
                  {dateFormat.format(article.publishedAt ?? article.createdAt)}
                </span>
                {article.author ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{article.author}</span>
                  </>
                ) : null}
              </>
            }
            actions={
              <RowActions
                editHref={`/admin/articles/${article.id}`}
                published={article.published}
                label={article.title}
                onToggle={async () => {
                  "use server";
                  return toggleArticle(article.id);
                }}
                onRemove={async () => {
                  "use server";
                  return removeArticle(article.id);
                }}
              />
            }
          />
        ))}
      </List>
    </>
  );
}
