import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import type { WorkItem } from "@/lib/content";
import { Reveal } from "./Reveal";
import { Wordmark } from "./Wordmark";
import { WorksCarousel } from "./WorksCarousel";
import { ArrowUpRight, Eyebrow, cx } from "./ui";

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
    <>
      {/* En-tête posé sur le fond clair de la page : la pastille, puis le titre
          en très grand que le bord de la section sombre vient trancher. */}
      <Reveal className="shell overflow-hidden pt-16 sm:pt-20">
        {/* La même pastille que les autres sections, simplement centrée : le
            bandeau qu'elle annonce l'est aussi. */}
        <div className="mb-6 flex justify-center">
          <Eyebrow>{works.eyebrow}</Eyebrow>
        </div>
        {/* Deux mots de moins que le nom de la marque : le corps peut monter
            sans que la ligne déborde de la colonne. */}
        <Wordmark
          text={works.title}
          className="text-[clamp(2.5rem,13.5vw,12.5rem)]"
        />
      </Reveal>

      {/* `relative` sert de repère aux décors : ils sont posés par le carrousel
          mais doivent couvrir la section entière. `overflow-hidden` retient le
          débord du flou. */}
      <section
        id="realisations"
        className="relative overflow-hidden bg-ink py-20 text-white sm:py-24"
      >
        {/* Le titre visible est décoratif : l'ossature du document a tout de
            même besoin du sien, sans quoi la section n'aurait pas de nom. */}
        <h2 className="sr-only">{works.title}</h2>

        <WorksCarousel
          count={items.length}
          label={works.title}
          /* Les décors sont rendus côté serveur et seulement permutés par le
             carrousel : `next/image` reste hors du bundle client. */
          backdrops={items.map((work, i) => (
            <Backdrop key={work.id} image={work.image} index={i} />
          ))}
        >
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
    </>
  );
}

/**
 * Décor d'un projet : son visuel, agrandi et flouté à outrance.
 *
 * C'est ce qui donne sa couleur à toute la section — elle change avec la
 * fiche affichée, sans qu'aucune teinte soit à saisir dans l'administration.
 * Purement décoratif : l'image nette de la fiche porte déjà le sens.
 */
function Backdrop({ image, index }: { image: string | null; index: number }) {
  if (!image) {
    return (
      <div
        className={cx(
          "size-full bg-gradient-to-br",
          placeholders[index % placeholders.length],
        )}
      />
    );
  }

  return (
    <Image
      src={image}
      alt=""
      fill
      sizes="100vw"
      /* Une vignette suffit : l'image est floutée au point de n'être plus
         qu'un aplat de couleurs. */
      quality={20}
      className="scale-125 object-cover opacity-45 blur-[80px]"
    />
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
    /* La fiche est transparente : son décor est posé au niveau de la section,
       pour teinter aussi le titre — il ne défile donc pas avec elle. */
    <article className="w-full shrink-0 snap-center">
      {/* `pb-28` réserve la place des commandes, posées par-dessus la piste. */}
      <div className="shell grid gap-10 pb-28 pt-12 lg:grid-cols-[1fr_minmax(0,22rem)_1fr] lg:items-stretch lg:gap-12 lg:pt-16">
        {/* Colonne de gauche : le projet raconté en haut, nommé en bas. Le nom
            se pose au pied de la colonne, à la manière du modèle — l'œil
            descend le long du texte et tombe dessus.
            Sur mobile elle passe sous le visuel : le nom doit suivre l'image. */}
        <div className="order-2 flex flex-col justify-between gap-10 lg:order-1">
          <p className="max-w-xs leading-relaxed text-white/55">{work.summary}</p>

          <div className="flex flex-col gap-4">
            <p className="text-sm text-white/45">
              <span className="text-white">{counter(index + 1)}</span> /{" "}
              {counter(total)}
            </p>
            <span aria-hidden className="h-px w-24 bg-white/20" />
            <h3 className="display text-5xl sm:text-6xl lg:text-7xl">
              {work.name}
            </h3>
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

          {/* Une vraie liste : les prestations sont des éléments distincts, et
              un lecteur d'écran doit les annoncer comme tels. Pas de puces —
              l'empilement suffit à les séparer, et le modèle n'en a pas. */}
          {work.services.length > 0 ? (
            <Meta label="Prestations">
              <ul className="flex flex-col gap-1.5">
                {work.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
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
