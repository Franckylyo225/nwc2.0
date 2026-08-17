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

/**
 * Modes SSL que `pg` traite aujourd'hui comme des synonymes de `verify-full`,
 * en prévenant qu'il cessera de le faire.
 */
const SSL_ALIASES = /([?&]sslmode=)(prefer|require|verify-ca)(?=&|$)/i;

/**
 * Fixe explicitement le mode SSL que `pg` applique déjà.
 *
 * Neon — comme la plupart des hébergeurs — livre une chaîne terminée par
 * `?sslmode=require`. `pg` la traite comme `verify-full`, mais avertit à
 * chaque démarrage qu'il adoptera la sémantique libpq à sa prochaine version
 * majeure, où `require` chiffre sans vérifier le certificat. L'avertissement
 * remonte alors dans l'overlay de Next, déguisé en erreur.
 *
 * Écrire `verify-full` noir sur blanc ne change donc rien au comportement
 * actuel : cela le grave, et la mise à jour de `pg` ne pourra pas affaiblir
 * la connexion sans qu'on l'ait décidé. La réécriture porte sur le seul
 * paramètre de la requête, sans reconstruire l'URL — un mot de passe aux
 * caractères exotiques ne doit pas être ré-encodé au passage.
 */
function pinSslMode(url: string) {
  return url.replace(SSL_ALIASES, "$1verify-full");
}

/** Valeur nettoyée d'une variable, ou `undefined` si elle est absente ou vide. */
export function readDatabaseUrl(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;

  /* Guillemets simples ou doubles laissés autour de la valeur. */
  const cleaned = raw.trim().replace(/^['"]|['"]$/g, "").trim();
  return cleaned || undefined;
}

function describe(name: string, url: string) {
  return (
    `${name} n'est pas une chaîne de connexion : « ${url.slice(0, 32)}… ». ` +
    `Attendu : postgresql://utilisateur:motdepasse@hote/base?sslmode=require — ` +
    `la chaîne ENTIÈRE, pas seulement le nom d'hôte, et sans guillemets autour.`
  );
}

/**
 * Première URL exploitable parmi les variables données, ou `undefined`.
 *
 * Une valeur mal formée est signalée puis ignorée, et l'on passe à la
 * suivante. Bloquer toute une installation parce qu'une variable secondaire
 * — `DIRECT_DATABASE_URL` par exemple — est mal saisie serait disproportionné :
 * l'avertissement reste visible dans les journaux de build.
 */
export function optionalDatabaseUrl(...names: string[]): string | undefined {
  for (const name of names) {
    const url = readDatabaseUrl(name);
    if (!url) continue;

    if (!SCHEMES.test(url)) {
      console.warn(`⚠ ${describe(name, url)} Variable ignorée.`);
      continue;
    }
    return pinSslMode(url);
  }
  return undefined;
}

/**
 * Comme `optionalDatabaseUrl`, mais exige qu'une URL soit trouvée. Utilisé là
 * où l'application ne peut rien faire sans base.
 */
export function resolveDatabaseUrl(...names: string[]): string {
  const url = optionalDatabaseUrl(...names);
  if (url) return url;

  const malformed = names.filter((name) => {
    const value = readDatabaseUrl(name);
    return value && !SCHEMES.test(value);
  });

  throw new Error(
    malformed.length > 0
      ? describe(malformed[0], readDatabaseUrl(malformed[0]) ?? "")
      : `Aucune URL de base de données. Renseigne ${names.join(" ou ")}.`,
  );
}
