import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, cx } from "@/components/ui";

/**
 * Boîte de réception — à part, et en tête de menu : c'est la seule rubrique
 * qui se remplit toute seule, donc la seule qui réclame d'être regardée.
 */
export const ADMIN_INBOX = { href: "/admin/messages", label: "Messages" } as const;

/** Rubriques de l'admin — sert à la fois au menu et au tableau de bord. */
export const ADMIN_SECTIONS = [
  { href: "/admin/services", label: "Services" },
  { href: "/admin/realisations", label: "Réalisations" },
  { href: "/admin/produits", label: "Projets maison" },
  { href: "/admin/articles", label: "Actualités & blog" },
  { href: "/admin/temoignages", label: "Témoignages" },
] as const;

/** Réglages du site — à part : ce n'est pas une collection de contenu. */
export const ADMIN_SETTINGS = { href: "/admin/parametres", label: "Paramètres" } as const;

/** En-tête d'une page admin : titre, description, bouton d'action. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-3xl text-ink sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-2 rounded-pill bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          {action.label}
          <ArrowUpRight />
        </Link>
      ) : null}
    </header>
  );
}

/** Conteneur d'une liste : cadre, séparateurs, état vide. */
export function List({
  children,
  empty,
}: {
  children: ReactNode;
  empty?: ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const isEmpty = items.flat().filter(Boolean).length === 0;

  if (isEmpty && empty) {
    return (
      <div className="rounded-card border border-dashed border-line-strong bg-surface/50 px-6 py-16 text-center text-sm text-muted">
        {empty}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-card bg-white ring-1 ring-line">
      {children}
    </ul>
  );
}

/** Une ligne de liste : identité à gauche, actions à droite. */
export function Row({
  title,
  meta,
  muted,
  actions,
}: {
  title: string;
  meta?: ReactNode;
  /** Grise la ligne — utilisé pour les brouillons. */
  muted?: boolean;
  actions: ReactNode;
}) {
  return (
    <li
      className={cx(
        "flex flex-col gap-3 px-6 py-5 transition-colors hover:bg-surface/60 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        muted && "opacity-60",
      )}
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-ink">{title}</p>
        {meta ? (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            {meta}
          </p>
        ) : null}
      </div>
      {actions}
    </li>
  );
}

/** Cadre d'une page de formulaire. */
export function FormShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <PageHeader title={title} description={description} />
      <div className="rounded-card bg-surface/40 px-6 py-7 ring-1 ring-line">
        {children}
      </div>
    </div>
  );
}
