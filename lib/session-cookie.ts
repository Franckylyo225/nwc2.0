/**
 * Nom du cookie de session, isolé dans son propre module.
 *
 * Le middleware tourne sur le runtime Edge et ne peut donc pas importer
 * lib/auth.ts, qui tire Prisma avec lui. Cette constante partagée évite de
 * dupliquer la chaîne des deux côtés.
 */
export const SESSION_COOKIE = "nwc_session";
