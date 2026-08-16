import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import type { WorkItem } from "@/lib/content";
import { Reveal } from "./Reveal";
import { WorksCarousel } from "./WorksCarousel";
import { ArrowUpRight, cx } from "./ui";

const { works } = site;

/** Dégradés utilisés quand un projet n'a pas encore de visuel. */
const placeholders = [
  "from-accent/40 via-accent/10 to-transparent",
  "from-white/20 via-white/5 to-transparent",
  "from-accent/25 via-white/10 to-transparent",
];

/**
 * Réalisations — un projet à la fois, en grand.
 *
 * La section rompt avec le reste de la page : fond sombre, pleine largeur, et
 * une seule fiche à l'écran. Un projet client se regarde, il ne se parcourt
 * pas en liste ; lui donner toute la place est le seul moyen d'en montrer
 * autre chose qu'une vignette.
 *
 * Le visuel du projet sert deux fois : net au centre, et flouté en fond. Le
 * décor change donc avec la fiche sans qu'aucune couleur soit à saisir dans
 * l'administration.
 */
export function Works({ items }: { items: WorkItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="realisations" className="bg-ink py-20 text-white sm:py-24">
      <Reveal className="shell mb-12 flex flex-col gap-5">
        <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-white/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-accent">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {works.eyebrow}
        </span>
        <h2 className="display text-4xl sm:text-5xl lg:text-[3.5rem]">
          {works.title}
        </h2>
      </Reveal>

      <WorksCarousel count={items.length} label={works.title}>
        {items.map((work, i) => (
          <WorkSlide
            key={work.id}
            work={work}
            index={i}
            total={items.length}
            /* Seule la première fiche est visible au chargement : les autres
               attendent qu'on les fasse défiler pour charger leur visuel. */
            priority={i === 0}
          />
        ))}
      </WorksCarousel>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

function WorkSlide({
  work,
  index,
  total,
  priority,
}: {
  work: WorkItem;
  index: number;
  total: number;
  priority: boolean;
}) {
  const counter = (value: number) => String(value).padStart(2, "0");

  return (
    <article className="relative w-full shrink-0 snap-center overflow-hidden">
      {/* Décor : le visuel du projet, agrandi et flouté. Purement décoratif,
          donc masqué aux lecteurs d'écran — l'image nette porte déjà le sens. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {work.image ? (
          <Image
            src={work.image}
            alt=""
            fill
            sizes="100vw"
            /* Une vignette suffit : l'image est floutée à outrance. */
            quality={20}
            className="scale-125 object-cover opacity-45 blur-[80px]"
          />
        ) : (
          <div
            className={cx(
              "size-full bg-gradient-to-br",
              placeholders[index % placeholders.length],
            )}
          />
        )}
      </div>

      {/* `pb-28` réserve la place des commandes, posées par-dessus la piste. */}
      <div className="shell relative grid gap-10 pb-28 pt-12 lg:grid-cols-[1fr_minmax(0,22rem)_1fr] lg:items-stretch lg:gap-12 lg:pt-16">
        {/* Colonne de gauche : le propos en haut, l'identité du projet en bas.
            Sur mobile elle passe sous le visuel — le nom doit suivre l'image. */}
        <div className="order-2 flex flex-col justify-between gap-10 lg:order-1">
          <p className="max-w-xs leading-relaxed text-white/55">{works.intro}</p>

          <div className="flex flex-col gap-4">
            <p className="text-sm text-white/45">
              <span className="text-white">{counter(index + 1)}</span> /{" "}
              {counter(total)}
            </p>
            <span aria-hidden className="h-px w-24 bg-white/20" />
            <h3 className="display text-5xl sm:text-6xl lg:text-7xl">
              {work.name}
            </h3>
            <p className="max-w-sm leading-relaxed text-white/55">
              {work.summary}
            </p>
          </div>
        </div>

        {/* Le visuel, au centre et en portrait — le format d'une maquette. */}
        <div className="order-1 lg:order-2 lg:self-center">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[1.5rem] bg-white/5 ring-1 ring-white/15 lg:max-w-none">
            {work.image ? (
              <Image
                src={work.image}
                alt={work.name}
                fill
                sizes="(max-width: 1024px) 90vw, 22rem"
                priority={priority}
                className="object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center">
                <span className="display text-6xl text-white/20">
                  {initials(work.name)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Colonne de droite : la fiche technique du projet. */}
        <dl className="order-3 flex flex-col gap-8 lg:pt-2">
          <Meta label="Année">{work.year}</Meta>
          <Meta label="Rôle">{work.category}</Meta>

          {work.services.length > 0 ? (
            <Meta label="Prestations">
              <span className="flex flex-col gap-1.5">
                {work.services.map((service) => (
                  <span key={service}>{service}</span>
                ))}
              </span>
            </Meta>
          ) : null}

          {/* Une liste de définitions n'accepte que dt, dd et div : le lien
              doit donc être enveloppé, sous peine de HTML invalide. */}
          {work.href !== "#" ? (
            <div>
              <Link
                href={work.href}
                className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-white transition-colors hover:text-accent"
              >
                Voir le projet
                <ArrowUpRight className="transition-transform duration-300 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}

function Meta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="text-sm text-white/45">{label}</dt>
      <dd className="text-lg leading-snug">{children}</dd>
    </div>
  );
}

/** Repère visuel en attendant le vrai visuel du projet. */
function initials(name: string) {
  return (
    name
      .replace(/[^A-Za-zÀ-ÿ]/g, "")
      .slice(0, 2)
      .toUpperCase() || "NWC"
  );
}
