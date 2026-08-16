/**
 * Remplit la base à partir des contenus statiques de content/site.ts, et crée
 * le compte d'administration.
 *
 * Le script est ré-exécutable sans risque : il ne touche pas aux collections
 * qui contiennent déjà des données, et ne recrée pas un compte existant.
 *
 *   npm run db:seed
 *
 * Identifiants du compte : variables ADMIN_EMAIL et ADMIN_PASSWORD du .env.
 */
import path from "node:path";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveDatabaseUrl } from "../lib/database-url";
import { PrismaClient } from "../lib/generated/prisma";
import { site } from "../content/site";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  /* .env absent : on s'appuie sur les variables déjà présentes dans l'environnement. */
}

const scryptAsync = promisify(scrypt);

let connectionString: string;
try {
  connectionString = resolveDatabaseUrl("DATABASE_URL");
} catch (error) {
  console.error(`\n✗ ${error instanceof Error ? error.message : error}\n`);
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

function slugify(input: string, fallback: string) {
  const slug = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return slug || fallback;
}

/** Garantit l'unicité d'un slug au sein d'un même lot d'import (ex. plusieurs
 *  entrées d'exemple partageant le même nom placeholder). */
function dedupeSlug(slug: string, used: Set<string>) {
  let candidate = slug;
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${slug}-${n}`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}

async function main() {
  /* ------------------------------------------------ Compte administrateur */
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (!email || !password) {
    console.warn(
      "→ ADMIN_EMAIL / ADMIN_PASSWORD absents du .env : aucun compte créé.",
    );
  } else if (password.length < 10) {
    console.error("✗ ADMIN_PASSWORD doit faire au moins 10 caractères.");
    process.exit(1);
  } else {
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      console.log(`→ Compte ${email} déjà présent, inchangé.`);
    } else {
      await prisma.adminUser.create({
        data: { email, password: await hashPassword(password), name: "New Wave" },
      });
      console.log(`✓ Compte administrateur créé : ${email}`);
    }
  }

  /* ------------------------------------------------------------ Réglages */
  await prisma.siteSettings.upsert({
    where: { id: "settings" },
    create: { id: "settings" },
    update: {},
  });
  console.log("✓ Réglages du site initialisés (mode construction désactivé)");

  /* ------------------------------------------------------------ Services */
  if ((await prisma.service.count()) === 0) {
    await prisma.service.createMany({
      data: site.services.items.map((item, index) => ({
        title: item.title,
        description: item.description,
        bullets: [...item.bullets],
        position: index,
      })),
    });
    console.log(`✓ ${site.services.items.length} services importés`);
  } else {
    console.log("→ Services déjà présents, ignorés.");
  }

  /* ------------------------------------------------------- Réalisations */
  if ((await prisma.work.count()) === 0) {
    const usedWorkSlugs = new Set<string>();
    await prisma.work.createMany({
      data: site.works.items.map((item, index) => ({
        name: item.name,
        slug: dedupeSlug(slugify(item.name, `realisation-${index + 1}`), usedWorkSlugs),
        year: item.year,
        category: item.category,
        summary: item.summary,
        services: [...item.services],
        href: item.href === "#" ? null : item.href,
        image: item.image,
        position: index,
        /* Les entrées d'exemple restent en brouillon : elles contiennent
           encore des marqueurs [À REMPLIR]. */
        published: false,
      })),
    });
    console.log(`✓ ${site.works.items.length} réalisations importées (en brouillon)`);
  } else {
    console.log("→ Réalisations déjà présentes, ignorées.");
  }

  /* ------------------------------------------------------ Projets maison */
  if ((await prisma.product.count()) === 0) {
    const statuses = { "En ligne": "ONLINE", "Bêta": "BETA", Bientôt: "SOON" } as const;
    const usedProductSlugs = new Set<string>();

    await prisma.product.createMany({
      data: site.products.items.map((item, index) => ({
        name: item.name,
        slug: dedupeSlug(slugify(item.name, `produit-${index + 1}`), usedProductSlugs),
        tagline: item.tagline,
        description: item.description,
        status: statuses[item.status as keyof typeof statuses] ?? "ONLINE",
        tags: [...item.tags],
        href: item.href,
        image: item.image,
        position: index,
        published: false,
      })),
    });
    console.log(`✓ ${site.products.items.length} projets maison importés (en brouillon)`);
  } else {
    console.log("→ Projets maison déjà présents, ignorés.");
  }

  /* --------------------------------------------------------- Témoignages */
  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({
      data: site.testimonials.items.map((item, index) => ({
        quote: item.quote,
        author: item.author,
        role: item.role,
        company: item.company,
        position: index,
        published: false,
      })),
    });
    console.log(
      `✓ ${site.testimonials.items.length} témoignages importés (en brouillon)`,
    );
  } else {
    console.log("→ Témoignages déjà présents, ignorés.");
  }

  /* ------------------------------------------------------------ Articles */
  if ((await prisma.article.count()) === 0) {
    await prisma.article.create({
      data: {
        title: "New Wave Conception ouvre son journal",
        slug: "ouverture-du-journal",
        category: "NEWS",
        excerpt:
          "Cet article d'exemple montre le rendu d'une actualité. Modifie-le ou supprime-le depuis l'administration.",
        content: [
          "## Un espace pour raconter",
          "",
          "Cette rubrique accueille les **actualités du studio** et les articles de fond.",
          "Elle se gère entièrement depuis l'administration, sans toucher au code.",
          "",
          "### Ce que le format accepte",
          "",
          "- des titres et des listes",
          "- du *gras*, de l'italique et des [liens](https://example.com)",
          "- des citations et des blocs de code",
          "",
          "> Le contenu s'écrit en Markdown : simple à taper, propre à relire.",
        ].join("\n"),
        author: "New Wave Conception",
        published: true,
        publishedAt: new Date(),
      },
    });
    console.log("✓ 1 article d'exemple créé");
  } else {
    console.log("→ Articles déjà présents, ignorés.");
  }
}

main()
  .then(() => console.log("\nTerminé.\n"))
  .catch((error) => {
    console.error("\n✗ Le seed a échoué :", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
