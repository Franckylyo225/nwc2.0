"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { ContactTrigger } from "./ContactTrigger";
import { ArrowUpRight, BrandMark, buttonClasses, cx } from "./ui";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Empêche le défilement de l'arrière-plan quand le menu mobile est ouvert. */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-smooth",
        scrolled
          ? "border-b border-line bg-bg/85 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="shell flex h-18 items-center justify-between gap-6 py-4">
        {/* Vers l'accueil, et non vers `#top` : une ancre ne quitte pas la page
            courante, si bien que depuis le blog ou une page légale le logo ne
            faisait rien. Sur l'accueil, la navigation ramène en haut, ce qui
            était déjà le comportement attendu. */}
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <Logo />
          <span className="text-[0.95rem] font-semibold leading-tight tracking-tight">
            New Wave
            <span className="block text-[0.7rem] font-normal uppercase tracking-[0.2em] text-muted">
              Conception
            </span>
          </span>
        </Link>

        {/* Liens — bureau */}
        <ul className="hidden items-center gap-1 lg:flex">
          {site.nav.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-pill px-4 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* Masqué via un conteneur : `hidden` sur le bouton lui-même serait
              écrasé par le `inline-flex` de sa classe de base. */}
          <span className="hidden sm:block">
            <ContactTrigger className={buttonClasses()}>
              {site.nav.cta.label}
              <ArrowUpRight />
            </ContactTrigger>
          </span>

          {/* Bouton burger — mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="grid size-11 place-items-center rounded-pill ring-1 ring-line-strong transition-colors hover:bg-surface lg:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={cx(
                  "absolute left-0 block h-px w-full bg-ink transition-all duration-300 ease-smooth",
                  open ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cx(
                  "absolute left-0 block h-px w-full bg-ink transition-all duration-300 ease-smooth",
                  open ? "top-1.5 -rotate-45" : "top-3",
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Panneau mobile */}
      <div
        id="menu-mobile"
        className={cx(
          "overflow-hidden border-t border-line bg-bg transition-[max-height,opacity] duration-400 ease-smooth lg:hidden",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <ul className="shell flex flex-col gap-1 py-6">
          {site.nav.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="display block rounded-card px-4 py-3 text-3xl text-ink transition-colors hover:bg-surface"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="mt-4 px-4">
            <ContactTrigger
              className={buttonClasses("primary", "w-full")}
              onClick={() => setOpen(false)}
            >
              {site.nav.cta.label}
              <ArrowUpRight />
            </ContactTrigger>
          </li>
        </ul>
      </div>
    </header>
  );
}

/** Monogramme « NWC » — remplace-le par ton logo si tu en as un. */
function Logo() {
  return (
    /* Le nom de la marque est écrit en toutes lettres à côté, à toutes les
       largeurs : l'icône n'a donc pas de `title`, sous peine de faire annoncer
       « New Wave Conception » deux fois de suite par un lecteur d'écran. */
    <span className="grid size-10 place-items-center rounded-[0.7rem] bg-ink text-white transition-colors group-hover:bg-accent">
      <BrandMark />
    </span>
  );
}
