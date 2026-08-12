/**
 * Primitives partagées : boutons, en-têtes de section, pastilles.
 * Aucune de ces briques ne contient de texte en dur — tout vient de content/site.ts.
 */
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ Bouton */

type ButtonVariant = "primary" | "secondary" | "ghost";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-pill text-sm font-medium transition-all duration-200 ease-smooth active:scale-[0.98] whitespace-nowrap";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white px-6 py-3 hover:bg-accent hover:shadow-[0_10px_30px_-10px_rgba(0,153,255,0.65)]",
  secondary:
    "bg-white text-ink px-6 py-3 ring-1 ring-line-strong hover:ring-ink hover:bg-surface",
  ghost: "text-ink px-3 py-2 hover:text-accent",
};

export function Button({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className">) {
  /**
   * On ne passe par <Link> que pour les vraies routes internes ("/…" ou "#…").
   * Tout le reste — URL externe, mailto:, tel:, ou valeur encore à remplir —
   * part en <a> brut : le routeur refuse les href contenant des crochets.
   */
  const isInternal = href.startsWith("/") || href.startsWith("#");
  const classes = cx(buttonBase, buttonVariants[variant], className);

  if (!isInternal) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

/* ----------------------------------------------------------------- Eyebrow */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    /* `w-fit` empêche l'étirement quand le parent est un flex-col. */
    <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-accent-soft px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-accent">
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

/* -------------------------------------------------------- En-tête section */

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="display text-4xl text-ink sm:text-5xl lg:text-[3.5rem]">
        {title}
      </h2>
      {intro ? (
        <p
          className={cx(
            "text-lg leading-relaxed text-muted",
            align === "center" ? "max-w-2xl" : "max-w-xl",
          )}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ Section */

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cx("py-24 sm:py-32", className)}>
      <div className="shell">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------- Icônes SVG */

/**
 * Les deux vagues de la marque, en `currentColor`.
 *
 * `title` donne un nom accessible à l'icône : à ne renseigner QUE lorsque le
 * nom de la marque n'est pas déjà écrit en toutes lettres à côté — sinon un
 * lecteur d'écran l'annonce deux fois. Sans `title`, l'icône est décorative.
 */
export function BrandMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      className={cx("size-5", className)}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M2 15c2.2-3.4 4-3.4 6.2 0s4 3.4 6.2 0 4-3.4 6.2 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M2 9c2.2-3.4 4-3.4 6.2 0s4 3.4 6.2 0 4-3.4 6.2 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={cx("size-4", className)}
    >
      <path
        d="M4.5 11.5 11.5 4.5M11.5 4.5H5.5M11.5 4.5v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Check({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={cx("size-4 shrink-0", className)}
    >
      <path
        d="m3.5 8.5 3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
