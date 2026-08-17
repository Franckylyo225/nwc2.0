import Image from "next/image";
import { site } from "@/content/site";
import type { ServiceItem } from "@/lib/content";
import { Reveal } from "./Reveal";
import { ServicesTabs } from "./ServicesTabs";
import { Section, SectionHeading } from "./ui";

const { services } = site;

/**
 * Services — un seul à la fois, montré en grand.
 *
 * Six cartes côte à côte se lisaient comme un tarif : l'œil balayait et ne
 * retenait rien. En onglets, chaque service obtient une illustration, une
 * phrase et ses points clés, et le visiteur choisit ce qu'il regarde.
 *
 * Les titres de section restent dans content/site.ts ; les items viennent de
 * la base.
 */
export function Services({ items }: { items: ServiceItem[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="services" className="overflow-hidden bg-surface/60">
      <Reveal>
        <SectionHeading eyebrow={services.eyebrow} title={services.title} />
      </Reveal>

      <ServicesTabs
        titles={items.map((service) => service.title)}
        panels={items.map((service, i) => (
          <Panel key={service.id} service={service} priority={i === 0} />
        ))}
      />
    </Section>
  );
}

/* ------------------------------------------------------------------------ */

function Panel({
  service,
  priority,
}: {
  service: ServiceItem;
  priority: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* L'illustration et son bandeau partagent ce repère : c'est lui qui
          cale le bandeau à mi-hauteur de l'image, et non du panneau entier —
          la description et les pastilles ne doivent pas peser dans ce calcul. */}
      <div className="relative flex w-full justify-center">
        {/* Le bandeau passe DERRIÈRE l'illustration : ce chevauchement donne
            sa profondeur au bloc.

            Il déborde de la colonne de texte pour occuper toute la largeur de
            la fenêtre : ancré au centre — la colonne étant centrée dans la
            page — puis étiré à `100vw` et recentré sur lui-même. Le débord est
            retenu par l'`overflow-hidden` de la section, ce qui évite au
            passage la barre horizontale que `100vw` provoque dès que la
            verticale est visible. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 w-screen -translate-x-1/2 -translate-y-1/2"
        >
          <Marquee text={service.title} />
        </div>

        <div className="relative aspect-16/10 w-full max-w-2xl overflow-hidden rounded-card bg-surface-2 shadow-[0_40px_90px_-50px_rgba(16,17,20,0.55)] ring-1 ring-line">
          {service.image ? (
            <Image
              src={service.image}
              alt={service.title}
              fill
              sizes="(max-width: 768px) 100vw, 42rem"
              priority={priority}
              className="object-cover"
            />
          ) : (
            /* Repli : le bloc garde exactement la même place, la mise en page
               ne bouge donc pas au moment de déposer la vraie illustration. */
            <div className="grid size-full place-items-center bg-gradient-to-br from-accent/20 via-surface-2 to-surface">
              <span className="display text-5xl text-ink/15">
                {service.title.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      <p className="max-w-md text-center text-lg leading-relaxed text-muted">
        {service.description}
      </p>

      {service.bullets.length > 0 ? (
        <ul className="flex flex-wrap justify-center gap-2">
          {service.bullets.map((bullet) => (
            <li
              key={bullet}
              className="rounded-pill bg-ink px-4 py-2 text-sm text-white/90"
            >
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Titre du service répété en très grand, défilant derrière l'illustration.
 *
 * Purement décoratif — le titre est déjà lisible dans l'onglet actif, le
 * répéter à voix haute n'apporterait rien. L'animation est celle des logos
 * partenaires (`--animate-marquee`), et le masque de bord évite qu'il
 * paraisse coupé net.
 */
function Marquee({ text }: { text: string }) {
  /* Répété six fois : trois suffisent à couvrir un écran large, et le tout
     est doublé pour que la boucle soit continue. */
  const run = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="edge-fade w-full overflow-hidden">
      <div className="flex w-max animate-marquee-slow items-center gap-8">
        {run.map((i) => (
          <span
            key={i}
            className="display whitespace-nowrap text-[clamp(3.5rem,11vw,9rem)] text-accent/25"
          >
            {text}
            <span className="mx-8 text-accent/40">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}
