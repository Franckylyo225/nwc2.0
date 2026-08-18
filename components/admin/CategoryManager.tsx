"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { removeArticleCategory, saveArticleCategory } from "@/app/admin/actions";
import { cx } from "@/components/ui";

/**
 * Rubriques du journal.
 *
 * Chaque ligne est son propre formulaire, et non un champ d'un grand
 * formulaire commun : renommer une rubrique ne doit pas obliger à réenregistrer
 * les autres, ni risquer d'écraser une modification faite entre-temps.
 *
 * Le slug n'est pas demandé à la création — il se déduit du nom côté serveur.
 * Il reste modifiable ensuite, parce qu'il vit dans l'URL du journal et qu'on
 * ne le change pas à la légère une fois des liens partagés.
 */

export type Category = {
  id: string;
  name: string;
  slug: string;
  position: number;
  _count: { articles: number };
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryRow category={category} />
          </li>
        ))}
      </ul>

      <CategoryRow />
    </div>
  );
}

function CategoryRow({ category }: { category?: Category }) {
  const isNew = !category;
  const [state, formAction, pending] = useActionState(
    saveArticleCategory.bind(null, category?.id ?? null),
    {} as ActionState,
  );

  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);

  /* Le formulaire de création se vide après coup, pour enchaîner ; celui d'une
     rubrique existante garde ce qui vient d'être saisi. */
  useEffect(() => {
    if (state.ok && isNew) form.current?.reset();
  }, [state.ok, isNew]);

  const used = category?._count.articles ?? 0;

  return (
    <form
      ref={form}
      action={formAction}
      className={cx(
        "flex flex-col gap-3 rounded-card px-4 py-4 ring-1",
        isNew ? "bg-surface/60 ring-dashed ring-line-strong" : "bg-white ring-line",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
            {isNew ? "Nouvelle rubrique" : "Nom"}
          </span>
          <input
            name="name"
            defaultValue={category?.name}
            placeholder="Études de cas"
            className="w-full rounded-xl bg-surface px-3.5 py-2.5 text-sm text-ink ring-1 ring-line transition-shadow focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        {/* Le slug ne s'affiche qu'une fois la rubrique créée : à la création il
            se déduit du nom, et un champ de plus n'aiderait personne. */}
        {isNew ? null : (
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
              Slug
            </span>
            <input
              name="slug"
              defaultValue={category.slug}
              className="w-full rounded-xl bg-surface px-3.5 py-2.5 font-mono text-[0.8rem] text-ink ring-1 ring-line transition-shadow focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
        )}

        <label className="flex w-full flex-col gap-1.5 sm:w-24">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
            Ordre
          </span>
          <input
            name="position"
            type="number"
            defaultValue={category?.position ?? 0}
            className="w-full rounded-xl bg-surface px-3.5 py-2.5 text-sm text-ink ring-1 ring-line transition-shadow focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-pill bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
        >
          {pending ? "…" : isNew ? "Ajouter" : "Enregistrer"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {state.error || removeError ? (
          <p role="alert" className="text-accent">
            {state.error ?? removeError}
          </p>
        ) : null}

        {isNew ? null : (
          <>
            <span className="text-muted">
              {used === 0
                ? "Aucun article"
                : `${used} article${used > 1 ? "s" : ""}`}
            </span>

            <span aria-hidden className="text-line-strong">
              ·
            </span>

            {removing ? (
              <span className="flex items-center gap-2">
                <RemoveButton
                  id={category.id}
                  label={category.name}
                  onError={setRemoveError}
                />
                <button
                  type="button"
                  onClick={() => setRemoving(false)}
                  className="text-muted transition-colors hover:text-ink"
                >
                  Annuler
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setRemoveError(null);
                  setRemoving(true);
                }}
                className="text-muted transition-colors hover:text-accent"
              >
                Supprimer
              </button>
            )}
          </>
        )}
      </div>
    </form>
  );
}

/**
 * Bouton de suppression.
 *
 * Isolé dans son propre composant pour porter `formAction` : la suppression
 * est une action distincte de l'enregistrement, alors que le bouton vit dans
 * le même formulaire. Un second `<form>` imbriqué serait du HTML invalide.
 */
function RemoveButton({
  id,
  label,
  onError,
}: {
  id: string;
  label: string;
  onError: (message: string | null) => void;
}) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        onError(null);
        const result = await removeArticleCategory(id);
        if (result?.error) onError(result.error);
        setPending(false);
      }}
      className="rounded-pill bg-accent px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
    >
      {pending ? "…" : `Supprimer « ${label} »`}
    </button>
  );
}
