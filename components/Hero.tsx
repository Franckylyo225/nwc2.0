import Image from "next/image";
import type { CSSProperties } from "react";
import { site } from "@/content/site";
import { HeroDotGrid } from "./HeroDotGrid";
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
    <section id="top" className="relative overflow-hidden bg-white pt-36 pb-8 sm:pt-44">
      {/* Grille de points + halo : au-dessus du fond blanc, sous le texte.
          `pointer-events-none` sur le contenu (juste en dessous) laisse la
          souris atteindre ce calque pour l'interaction. */}
      <HeroDotGrid />

      <div className="shell relative z-[3] flex flex-col items-center pointer-events-none">
        {hero.badge ? (
          <div className="rise mb-8 flex justify-center" style={delay(0)}>
            <span className="inline-flex items-center gap-2 rounded-pill border-[0.5px] border-[rgba(10,10,10,0.1)] bg-transparent px-4 py-2 text-[11px] text-[#767676]">
              <span className="inline-block size-1.5 shrink-0 rounded-full bg-[#EC4C79]" />
              {hero.badge}
            </span>
          </div>
        ) : null}

        <h1 className="display mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[26px] text-[#0A0A0A] sm:max-w-[560px] sm:text-[38px] lg:max-w-[760px] lg:text-[56px]">
          {headline.map((part, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 overflow-hidden pb-[0.12em]"
            >
              <span
                className={cx(
                  "rise-mask inline-block",
                  part.accent && "text-[#EC4C79]",
                )}
                style={delay(i + 1)}
              >
                {part.text}
              </span>

              {part.imageSlot ? (
                <span className="rise inline-block" style={delay(i + 1.5)}>
                  <HeadlineVignette
                    src={images[part.imageSlot] ?? null}
                    slot={part.imageSlot}
                  />
                </span>
              ) : null}
            </span>
          ))}
        </h1>

        {/* Sous-titre */}
        <p
          className="rise mx-auto mt-6 max-w-[440px] text-center text-[13.5px] leading-[1.7] text-[#767676]"
          style={delay(afterTitle)}
        >
          {hero.subline}
        </p>

        {/* CTA */}
        <div
          className="rise mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-[14px]"
          style={delay(afterTitle + 1)}
        >
          <Button
            href={hero.primaryCta.href}
            className="pointer-events-auto !rounded-[8px] !bg-[#0A0A0A] !px-[26px] !py-[11px]"
          >
            {hero.primaryCta.label}
            <ArrowUpRight />
          </Button>
          <Button
            href={hero.secondaryCta.href}
            variant="ghost"
            className="pointer-events-auto !rounded-[8px] !px-[26px] !py-[11px] border-[0.5px] border-[rgba(10,10,10,0.15)] hover:bg-black/[0.03]"
          >
            {hero.secondaryCta.label}
          </Button>
        </div>

        {/* Chiffres clés */}
        {hero.stats.length > 0 ? (
          <dl
            className="rise mt-20 grid w-full grid-cols-1 gap-px overflow-hidden rounded-card bg-line ring-1 ring-line sm:grid-cols-3"
            style={delay(afterTitle + 2)}
          >
            {hero.stats.map((stat) => (
              <div key={stat.label} className="bg-bg px-6 py-8 text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="display text-4xl text-ink sm:text-5xl">{stat.value}</dd>
                <dd className="mt-2 text-sm text-muted">{stat.label}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <p className="rise mt-8 text-center text-sm text-muted" style={delay(afterTitle + 3)}>
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
function HeadlineVignette({ src, slot }: { src: string | null; slot: number }) {
  /* La boucle vit sur la vignette et non sur son enveloppe, qui porte déjà
     l'animation d'apparition : deux animations sur un même élément se
     remplacent au lieu de s'ajouter. `--slot` décale les trois pastilles. */
  const shape =
    "headline-float relative block size-[0.78em] shrink-0 overflow-hidden rounded-full ring-1 ring-line";
  const phase = { "--slot": slot } as CSSProperties;

  if (!src) {
    return (
      <span
        aria-hidden
        style={phase}
        className={cx(shape, "bg-gradient-to-br from-accent/30 via-surface-2 to-surface")}
      />
    );
  }

  return (
    <span aria-hidden style={phase} className={shape}>
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
