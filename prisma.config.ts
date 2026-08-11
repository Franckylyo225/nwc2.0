import path from "node:path";
import { defineConfig } from "prisma/config";
import { optionalDatabaseUrl } from "./lib/database-url";

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
     * Les migrations exigent une connexion DIRECTE.
     *
     * Prisma pose un verrou consultatif de session au début d'une migration.
     * À travers un pooler (pgbouncer, l'endpoint `-pooler` de Neon), la
     * connexion est rendue au pool en conservant ce verrou : il devient
     * orphelin, et la migration suivante expire sur `P1002`.
     *
     * `DIRECT_DATABASE_URL` est donc à privilégier. Le repli sur
     * `DATABASE_URL` ne vaut que pour un poste de développement, où cette
     * dernière pointe généralement sur l'endpoint direct.
     */
    url: optionalDatabaseUrl("DIRECT_DATABASE_URL", "DATABASE_URL"),
  },
});
