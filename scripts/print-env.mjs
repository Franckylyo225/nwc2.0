/**
 * Affiche les valeurs à coller dans les variables d'environnement de
 * l'hébergeur, prêtes à l'emploi et sans guillemets.
 *
 *   node scripts/print-env.mjs
 *
 * Rien n'est envoyé nulle part : le script lit seulement le .env local.
 */
import path from "node:path";

process.loadEnvFile(path.join(process.cwd(), ".env"));

const url = (process.env.DATABASE_URL ?? "").trim().replace(/^['"]|['"]$/g, "");
if (!/^postgres(ql)?:\/\//.test(url)) {
  console.error("\n✗ DATABASE_URL absente ou invalide dans .env local.\n");
  process.exit(1);
}

const parsed = new URL(url);
const host = parsed.hostname;
const pooled = host.includes("-pooler")
  ? host
  : host.replace(/^([^.]+)\./, "$1-pooler.");
const direct = host.replace("-pooler", "");

const withHost = (h) => {
  const u = new URL(url);
  u.hostname = h;
  return u.toString();
};

console.log("\nÀ coller dans Vercel → Settings → Environment Variables");
console.log("Coche bien « Production ». Aucune guillemet autour des valeurs.\n");
console.log("DATABASE_URL");
console.log(withHost(pooled));
console.log("\nDIRECT_DATABASE_URL  (inutile sur Vercel : les migrations n'y tournent pas)");
console.log(withHost(direct));

const blob = (process.env.BLOB_READ_WRITE_TOKEN ?? "").trim().replace(/^['"]|['"]$/g, "");
console.log("\nBLOB_READ_WRITE_TOKEN  (obligatoire pour l'envoi d'images sur Vercel)");
console.log(blob || "— absent du .env local —");
console.log("");
