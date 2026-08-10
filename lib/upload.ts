import "server-only";

import { put } from "@vercel/blob";

const MAX_BYTES = 4 * 1024 * 1024; // 4 Mo
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Envoie une image sur Vercel Blob et renvoie son URL publique.
 *
 * Renvoie `null` si aucun fichier n'a été choisi — l'appelant conserve alors
 * l'image existante plutôt que de l'effacer.
 *
 * La limite de 4 Mo n'est pas arbitraire : au-delà, le corps d'une Server
 * Action est rejeté avant même d'arriver ici. Autant l'annoncer clairement.
 */
export async function uploadImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (!ALLOWED.includes(file.type)) {
    throw new Error(
      `Format non accepté (${file.type || "inconnu"}). Utilise JPG, PNG, WebP, AVIF ou SVG.`,
    );
  }

  if (file.size > MAX_BYTES) {
    throw new Error(
      `Image trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum 4 Mo.`,
    );
  }

  if (!isBlobConfigured()) {
    throw new Error(
      "Le stockage d'images n'est pas configuré. Ajoute BLOB_READ_WRITE_TOKEN dans .env, ou colle directement une URL d'image dans le champ prévu.",
    );
  }

  const blob = await put(sanitizeName(file.name), file, {
    access: "public",
    /* Vercel Blob ajoute un suffixe aléatoire : deux fichiers du même nom ne
       s'écrasent pas. */
    addRandomSuffix: true,
  });

  return blob.url;
}

function sanitizeName(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image"
  );
}
