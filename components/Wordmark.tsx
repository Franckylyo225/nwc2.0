import { cx } from "./ui";

/**
 * Un mot posé en très grand, pleine largeur, et tranché net par le bord du
 * bloc qui suit.
 *
 * Tracé en SVG et non en HTML, pour une raison précise : il doit occuper toute
 * la largeur quelle que soit celle de l'écran **et** la longueur du texte.
 * `textLength` sur la largeur du `viewBox` le garantit ; `lengthAdjust`
 * n'ajuste que l'espacement des lettres, jamais leur dessin. Une taille en
 * `vw` déborderait ou laisserait un blanc dès qu'on change un caractère.
 *
 * La coupe vient du `viewBox`, plus court que la ligne de texte : le bas des
 * lettres passe dessous et n'est simplement pas tracé. Le dégradé l'éteint
 * avant la coupe, sans quoi elle paraîtrait accidentelle.
 *
 * Purement décoratif : le texte est toujours écrit ailleurs en clair, et
 * l'entendre deux fois de suite n'apprendrait rien.
 */
export function Wordmark({
  text,
  id,
  className,
}: {
  text: string;
  /** Rend unique l'identifiant du dégradé : deux bandeaux coexistent sur l'accueil. */
  id: string;
  className?: string;
}) {
  const gradient = `wordmark-${id}`;

  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 66"
      className={cx("block w-full select-none", className)}
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      <text
        x="500"
        y="100"
        textAnchor="middle"
        textLength="980"
        lengthAdjust="spacing"
        fontSize="112"
        fill={`url(#${gradient})`}
        className="display"
      >
        {text}
      </text>
    </svg>
  );
}
