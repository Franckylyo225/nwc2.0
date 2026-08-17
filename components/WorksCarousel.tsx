"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cx } from "./ui";

/**
 * Piste défilante du carrousel de réalisations.
 *
 * La piste est un conteneur à défilement horizontal avec accroche : elle
 * fonctionne au doigt, au trackpad et au clavier **sans une ligne de
 * JavaScript**. Les flèches et les pastilles sont un confort ajouté à
 * l'hydratation — sans elles, on fait défiler à la main, et rien n'est perdu.
 *
 * C'est pourquoi les fiches sont rendues côté serveur et passées en
 * `children` : ce composant ne connaît que leur nombre.
 */
export function WorksCarousel({
  children,
  backdrops,
  header,
  count,
  label,
}: {
  children: ReactNode;
  /** Un décor par projet, rendu côté serveur ; seul l'affiché est opaque. */
  backdrops: ReactNode[];
  /** Titre de la section : il vit sous les décors, donc à l'intérieur d'ici. */
  header: ReactNode;
  count: number;
  label: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  /* La position courante se lit sur le défilement plutôt que de se piloter :
     glisser au doigt et cliquer sur une flèche mènent alors au même état. */
  useEffect(() => {
    const element = track.current;
    if (!element) return;

    const onScroll = () => {
      const width = element.clientWidth;
      if (width === 0) return;
      setIndex(Math.round(element.scrollLeft / width));
    };

    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (next: number) => {
    const element = track.current;
    if (!element) return;
    element.scrollTo({
      left: element.clientWidth * next,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Décors superposés, tous montés, un seul visible. Les permuter par
          l'opacité plutôt que par le montage donne le fondu d'une couleur à
          l'autre, et évite de recharger une image déjà vue.

          `absolute inset-0` se résout sur la <section>, seul ancêtre
          positionné : le décor couvre donc le titre autant que la fiche. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {backdrops.map((backdrop, i) => (
          <div
            key={i}
            className={cx(
              "absolute inset-0 transition-opacity duration-700 ease-smooth",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            {backdrop}
          </div>
        ))}
      </div>

      <div className="relative">{header}</div>

      <div className="relative">
        <div
          ref={track}
          /* `tabIndex` rend la piste focalisable : les flèches du clavier
             défilent alors, comme dans n'importe quelle zone défilante. */
          tabIndex={0}
          role="group"
          aria-label={label}
          className="works-track flex snap-x snap-mandatory overflow-x-auto focus-visible:outline-none"
        >
          {children}
        </div>

        {/* Commandes : au-dessus de la piste, jamais dans le flux — la fiche
            occupe déjà toute la largeur. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-5 pb-8 sm:px-8">
          <div className="pointer-events-auto flex items-center gap-2 rounded-pill bg-white/10 p-1.5 backdrop-blur-md">
            <Arrow
              direction="previous"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
            />

            <ol className="flex items-center gap-1.5 px-1">
              {Array.from({ length: count }, (_, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Projet ${i + 1} sur ${count}`}
                    aria-current={i === index ? "true" : undefined}
                    className={cx(
                      "block size-1.5 rounded-full transition-all duration-300 ease-smooth",
                      i === index ? "w-5 bg-white" : "bg-white/40 hover:bg-white/70",
                    )}
                  />
                </li>
              ))}
            </ol>

            <Arrow
              direction="next"
              disabled={index >= count - 1}
              onClick={() => goTo(index + 1)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function Arrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isNext = direction === "next";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isNext ? "Projet suivant" : "Projet précédent"}
      className="grid size-9 place-items-center rounded-full text-white transition-colors hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className={cx("size-4", !isNext && "rotate-180")}
      >
        <path
          d="M6 3.5 10.5 8 6 12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
