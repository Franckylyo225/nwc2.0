"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ActionState } from "@/app/admin/actions";
import { removeMessage, setMessageStatus } from "@/app/admin/actions";
import type { MessageStatus } from "@/lib/generated/prisma";
import { cx } from "@/components/ui";

/**
 * Ce qu'on peut faire d'un message ouvert : y répondre, le remettre à traiter,
 * le ranger, le supprimer.
 *
 * Trois statuts, deux gestes : « archiver » range, « à traiter » ressort de
 * l'archive comme du statut lu. Un message rouvert redevient donc une tâche —
 * c'est le seul moyen de rattraper un archivage trop rapide.
 */
export function MessageActions({
  id,
  status,
  author,
  replyHref,
}: {
  id: string;
  status: MessageStatus;
  /** Nom de l'expéditeur, repris dans la confirmation de suppression. */
  author: string;
  replyHref: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<ActionState>, after?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
      else if (after) after();
      else router.refresh();
    });
  };

  const archived = status === "ARCHIVED";

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-6">
      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent ring-1 ring-accent/20"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={replyHref}
          className="inline-flex items-center gap-2 rounded-pill bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Répondre par e-mail
        </a>

        <button
          type="button"
          onClick={() => run(() => setMessageStatus(id, archived ? "NEW" : "ARCHIVED"))}
          disabled={pending}
          className={cx(
            "rounded-pill px-4 py-2.5 text-sm transition-colors disabled:opacity-50",
            archived
              ? "bg-accent-soft text-accent hover:bg-accent hover:text-white"
              : "bg-surface text-muted hover:bg-line hover:text-ink",
          )}
        >
          {archived ? "Remettre à traiter" : "Archiver"}
        </button>

        <span className="flex-1" />

        {confirming ? (
          <span className="flex items-center gap-1">
            <button
              type="button"
              /* La suppression fait disparaître la page courante : on retourne
                 à la liste plutôt que de rafraîchir un message qui n'est plus. */
              onClick={() =>
                run(() => removeMessage(id), () => {
                  router.push("/admin/messages");
                  router.refresh();
                })
              }
              disabled={pending}
              className="rounded-pill bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {pending ? "…" : `Supprimer le message de ${author}`}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-pill px-3 py-2.5 text-sm text-muted transition-colors hover:text-ink"
            >
              Annuler
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-pill px-4 py-2.5 text-sm text-muted transition-colors hover:text-accent"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}
