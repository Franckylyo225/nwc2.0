import { site } from "@/content/site";
import type { SiteSettings } from "@/lib/settings";
import { ArrowUpRight } from "./ui";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Écran affiché aux visiteurs quand le mode maintenance est actif.
 *
 * Volontairement autonome : ni navigation, ni pied de page, aucun lien vers
 * les pages masquées. Le seul chemin ouvert est le contact.
 */
export function Maintenance({ settings }: { settings: SiteSettings }) {
  const { brand, contact } = site;
  const eta = settings.maintenanceEta;

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-6 py-20">
      {/* Même décor que le hero : on reste chez soi, même portes fermées. */}
      <div
        aria-hidden
        className="grid-bg pointer-events-none absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="relative flex w-full max-w-2xl flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-[0.9rem] bg-ink text-white">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-7">
            <title>{brand.name}</title>
            <path
              d="M2 15c2.2-3.4 4-3.4 6.2 0s4 3.4 6.2 0 4-3.4 6.2 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M2 9c2.2-3.4 4-3.4 6.2 0s4 3.4 6.2 0 4-3.4 6.2 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.45"
            />
          </svg>
        </span>

        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-muted">
          {brand.name}
        </p>

        <h1 className="display mt-6 text-5xl text-ink sm:text-6xl lg:text-7xl">
          {settings.maintenanceTitle}
        </h1>

        <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
          {settings.maintenanceMessage}
        </p>

        {eta && settings.maintenanceEtaIsFuture ? (
          <p className="mt-8 inline-flex items-center gap-2.5 rounded-pill bg-white px-4 py-2 text-sm text-muted shadow-[0_1px_2px_rgba(16,17,20,0.06)] ring-1 ring-line">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Ouverture prévue le{" "}
            <time dateTime={eta.toISOString()} className="font-medium text-ink">
              {dateFormat.format(eta)}
            </time>
          </p>
        ) : null}

        {settings.showContact ? (
          <div className="mt-12 flex flex-col items-center gap-4 border-t border-line pt-10">
            <p className="text-sm text-muted">Un projet en attendant ?</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-pill bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent"
              >
                {contact.email}
                <ArrowUpRight />
              </a>
              <a
                href={`tel:${contact.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-pill bg-white px-6 py-3 text-sm text-ink ring-1 ring-line-strong transition-colors hover:bg-surface"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
