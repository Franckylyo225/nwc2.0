"use client";

import { useState } from "react";

/**
 * Champ image de l'administration : aperçu, URL modifiable à la main, et envoi
 * de fichier.
 *
 * Le champ texte porte le nom `name`, le fichier `name + "File"`. Côté serveur,
 * un fichier envoyé l'emporte sur l'URL saisie ; si aucun fichier n'est choisi,
 * l'URL existante est conservée.
 */
export function ImageField({
  id,
  name,
  value,
  help,
}: {
  id: string;
  name: string;
  value: string;
  help?: string;
}) {
  const [url, setUrl] = useState(value);

  return (
    <div className="flex flex-col gap-3">
      {url ? (
        <span className="relative inline-block w-fit">
          {/* Aperçu simple : l'URL peut pointer n'importe où, next/image
              imposerait de déclarer chaque domaine distant. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="h-28 w-auto max-w-full rounded-xl bg-surface object-contain ring-1 ring-line"
          />
          <button
            type="button"
            onClick={() => setUrl("")}
            aria-label="Retirer l'image"
            className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-ink text-white shadow-sm transition-colors hover:bg-accent"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-3">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </span>
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

      {help ? <p className="text-sm text-muted">{help}</p> : null}
    </div>
  );
}
