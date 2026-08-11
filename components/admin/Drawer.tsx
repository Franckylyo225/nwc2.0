"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Panneau latéral qui glisse depuis la droite, par-dessus la liste.
 *
 * Il est monté par une route interceptée : l'URL change comme pour une page
 * normale, donc le bouton « précédent » du navigateur le referme et un lien
 * direct affiche la page pleine. Fermer revient simplement à remonter d'un cran
 * dans l'historique.
 */
export function Drawer({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);

  const close = () => router.back();

  useEffect(() => {
    /* Échap ferme, comme dans toute boîte de dialogue. */
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    /* L'arrière-plan ne doit pas défiler sous le panneau. */
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    /* Le focus entre dans le panneau : sans cela, la tabulation continuerait
       de parcourir la liste restée derrière. */
    panel.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Voile : un clic dessus ferme. */}
      <button
        type="button"
        aria-label="Fermer"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/25 [animation:fade-in_0.25s_var(--ease-smooth)_both] backdrop-blur-[2px]"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        className="relative flex h-full w-full max-w-xl flex-col bg-bg shadow-[-24px_0_60px_-30px_rgba(16,17,20,0.45)] outline-none [animation:drawer-in_0.35s_var(--ease-smooth)_both]"
      >
        <header className="flex items-start justify-between gap-6 border-b border-line px-6 py-5">
          <div>
            <h2 id="drawer-title" className="display text-2xl text-ink">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-muted">{description}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Fermer le panneau"
            className="-mr-1 grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-4">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {/* Corps défilant : le pied de formulaire y reste collé en bas. */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
