import Image from "next/image";
import type { CSSProperties } from "react";
import { site } from "@/content/site";
import { ArrowUpRight, Button, cx } from "./ui";

const { hero, brand } = site;

/** Forme d'un fragment de titre, telle qu'écrite dans content/site.ts. */
type HeadlinePart = {
  text: string;
  accent?: boolean;
  /** Emplacement de vignette (1, 2, 3), rempli depuis l'administration. */
  imageSlot?: number;
};

const headline: readonly HeadlinePart[] = hero.headline;

/** Cascade d'apparition : 70 ms entre chaque élément. */
const delay = (step: number) => ({ "--delay": `${step * 70}ms` }) as CSSProperties;

export function Hero({
  images = {},
}: {
  /** Vignettes du titre, par emplacement. Fournies par les réglages du site. */
  images?: Record<number, string | null>;
}) {
  const afterTitle = headline.length + 1;

  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-8 sm:pt-44">
      {/* Décor de fond */}
      <div
        aria-hidden
        className="grid-bg pointer-events-none absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="shell relative">
        {hero.badge ? (
          <div
            className="rise mb-8 flex justify-center lg:justify-start"
            style={delay(0)}
          >
            <span className="inline-flex items-center gap-2.5 rounded-pill bg-white px-4 py-2 text-sm text-muted shadow-[0_1px_2px_rgba(16,17,20,0.06)] ring-1 ring-line">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              {hero.badge}
            </span>
          </div>
        ) : null}

        {/* L'échelle est calée sur un titre d'environ 60 caractères. Un titre
            nettement plus long mérite de descendre d'un cran, un titre court
            supporte de monter. */}
        <h1 className="display flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[11vw] leading-[0.95] text-ink sm:gap-x-5 sm:text-[7.5vw] lg:justify-start lg:text-left lg:text-[5.2rem] xl:text-[5.8rem]">
          {headline.map((part, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 overflow-hidden pb-[0.12em] sm:gap-4"
            >
              <span
                className={cx("rise-mask inline-block", part.accent && "text-accent")}
                style={delay(i + 1)}
              >
                {part.text}
              </span>

              {part.imageSlot ? (
                <span className="rise inline-block" style={delay(i + 1.5)}>
                  <HeadlineVignette src={images[part.imageSlot] ?? null} />
                </span>
              ) : null}
            </span>
          ))}
        </h1>

        {/* Sous-titre + actions */}
        <div className="mt-12 flex flex-col items-center gap-10 lg:flex-row lg:items-end lg:justify-between">
          <p
            className="rise max-w-xl text-center text-lg leading-relaxed text-muted lg:text-left"
            style={delay(afterTitle)}
          >
            {hero.subline}
          </p>

          <div
            className="rise flex flex-col gap-3 sm:flex-row"
            style={delay(afterTitle + 1)}
          >
            <Button href={hero.primaryCta.href}>
              {hero.primaryCta.label}
              <ArrowUpRight />
            </Button>
            <Button href={hero.secondaryCta.href} variant="secondary">
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>

        {/* Chiffres clés */}
        {hero.stats.length > 0 ? (
          <dl
            className="rise mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-card bg-line ring-1 ring-line sm:grid-cols-3"
            style={delay(afterTitle + 2)}
          >
            {hero.stats.map((stat) => (
              <div key={stat.label} className="bg-bg px-6 py-8 text-center sm:text-left">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="display text-4xl text-ink sm:text-5xl">{stat.value}</dd>
                <dd className="mt-2 text-sm text-muted">{stat.label}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <p
          className="rise mt-8 text-center text-sm text-muted lg:text-left"
          style={delay(afterTitle + 3)}
        >
          {brand.tagline} · {brand.city}, {brand.country}
        </p>
      </div>
    </section>
  );
}

/**
 * Vignette ronde insérée dans le titre.
 *
 * Sa taille est exprimée en `em` : elle suit donc l'échelle du titre à tous
 * les points de rupture, sans réglage supplémentaire.
 *
 * Tant qu'aucun fichier n'est renseigné, une pastille neutre occupe exactement
 * la même place — la mise en page ne bougera pas au moment de la remplacer.
 */
function HeadlineVignette({ src }: { src: string | null }) {
  const shape =
    "relative block size-[0.78em] shrink-0 overflow-hidden rounded-full ring-1 ring-line";

  if (!src) {
    return (
      <span
        aria-hidden
        className={cx(shape, "bg-gradient-to-br from-accent/30 via-surface-2 to-surface")}
      />
    );
  }

  return (
    <span aria-hidden className={shape}>
      <Image
        src={src}
        /* Décoratives : le sens est porté par le texte du titre. */
        alt=""
        fill
        /* Le rendu ne dépasse jamais ~120 px de côté, même sur grand écran. */
        sizes="120px"
        className="object-cover"
      />
    </span>
  );
}
