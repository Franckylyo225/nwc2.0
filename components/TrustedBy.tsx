import Image from "next/image";
import { site } from "@/content/site";

const { trustedBy } = site;

type PartnerLogo = {
  name: string;
  src: string;
  width: number;
  height: number;
};

/**
 * Bandeau défilant des logos partenaires. L'animation est purement CSS
 * (voir --animate-marquee dans globals.css) : aucun JS côté client.
 *
 * Les logos ont des proportions très différentes ; ils sont donc posés dans
 * une « boîte » de taille fixe où chacun s'inscrit en `object-contain`. Les
 * logos larges sont bridés par la largeur, les logos hauts par la hauteur :
 * l'ensemble garde une présence visuelle comparable.
 */
export function TrustedBy() {
  const logos: readonly PartnerLogo[] = trustedBy.logos;
  if (logos.length === 0) return null;

  /* La liste est doublée : c'est ce qui rend le défilement continu. */
  const loop = [...logos, ...logos];

  return (
    <section className="border-y border-line bg-surface/60 py-10">
      <div className="shell flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        <p className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-muted">
          {trustedBy.label}
        </p>

        <div className="edge-fade relative w-full overflow-hidden">
          <ul className="flex w-max animate-marquee items-center gap-12 pr-12 hover:[animation-play-state:paused] sm:gap-16 sm:pr-16">
            {loop.map((logo, i) => (
              <li
                key={`${logo.src}-${i}`}
                /* La seconde moitié n'est là que pour la boucle visuelle :
                   on la retire des lecteurs d'écran. */
                aria-hidden={i >= logos.length}
                className="flex h-14 w-40 shrink-0 items-center justify-center"
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  /* Niveaux de gris au repos, couleurs de marque au survol.
                     Huit logos aux chartes sans rapport formaient une ligne
                     bariolée qui tirait l'œil plus que le reste de la page ;
                     dégrisés un par un, ils redeviennent lisibles sans voler
                     la vedette.

                     Le survol met aussi l'animation en pause (voir la liste
                     ci-dessus) : le logo reste sous le curseur le temps qu'on
                     le regarde.

                     Contrepartie assumée : un logo dont toute l'identité tient
                     dans sa couleur — le jaune d'ADA — perd son repère au
                     repos. Pour revenir aux couleurs permanentes, retirer
                     `grayscale` et `hover:grayscale-0`. */
                  className="max-h-full w-auto max-w-full object-contain opacity-70 grayscale transition duration-300 ease-smooth hover:opacity-100 hover:grayscale-0"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
