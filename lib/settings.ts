import "server-only";

import { isDatabaseConfigured, prisma } from "./db";

/** Identifiant de la ligne unique de réglages. */
export const SETTINGS_ID = "settings";

export type SiteSettings = {
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceEta: Date | null;
  /**
   * Vrai si la date d'ouverture est encore à venir. Calculé ici, au moment de
   * la requête, plutôt que dans le composant : le rendu reste une pure
   * fonction de ses données.
   */
  maintenanceEtaIsFuture: boolean;
  showContact: boolean;
};

/**
 * Valeurs par défaut, servies tant qu'aucune base n'est configurée ou que la
 * ligne de réglages n'existe pas encore.
 *
 * `maintenanceMode: false` est volontaire : un incident de lecture ne doit
 * jamais fermer le site par accident.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  maintenanceMode: false,
  maintenanceTitle: "Le site arrive bientôt",
  maintenanceMessage:
    "Nous préparons quelque chose de mieux. Revenez très vite.",
  maintenanceEta: null,
  maintenanceEtaIsFuture: false,
  showContact: true,
};

export async function getSettings(): Promise<SiteSettings> {
  if (!isDatabaseConfigured()) return DEFAULT_SETTINGS;

  const row = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (!row) return DEFAULT_SETTINGS;

  return {
    maintenanceMode: row.maintenanceMode,
    maintenanceTitle: row.maintenanceTitle,
    maintenanceMessage: row.maintenanceMessage,
    maintenanceEta: row.maintenanceEta,
    maintenanceEtaIsFuture: row.maintenanceEta
      ? row.maintenanceEta.getTime() > Date.now()
      : false,
    showContact: row.showContact,
  };
}
