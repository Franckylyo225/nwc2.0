import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatArticleDate } from "@/components/article-date";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ArrowUpRight, Eyebrow, cx } from "@/components/ui";
import { ARTICLE_CATEGORY_LABELS, getArticles } from "@/lib/content";
import type { ArticleCategory } from "@/lib/generated/prisma";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Actualités & blog",
  description:
    "Les annonces du studio et nos partis pris sur la conception web, le design et la performance.",
  alternates: { canonical: "/blog" },
};

const FILTERS = [
  { value: null, label: "Tout" },
  { value: "NEWS" as const, label: "Actualités" },
  { value: "POST" as const, label: "Articles" },
];

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<{ rubrique?: string }>;
}) {
  const { rubrique } = await searchParams;
  const active: ArticleCategory | null =
    rubrique === "NEWS" || rubrique === "POST" ? rubrique : null;

  const articles = await getArticles(active ? { category: active } : undefined);

  return (
    <>
      <Nav />
      <main id="contenu" className="pt-36 sm:pt-44">
        <div className="shell">
          <Eyebrow>Journal</Eyebrow>
          <h1 className="display mt-5 max-w-3xl text-5xl text-ink sm:text-6xl">
            Actualités &amp; articles
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            {metadata.description}
          </p>

          {/* Filtres par rubrique — de simples liens, donc partageables. */}
          <nav className="mt-10 flex flex-wrap gap-2">
            {FILTERS.map((filter) => {
              const isActive = filter.value === active;
              return (
                <Link
                  key={filter.label}
                  href={filter.value ? `/blog?rubrique=${filter.value}` : "/blog"}
                  aria-current={isActive ? "page" : undefined}
                  className={cx(
                    "rounded-pill px-4 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-ink text-white"
                      : "bg-surface text-muted hover:bg-line hover:text-ink",
                  )}
                >
                  {filter.label}
                </Link>
              );
            })}
          </nav>

          {articles.length === 0 ? (
            <p className="mt-16 rounded-card border border-dashed border-line-strong px-6 py-16 text-center text-muted">
              Aucun article publié pour le moment.
            </p>
          ) : (
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <li key={article.id} className="h-full">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-card bg-white ring-1 ring-line transition-all duration-300 ease-smooth hover:shadow-[0_28px_64px_-40px_rgba(16,17,20,0.45)] hover:ring-line-strong"
                  >
                    <div className="relative aspect-16/10 overflow-hidden border-b border-line bg-gradient-to-br from-accent/15 via-surface-2 to-surface">
                      {article.cover ? (
                        <Image
                          src={article.cover}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
                        />
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted">
                        <span className="text-accent">
                          {ARTICLE_CATEGORY_LABELS[article.category]}
                        </span>
                        <span aria-hidden className="h-px w-4 bg-line-strong" />
                        <span>{formatArticleDate(article.publishedAt)}</span>
                      </p>

                      <h2 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-ink">
                        {article.title}
                      </h2>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                        {article.excerpt}
                      </p>

                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors group-hover:text-accent">
                        Lire
                        <ArrowUpRight className="transition-transform duration-300 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
