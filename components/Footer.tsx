import Link from "next/link";
import { site } from "@/content/site";
import { ArrowUpRight } from "./ui";

const { footer, brand, contact } = site;

export function Footer() {
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
