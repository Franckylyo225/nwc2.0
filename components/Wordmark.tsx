import { cx } from "./ui";

/**
 * Un mot posé en très grand, qui se dissout vers le bas.
 *
 * Le texte n'est pas tranché : un dégradé appliqué **aux lettres elles-mêmes**
 * (`bg-clip-text`) les éteint progressivement, si bien qu'elles s'effacent
 * avant d'atteindre le bloc suivant. Une coupe nette, essayée d'abord, donnait
 * un bord dur qui ressemblait à un défaut d'affichage.
 *
 * L'espacement des lettres reste celui de la police. Forcer le mot à occuper
 * toute la largeur — par un `textLength` en SVG — l'écartèle dès qu'il est
 * court : le texte se lit alors comme une suite de lettres isolées et perd
 * l'effet de masse qu'on cherche ici.
 *
 * La taille se règle à l'appel, et **doit** l'être : le composant n'en propose
 * aucune. Une taille par défaut se serait retrouvée en concurrence avec celle
 * de l'appelant — deux `text-[…]` sur le même élément se départagent par
 * l'ordre du CSS généré, pas par celui de l'attribut, et le résultat varie
 * d'un mot à l'autre sans qu'on puisse s'y fier.
 *
 * C'est la largeur occupée qu'on égalise, pas la taille des lettres : à corps
 * égal, un mot court flotte au milieu de la colonne quand un long en déborde.
 *
 * Purement décoratif : le texte est toujours écrit ailleurs en clair, et
 * l'entendre deux fois de suite n'apprendrait rien.
 */
export function Wordmark({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <p
      aria-hidden
      className={cx(
        "display select-none whitespace-nowrap text-center leading-[0.85] tracking-[-0.045em]",
        /* Le dégradé habille le texte et non son fond : d'où `bg-clip-text` et
           un texte transparent, qui laisse voir le dégradé au travers. */
        "bg-gradient-to-b from-ink/35 via-ink/18 to-transparent bg-clip-text text-transparent",
        className,
      )}
    >
      {text}
    </p>
  );
}
