import Link from "next/link";
import { ADMIN_INBOX, ADMIN_SECTIONS, PageHeader } from "@/components/admin/shell";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { storageMode } from "@/lib/upload";

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

/** Boîte de réception : ce qui reste à traiter, et ce qui n'a pas été ouvert. */
async function getInbox() {
  const [toHandle, unread] = await Promise.all([
    prisma.message.count({ where: { status: { in: ["NEW", "READ"] } } }),
    prisma.message.count({ where: { status: "NEW" } }),
  ]);
  return { toHandle, unread };
}

export default async function AdminHome() {
  const [counts, inbox, settings] = await Promise.all([
    getCounts(),
    getInbox(),
    getSettings(),
  ]);

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

      {settings.maintenanceMode ? (
        <p className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-card bg-accent-soft px-5 py-4 text-sm text-ink ring-1 ring-accent/25">
          <strong className="text-accent">Le site est fermé au public.</strong>
          <span className="text-muted">
            Les visiteurs voient la page de maintenance.
          </span>
          <Link
            href="/admin/parametres"
            className="font-medium text-accent underline underline-offset-2"
          >
            Modifier
          </Link>
        </p>
      ) : null}

      <Link
        href={ADMIN_INBOX.href}
        className="mb-8 flex flex-col gap-2 rounded-card bg-ink px-6 py-6 text-white transition-shadow duration-300 ease-smooth hover:shadow-[0_20px_50px_-25px_rgba(16,17,20,0.6)] sm:flex-row sm:items-center sm:justify-between"
      >
        <span>
          <span className="text-sm font-medium">Messages reçus</span>
          <span className="mt-1 block text-sm text-white/55">
            {inbox.toHandle === 0
              ? "Rien à traiter pour l'instant."
              : inbox.unread > 0
                ? `${inbox.unread} non ${inbox.unread > 1 ? "lus" : "lu"} sur ${inbox.toHandle} à traiter.`
                : `${inbox.toHandle} en attente de réponse.`}
          </span>
        </span>
        <span
          className={`display text-4xl ${inbox.unread > 0 ? "text-accent" : "text-white/70"}`}
        >
          {inbox.toHandle}
        </span>
      </Link>

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

      <StorageNotice />
    </>
  );
}

/** Rappelle où atterrissent les images envoyées depuis l'administration. */
function StorageNotice() {
  const mode = storageMode();
  if (mode === "blob") return null;

  return (
    <p className="mt-8 rounded-card bg-surface px-5 py-4 text-sm leading-relaxed text-muted ring-1 ring-line">
      {mode === "local" ? (
        <>
          <strong className="text-ink">Images stockées sur ce serveur</strong>{" "}
          (dossier <code>public/uploads</code>). L&apos;envoi de fichiers
          fonctionne. Sur un hébergement sans disque persistant comme Vercel, il
          faudra définir <code>BLOB_READ_WRITE_TOKEN</code> — les images déjà
          enregistrées ne suivraient pas.
        </>
      ) : (
        <>
          <strong className="text-ink">Envoi de fichiers indisponible</strong> sur
          cet hébergement : le disque n&apos;est pas persistant. Définis{" "}
          <code>BLOB_READ_WRITE_TOKEN</code>, ou colle une URL d&apos;image dans
          les formulaires.
        </>
      )}
    </p>
  );
}
