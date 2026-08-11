"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";

/**
 * Champ image de l'administration : aperçu, URL modifiable à la main, et envoi
 * de fichier.
 *
 * Deux modes selon l'hébergement, décidés côté serveur :
 *
 *  - **`blob`** — le fichier part directement du navigateur vers Vercel Blob,
 *    et seule l'URL obtenue accompagne le formulaire. C'est indispensable :
 *    Vercel plafonne à 4,5 Mo le corps d'une requête vers une fonction
 *    serverless, donc une photo un peu lourde postée au serveur est rejetée
 *    avec un « 413 » avant d'atteindre le code applicatif.
 *
 *  - **`server`** — le fichier accompagne le formulaire et c'est le serveur
 *    qui l'écrit sur disque. Utilisé en local et sur un serveur classique, où
 *    la limite n'existe pas.
 */
export function ImageField({
  id,
  name,
  value,
  help,
  mode = "server",
}: {
  id: string;
  name: string;
  value: string;
  help?: string;
  mode?: "blob" | "server";
}) {
  const [url, setUrl] = useState(value);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || mode !== "blob") return;

    setStatus("sending");
    setMessage(null);
    setProgress(0);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });

      setUrl(blob.url);
      setStatus("idle");
      /* Le fichier est déjà déposé : on vide le champ pour qu'il ne reparte
         pas une seconde fois avec le formulaire. */
      if (fileInput.current) fileInput.current.value = "";
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Envoi impossible. Réessaie.",
      );
    }
  }

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
        <span>
          Ou envoyer un fichier (JPG, PNG, WebP, AVIF, SVG —{" "}
          {mode === "blob" ? "8 Mo max" : "4 Mo max"})
        </span>
        <input
          ref={fileInput}
          type="file"
          /* En mode « blob », le fichier ne doit pas accompagner le formulaire :
             il est déjà parti. On lui retire donc son `name`. */
          name={mode === "blob" ? undefined : `${name}File`}
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
          onChange={onFileChange}
          disabled={status === "sending"}
          className="text-sm file:mr-3 file:rounded-pill file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-accent disabled:opacity-50"
        />
      </label>

      {status === "sending" ? (
        <p aria-live="polite" className="text-sm text-muted">
          Envoi en cours… {progress}%
        </p>
      ) : null}

      {status === "error" && message ? (
        <p role="alert" className="text-sm text-accent">
          {message}
        </p>
      ) : null}

      {help ? <p className="text-sm text-muted">{help}</p> : null}
    </div>
  );
}
