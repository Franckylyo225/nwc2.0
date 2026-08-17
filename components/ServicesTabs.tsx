"use client";

import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cx } from "./ui";

/**
 * Onglets des services : une rangée de titres, un seul service montré en
 * grand.
 *
 * Tous les panneaux sont rendus, y compris ceux qui sont masqués : leur texte
 * part donc dans le HTML, et un moteur de recherche lit les six services et
 * non le premier. `hidden` les retire du flux, du focus et des lecteurs
 * d'écran — ce qu'un simple `opacity-0` ne ferait pas.
 *
 * Les panneaux sont rendus côté serveur et passés en `children` : `next/image`
 * reste hors du bundle client, qui ne fait que basculer un index.
 */
export function ServicesTabs({
  titles,
  panels,
}: {
  titles: string[];
  /** Un panneau par service, dans le même ordre que `titles`. */
  panels: ReactNode[];
}) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Flèches, Origine et Fin déplacent la sélection, comme dans tout jeu
   * d'onglets. Sans cela, seule la tabulation circulerait — et elle sort du
   * groupe au lieu de le parcourir.
   */
  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = titles.length - 1;
    const next = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    }[event.key];

    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="mt-12">
      <div
        role="tablist"
        aria-label="Nos services"
        onKeyDown={onKeyDown}
        className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-line pt-6"
      >
        {titles.map((title, i) => (
          <button
            key={title}
            ref={(node) => {
              tabs.current[i] = node;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            /* Un seul onglet est atteignable au clavier : la tabulation entre
               dans le groupe et en sort, les flèches y circulent. */
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cx(
              "inline-flex items-center gap-2 text-sm transition-colors duration-300 ease-smooth",
              i === active ? "text-accent" : "text-muted hover:text-ink",
            )}
          >
            <span
              aria-hidden
              className={cx(
                "size-1.5 rounded-full bg-accent transition-all duration-300 ease-smooth",
                i === active ? "scale-100 opacity-100" : "scale-0 opacity-0",
              )}
            />
            {title}
          </button>
        ))}
      </div>

      {panels.map((panel, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
          /* `tabIndex` rend le panneau focalisable : après un changement
             d'onglet, la tabulation reprend dans le contenu affiché. */
          tabIndex={0}
          /* L'animation est portée par le panneau lui-même : elle se rejoue à
             chaque prise de main, puisqu'il sort du `display: none`. */
          className="mt-10 [animation:service-in_0.45s_var(--ease-smooth)_both] focus-visible:outline-none"
        >
          {panel}
        </div>
      ))}
    </div>
  );
}
