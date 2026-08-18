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
 * `pb-[env(safe-area-inset-bottom)]` le remonte au-dessus de la barre
 * d'accueil des iPhone récents, sans quoi le bas du bouton passe dessous.
 */
export function MobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:hidden">
      <ContactTrigger className="flex w-full items-center justify-center gap-2 rounded-pill bg-ink px-6 py-3.5 text-sm font-medium text-white transition-colors active:bg-accent">
        {site.nav.cta.label}
        <ArrowUpRight />
      </ContactTrigger>
    </div>
  );
}
