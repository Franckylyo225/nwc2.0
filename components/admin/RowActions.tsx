"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ActionState } from "@/app/admin/actions";
import { cx } from "@/components/ui";

/**
 * Actions d'une ligne de liste : publier/dépublier, modifier, supprimer.
 *
 * La suppression demande confirmation — c'est irréversible et un clic malheureux
 * dans une liste dense arrive vite.
 */
export function RowActions({
  editHref,
  published,
  label,
  onToggle,
  onRemove,
}: {
  editHref: string;
  published: boolean;
  /** Nom du contenu, repris dans la confirmation. */
  label: string;
  onToggle: () => Promise<ActionState>;
  onRemove: () => Promise<ActionState>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<ActionState>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => run(onToggle)}
          disabled={pending}
          title={published ? "Dépublier" : "Publier"}
          className={cx(
            "rounded-pill px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
            published
              ? "bg-accent-soft text-accent hover:bg-accent hover:text-white"
              : "bg-surface text-muted hover:bg-line",
          )}
        >
          {published ? "En ligne" : "Brouillon"}
        </button>

        <Link
          href={editHref}
          className="rounded-pill px-3 py-1.5 text-xs text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          Modifier
        </Link>

        {confirming ? (
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => run(onRemove)}
              disabled={pending}
              className="rounded-pill bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {pending ? "…" : "Confirmer"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-pill px-2 py-1.5 text-xs text-muted hover:text-ink"
            >
              Non
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            title={`Supprimer « ${label} »`}
            className="rounded-pill px-3 py-1.5 text-xs text-muted transition-colors hover:bg-accent-soft hover:text-accent"
          >
            Supprimer
          </button>
        )}
      </div>

      {error ? (
        <p role="alert" className="max-w-xs text-right text-xs text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
