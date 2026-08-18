import Link from "next/link";
import { site } from "@/content/site";
import { MobileCta } from "./MobileCta";
import { Wordmark } from "./Wordmark";
import { ArrowUpRight } from "./ui";

const { footer, brand, contact } = site;

export function Footer() {
  return (
    /* `overflow-hidden` sert au bandeau du bas, qui déborde volontairement.
       Le pied de page est le seul élément commun à toutes les pages publiques :
       c'est donc lui qui porte le bouton fixe du mobile. */
    <footer className="overflow-hidden border-t border-line bg-surface/60">
      <MobileCta />
      <div className="shell pb-28 pt-16 sm:pb-12 sm:pt-20">
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

        {/* Dernière chose de la page, et la seule des trois à n'être pas
            tranchée : c'est le nom du studio, il doit se lire en entier. Le
            dégradé reste, mais s'arrête avant la transparence complète — assez
            pour poser une ombre sous le mot, pas assez pour l'effacer. */}
        <Wordmark
          text={brand.name}
          className="mt-12 text-[clamp(2rem,8.4vw,7.9rem)] from-ink/40 via-ink/26 to-ink/8 sm:mt-16"
        />
      </div>
    </footer>
  );
}
