import { site } from "@/content/site";
import type { TestimonialItem } from "@/lib/content";
import { Reveal } from "./Reveal";
import { Eyebrow } from "./ui";

const { testimonials } = site;

export function Testimonials({ items }: { items: TestimonialItem[] }) {
  if (items.length === 0) return null;

  /* Liste doublée pour un défilement sans couture. */
  const loop = [...items, ...items];

  return (
    <section className="overflow-hidden py-24 sm:py-32">
      <div className="shell">
        <Reveal className="flex flex-col items-center gap-5 text-center">
          <Eyebrow>{testimonials.eyebrow}</Eyebrow>
          <h2 className="display text-4xl text-ink sm:text-5xl">
            {testimonials.title}
          </h2>
        </Reveal>
      </div>

      <div className="edge-fade relative mt-14 overflow-hidden">
        <ul className="flex w-max animate-marquee-slow gap-5 pr-5 hover:[animation-play-state:paused]">
          {loop.map((item, i) => (
            <li
              key={i}
              aria-hidden={i >= items.length}
              className="flex w-[min(85vw,26rem)] shrink-0 flex-col justify-between gap-8 rounded-card bg-surface p-8 ring-1 ring-line"
            >
              <div>
                <Stars />
                <blockquote className="mt-5 text-lg leading-relaxed text-ink-soft">
                  “{item.quote}”
                </blockquote>
              </div>

              <figcaption className="flex items-center gap-3 border-t border-line pt-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-sm font-medium text-white">
                  {initials(item.author)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {item.author}
                  </span>
                  <span className="block truncate text-sm text-muted">
                    {item.role} · {item.company}
                  </span>
                </span>
              </figcaption>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stars() {
  return (
    <div className="flex gap-1 text-accent" aria-label="5 étoiles sur 5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-4">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

/** « [Prénom Nom] » → « PN ». Tolère les valeurs encore entre crochets. */
function initials(name: string) {
  const letters = name
    .replace(/[[\]]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("");
  return letters.slice(0, 2).toUpperCase() || "•";
}
