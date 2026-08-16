import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "./db";
import { SETTINGS_ID } from "./settings";

/**
 * Défenses du formulaire de contact.
 *
 * Trois filtres, du moins au plus coûteux : un champ leurre, un délai minimal
 * de remplissage, puis un quota par expéditeur. Aucun ne suffit seul — les
 * robots les plus sommaires tombent sur le premier, ceux qui exécutent du
 * JavaScript sur le deuxième, et le quota rattrape le reste.
 *
 * Rien ici ne dépend d'un service extérieur ni d'une clé d'API : le formulaire
 * marche dès l'installation, sans configuration.
 */

/** Nombre de messages tolérés par expéditeur, sur une heure puis sur un jour. */
const QUOTA_HOUR = 3;
const QUOTA_DAY = 8;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/**
 * Empreinte de l'expéditeur : l'adresse IP, salée puis hachée.
 *
 * L'adresse elle-même n'est jamais écrite. Non salée, une empreinte d'IPv4 se
 * remonterait par force brute en quelques minutes — l'espace tient sur 32
 * bits ; le sel, tiré au sort et gardé en base, referme cette porte.
 *
 * Sans adresse exploitable — un runtime qui ne la transmet pas — on retombe
 * sur une empreinte commune : le quota devient alors global plutôt que par
 * visiteur. Volontairement strict : mieux vaut freiner tout le monde une heure
 * que d'ouvrir la vanne.
 */
export async function senderHash(): Promise<string> {
  const store = await headers();

  /* `x-forwarded-for` liste les relais traversés, du client aux proxies :
     seule la première adresse est celle du visiteur. */
  const forwarded = store.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || store.get("x-real-ip")?.trim() || "inconnu";

  const salt = await contactSalt();
  return createHash("sha256").update(`${salt}:${address}`).digest("hex");
}

/**
 * Sel du hachage, tiré au sort à la première réception puis conservé.
 *
 * Il vit en base et non dans une variable d'environnement pour qu'aucune
 * installation ne puisse hacher sans sel faute de l'avoir configurée. La
 * ligne de réglages est unique et d'identifiant fixe : l'`upsert` la crée si
 * le premier message arrive avant tout passage dans l'administration.
 */
async function contactSalt(): Promise<string> {
  const existing = await prisma.siteSettings.findUnique({
    where: { id: SETTINGS_ID },
    select: { contactSalt: true },
  });
  if (existing?.contactSalt) return existing.contactSalt;

  const salt = randomBytes(32).toString("hex");
  const row = await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, contactSalt: salt },
    update: { contactSalt: salt },
    select: { contactSalt: true },
  });

  /* Deux envois simultanés peuvent tirer deux sels ; celui qui écrit en
     dernier gagne, et c'est sa valeur relue ici qui fait foi. */
  return row.contactSalt ?? salt;
}

/**
 * Vrai si l'expéditeur a déjà dépassé son quota.
 *
 * Le comptage porte sur les messages enregistrés, pas sur les tentatives :
 * une soumission refusée pour une faute de frappe ne consomme rien.
 */
export async function isOverQuota(hash: string): Promise<boolean> {
  const now = Date.now();

  const [lastHour, lastDay] = await Promise.all([
    prisma.message.count({
      where: { senderHash: hash, createdAt: { gte: new Date(now - HOUR_MS) } },
    }),
    prisma.message.count({
      where: { senderHash: hash, createdAt: { gte: new Date(now - DAY_MS) } },
    }),
  ]);

  return lastHour >= QUOTA_HOUR || lastDay >= QUOTA_DAY;
}
