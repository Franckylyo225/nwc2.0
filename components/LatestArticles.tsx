import Image from "next/image";
import Link from "next/link";
import { ARTICLE_CATEGORY_LABELS, type ArticleSummary } from "@/lib/content";
import { Reveal } from "./Reveal";
import { ArrowUpRight, Button, Section, SectionHeading } from "./ui";
import { formatArticleDate } from "./article-date";

/**
 * Trois derniers contenus publiés, toutes rubriques confondues.
 * La section disparaît tant qu'aucun article n'est publié.
 */
export function LatestArticles({ items }: { items: ArticleSummary[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="actualites" className="bg-surface/50">
      <Reveal>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Actualités"
            title="Ce qui se passe au studio"
            intro="Nos annonces, nos coulisses et nos partis pris sur le web."
          />
          <Button href="/blog" variant="secondary" className="shrink-0">
            Tout lire
            <ArrowUpRight />
          </Button>
        </div>
      </Reveal>

      <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article, i) => (
          <Reveal key={article.id} delay={0.07 * i}>
            <li className="h-full">
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

                  <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-ink">
                    {article.title}
                  </h3>
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
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
