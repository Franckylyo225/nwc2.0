"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useContactModal } from "./ContactModalProvider";

/**
 * Bouton qui ouvre le parcours de contact.
 *
 * Rendu en lien vers `#contact`, puis détourné au clic. Ce n'est pas une
 * coquetterie : sans JavaScript — ou avant l'hydratation, ou hors du
 * fournisseur — le lien fait ce qu'il a toujours fait, il descend à la section
 * contact, qui affiche les coordonnées directes. Un `<button>` seul n'aurait
 * rien fait du tout.
 *
 * Même repli quand aucune base n'est configurée : le parcours n'aurait nulle
 * part où déposer la demande.
 */
export function ContactTrigger({
  className,
  onClick,
  children,
}: {
  className?: string;
  /** Joué dans tous les cas — sert au menu mobile, qui doit se refermer. */
  onClick?: () => void;
  children: ReactNode;
}) {
  const modal = useContactModal();

  return (
    <Link
      href="#contact"
      onClick={(event) => {
        onClick?.();
        if (!modal?.available) return;
        event.preventDefault();
        modal.open();
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
