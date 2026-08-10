import type { CSSProperties, ReactNode } from "react";
import { cx } from "./ui";

/**
 * Fait apparaître son contenu au défilement (léger fondu + montée).
 *
 * Composant serveur, sans JavaScript : l'animation repose sur les
 * scroll-driven animations CSS (voir `.reveal` dans globals.css).
 * Conséquence importante : le contenu est présent et visible dans le HTML
 * envoyé au navigateur — bon pour le référencement et l'accessibilité.
 *
 * `delay` est exprimé en secondes pour rester lisible côté appelant ; il est
 * converti en décalage de plage de défilement (un retard en temps n'a pas de
 * sens quand l'animation est pilotée par le scroll).
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const style = {
    "--stagger": `${Math.min(delay * 100, 30)}%`,
  } as CSSProperties;

  return (
    <div className={cx("reveal", className)} style={style}>
      {children}
    </div>
  );
}
