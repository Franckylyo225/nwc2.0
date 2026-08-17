import Link from "next/link";
import { List, PageHeader, Row } from "@/components/admin/shell";
import { cx } from "@/components/ui";
import { prisma } from "@/lib/db";
import type { MessageStatus } from "@/lib/generated/prisma";

export const dynamic = "force-dynamic";

/**
 * Deux vues seulement : ce qui reste à traiter, et le reste.
 *
 * La distinction lu / non lu ne mérite pas un onglet — elle se voit à la
 * pastille, et un message lu mais sans réponse est toujours une tâche.
 */
const VIEWS = {
  "": { label: "À traiter", statuses: ["NEW", "READ"] },
  archives: { label: "Archivés", statuses: ["ARCHIVED"] },
} as const satisfies Record<
  string,
  { label: string; statuses: readonly MessageStatus[] }
>;

type ViewKey = keyof typeof VIEWS;

const stamp = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  const { vue } = await searchParams;
  const view: ViewKey = vue === "archives" ? "archives" : "";

  const [messages, counts] = await Promise.all([
    prisma.message.findMany({
      where: { status: { in: [...VIEWS[view].statuses] } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.message.groupBy({ by: ["status"], _count: true }),
  ]);

  const countOf = (key: ViewKey) => {
    /* L'annotation élargit le tuple littéral déclaré dans VIEWS : sans elle,
       `includes` n'accepterait que les deux statuts de cette vue-là. */
    const statuses: readonly MessageStatus[] = VIEWS[key].statuses;
    return counts
      .filter((row) => statuses.includes(row.status))
      .reduce((total, row) => total + row._count, 0);
  };

  return (
    <>
      <PageHeader
        title="Messages"
        description="Les demandes reçues par le formulaire de contact du site. Rien ne part par e-mail : c'est ici qu'elles arrivent."
      />

      <nav className="mb-6 flex gap-1" aria-label="Filtrer les messages">
        {(Object.keys(VIEWS) as ViewKey[]).map((key) => (
          <Link
            key={key}
            href={key === "" ? "/admin/messages" : `/admin/messages?vue=${key}`}
            aria-current={key === view ? "page" : undefined}
            className={cx(
              "rounded-pill px-4 py-2 text-sm transition-colors",
              key === view
                ? "bg-ink text-white"
                : "text-muted hover:bg-surface hover:text-ink",
            )}
          >
            {VIEWS[key].label}
            <span className="ml-1.5 text-xs opacity-60">{countOf(key)}</span>
          </Link>
        ))}
      </nav>

      <List
        empty={
          view === "archives"
            ? "Aucun message archivé."
            : "Aucun message en attente. Les demandes envoyées depuis le site apparaîtront ici."
        }
      >
        {messages.map((message) => (
          <Row
            key={message.id}
            title={message.name}
            muted={message.status === "ARCHIVED"}
            meta={
              <>
                {message.status === "NEW" ? (
                  <span className="rounded-pill bg-accent px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-white">
                    Nouveau
                  </span>
                ) : null}
                <span>{message.email ?? message.phone}</span>
                {message.services.length > 0 ? (
                  <>
                    <span aria-hidden>·</span>
                    <span className="truncate">{message.services.join(", ")}</span>
                  </>
                ) : null}
                <span aria-hidden>·</span>
                <span>{message.scope}</span>
                <span aria-hidden>·</span>
                <time dateTime={message.createdAt.toISOString()}>
                  {stamp.format(message.createdAt)}
                </time>
              </>
            }
            actions={
              <Link
                href={`/admin/messages/${message.id}`}
                className="shrink-0 rounded-pill px-4 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                Ouvrir
              </Link>
            }
          />
        ))}
      </List>
    </>
  );
}
