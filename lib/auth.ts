import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "./db";
import { SESSION_COOKIE } from "./session-cookie";

const scryptAsync = promisify(scrypt);

export { SESSION_COOKIE };
const SESSION_DAYS = 14;

/* ------------------------------------------------------- Mots de passe --- */

/**
 * Hache un mot de passe avec scrypt (fourni par Node, pas de dépendance).
 * Format stocké : "sel_hex:clé_hex".
 */
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

/**
 * Comparaison à temps constant : une comparaison naïve laisserait fuiter,
 * par le temps de réponse, le nombre de caractères corrects.
 */
export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const actual = (await scryptAsync(password, salt, 64)) as Buffer;
  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}

/* ------------------------------------------------------------ Sessions --- */

/** Crée une session en base et pose le cookie correspondant. */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({ data: { token, userId, expiresAt } });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** Supprime la session en base — la déconnexion révoque réellement l'accès. */
export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  store.delete(SESSION_COOKIE);
}

/**
 * Utilisateur connecté, ou `null`.
 *
 * `cache()` déduplique l'appel sur un même rendu : le layout admin et une page
 * peuvent tous deux le demander sans provoquer deux requêtes.
 */
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  /* Session expirée : on la purge au passage plutôt que d'accumuler. */
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return { id: session.user.id, email: session.user.email, name: session.user.name };
});

/** À appeler en tête de toute action admin : coupe court si non authentifié. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Non authentifié");
  }
  return user;
}
