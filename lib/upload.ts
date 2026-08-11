import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const MAX_BYTES = 4 * 1024 * 1024; // 4 Mo — voir bodySizeLimit dans next.config.ts
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];

/** Dossier de destination du stockage local, servi tel quel par Next. */
const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");
const LOCAL_URL_PREFIX = "/uploads";

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Vrai sur un hébergement sans disque persistant (Vercel et assimilés), où
 * écrire dans `public/` ne sert à rien : le système de fichiers est en lecture
 * seule et les fichiers ajoutés après le build ne sont pas servis.
 */
function isServerless() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/** Où atterrissent les images, compte tenu de la configuration courante. */
export function storageMode(): "blob" | "local" | "unavailable" {
  if (isBlobConfigured()) return "blob";
  return isServerless() ? "unavailable" : "local";
}

/**
 * Envoie une image et renvoie son URL publique.
 *
 * Deux destinations possibles :
 *  - **Vercel Blob** dès que `BLOB_READ_WRITE_TOKEN` est défini — le mode à
 *    utiliser en production ;
 *  - **le dossier `public/uploads`** sinon, ce qui rend l'envoi de fichiers
 *    opérationnel immédiatement en local et sur un serveur classique.
 *
 * Renvoie `null` si aucun fichier n'a été choisi : l'appelant conserve alors
 * l'image existante au lieu de l'effacer.
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

  const name = uniqueName(file.name);

  if (isBlobConfigured()) {
    try {
      const blob = await put(name, file, { access: "public", addRandomSuffix: false });
      return blob.url;
    } catch (error) {
      throw new Error(explainBlobError(error));
    }
  }

  if (isServerless()) {
    throw new Error(
      "L'envoi de fichiers nécessite un stockage externe sur cet hébergement. Ajoute BLOB_READ_WRITE_TOKEN dans les variables d'environnement, ou colle une URL d'image dans le champ prévu.",
    );
  }

  /* Stockage local : le fichier est écrit dans public/, donc servi
     directement par Next à l'URL correspondante. */
  await mkdir(LOCAL_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(LOCAL_DIR, name), bytes);

  return `${LOCAL_URL_PREFIX}/${name}`;
}

/**
 * Traduit les erreurs de Vercel Blob en consignes exploitables.
 *
 * Le cas du store privé mérite un message dédié : le message d'origine parle
 * de « public access on a private store », ce qui ne dit pas quoi faire — or
 * un site public a besoin d'images lisibles sans authentification.
 */
function explainBlobError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("private store")) {
    return "Le store Vercel Blob est configuré en accès privé : ses fichiers renvoient une erreur 403 aux visiteurs. Crée un store en accès public (Vercel → Storage → Blob → Create store → Public), puis remplace BLOB_READ_WRITE_TOKEN.";
  }

  if (message.includes("Access denied") || message.includes("forbidden")) {
    return "Jeton Vercel Blob refusé. Vérifie que BLOB_READ_WRITE_TOKEN correspond bien au store du projet.";
  }

  return `Envoi vers Vercel Blob impossible : ${message}`;
}

/**
 * Nom de fichier unique et sans surprise : accents retirés, caractères exotiques
 * remplacés, suffixe aléatoire pour qu'un même nom n'écrase jamais le précédent.
 */
function uniqueName(original: string) {
  const parsed = path.parse(original);

  const base =
    parsed.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image";

  const extension = parsed.ext.toLowerCase().replace(/[^a-z0-9.]/g, "") || ".jpg";

  return `${base}-${randomBytes(4).toString("hex")}${extension}`;
}
