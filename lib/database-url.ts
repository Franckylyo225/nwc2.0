/**
 * Lecture des URL de connexion, tolérante aux erreurs de saisie courantes.
 *
 * Deux pièges reviennent systématiquement au moment de renseigner les
 * variables chez un hébergeur :
 *
 *  - la valeur est collée depuis un fichier .env **avec ses guillemets** ;
 *    la chaîne commence alors par `"` et Prisma répond « P1013 : the scheme
 *    is not recognized », un message qui ne désigne pas la cause ;
 *  - la variable est créée mais laissée **vide** ; l'opérateur `??` ne
 *    bascule pas sur la valeur de repli, puisqu'une chaîne vide n'est ni
 *    `null` ni `undefined`.
 *
 * Ce module absorbe les deux, et échoue avec un message qui nomme la variable
 * fautive plutôt qu'un code d'erreur.
 */

const SCHEMES = /^postgres(ql)?:\/\//;

/** Valeur nettoyée d'une variable, ou `undefined` si elle est absente ou vide. */
export function readDatabaseUrl(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;

  /* Guillemets simples ou doubles laissés autour de la valeur. */
  const cleaned = raw.trim().replace(/^['"]|['"]$/g, "").trim();
  return cleaned || undefined;
}

function assertScheme(name: string, url: string) {
  if (!SCHEMES.test(url)) {
    throw new Error(
      `${name} ne commence pas par « postgresql:// » (valeur reçue : « ${url.slice(0, 24)}… »). ` +
        `Chez un hébergeur, la valeur se saisit SANS guillemets autour.`,
    );
  }
}

/**
 * Première URL exploitable parmi les variables données, ou `undefined`.
 *
 * Une valeur présente mais mal formée lève une erreur : mieux vaut échouer
 * en nommant la variable fautive que laisser Prisma répondre « P1013 ».
 */
export function optionalDatabaseUrl(...names: string[]): string | undefined {
  for (const name of names) {
    const url = readDatabaseUrl(name);
    if (!url) continue;
    assertScheme(name, url);
    return url;
  }
  return undefined;
}

/**
 * Comme `optionalDatabaseUrl`, mais exige qu'une URL soit trouvée.
 */
export function resolveDatabaseUrl(...names: string[]): string {
  const url = optionalDatabaseUrl(...names);
  if (url) return url;

  throw new Error(
    `Aucune URL de base de données exploitable. Renseigne ${names.join(" ou ")} ` +
      `(valeur non vide, sans guillemets).`,
  );
}
