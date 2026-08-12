import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Eyebrow } from "@/components/ui";
import { getLegalDocument } from "@/content/legal";

/**
 * Gabarit commun aux trois documents légaux.
 *
 * Les textes vivent dans `content/legal.ts` et s'écrivent en Markdown, rendu
 * côté serveur — même mécanique que les articles du blog. Les trois pages ne
 * sont donc que des coquilles de trois lignes.
 *
 * Ces routes vivent dans `app/(legal)/`, DÉLIBÉRÉMENT hors du groupe `(site)` :
 * elles échappent ainsi au mode maintenance. Un client qui suit le lien vers
 * les CGV depuis un devis, ou un visiteur qui cherche à identifier l'éditeur,
 * ne doit pas tomber sur la page d'attente. Elles n'ont besoin d'aucune lecture
 * en base, donc rien ne justifie de les fermer avec le reste du site.
 */

/** Métadonnées d'une page légale. À appeler depuis le `metadata` de la route. */
export function legalMetadata(slug: string): Metadata {
  const document = getLegalDocument(slug);
  if (!document) return {};

  return {
    title: document.title,
    description: document.description,
    alternates: { canonical: `/${document.slug}` },
    /* Ces pages doivent rester accessibles et citables, mais n'ont aucun
       intérêt dans les résultats de recherche : elles y diluent le site. */
    robots: { index: false, follow: true },
  };
}

const formatRevisionDate = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

export async function LegalPage({ slug }: { slug: string }) {
  const document = getLegalDocument(slug);
  if (!document) notFound();

  /* Markdown rédigé par le studio, jamais par un visiteur : rendu tel quel,
     sans passe d'assainissement, comme pour les articles. */
  const html = await marked.parse(document.body);

  return (
    <>
      <Nav />
      <main id="contenu" className="pt-36 sm:pt-44">
        <article className="shell max-w-3xl pb-24">
          <Eyebrow>Informations légales</Eyebrow>

          <h1 className="display mt-5 text-4xl text-ink sm:text-5xl lg:text-6xl">
            {document.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            {document.description}
          </p>

          <p className="mt-8 border-t border-line pt-6 text-sm text-muted">
            Dernière mise à jour le{" "}
            <time dateTime={document.updatedAt}>
              {formatRevisionDate(document.updatedAt)}
            </time>
          </p>

          <div
            className="prose-nwc mt-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
