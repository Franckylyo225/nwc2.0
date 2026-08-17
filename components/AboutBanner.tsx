import type { CSSProperties } from "react";
import Image from "next/image";
import { site } from "@/content/site";
import { Reveal } from "./Reveal";
import { BrandMark } from "./ui";

const { aboutBanner, brand } = site;

/**
 * Grande carte sombre posée juste avant les services : la déclaration
 * d'intention du studio, avec une carte de chiffres qui défile par-dessus.
 *
 * La photo de fond vient des réglages (Paramètres → CMS) et reste facultative.
 * Sans elle, la carte est sombre et parfaitement lisible — le dégradé occupe la
 * même place, la mise en page ne bouge pas au moment de la remplacer.
 */
export function AboutBanner({ image }: { image: string | null }) {
  return (
    <section className="pt-8 sm:pt-12">
      <div className="shell">
        <Reveal>
          {/* La hauteur plancher suit la largeur : à 28 rem sur un téléphone,
              elle imposait un vide sous le logo avant même que le texte ne
              commence. Le rembourrage descend aussi — 2 rem de chaque côté sur
              un écran de 375 px, c'est un sixième de la largeur perdu. */}
          <div className="relative isolate flex min-h-[20rem] flex-col justify-between overflow-hidden rounded-card bg-ink p-6 text-white sm:min-h-[28rem] sm:p-12 lg:min-h-[34rem] lg:p-14">
            {image ? (
              /* Décorative : le sens est porté par le titre et le paragraphe
                 posés par-dessus, d'où un `alt` vide. */
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority={false}
                className="-z-10 object-cover"
              />
            ) : null}

            {/* Assombrit vers le bas-gauche, là où se pose le texte. Présent
                même sans photo : il donne sa profondeur à la carte. */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-gradient-to-tr from-ink via-ink/85 to-ink/45"
            />

            <p className="flex items-center gap-2.5 sm:gap-3">
              <BrandMark className="size-6 shrink-0 sm:size-7" />
              <span className="display text-xl tracking-tight sm:text-2xl">
                {brand.short}
              </span>
              <span className="sr-only">{brand.name}</span>
            </p>

            <div className="mt-10 grid gap-8 sm:mt-14 sm:gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
              <div>
                {/* L'interlignage d'affichage (0.98) est calibré pour un titre
                    d'une ou deux lignes. Sur un téléphone celui-ci en fait
                    quatre : il faut le desserrer, sinon les lignes se touchent. */}
                <h2 className="display max-w-3xl text-[1.75rem] leading-[1.08] sm:text-4xl sm:leading-[0.98] lg:text-5xl">
                  {aboutBanner.title}
                </h2>
                {/* Ce paragraphe fait près de 500 signes. À 18 px dans une
                    colonne de 270 px, il occupait une trentaine de lignes : on
                    revient au corps de texte courant tant qu'on est étroit. */}
                <p className="mt-4 max-w-3xl leading-relaxed text-white/70 sm:mt-6 sm:text-lg">
                  {aboutBanner.text}
                </p>
              </div>

              <StatCarousel />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Les chiffres, un par écran, en défilement horizontal avec accroche.
 *
 * Aucun JavaScript : c'est une zone défilante ordinaire, et le curseur des
 * pastilles est piloté par le défilement lui-même (voir `.stat-carousel` dans
 * globals.css). Au clavier comme au lecteur d'écran, les trois chiffres sont
 * atteignables — ils sont tous dans le HTML, rien n'est masqué.
 */
function StatCarousel() {
  const { stats } = aboutBanner;
  /* Test en falsy plutôt qu'en `=== 0` : `site` est figé par `as const`, donc
     TypeScript connaît la longueur exacte et refuserait la comparaison. */
  if (!stats.length) return null;

  return (
    <div className="stat-carousel w-full lg:w-72">
      <div
        className="stat-scroller"
        tabIndex={0}
        role="group"
        aria-label="Chiffres clés du studio"
      >
        {stats.map((stat) => (
          <article
            key={stat.caption}
            className="rounded-[1rem] bg-white p-5 text-ink shadow-[0_28px_64px_-40px_rgba(16,17,20,0.7)] sm:p-6"
          >
            <p className="flex items-baseline gap-1.5">
              <span className="display text-4xl sm:text-5xl">{stat.value}</span>
              <span className="text-base text-muted sm:text-lg">{stat.unit}</span>
            </p>
            <p className="mt-3 text-sm leading-snug text-muted">
              {stat.caption}
            </p>
          </article>
        ))}
      </div>

      {stats.length > 1 ? (
        <div
          aria-hidden
          className="stat-dots mx-auto mt-5 lg:mr-0"
          style={{ "--n": stats.length } as CSSProperties}
        >
          {stats.map((stat) => (
            <span key={stat.caption} />
          ))}
          <span className="stat-cursor" />
        </div>
      ) : null}
    </div>
  );
}
