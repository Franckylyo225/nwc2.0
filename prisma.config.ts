import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Configuration des commandes Prisma (migrate, db, studio…).
 *
 * Depuis Prisma 7, l'URL de connexion n'est plus déclarée dans schema.prisma
 * et le fichier .env n'est plus chargé automatiquement : on s'en charge ici.
 */
try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  /* .env absent — les commandes Prisma signaleront l'URL manquante d'elles-mêmes. */
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    /**
     * Les migrations exigent une connexion directe : le pooler de Neon ne
     * supporte pas les verrous de session dont Prisma a besoin. En production,
     * DATABASE_URL pointe sur l'endpoint poolé et DIRECT_DATABASE_URL sur
     * l'endpoint direct ; en local, une seule suffit.
     */
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
  },
});
