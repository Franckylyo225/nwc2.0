"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { slugify } from "@/lib/schemas";
import { cx } from "@/components/ui";
import type { Field, FieldValues } from "./fields";

/**
 * Rend un formulaire complet à partir d'une description de champs.
 *
 * L'état d'erreur vient du serveur via `useActionState` : la validation zod
 * fait autorité, le navigateur ne fait qu'un premier filtrage.
 */
export function ResourceForm({
  fields,
  values,
  action,
  backHref,
  submitLabel = "Enregistrer",
  variant = "page",
}: {
  fields: Field[];
  values: FieldValues;
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>;
  backHref: string;
  submitLabel?: string;
  /** « drawer » : le formulaire est dans le panneau latéral. */
  variant?: "page" | "drawer";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const router = useRouter();

  /**
   * Après un enregistrement réussi, on quitte le formulaire.
   *
   * Depuis le panneau, il faut remonter dans l'historique : c'est ce qui
   * démonte la route interceptée. Une redirection serveur, elle, laisserait
   * le panneau ouvert par-dessus la liste déjà à jour.
   */
  useEffect(() => {
    if (!state.ok) return;
    if (variant === "drawer") router.back();
    else router.push(backHref);
    router.refresh();
  }, [state.ok, variant, router, backHref]);

  /* Le slug se remplit tout seul tant que l'utilisateur n'y a pas touché. */
  const [slug, setSlug] = useState(String(values.slug ?? ""));
  const [slugTouched, setSlugTouched] = useState(Boolean(values.slug));

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

      {fields.map((field) => (
        <FieldRow
          key={field.name}
          field={field}
          value={values[field.name]}
          error={state.fieldErrors?.[field.name]}
          slug={slug}
          onSlugSourceChange={(text) => {
            if (!slugTouched) setSlug(slugify(text));
          }}
          onSlugChange={(next) => {
            setSlug(next);
            setSlugTouched(true);
          }}
        />
      ))}

      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t border-line bg-bg/90 px-6 py-4 backdrop-blur">
        {variant === "drawer" ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-pill px-5 py-2.5 text-sm text-muted transition-colors hover:text-ink"
          >
            Annuler
          </button>
        ) : (
          <Link
            href={backHref}
            className="rounded-pill px-5 py-2.5 text-sm text-muted transition-colors hover:text-ink"
          >
            Annuler
          </Link>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-pill bg-ink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------------ */

function FieldRow({
  field,
  value,
  error,
  slug,
  onSlugSourceChange,
  onSlugChange,
}: {
  field: Field;
  value: FieldValues[string];
  error?: string;
  slug: string;
  onSlugSourceChange: (text: string) => void;
  onSlugChange: (next: string) => void;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : field.help ? `${id}-help` : undefined;

  const base =
    "w-full rounded-xl bg-white px-4 py-3 text-sm text-ink ring-1 transition-shadow placeholder:text-muted/60 focus:outline-none focus:ring-2";
  const ring = error ? "ring-accent" : "ring-line focus:ring-accent";

  return (
    <div className="flex flex-col gap-2">
      {field.type !== "checkbox" ? (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {field.label}
        </label>
      ) : null}

      {field.type === "textarea" ? (
        <textarea
          id={id}
          name={field.name}
          rows={field.rows ?? 4}
          defaultValue={String(value ?? "")}
          placeholder={field.placeholder}
          aria-describedby={describedBy}
          className={cx(base, ring, field.mono && "font-mono text-[0.8rem] leading-relaxed")}
        />
      ) : field.type === "lines" ? (
        <textarea
          id={id}
          name={field.name}
          rows={field.rows ?? 4}
          defaultValue={Array.isArray(value) ? value.join("\n") : String(value ?? "")}
          aria-describedby={describedBy}
          className={cx(base, ring)}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          name={field.name}
          defaultValue={String(value ?? "")}
          aria-describedby={describedBy}
          className={cx(base, ring)}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === "checkbox" ? (
        <label className="flex items-center gap-3 text-sm text-ink">
          <input
            id={id}
            type="checkbox"
            name={field.name}
            defaultChecked={Boolean(value)}
            className="size-4 accent-[var(--color-accent)]"
          />
          {field.label}
        </label>
      ) : field.type === "image" ? (
        <ImageField id={id} name={field.name} value={String(value ?? "")} />
      ) : field.type === "slug" ? (
        <input
          id={id}
          name={field.name}
          value={slug}
          onChange={(event) => onSlugChange(event.target.value)}
          aria-describedby={describedBy}
          className={cx(base, ring, "font-mono text-[0.8rem]")}
        />
      ) : (
        <input
          id={id}
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          name={field.name}
          defaultValue={value === null || value === undefined ? "" : String(value)}
          placeholder={field.placeholder}
          aria-describedby={describedBy}
          onChange={
            "slugSource" in field && field.slugSource
              ? (event) => onSlugSourceChange(event.target.value)
              : undefined
          }
          className={cx(base, ring)}
        />
      )}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : field.help ? (
        <p id={`${id}-help`} className="text-sm text-muted">
          {field.help}
        </p>
      ) : null}
    </div>
  );
}

/** Champ image : aperçu, URL modifiable à la main, et envoi de fichier. */
function ImageField({
  id,
  name,
  value,
}: {
  id: string;
  name: string;
  value: string;
}) {
  const [url, setUrl] = useState(value);

  return (
    <div className="flex flex-col gap-3">
      {url ? (
        // Aperçu simple : l'URL peut pointer n'importe où, next/image imposerait
        // de déclarer chaque domaine distant.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="h-32 w-auto max-w-full rounded-xl bg-surface object-contain ring-1 ring-line"
        />
      ) : null}

      <input
        id={id}
        name={name}
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://… ou /chemin/dans/public.png"
        className="w-full rounded-xl bg-white px-4 py-3 text-sm text-ink ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-accent"
      />

      <label className="flex flex-col gap-1.5 text-sm text-muted">
        <span>Ou envoyer un fichier (JPG, PNG, WebP, AVIF, SVG — 4 Mo max)</span>
        <input
          type="file"
          name={`${name}File`}
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
          className="text-sm file:mr-3 file:rounded-pill file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-accent"
        />
      </label>
    </div>
  );
}
