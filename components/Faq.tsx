"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { Reveal } from "./Reveal";
import { Eyebrow, Section, cx } from "./ui";

const { faq } = site;

export function Faq() {
  /* Une seule question ouverte à la fois ; la première l'est au chargement. */
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" className="bg-surface/50">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>{faq.eyebrow}</Eyebrow>
          <h2 className="display text-4xl text-ink sm:text-5xl">{faq.title}</h2>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="flex flex-col">
            {faq.items.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <li key={item.q} className="border-b border-line first:border-t">
                  <h3>
                    <button
                      type="button"
                      id={`faq-trigger-${i}`}
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-accent"
                    >
                      <span className="text-lg font-medium tracking-tight">
                        {item.q}
                      </span>
                      <span
                        aria-hidden
                        className={cx(
                          "relative grid size-8 shrink-0 place-items-center rounded-full ring-1 transition-all duration-300 ease-smooth",
                          isOpen
                            ? "rotate-45 bg-accent text-white ring-accent"
                            : "ring-line-strong",
                        )}
                      >
                        <span className="absolute h-px w-3.5 bg-current" />
                        <span className="absolute h-3.5 w-px bg-current" />
                      </span>
                    </button>
                  </h3>

                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    /* `inert` retire le panneau fermé du focus et des lecteurs
                       d'écran sans casser la transition CSS (React 19). */
                    inert={!isOpen}
                    className={cx(
                      "grid transition-all duration-400 ease-smooth",
                      isOpen
                        ? "grid-rows-[1fr] pb-7 opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pr-10 leading-relaxed text-muted">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
