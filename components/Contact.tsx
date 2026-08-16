import { site } from "@/content/site";
import { isDatabaseConfigured } from "@/lib/db";
import { ContactForm } from "./ContactForm";
import { Reveal } from "./Reveal";
import { ArrowUpRight } from "./ui";

const { contact } = site;

/** Un contenu encore à remplir ne doit pas produire un lien mort. */
function isFilled(value: string) {
  return !value.includes("[À REMPLIR");
}

/**
 * Section de contact — le point final de la page.
 *
 * Fond sombre, comme la carte d'appel à l'action qu'elle remplace : après la
 * FAQ, il faut une rupture franche pour que la fin de la page se voie. Le
 * formulaire est posé dessus en carte claire, seul élément lumineux de la
 * section, donc le premier regardé.
 */
export function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-ink py-24 text-white sm:py-32"
    >
      {/* Halo décoratif */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 left-1/4 size-[40rem] -translate-x-1/2 rounded-full bg-accent/25 blur-[130px]"
      />

      <div className="shell relative grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20">
        <Reveal className="flex flex-col gap-6 lg:sticky lg:top-28">
          <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-white/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-accent">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            {contact.eyebrow}
          </span>

          <h2 className="display text-4xl sm:text-5xl lg:text-[3.5rem]">
            {contact.title}
          </h2>

          <p className="max-w-md text-lg leading-relaxed text-white/60">
            {contact.subtitle}
          </p>

          <address className="mt-2 flex flex-col gap-3 not-italic">
            <Coordinate label="E-mail" href={`mailto:${contact.email}`}>
              {contact.email}
            </Coordinate>
            <Coordinate label="Téléphone" href={`tel:${contact.phone}`}>
              {contact.phone}
            </Coordinate>
            <span className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.14em] text-white/40">
                Adresse
              </span>
              <span className="text-white/80">{contact.address}</span>
            </span>
          </address>

          {isFilled(contact.booking.href) ? (
            <a
              href={contact.booking.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group mt-2 inline-flex w-fit items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-white/10"
            >
              {contact.booking.label}
              <ArrowUpRight className="transition-transform duration-300 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ) : null}
        </Reveal>

        <Reveal delay={0.08}>
          <div className="rounded-[1.75rem] bg-bg p-7 text-ink shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] sm:p-9">
            {isDatabaseConfigured() ? <ContactForm /> : <DirectContact />}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

function Coordinate({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: string;
}) {
  return (
    <span className="flex flex-col">
      <span className="text-xs uppercase tracking-[0.14em] text-white/40">
        {label}
      </span>
      <a href={href} className="text-white/80 transition-colors hover:text-accent">
        {children}
      </a>
    </span>
  );
}

/**
 * Repli affiché tant qu'aucune base n'est configurée : les messages n'auraient
 * nulle part où atterrir. Le site reste consultable et la section utile — on
 * renvoie simplement vers l'e-mail et le téléphone.
 */
function DirectContact() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h3 className="display text-2xl text-ink">Écrivez-nous directement</h3>
      <p className="leading-relaxed text-muted">
        Décrivez votre projet en deux lignes — ce que vous voulez construire,
        pour qui, et pour quand. Réponse sous 24 h ouvrées.
      </p>
      <a
        href={`mailto:${contact.email}`}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-pill bg-ink px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent"
      >
        {contact.email}
        <ArrowUpRight />
      </a>
    </div>
  );
}
