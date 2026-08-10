import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import type { WorkItem } from "@/lib/content";
import { Reveal } from "./Reveal";
import { ArrowUpRight, Button, Section, SectionHeading, cx } from "./ui";

const { works } = site;

/** Dégradés utilisés quand aucune image n'est fournie dans content/site.ts. */
const placeholders = [
  "from-accent/25 via-accent/5 to-surface-2",
  "from-ink/15 via-surface-2 to-surface",
  "from-accent/15 via-surface to-surface-2",
];

export function Works({ items }: { items: WorkItem[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="realisations" className="bg-surface/50">
      <Reveal>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={works.eyebrow}
            title={works.title}
            intro={works.intro}
          />
          <Button href={works.cta.href} variant="secondary" className="shrink-0">
            {works.cta.label}
            <ArrowUpRight />
          </Button>
        </div>
      </Reveal>

      <div className="mt-16 flex flex-col gap-6">
        {items.map((work, i) => (
          <Reveal key={work.id} delay={0.06 * i}>
            <Link
              href={work.href}
              className="group grid overflow-hidden rounded-card bg-white ring-1 ring-line transition-all duration-400 ease-smooth hover:shadow-[0_30px_70px_-40px_rgba(16,17,20,0.4)] hover:ring-line-strong lg:grid-cols-[1.1fr_1fr]"
            >
              {/* Visuel */}
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[22rem]">
                {work.image ? (
                  <Image
                    src={work.image}
                    alt={work.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
                  />
                ) : (
                  <div
                    className={cx(
                      "grid h-full w-full place-items-center bg-gradient-to-br",
                      placeholders[i % placeholders.length],
                    )}
                  >
                    {/* Repère visuel en attendant la vraie image du projet */}
                    <span className="display text-6xl text-ink/20">
                      {work.name.replace(/[^A-Za-zÀ-ÿ]/g, "").slice(0, 2).toUpperCase() ||
                        "NWC"}
                    </span>
                  </div>
                )}
              </div>

              {/* Texte */}
              <div className="flex flex-col justify-between gap-8 p-8 lg:p-12">
                <div>
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted">
                    <span>{work.category}</span>
                    <span aria-hidden className="h-px w-6 bg-line-strong" />
                    <span>{work.year}</span>
                  </div>

                  <h3 className="display mt-5 text-4xl text-ink sm:text-5xl">
                    {work.name}
                  </h3>
                  <p className="mt-4 max-w-md leading-relaxed text-muted">
                    {work.summary}
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors group-hover:text-accent">
                  Voir le projet
                  <ArrowUpRight className="transition-transform duration-300 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
