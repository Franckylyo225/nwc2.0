import { site } from "@/content/site";
import type { ServiceItem } from "@/lib/content";
import { Reveal } from "./Reveal";
import { Check, Section, SectionHeading } from "./ui";

const { services } = site;

/** Les titres de section restent dans content/site.ts ; les items viennent de la base. */
export function Services({ items }: { items: ServiceItem[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="services">
      <Reveal>
        <SectionHeading
          eyebrow={services.eyebrow}
          title={services.title}
          intro={services.intro}
        />
      </Reveal>

      <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((service, i) => (
          <Reveal key={service.id} delay={0.05 * (i % 3)}>
            <li className="group flex h-full flex-col rounded-card bg-surface p-7 ring-1 ring-transparent transition-all duration-300 ease-smooth hover:bg-white hover:shadow-[0_24px_60px_-32px_rgba(16,17,20,0.35)] hover:ring-line">
              <span className="display mb-6 text-sm text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>

              <h3 className="text-xl font-semibold tracking-tight text-ink">
                {service.title}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
                {service.description}
              </p>

              <ul className="mt-6 flex flex-col gap-2 border-t border-line pt-5 text-sm text-ink-soft">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2.5">
                    <Check className="text-accent" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
