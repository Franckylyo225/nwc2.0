"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ContactModal } from "./ContactModal";

/**
 * Point d'ouverture du parcours de contact.
 *
 * La modale est ouverte depuis deux endroits éloignés de l'arbre — le bouton
 * de la navigation et celui de la section contact. Un contexte évite de faire
 * redescendre un état par toutes les sections intermédiaires.
 *
 * Elle n'est montée que le temps de son ouverture : fermée, elle ne coûte rien
 * et son état repart à zéro à la réouverture, ce qui est le comportement
 * attendu d'un parcours qu'on a abandonné.
 */

type ContactModalApi = {
  open: () => void;
  /** Faux quand aucune base n'est configurée : rien n'aurait où atterrir. */
  available: boolean;
};

const Context = createContext<ContactModalApi | null>(null);

export function ContactModalProvider({
  children,
  available,
}: {
  children: ReactNode;
  available: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback(() => {
    /* Mémorisé pour être rendu à la fermeture : sans cela, le focus
       retomberait en haut de page et l'on perdrait sa place. */
    opener.current = document.activeElement as HTMLElement | null;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    opener.current?.focus();
  }, []);

  return (
    <Context.Provider value={{ open, available }}>
      {children}
      {isOpen ? <ContactModal onClose={close} /> : null}
    </Context.Provider>
  );
}

/**
 * Accès au parcours depuis n'importe quel composant client du site public.
 *
 * Hors du fournisseur — sur les pages légales, par exemple — il renvoie `null`
 * plutôt que de lever : l'appelant retombe alors sur son lien `#contact`.
 */
export function useContactModal() {
  return useContext(Context);
}
