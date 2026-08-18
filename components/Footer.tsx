import Link from "next/link";
import { site } from "@/content/site";
import { ArrowUpRight } from "./ui";

const { footer, brand, contact } = site;

export function Footer() {
  return (
    <>
      <Wordmark />
      <FooterBody />
    </>
  );
}

/**
 * Le nom de la marque en très grand, tranché net par le bord du pied de page.
 *
 * Le texte est tracé en SVG plutôt qu'en HTML, pour une raison précise : il
 * doit occuper toute la largeur, quelle que soit celle de l'écran **et** la
 * longueur du nom. `textLength` sur la largeur du `viewBox` le garantit ;
 * `lengthAdjust="spacing"` ne touche qu'à l'espacement des lettres, jamais à
 * leur dessin. Une taille en `vw` aurait débordé ou laissé un blanc dès qu'on
 * change le nom d'un caractère.
 *
 * La coupe vient du `viewBox`, plus court que la ligne de texte : les jambages
 * passent dessous et sont simplement absents du tracé. Le dégradé, lui, éteint
 * le bas des lettres avant la coupe, sans quoi elle paraîtrait accidentelle.
 *
 * Purement décoratif : le nom est déjà écrit juste en dessous, et l'entendre
 * deux fois de suite n'apprendrait rien.
 */
function Wordmark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 66"
      className="block w-full select-none"
    >
      <defs>
        <linearGradient id="wordmark-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      <text
        x="500"
        y="100"
        textAnchor="middle"
        textLength="980"
        lengthAdjust="spacing"
        fontSize="112"
        fill="url(#wordmark-fade)"
        className="display"
      >
        {brand.name}
      </text>
    </svg>
  );
}

function FooterBody() {
  return (
    <footer className="border-t border-line bg-surface/60">
      <div className="shell py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Marque */}
          <div className="flex flex-col gap-5">
            <span className="display text-2xl text-ink">{brand.name}</span>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              {footer.blurb}
            </p>
            <address className="flex flex-col gap-1 text-sm not-italic text-muted">
              <a href={`mailto:${contact.email}`} className="hover:text-accent">
                {contact.email}
              </a>
              <a href={`tel:${contact.phone}`} className="hover:text-accent">
                {contact.phone}
              </a>
              <span>{contact.address}</span>
            </address>
          </div>

          {/* Colonnes de liens */}
          {footer.columns.map((column) => (
            <nav key={column.title} className="flex flex-col gap-4">
              <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-ink">
                {column.title}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Réseaux */}
          <nav className="flex flex-col gap-4">
            <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-ink">
              Suivre
            </h2>
            <ul className="flex flex-col gap-2.5">
              {contact.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
                  >
                    {social.label}
                    <ArrowUpRight className="size-3.5 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">{footer.legal}</p>
          <a
            href="#top"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
          >
            Revenir en haut
            <ArrowUpRight className="size-3.5 -rotate-45" />
          </a>
        </div>
      </div>
    </footer>
  );
}
