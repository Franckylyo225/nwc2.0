import Image from "next/image";
import { site } from "@/content/site";
import { isDatabaseConfigured } from "@/lib/db";
import { ContactTrigger } from "./ContactTrigger";
import { Reveal } from "./Reveal";
import { ArrowUpRight } from "./ui";

const { contact } = site;

/**
 * Section de contact — le point final de la page.
 *
 * Deux blocs côte à côte : à gauche l'invitation, dans une carte sombre ; à
 * droite un visuel qui occupe les deux tiers. Rien d'autre — les coordonnées
 * vivent dans le pied de page, les répéter ici affaiblirait le seul geste
 * qu'on attend du visiteur.
 *
 * La carte est volontairement la plus étroite des deux : c'est le contraste
 * avec l'image, et non sa taille, qui la fait regarder en premier.
 */
export function Contact({ image }: { image: string | null }) {
  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-5">
            <Invitation />
            <Visual image={image} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

function Invitation() {
  const available = isDatabaseConfigured();

  return (
    <div className="relative flex flex-col justify-between gap-10 overflow-hidden rounded-[1.75rem] bg-ink p-8 text-white sm:p-10">
      <Squiggle />

      <div className="relative flex flex-col gap-4">
        <h2 className="display text-4xl sm:text-5xl">{contact.title}</h2>
        <p className="max-w-xs leading-relaxed text-white/55">
          {contact.subtitle}
        </p>
      </div>

      {/* Sans base, le parcours n'aurait nulle part où déposer la demande :
          le bouton laisse alors place à l'adresse, qui marche toujours. */}
      {available ? (
        <ContactTrigger className="group relative inline-flex w-full items-center justify-between gap-3 rounded-pill bg-white py-1.5 pl-6 pr-1.5 text-sm font-medium text-ink transition-colors hover:bg-white/90">
          {contact.flow.open}
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-white transition-transform duration-300 ease-smooth group-hover:rotate-45">
            <ArrowUpRight />
          </span>
        </ContactTrigger>
      ) : (
        <a
          href={`mailto:${contact.email}`}
          className="group relative inline-flex w-full items-center justify-between gap-3 rounded-pill bg-white py-1.5 pl-6 pr-1.5 text-sm font-medium text-ink transition-colors hover:bg-white/90"
        >
          {contact.email}
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-white transition-transform duration-300 ease-smooth group-hover:rotate-45">
            <ArrowUpRight />
          </span>
        </a>
      )}
    </div>
  );
}

/**
 * Boucle décorative, en haut de la carte.
 *
 * Le seul trait de couleur de la section : il attire l'œil sur la carte
 * sombre, que l'image voisine écraserait sans lui. Purement graphique, donc
 * masqué aux lecteurs d'écran — et débordant volontairement du cadre, ce que
 * l'`overflow-hidden` de la carte vient trancher.
 */
function Squiggle() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 160 80"
      fill="none"
      className="pointer-events-none absolute -left-10 -top-6 w-52 text-accent"
    >
      <path
        d="M-4 66C10 26 34 6 52 14c14 6 12 28-4 30-18 2-24-18-8-28C62 2 106 6 164 22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Le visuel du bloc, déposé depuis l'administration (Paramètres → CMS).
 *
 * Sans image, un dégradé occupe exactement la même place : la mise en page ne
 * bouge pas au moment de la remplacer.
 */
function Visual({ image }: { image: string | null }) {
  return (
    <div className="relative aspect-4/3 overflow-hidden rounded-[1.75rem] bg-surface-2 sm:aspect-16/10 lg:aspect-auto lg:min-h-[26rem]">
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
      ) : (
        <div className="size-full bg-gradient-to-br from-accent/25 via-surface-2 to-surface" />
      )}
    </div>
  );
}
