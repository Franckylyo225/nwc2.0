import type { Metadata } from "next";
import { ContactModalProvider } from "@/components/ContactModalProvider";
import { Maintenance } from "@/components/Maintenance";
import { PreviewBanner } from "@/components/PreviewBanner";
import { getCurrentUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { getSettings } from "@/lib/settings";

/**
 * Site fermé = pas d'indexation. Ce `robots` écrase celui du layout racine
 * pour toutes les pages publiques, tant que le mode maintenance est actif.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { maintenanceMode } = await getSettings();
  return maintenanceMode ? { robots: { index: false, follow: false } } : {};
}

/**
 * Portail du site public.
 *
 * Quand le mode maintenance est actif, toutes les pages de ce groupe sont
 * remplacées par l'écran de maintenance — sauf pour un administrateur
 * connecté, qui continue de voir le vrai site avec un bandeau d'avertissement.
 *
 * Le mode est vérifié AVANT toute lecture de cookie : tant qu'il est inactif,
 * aucun accès à la session n'a lieu et les pages restent prégénérées.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  /* Le parcours de contact s'ouvre depuis la navigation comme depuis la
     section contact : son état vit donc au-dessus des deux. */
  const withModal = (content: React.ReactNode) => (
    <ContactModalProvider available={isDatabaseConfigured()}>
      {content}
    </ContactModalProvider>
  );

  if (!settings.maintenanceMode) return withModal(children);

  /* À partir d'ici, le rendu devient dynamique : c'est le prix de la
     prévisualisation, et c'est sans conséquence puisque le site est fermé. */
  const user = await getCurrentUser();

  if (!user) return <Maintenance settings={settings} />;

  return withModal(
    <>
      <PreviewBanner />
      {children}
    </>,
  );
}
