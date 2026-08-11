"use client";

import { useActionState, useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import { cx } from "@/components/ui";
import type { SiteSettings } from "@/lib/settings";

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
