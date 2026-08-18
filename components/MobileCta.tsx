import { ContactTrigger } from "./ContactTrigger";
import { ArrowUpRight } from "./ui";
import { site } from "@/content/site";

/**
 * Bouton d'appel fixé au bas de l'écran, sur mobile uniquement.
 *
 * Il n'apparaît qu'en dessous de `sm`, précisément là où celui de la
 * navigation disparaît : au-delà, le visiteur a déjà un « Démarrer un projet »
 * sous les yeux en permanence, et deux boutons identiques à l'écran se
 * concurrenceraient.
 *
 * C'est une bannière et non un bouton posé dans une barre : elle occupe toute
 * la largeur, sans marge ni arrondi, et porte la couleur d'accent. Sur un
 * écran de téléphone, c'est la forme qui reste lisible d'un coup d'œil et la
 * plus facile à atteindre au pouce.
 *
 * Le rembourrage bas absorbe `env(safe-area-inset-bottom)` : la couleur
 * descend ainsi jusqu'au bord de l'écran sur les iPhone récents, tandis que le
 * texte reste au-dessus de la barre d'accueil.
 */
export function MobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 shadow-[0_-12px_30px_-18px_rgba(16,17,20,0.45)] sm:hidden">
      <ContactTrigger className="flex w-full items-center justify-center gap-2 bg-accent px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 text-sm font-medium text-white transition-colors active:bg-accent-hover">
        {site.nav.cta.label}
        <ArrowUpRight />
      </ContactTrigger>
    </div>
  );
}
