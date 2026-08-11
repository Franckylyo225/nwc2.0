/**
 * Transfère vers Vercel Blob les images stockées localement.
 *
 * À lancer une seule fois, au moment de passer d'un stockage local
 * (`public/uploads/`) à un hébergement sans disque persistant comme Vercel.
 *
 *   npm run images:migrate -- --dry-run   # aperçu, n'écrit rien
 *   npm run images:migrate                # transfère et met à jour la base
 *
 * Le script est ré-exécutable sans risque : il ignore les images déjà servies
 * par une URL distante, et ne supprime jamais les fichiers d'origine.
 */
import path from "node:path";
import { readFile } from "node:fs/promises";
import { put } from "@vercel/blob";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  /* .env absent : on s'appuie sur les variables de l'environnement. */
}

const dryRun = process.argv.includes("--dry-run");
const LOCAL_PREFIX = "/uploads/";
const PUBLIC_DIR = path.join(process.cwd(), "public");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("\n✗ DATABASE_URL manquante. Renseigne-la dans .env.\n");
  process.exit(1);
}

if (!dryRun && !process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    [
      "",
      "✗ BLOB_READ_WRITE_TOKEN manquant.",
      "",
      "  Pour l'obtenir : Vercel → ton projet → Storage → Blob → Create store,",
      "  puis copie la valeur dans .env.",
      "",
      "  Pour voir ce qui serait transféré sans rien écrire :",
      "    npm run images:migrate -- --dry-run",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/** Les quatre champs image du modèle de données. */
const TARGETS = [
  { label: "Réalisations", model: "work", field: "image" },
  { label: "Projets maison", model: "product", field: "image" },
  { label: "Articles", model: "article", field: "cover" },
  { label: "Témoignages", model: "testimonial", field: "avatar" },
] as const;

type Delegate = {
  findMany: (args: unknown) => Promise<Array<Record<string, unknown>>>;
  update: (args: unknown) => Promise<unknown>;
};

const stats = { found: 0, moved: 0, missing: 0, failed: 0 };

async function migrateTarget(target: (typeof TARGETS)[number]) {
  const delegate = (prisma as unknown as Record<string, Delegate>)[target.model];

  const rows = await delegate.findMany({
    where: { [target.field]: { startsWith: LOCAL_PREFIX } },
    select: { id: true, [target.field]: true },
  });

  if (rows.length === 0) {
    console.log(`  ${target.label} : rien à transférer`);
    return;
  }

  console.log(`  ${target.label} : ${rows.length} image(s)`);

  for (const row of rows) {
    const id = String(row.id);
    const url = String(row[target.field]);
    const filePath = path.join(PUBLIC_DIR, url);
    stats.found += 1;

    let bytes: Buffer;
    try {
      bytes = await readFile(filePath);
    } catch {
      /* Fichier absent : on laisse la valeur telle quelle plutôt que de
         casser silencieusement le lien en base. */
      console.log(`    ⚠ ${url} — fichier introuvable, laissé en l'état`);
      stats.missing += 1;
      continue;
    }

    if (dryRun) {
      console.log(`    · ${url} (${(bytes.length / 1024).toFixed(0)} Ko) → Blob`);
      continue;
    }

    try {
      const blob = await put(path.basename(url), bytes, {
        access: "public",
        addRandomSuffix: false,
        contentType: contentTypeOf(url),
      });

      await delegate.update({
        where: { id },
        data: { [target.field]: blob.url },
      });

      console.log(`    ✓ ${url} → ${blob.url}`);
      stats.moved += 1;
    } catch (error) {
      console.log(
        `    ✗ ${url} — ${error instanceof Error ? error.message : String(error)}`,
      );
      stats.failed += 1;
    }
  }
}

function contentTypeOf(url: string) {
  const extension = path.extname(url).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
  };
  return map[extension] ?? "application/octet-stream";
}

async function main() {
  console.log(
    dryRun
      ? "\nAperçu — aucune écriture (ni Blob, ni base).\n"
      : "\nTransfert des images locales vers Vercel Blob.\n",
  );

  for (const target of TARGETS) {
    await migrateTarget(target);
  }

  console.log("");
  if (stats.found === 0) {
    console.log("Aucune image locale à transférer : rien à faire.");
  } else if (dryRun) {
    console.log(
      `${stats.found} image(s) seraient transférées. Relance sans --dry-run pour l'appliquer.`,
    );
  } else {
    console.log(
      `${stats.moved} transférée(s), ${stats.missing} introuvable(s), ${stats.failed} en échec.`,
    );
    if (stats.moved > 0) {
      console.log(
        "\nLes fichiers d'origine sont conservés dans public/uploads/ :\n" +
          "supprime-les une fois le site vérifié en ligne.",
      );
    }
  }
  console.log("");
}

main()
  .catch((error) => {
    console.error("\n✗ La migration a échoué :", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
