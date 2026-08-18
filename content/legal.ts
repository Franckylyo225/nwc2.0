/* ============================================================================
 * NEW WAVE CONCEPTION — PAGES LÉGALES
 * ----------------------------------------------------------------------------
 * Les trois documents obligatoires, référencés dans le pied de page.
 *
 * CADRE RETENU : société de droit ivoirien, établie à Abidjan, qui démarche
 * aussi des clients en France. Deux régimes se superposent donc, et les textes
 * ci-dessous le disent explicitement :
 *
 *   - Côte d'Ivoire : loi n°2013-450 du 19 juin 2013 relative à la protection
 *     des données à caractère personnel, sous le contrôle de l'ARTCI ;
 *   - Union européenne : le RGPD s'applique par extraterritorialité (art. 3.2)
 *     dès lors que le studio propose ses services à des personnes situées
 *     dans l'Union.
 *
 * CONVENTION : identique au reste du contenu — [À REMPLIR] marque une
 * information que seul l'éditeur connaît. Ici elles ne sont PAS optionnelles :
 * une mention légale incomplète est une infraction, pas une imperfection.
 *
 *   grep -rn "À REMPLIR" content/legal.ts
 *
 * Le corps de chaque document s'écrit en Markdown et se rend côté serveur,
 * exactement comme les articles du blog.
 * ==========================================================================*/

import { site } from "./site";

export type LegalDocument = {
  /** Segment d'URL. Doit correspondre aux liens de `site.footer`. */
  slug: string;
  title: string;
  /** Sert au <title>, à la meta description et au chapô de la page. */
  description: string;
  /** Date de dernière révision, en ISO. Affichée en tête de document. */
  updatedAt: string;
  /** Corps du document, en Markdown. */
  body: string;
};

/** Dernière révision des trois documents. À bouger à chaque modification de fond. */
const UPDATED_AT = "2026-08-16";

const { brand, contact } = site;

/* ---------------------------------------------------------------------------
 * Hébergement — obligatoire dans les mentions légales.
 * Ces valeurs décrivent l'infrastructure décrite dans le README (Vercel pour
 * l'application et les images, Neon pour la base). Vérifie l'adresse exacte de
 * chaque prestataire au moment de la mise en ligne : elle peut changer.
 * ------------------------------------------------------------------------- */
const HOSTS = {
  app: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — [vercel.com](https://vercel.com)",
  database:
    "Neon Inc., 209 Orange Street, Wilmington, DE 19801, États-Unis — [neon.com](https://neon.com)",
} as const;

/* ========================================================== MENTIONS LÉGALES */

const mentionsLegales: LegalDocument = {
  slug: "mentions-legales",
  title: "Mentions légales",
  description: `Identité de l'éditeur du site ${brand.url.replace(/^https?:\/\//, "")}, hébergement, propriété intellectuelle et conditions d'utilisation.`,
  updatedAt: UPDATED_AT,
  body: `
## 1. Éditeur du site

Le présent site est édité par :

- **Dénomination sociale** : ${brand.name}
- **Forme juridique** : SARL
- **Capital social** : 1 000 000 FCFA
- **Siège social** : ${contact.address}, ${brand.country}
- **RCCM** : CI-ABJ-03-2022-B12-04941
- **Compte contribuable** : 2243543Q
- **Téléphone** : ${contact.phone}
- **Adresse électronique** : [${contact.email}](mailto:${contact.email})

## 2. Direction de la publication

Le directeur de la publication est Franck TCHETEHO, en sa qualité de représentant légal de ${brand.name}.

Toute question relative au contenu du site peut lui être adressée à [${contact.email}](mailto:${contact.email}).

## 3. Hébergement

L'application et les fichiers déposés par l'éditeur sont hébergés par :

- **Hébergeur de l'application** : ${HOSTS.app}
- **Hébergeur de la base de données** : ${HOSTS.database}

Ces prestataires opèrent depuis des centres de données situés hors de ${brand.country}. Les conséquences de cette localisation sur les données personnelles sont détaillées dans notre [politique de confidentialité](/confidentialite).

## 4. Propriété intellectuelle

L'ensemble des éléments composant ce site — structure, textes, identité visuelle, chartes graphiques, logos, illustrations, photographies, code source et bases de données — est la propriété exclusive de ${brand.name} ou de ses partenaires, et est protégé par le droit ivoirien et les conventions internationales relatives à la propriété intellectuelle, notamment l'Annexe VII de l'Accord de Bangui.

Toute reproduction, représentation, adaptation, traduction ou exploitation, totale ou partielle, par quelque procédé que ce soit et sur quelque support que ce soit, sans autorisation écrite préalable de ${brand.name}, est interdite et constitue une contrefaçon.

Les marques et logos de nos clients et partenaires reproduits sur ce site le sont avec leur accord et demeurent la propriété de leurs titulaires respectifs. Toute demande de retrait sera traitée sans délai à [${contact.email}](mailto:${contact.email}).

## 5. Liens hypertextes

Ce site peut renvoyer vers des sites tiers. ${brand.name} n'exerce aucun contrôle sur ces ressources et décline toute responsabilité quant à leur contenu, leur disponibilité ou l'usage qui en est fait.

La création d'un lien vers ce site est libre, à condition qu'il ne porte pas atteinte à l'image de ${brand.name} et qu'il ne s'insère pas dans un contexte contraire à l'ordre public ou aux bonnes mœurs.

## 6. Disponibilité et responsabilité

${brand.name} s'efforce d'assurer l'exactitude des informations publiées et la disponibilité du site, sans que cela constitue une obligation de résultat. Le site peut être interrompu à tout moment, notamment pour maintenance.

Les informations présentées à titre indicatif — délais, tarifs, exemples de réalisations — ne constituent pas une offre contractuelle. Seul un devis signé engage les parties, dans les conditions prévues par nos [conditions générales de vente](/cgv).

## 7. Signalement de contenu

Tout contenu qui semblerait illicite, inexact ou attentatoire aux droits d'un tiers peut être signalé à [${contact.email}](mailto:${contact.email}). Merci d'indiquer l'adresse de la page concernée, la nature du problème et vos coordonnées, afin que nous puissions vous répondre.

## 8. Droit applicable

Les présentes mentions légales sont régies par le droit ivoirien. À défaut de résolution amiable, tout litige relatif à l'utilisation du site relève de la compétence des tribunaux d'Abidjan.
`.trim(),
};

/* ================================================= POLITIQUE DE CONFIDENTIALITÉ */

const confidentialite: LegalDocument = {
  slug: "confidentialite",
  title: "Politique de confidentialité",
  description:
    "Ce site public ne dépose aucun cookie et n'utilise aucun outil de mesure d'audience. Voici, en détail, ce que nous traitons et ce que nous ne traitons pas.",
  updatedAt: UPDATED_AT,
  body: `
## En résumé

Ce site est volontairement sobre. À sa consultation :

- **aucun cookie n'est déposé** sur votre navigateur ;
- **aucun outil de mesure d'audience** n'est installé — ni Google Analytics, ni équivalent ;
- **aucun script tiers**, aucun bouton de réseau social, aucune police chargée depuis un serveur extérieur ;
- **un seul formulaire**, celui de contact, et il ne se remplit qu'à votre initiative.

Autrement dit, tant que vous ne nous écrivez pas, nous ne détenons sur vous que ce que tout serveur web enregistre techniquement pour fonctionner.

## 1. Responsable du traitement

Le responsable du traitement est ${brand.name}, dont l'identification complète figure dans les [mentions légales](/mentions-legales).

Pour toute question ou demande relative à vos données : [${contact.email}](mailto:${contact.email}).

## 2. Cadre juridique applicable

Deux régimes se superposent, et nous appliquons le plus protecteur des deux à chaque situation :

- la **loi ivoirienne n°2013-450 du 19 juin 2013** relative à la protection des données à caractère personnel, sous le contrôle de l'**ARTCI** ;
- le **Règlement général sur la protection des données (RGPD)**, qui s'applique à nos traitements dès lors qu'ils concernent des personnes situées dans l'Union européenne — ce qui est le cas d'une partie de notre clientèle.

## 3. Données que nous traitons

### 3.1 Lorsque vous nous écrivez

Si vous nous contactez par le **formulaire du site**, par courriel ou par téléphone, nous traitons les données que vous nous transmettez de vous-même : nom, adresse électronique **ou** numéro de téléphone selon le moyen de rappel que vous choisissez, nature et envergure du projet envisagé, et, le cas échéant, la précision que vous saisissez librement.

Le formulaire ne demande **qu'une seule coordonnée** : celle du canal par lequel vous souhaitez être recontacté. Nous ne collectons pas l'autre.

- **Finalité** : répondre à votre demande, établir un devis, assurer le suivi de la relation commerciale.
- **Base légale** : votre démarche elle-même — mesures précontractuelles prises à votre demande, puis exécution du contrat s'il est conclu (art. 6.1.b du RGPD).
- **Durée de conservation** : trois ans à compter du dernier échange en l'absence de contrat ; pour les clients, la durée de la relation commerciale, prolongée des délais légaux de conservation des documents comptables.

Les messages envoyés par le formulaire sont enregistrés dans notre base de données et consultés depuis notre espace d'administration. Ils ne sont transmis à aucun outil tiers de gestion commerciale.

### 3.2 Protection du formulaire contre les envois automatisés

Pour empêcher qu'un programme n'inonde le formulaire, nous enregistrons auprès de chaque message une **empreinte de votre adresse IP** et non l'adresse elle-même : celle-ci est combinée à une valeur secrète propre à notre installation, puis transformée par une fonction de hachage irréversible.

- **Finalité** : limiter le nombre de messages envoyés depuis une même connexion.
- **Base légale** : notre intérêt légitime à préserver le bon fonctionnement du formulaire (art. 6.1.f du RGPD).
- **Durée de conservation** : celle du message auquel l'empreinte est attachée.

Cette empreinte ne permet ni de retrouver votre adresse, ni de vous suivre d'un site à l'autre. Elle n'est utilisée à aucune autre fin, et notamment pas à des fins statistiques ou commerciales.

### 3.3 Journaux techniques du serveur

Comme tout serveur web, notre hébergeur enregistre automatiquement, à chaque requête, l'adresse IP appelante, la date et l'heure, la page demandée, le type de navigateur et le référent.

- **Finalité** : faire fonctionner le service, diagnostiquer les pannes, détecter les abus.
- **Base légale** : notre intérêt légitime à assurer la sécurité et la disponibilité du site (art. 6.1.f du RGPD).
- **Durée de conservation** : celle pratiquée par notre hébergeur, de l'ordre de quelques semaines. Nous n'exploitons pas ces journaux à des fins statistiques ou commerciales.

### 3.4 Cookie d'administration

Un unique cookie, nommé \`nwc_session\`, est déposé **à la connexion à l'espace d'administration** — donc uniquement pour les membres du studio, jamais pour un visiteur.

Il est strictement nécessaire à l'authentification, ne contient qu'un identifiant de session aléatoire, est \`httpOnly\` (inaccessible au JavaScript) et est supprimé à la déconnexion. À ce titre, il est dispensé de consentement.

Aucun autre cookie n'existe sur ce site — d'où l'absence de bandeau : il n'y aurait rien à vous demander.

### 3.5 Ce que nous ne faisons pas

Nous ne vendons, ne louons ni n'échangeons vos données. Nous ne construisons pas de profils publicitaires. Nous ne pratiquons aucune décision automatisée produisant des effets juridiques à votre égard.

## 4. Destinataires et sous-traitants

Vos données ne sont accessibles qu'aux membres du studio qui en ont besoin, et à nos sous-traitants techniques :

| Sous-traitant | Rôle | Localisation |
| --- | --- | --- |
| Vercel Inc. | Hébergement du site et des images | États-Unis |
| Neon Inc. | Hébergement de la base de données | États-Unis |
| [À REMPLIR — fournisseur de messagerie, ex. Google Workspace] | Courrier électronique | [À REMPLIR] |

Ces prestataires n'agissent que sur nos instructions et sont tenus par contrat à des obligations de confidentialité et de sécurité.

## 5. Transferts hors de Côte d'Ivoire et hors de l'Union européenne

Nos prestataires d'hébergement sont établis aux États-Unis. Les transferts vers ce pays sont encadrés par les **clauses contractuelles types** de la Commission européenne, complétées le cas échéant par les mécanismes prévus par la loi ivoirienne pour les transferts internationaux.

## 6. Sécurité

Les échanges avec le site sont chiffrés en transit (HTTPS). Les mots de passe de l'administration sont stockés sous forme de condensats **scrypt** et jamais en clair. L'accès à l'administration est restreint, journalisé et révocable immédiatement.

Aucun dispositif n'étant infaillible, nous nous engageons, en cas de violation de données susceptible d'engendrer un risque pour vos droits, à notifier l'autorité compétente et, lorsque le risque est élevé, à vous en informer directement.

## 7. Vos droits

Vous disposez d'un droit d'**accès**, de **rectification**, d'**effacement**, de **limitation**, d'**opposition** et de **portabilité** sur vos données, ainsi que du droit de définir des directives relatives à leur sort après votre décès.

Pour les exercer, écrivez à [${contact.email}](mailto:${contact.email}). Nous répondons dans un délai d'un mois. Une pièce justifiant de votre identité pourra vous être demandée en cas de doute raisonnable.

Si notre réponse ne vous satisfait pas, vous pouvez saisir :

- l'**ARTCI** — Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire, [artci.ci](https://www.artci.ci) ;
- si vous résidez dans l'Union européenne, l'autorité de contrôle de votre pays — en France, la **CNIL**, [cnil.fr](https://www.cnil.fr).

## 8. Modifications

Cette politique peut être mise à jour pour refléter une évolution du site ou de la réglementation. La date de dernière révision figure en tête de page. Toute modification substantielle sera signalée sur cette page.
`.trim(),
};

/* ===================================================================== CGV */

const cgv: LegalDocument = {
  slug: "cgv",
  title: "Conditions générales de vente",
  description: `Conditions applicables aux prestations de conception, de développement et d'accompagnement fournies par ${brand.name}.`,
  updatedAt: UPDATED_AT,
  body: `
## 1. Objet et champ d'application

Les présentes conditions générales de vente (les « CGV ») régissent les prestations de conception graphique, de conception et de développement de sites et d'applications, ainsi que les prestations d'accompagnement fournies par ${brand.name} (le « Prestataire ») à ses clients professionnels et particuliers (le « Client »).

Toute commande implique l'acceptation sans réserve des présentes CGV, qui prévalent sur les conditions d'achat du Client, sauf accord écrit contraire. Le fait que le Prestataire ne se prévale pas d'une clause ne vaut pas renonciation à celle-ci.

## 2. Devis et formation du contrat

Chaque prestation fait l'objet d'un devis détaillé, précisant le périmètre, les livrables, le calendrier et le prix. Le devis est valable **30 jours** à compter de sa date d'émission.

Le contrat est formé à la réception par le Prestataire du devis daté, signé et accompagné de la mention « bon pour accord », ainsi que de l'acompte prévu à l'article 4.

Toute demande sortant du périmètre décrit au devis fait l'objet d'un avenant chiffré. Aucun travail hors périmètre n'est engagé sans accord écrit préalable.

## 3. Prix

Les prix sont exprimés en **francs CFA (XOF)**, ou en euros lorsque le devis le prévoit expressément. Ils s'entendent hors taxes ; la TVA et toute autre taxe applicable s'ajoutent au taux en vigueur au jour de la facturation.

Les frais de tiers nécessaires au projet — nom de domaine, hébergement, licences de polices ou d'images, services externes — sont refacturés au Client au coût réel, ou réglés directement par lui, selon ce que prévoit le devis.

## 4. Modalités de paiement

Sauf stipulation contraire du devis, le règlement s'effectue selon l'échéancier suivant :

- **50%** à la commande, à titre d'acompte ;
- **50%** (le solde) à la livraison, avant mise en ligne.

Les paiements se font par **virement bancaire, chèque ou Mobile Money**.

## 5. Obligations du Client

La qualité et le respect du calendrier dépendent directement de la collaboration du Client. Celui-ci s'engage à :

- désigner un interlocuteur unique, habilité à valider les étapes du projet ;
- fournir en temps utile les contenus nécessaires — textes, images, logos, accès techniques — dans les formats convenus ;
- répondre aux demandes de validation dans un délai de **3 jours ouvrés** ;
- garantir qu'il détient les droits sur les éléments qu'il transmet.

Le Client garantit le Prestataire contre toute réclamation d'un tiers relative aux contenus qu'il a fournis.

## 6. Délais

Les délais indiqués au devis courent à compter de la formation du contrat et de la réception de l'ensemble des éléments attendus du Client. Ils sont donnés à titre indicatif et sont automatiquement prolongés de la durée de tout retard imputable au Client ou à un tiers.

Un retard raisonnable ne peut donner lieu ni à annulation de la commande, ni à indemnité.

## 7. Livraison et recette

À l'achèvement des travaux, le Prestataire met les livrables à disposition du Client pour recette.

Le Client dispose de **10 jours ouvrés** pour notifier par écrit les non-conformités constatées au regard du devis. Passé ce délai, ou en cas de mise en exploitation des livrables par le Client, la recette est réputée acquise sans réserve.

Les corrections de non-conformités sont réalisées sans frais. Les demandes d'évolution formulées à ce stade relèvent de l'article 2.

## 8. Propriété intellectuelle

Le Prestataire conserve la propriété pleine et entière des livrables **jusqu'au paiement intégral du prix**.

Au complet paiement, le Prestataire cède au Client, pour la durée légale de protection et pour le monde entier, les droits de reproduction, de représentation et d'adaptation portant sur les créations spécifiquement réalisées pour lui, aux fins d'exploitation décrites au devis.

Sont exclus de cette cession, et demeurent la propriété du Prestataire :

- les méthodes, savoir-faire, briques logicielles et composants réutilisables préexistants, pour lesquels le Client reçoit une licence d'utilisation non exclusive, cessible avec le projet ;
- les propositions et pistes créatives non retenues ;
- les éléments de tiers — polices, photographies, bibliothèques — soumis à leurs propres licences, dont le Client fait son affaire de respecter les termes.

Sauf refus écrit du Client, le Prestataire peut citer son nom, reproduire les créations réalisées et décrire la mission dans ses références commerciales et son portfolio.

## 9. Hébergement, maintenance et garantie

La livraison n'emporte ni hébergement, ni maintenance, ni infogérance, sauf prestation distincte prévue au devis ou contrat de maintenance séparé.

Le Prestataire garantit la correction, pendant **2 mois** à compter de la recette, des dysfonctionnements imputables à son travail. Sont exclus de cette garantie : les modifications apportées par le Client ou par un tiers, les défaillances des services externes, les évolutions des navigateurs et des systèmes intervenues après la livraison, et tout usage non conforme.

## 10. Droit de rétractation

Le Client consommateur, au sens de la réglementation applicable à la protection du consommateur, dispose d'un délai de rétractation de **quatorze (14) jours** pour les contrats conclus à distance.

Lorsque l'exécution des prestations commence, à sa demande expresse, avant l'expiration de ce délai, le Client reconnaît que son droit de rétractation s'éteint une fois la prestation pleinement exécutée, et qu'en cas de rétractation avant achèvement, il reste redevable du prix correspondant aux travaux déjà réalisés.

Ce droit ne s'applique pas aux clients professionnels agissant dans le cadre de leur activité.

## 11. Résiliation

Chaque partie peut résilier le contrat en cas de manquement grave de l'autre, non réparé dans les trente (30) jours suivant une mise en demeure écrite restée sans effet.

En cas de résiliation ou d'abandon du projet par le Client, les sommes versées restent acquises au Prestataire, et les travaux réalisés jusqu'à la date de résiliation lui sont dus au prorata de leur avancement.

## 12. Responsabilité

Le Prestataire est tenu d'une obligation de moyens dans l'exécution de ses prestations.

Sa responsabilité ne peut être engagée qu'en cas de faute prouvée, et est limitée aux dommages directs, dans la limite du montant hors taxes effectivement perçu au titre de la prestation en cause. Sont notamment exclus les pertes d'exploitation, pertes de chiffre d'affaires, pertes de données et préjudices d'image.

Le Prestataire ne saurait être tenu responsable des interruptions, défaillances ou failles de sécurité imputables aux services de tiers, ni des conséquences d'une modification apportée aux livrables sans son intervention.

## 13. Force majeure

Aucune des parties ne peut être tenue responsable d'un manquement causé par un événement de force majeure, entendu comme un événement échappant à son contrôle raisonnable et rendant l'exécution impossible.

Si l'événement se prolonge au-delà de soixante (60) jours, chaque partie peut résilier le contrat par lettre recommandée, sans indemnité, le décompte des travaux réalisés s'opérant selon l'article 11.

## 14. Confidentialité

Chaque partie s'engage à préserver la confidentialité des informations non publiques dont elle a connaissance à l'occasion du contrat, pendant toute sa durée et deux ans après son terme.

Le traitement des données à caractère personnel est décrit dans notre [politique de confidentialité](/confidentialite). Lorsque le Prestataire traite des données pour le compte du Client, un accord de sous-traitance conforme à la réglementation applicable est conclu entre les parties.

## 15. Droit applicable et règlement des litiges

Les présentes CGV sont soumises au **droit ivoirien**.

En cas de différend, les parties s'engagent à rechercher une solution amiable avant toute action contentieuse. À défaut d'accord dans un délai de trente (30) jours suivant la première notification écrite, le litige relève de la compétence exclusive des **tribunaux d'Abidjan**, y compris en cas de pluralité de défendeurs ou d'appel en garantie.

## 16. Contact

Toute question relative aux présentes conditions peut être adressée à [${contact.email}](mailto:${contact.email}) ou au ${contact.phone}.
`.trim(),
};

/** Les trois documents, indexés par slug — l'ordre est celui du pied de page. */
export const legalDocuments = [mentionsLegales, confidentialite, cgv] as const;

export function getLegalDocument(slug: string): LegalDocument | undefined {
  return legalDocuments.find((document) => document.slug === slug);
}
