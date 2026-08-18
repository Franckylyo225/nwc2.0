import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { formatArticleDate } from "@/components/article-date";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ArrowUpRight } from "@/components/ui";
import { getArticleBySlug, getArticleSlugs } from "@/lib/content";

export const revalidate = 3600;

/** Pré-génère les articles publiés au build ; les nouveaux sont rendus à la demande. */
export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article introuvable" };

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      images: article.cover ? [article.cover] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  /* Le Markdown est écrit par un administrateur authentifié : on le rend tel
     quel, sans passe d'assainissement supplémentaire. */
  const html = await marked.parse(article.content);

  return (
    <>
      <Nav />
      <main id="contenu" className="pt-36 sm:pt-44">
        <article className="shell max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
          >
            <ArrowUpRight className="size-3.5 -rotate-[135deg]" />
            Retour au journal
          </Link>

          <p className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted">
            <span className="text-accent">
              {article.category.name}
            </span>
            <span aria-hidden className="h-px w-6 bg-line-strong" />
            <span>{formatArticleDate(article.publishedAt)}</span>
            {article.author ? (
              <>
                <span aria-hidden className="h-px w-6 bg-line-strong" />
                <span>{article.author}</span>
              </>
            ) : null}
          </p>

          <h1 className="display mt-5 text-4xl text-ink sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">{article.excerpt}</p>

          {article.cover ? (
            <Image
              src={article.cover}
              alt=""
              width={1600}
              height={900}
              priority
              className="mt-12 w-full rounded-card object-cover ring-1 ring-line"
            />
          ) : null}

          {/* Contenu Markdown converti en HTML côté serveur. */}
          <div
            className="prose-nwc mt-12"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
