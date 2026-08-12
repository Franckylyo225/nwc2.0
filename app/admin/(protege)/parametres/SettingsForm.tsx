"use client";

import { useActionState, useRef, useState } from "react";
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

/**
 * Visuels des blocs du site. L'ordre est celui de la page d'accueil.
 *
 * Pour en ajouter un : une colonne dans `SiteSettings`, une entrée dans
 * `settingsSchema` et `SETTINGS_IMAGE_FIELDS`, puis une ligne ici.
 */
const BLOCK_IMAGES = [
  {
    name: "aboutBannerImage",
    key: "aboutBanner",
    label: "Fond de la carte de présentation",
    help: "La grande carte sombre placée juste avant les services. Format paysage très large, 2000 × 900 px environ. Le texte se pose par-dessus : choisis une image calme, sans détail important en bas à gauche.",
  },
  {
    name: "aboutStudioImage",
    key: "aboutStudio",
    label: "Photo de la section « Le studio »",
    help: "Le portrait ou la photo d'équipe affiché à côté du texte de présentation. Format portrait, 1000 × 1250 px environ.",
  },
] as const;

const TABS = [
  { id: "maintenance", label: "Mode maintenance" },
  { id: "hero", label: "Images du titre" },
  { id: "cms", label: "CMS" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const input =
  "w-full rounded-xl bg-white px-4 py-3 text-sm text-ink ring-1 ring-line transition-shadow placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent";

export function SettingsForm({
  settings,
  storage,
}: {
  settings: SiteSettings;
  storage: "blob" | "server";
}) {
  const [state, formAction, pending] = useActionState(saveSettings, {});
  const [tab, setTab] = useState<TabId>("maintenance");

  /* L'interrupteur pilote l'affichage des champs qui n'ont de sens
     qu'en mode maintenance. */
  const [active, setActive] = useState(settings.maintenanceMode);

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /* Flèches gauche/droite entre les onglets, comme l'attend un lecteur
     d'écran sur ce motif. */
  function onTabKeyDown(event: React.KeyboardEvent) {
    const index = TABS.findIndex((t) => t.id === tab);
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % TABS.length
        : event.key === "ArrowLeft"
          ? (index - 1 + TABS.length) % TABS.length
          : null;

    if (next === null) return;
    event.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  }

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

      {/* Onglets */}
      <div role="tablist" aria-label="Réglages" className="flex gap-1 border-b border-line">
        {TABS.map((item) => {
          const selected = item.id === tab;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[item.id] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(item.id)}
              onKeyDown={onTabKeyDown}
              className={cx(
                "-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                selected
                  ? "border-accent text-ink"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------ Onglet 1 : maintenance */}
      {/* Les panneaux restent montés : masqués, leurs champs continuent
          d'accompagner le formulaire, donc rien ne se perd en changeant
          d'onglet. */}
      <div
        role="tabpanel"
        id="panel-maintenance"
        aria-labelledby="tab-maintenance"
        hidden={tab !== "maintenance"}
        className="flex flex-col gap-7"
      >
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
            <label htmlFor="maintenanceMessage" className="text-sm font-medium text-ink">
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
      </div>

      {/* ------------------------------------------- Onglet 2 : vignettes */}
      <div
        role="tabpanel"
        id="panel-hero"
        aria-labelledby="tab-hero"
        hidden={tab !== "hero"}
        className="flex flex-col gap-6"
      >
        <p className="text-sm leading-relaxed text-muted">
          Trois vignettes rondes s&apos;insèrent entre les mots du grand titre.
          Sans image, une pastille neutre occupe la place — la mise en page ne
          bouge pas. Format conseillé :{" "}
          <strong>carré, 400 × 400 px minimum</strong>, sujet centré, car
          l&apos;image est recadrée en cercle.
        </p>

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
              mode={storage}
            />
          </div>
        ))}
      </div>

      {/* ------------------------------------------------ Onglet 3 : CMS */}
      <div
        role="tabpanel"
        id="panel-cms"
        aria-labelledby="tab-cms"
        hidden={tab !== "cms"}
        className="flex flex-col gap-6"
      >
        <p className="text-sm leading-relaxed text-muted">
          Les visuels des blocs de la page d&apos;accueil. Chaque bloc
          fonctionne sans image : un dégradé occupe alors exactement la même
          place, donc <strong>la mise en page ne bouge pas</strong> au moment
          d&apos;en ajouter une. Vider le champ remet le dégradé.
        </p>

        {BLOCK_IMAGES.map((block) => (
          <div key={block.name} className="flex flex-col gap-2">
            <label htmlFor={block.name} className="text-sm font-medium text-ink">
              {block.label}
            </label>
            <ImageField
              id={block.name}
              name={block.name}
              value={settings.blockImages[block.key] ?? ""}
              help={block.help}
              mode={storage}
            />
          </div>
        ))}
      </div>

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
