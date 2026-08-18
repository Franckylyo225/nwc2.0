import { ContactModalProvider } from "@/components/ContactModalProvider";
import { isDatabaseConfigured } from "@/lib/db";

/**
 * Les pages légales ne dépendent d'aucun réglage — pas de mode maintenance, pas
 * de contenu en base : un visiteur doit pouvoir les lire même site fermé.
 *
 * Elles ont en revanche besoin du parcours de contact, que la navigation et le
 * bouton fixe du bas proposent ici comme partout ailleurs.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContactModalProvider available={isDatabaseConfigured()}>
      {children}
    </ContactModalProvider>
  );
}
