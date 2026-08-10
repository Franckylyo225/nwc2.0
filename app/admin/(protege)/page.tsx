import Link from "next/link";
import { ADMIN_SECTIONS, PageHeader } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import { isBlobConfigured } from "@/lib/upload";

export const dynamic = "force-dynamic";

/** Compteurs par collection : total et nombre de brouillons. */
async function getCounts() {
  const [services, works, products, articles, testimonials] = await Promise.all([
    countPair(() => prisma.service.count(), () => prisma.service.count({ where: { published: false } })),
    countPair(() => prisma.work.count(), () => prisma.work.count({ where: { published: false } })),
    countPair(() => prisma.product.count(), () => prisma.product.count({ where: { published: false } })),
    countPair(() => prisma.article.count(), () => prisma.article.count({ where: { published: false } })),
    countPair(
      () => prisma.testimonial.count(),
      () => prisma.testimonial.count({ where: { published: false } }),
    ),
  ]);

  return { services, works, products, articles, testimonials };
}

async function countPair(total: () => Promise<number>, drafts: () => Promise<number>) {
  const [a, b] = await Promise.all([total(), drafts()]);
  return { total: a, drafts: b };
}

export default async function AdminHome() {
  const counts = await getCounts();

  const cards = [
    { ...ADMIN_SECTIONS[0], ...counts.services },
    { ...ADMIN_SECTIONS[1], ...counts.works },
    { ...ADMIN_SECTIONS[2], ...counts.products },
    { ...ADMIN_SECTIONS[3], ...counts.articles },
    { ...ADMIN_SECTIONS[4], ...counts.testimonials },
  ];

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Tout ce qui est publié ici apparaît immédiatement sur le site."
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="flex h-full flex-col justify-between gap-6 rounded-card bg-white p-6 ring-1 ring-line transition-all duration-300 ease-smooth hover:shadow-[0_20px_50px_-35px_rgba(16,17,20,0.5)] hover:ring-line-strong"
            >
              <span className="text-sm font-medium text-ink">{card.label}</span>
              <span>
                <span className="display block text-4xl text-ink">{card.total}</span>
                <span className="mt-1 block text-xs text-muted">
                  {card.total === 0
                    ? "aucun contenu"
                    : card.drafts > 0
                      ? `dont ${card.drafts} en brouillon`
                      : "tous publiés"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {!isBlobConfigured() ? (
        <p className="mt-8 rounded-card bg-surface px-5 py-4 text-sm leading-relaxed text-muted ring-1 ring-line">
          <strong className="text-ink">Envoi d&apos;images désactivé.</strong> La
          variable <code>BLOB_READ_WRITE_TOKEN</code> n&apos;est pas définie. En
          attendant, colle directement l&apos;URL d&apos;une image dans les
          formulaires — tout le reste fonctionne.
        </p>
      ) : null}
    </>
  );
}
