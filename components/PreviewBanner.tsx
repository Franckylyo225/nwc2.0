import Link from "next/link";

/**
 * Rappel affiché à l'administrateur connecté quand le site est fermé au public.
 *
 * Sans lui, on oublie que le mode maintenance est actif — et on croit le site
 * en ligne alors que les visiteurs voient une porte close.
 */
export function PreviewBanner() {
  return (
    <div className="sticky top-0 z-[60] bg-accent px-4 py-2.5 text-center text-sm text-white">
      <span className="font-medium">Mode maintenance actif.</span>{" "}
      <span className="text-white/85">
        Les visiteurs voient la page d&apos;attente ; vous voyez le site parce que
        vous êtes connecté.
      </span>{" "}
      <Link
        href="/admin/parametres"
        className="underline underline-offset-2 hover:text-white"
      >
        Désactiver
      </Link>
    </div>
  );
}
