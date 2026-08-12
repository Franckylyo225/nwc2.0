import Image from "next/image";
import { site } from "@/content/site";
import { Reveal } from "./Reveal";
import { Eyebrow, Section } from "./ui";

const { about, brand } = site;

/** `image` vient des réglages (Paramètres → CMS) ; sans elle, un repli dégradé. */
export function About({ image }: { image: string | null }) {
  return (
    <Section id="studio">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Portrait / visuel */}
        <Reveal className="order-2 lg:order-1">
          <div className="relative aspect-4/5 overflow-hidden rounded-card bg-gradient-to-br from-accent/20 via-surface-2 to-surface ring-1 ring-line">
            {image ? (
              <Image
                src={image}
                alt={about.signature.name}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center p-10 text-center">
                <div>
                  <span className="display block text-7xl text-ink/20">
                    {brand.short}
                  </span>
                  <span className="mt-4 block text-sm text-muted">
                    Dépose la photo depuis l&apos;administration,{" "}
                    <span className="whitespace-nowrap">Paramètres → CMS</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* Texte */}
        <Reveal delay={0.08} className="order-1 flex flex-col gap-6 lg:order-2">
          <Eyebrow>{about.eyebrow}</Eyebrow>
          <h2 className="display text-4xl text-ink sm:text-5xl lg:text-[3.5rem]">
            {about.title}
          </h2>

          {about.paragraphs.map((paragraph, i) => (
            <p key={i} className="text-lg leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}

          <div className="mt-2 flex items-center gap-3">
            <span aria-hidden className="h-10 w-px bg-line-strong" />
            <span>
              <span className="block font-semibold text-ink">
                {about.signature.name}
              </span>
              <span className="block text-sm text-muted">
                {about.signature.role}
              </span>
            </span>
          </div>

          {about.highlights.length > 0 ? (
            <dl className="mt-6 grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
              {about.highlights.map((item) => (
                <div key={item.label}>
                  <dt className="sr-only">{item.label}</dt>
                  <dd className="display text-3xl text-ink">{item.value}</dd>
                  <dd className="mt-1.5 text-sm leading-snug text-muted">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Reveal>
      </div>
    </Section>
  );
}
