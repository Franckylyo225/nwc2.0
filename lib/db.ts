import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma";

/**
 * Client Prisma partagé.
 *
 * En développement, Next recharge les modules à chaque modification : sans ce
 * cache sur `globalThis`, chaque rechargement ouvrirait un nouveau pool de
 * connexions et la base finirait par les refuser.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * `true` quand une base est configurée. Tant qu'elle ne l'est pas, le site
 * public retombe sur les contenus statiques de content/site.ts — il reste donc
 * consultable et constructible avant la mise en place de la base.
 */
export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL n'est pas définie. Copie .env.example vers .env et renseigne l'URL de la base.",
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/**
 * Le vrai client n'est créé qu'au premier accès à une de ses propriétés.
 * Sans cette indirection, le simple fait d'importer ce module dans un projet
 * sans DATABASE_URL ferait échouer le build.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = (globalForPrisma.prisma ??= createClient());
    const value = Reflect.get(client, property) as unknown;
    return typeof value === "function" ? value.bind(client) : value;
  },
});
