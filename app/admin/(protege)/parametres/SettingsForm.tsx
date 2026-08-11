"use client";

import { useActionState, useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import { ImageField } from "@/components/admin/ImageField";
import { cx } from "@/components/ui";
import type { SiteSettings } from "@/lib/settings";

/**
 * Emplacements des vignettes, dans l'ordre du titre. Les positions
 * correspondent aux `imageSlot` déclarés dans content/site.ts.
 */
const HERO_SLOTS = [
  {
    name: "heroImage1",
    position: 1,
    label: "1 — après « la présence »",
    help: "Apparaît juste avant le mot coloré du titre.",
  },
  {
    name: "heroImage2",
    position: 2,
    label: "2 — après « des plus grandes »",
    help: "Apparaît avant « marques ».",
  },
  {
    name: "heroImage3",
    position: 3,
    label: "3 — après « d'Abidjan »",
    help: "Apparaît avant « et d'ailleurs ».",
  },
] as const;

const input =
  "w-full rounded-xl bg-white px-4 py-3 text-sm text-ink ring-1 ring-line transition-shadow placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(saveSettings, {});

  /* L'interrupteur pilote l'affichage des champs qui n'ont de sens
     qu'en mode maintenance. */
  const [active, setActive] = useState(settings.maintenanceMode);

  return (
    <form action={formAction} className="flex flex-col gap-7">
      {state.error ? (
        <p
          role="alert"
          className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent ring-1 ring-accent/20"
        >
          {state.error}
        </p>
      ) : null}

      {/* Interrupteur principal */}
      <label
        className={cx(
          "flex cursor-pointer items-start gap-4 rounded-card p-5 ring-1 transition-colors",
          active ? "bg-accent-soft ring-accent/30" : "bg-white ring-line",
        )}
      >
        <input
          type="checkbox"
          name="maintenanceMode"
          defaultChecked={settings.maintenanceMode}
          onChange={(event) => setActive(event.target.checked)}
          className="mt-0.5 size-4 accent-[var(--color-accent)]"
        />
        <span>
          <span className="block text-sm font-medium text-ink">
            Activer le mode maintenance
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-muted">
            Les visiteurs voient une page d&apos;attente à la place du site.
            Connecté à l&apos;administration, vous continuez de voir le vrai site
            avec un bandeau de rappel.
          </span>
        </span>
      </label>

      <fieldset
        disabled={!active}
        className={cx(
          "flex flex-col gap-7 transition-opacity",
          !active && "pointer-events-none opacity-45",
        )}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="maintenanceTitle" className="text-sm font-medium text-ink">
            Titre affiché
          </label>
          <input
            id="maintenanceTitle"
            name="maintenanceTitle"
            defaultValue={settings.maintenanceTitle}
            className={input}
          />
          {state.fieldErrors?.maintenanceTitle ? (
            <p role="alert" className="text-sm text-accent">
              {state.fieldErrors.maintenanceTitle}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="maintenanceMessage"
            className="text-sm font-medium text-ink"
          >
            Message
          </label>
          <textarea
            id="maintenanceMessage"
            name="maintenanceMessage"
            rows={3}
            defaultValue={settings.maintenanceMessage}
            className={input}
          />
          {state.fieldErrors?.maintenanceMessage ? (
            <p role="alert" className="text-sm text-accent">
              {state.fieldErrors.maintenanceMessage}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="maintenanceEta" className="text-sm font-medium text-ink">
            Date d&apos;ouverture annoncée
          </label>
          <input
            id="maintenanceEta"
            name="maintenanceEta"
            type="date"
            defaultValue={settings.maintenanceEta?.toISOString().slice(0, 10) ?? ""}
            className={input}
          />
          <p className="text-sm text-muted">
            Facultatif. Laissée vide, ou déjà passée, aucune date n&apos;est
            affichée.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="showContact"
            defaultChecked={settings.showContact}
            className="size-4 accent-[var(--color-accent)]"
          />
          Afficher l&apos;e-mail et le téléphone sur la page d&apos;attente
        </label>
      </fieldset>

      {/* --------------------------------------- Vignettes du titre --- */}
      <section className="flex flex-col gap-5 border-t border-line pt-7">
        <div>
          <h2 className="text-sm font-medium text-ink">
            Images du titre d&apos;accueil
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Trois vignettes rondes s&apos;insèrent entre les mots du grand titre.
            Sans image, une pastille neutre occupe la place — la mise en page ne
            bouge pas. Format conseillé : <strong>carré, 400 × 400 px minimum</strong>,
            sujet centré, car l&apos;image est recadrée en cercle.
          </p>
        </div>

        {HERO_SLOTS.map((slot) => (
          <div key={slot.name} className="flex flex-col gap-2">
            <label htmlFor={slot.name} className="text-sm font-medium text-ink">
              {slot.label}
            </label>
            <ImageField
              id={slot.name}
              name={slot.name}
              value={settings.heroImages[slot.position] ?? ""}
              help={slot.help}
            />
          </div>
        ))}
      </section>

      <div className="flex items-center justify-end gap-4 border-t border-line pt-6">
        <span aria-live="polite" className="text-sm text-muted">
          {state.ok && !pending ? "Réglages enregistrés." : ""}
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-pill bg-ink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Enregistrer les réglages"}
        </button>
      </div>
    </form>
  );
}
