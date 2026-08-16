# New Wave Conception — site vitrine

Site de l'agence, inspiré du modèle [agero.framer.website](https://agero.framer.website/) :
mise en page claire, grand titre d'affichage, accent rouge framboise.

Stack : **Next.js 16** (App Router) · **TypeScript** · **Tailwind CSS 4** ·
**Prisma 7 / Postgres** pour l'administration.

## Démarrer

```bash
npm run dev     # http://localhost:3000
npm run build   # build de production
npm start       # sert le build
npm run lint
```

Node 20+ requis (développé avec Node 24).

Le site public fonctionne **sans base de données** : tant que `DATABASE_URL`
n'est pas définie, il affiche les contenus statiques de `content/site.ts`.
L'administration, elle, a besoin de la base.

## Brancher la base de données

1. Crée une base Postgres sur [neon.com](https://neon.com) (offre gratuite),
   copie la *connection string*.
2. `cp .env.example .env`, puis renseigne `DATABASE_URL`, `ADMIN_EMAIL` et
   `ADMIN_PASSWORD` (10 caractères minimum).
3. Crée les tables et importe les contenus existants :

```bash
npm run db:migrate -- --name init   # première fois seulement
npm run db:seed                     # crée le compte admin + importe content/site.ts
npm run dev
```

L'administration est ensuite sur **`/admin`**.

Le seed est ré-exécutable sans risque : il ignore les collections déjà
remplies et ne recrée pas un compte existant. Les contenus importés qui
contiennent encore des `[À REMPLIR]` arrivent **en brouillon** — ils
n'apparaissent pas sur le site tant que tu ne les publies pas.

Autres commandes : `npm run db:deploy` (migrations en production),
`npm run db:studio` (explorateur de base).

### Envoi d'images

L'envoi de fichiers fonctionne sans rien configurer. La destination dépend de
l'environnement :

| Situation | Destination | URL enregistrée |
| --- | --- | --- |
| `BLOB_READ_WRITE_TOKEN` défini | Vercel Blob | `https://…blob.vercel-storage.com/…` |
| Sinon, en local ou sur un serveur classique | `public/uploads/` | `/uploads/mon-image-a1b2c3d4.png` |
| Sinon, sur Vercel | *indisponible* | — un message explique quoi faire |

Le stockage local suffit en développement et sur un VPS. **Sur Vercel, le jeton
est obligatoire** : le disque y est en lecture seule et les fichiers écrits
après le build ne sont pas servis. Vercel → ton projet → Storage → Blob → créer
un store, puis copier le jeton dans les variables d'environnement.

Chaque fichier reçoit un suffixe aléatoire : deux images du même nom ne
s'écrasent jamais.

Formats acceptés : JPG, PNG, WebP, AVIF et SVG.

**Sur Vercel, le fichier part directement du navigateur vers Blob** — limite
8 Mo. C'est indispensable : la plateforme plafonne à 4,5 Mo le corps d'une
requête vers une fonction serverless, quelle que soit la configuration de Next.
Une photo un peu lourde postée au serveur est rejetée par un `413` avant
d'atteindre le code. La route `/api/blob-upload` délivre le jeton d'envoi, et
seulement à un administrateur connecté.

**En local et sur un serveur classique**, le fichier accompagne le formulaire
et le serveur l'écrit sur disque — limite 4 Mo, alignée sur
`serverActions.bodySizeLimit` dans `next.config.ts`. Si tu relèves l'une,
relève l'autre.

## L'administration

Cinq rubriques de contenu, toutes sur le même fonctionnement — lister, créer,
modifier, publier/dépublier, supprimer :

| Rubrique | Ce qu'elle alimente |
| --- | --- |
| Services | La grille de services de l'accueil |
| Réalisations | Le carrousel de projets clients |
| Projets maison | Vos SaaS et plateformes |
| Actualités & blog | `/blog` et les 3 dernières nouvelles sur l'accueil |
| Témoignages | Le carrousel de citations |

Plus **[Messages](#le-formulaire-de-contact)**, qui ne s'alimente pas depuis
l'admin mais depuis le site, et une page **Paramètres** en trois onglets,
décrits ci-dessous : mode maintenance, images du titre d'accueil, et **CMS** —
les visuels des blocs de la page d'accueil.

Points communs à tous les contenus :

- **Ordre d'affichage** — un nombre ; les plus petits passent devant.
- **Publié** — décoché, le contenu reste invisible sur le site public.
- **Slug** — rempli automatiquement à partir du titre, modifiable.

Actualités et articles de fond partagent une seule liste, séparés par leur
catégorie. La page `/blog` propose un filtre entre les deux.

Le contenu des articles s'écrit en **Markdown** (`## titre`, `**gras**`,
`- liste`, `[lien](url)`), rendu en HTML côté serveur.

Toute publication rafraîchit immédiatement les pages publiques concernées.

### Le formulaire de contact

La section `#contact`, en bas de la page d'accueil, porte un vrai formulaire.
Les demandes arrivent dans **`/admin/messages`** — une pastille dans le menu
compte les non-lues.

**Rien ne part par e-mail.** C'est délibéré : envoyer du courrier depuis le
site demanderait un service tiers et une clé d'API, donc une configuration de
plus à maintenir et à surveiller. Le jour où l'attente d'une notification se
fait sentir, c'est l'ajout à faire — jusque-là, la boîte de réception de
l'administration suffit et ne peut pas tomber en panne toute seule.

Un message se lit, se range (*Archiver*) ou se supprime. L'ouvrir le marque lu.
Le bouton **Répondre par e-mail** ouvre votre logiciel de courrier avec le
destinataire, l'objet et la salutation déjà remplis : la réponse part de la
vraie boîte du studio, pas du site.

Les champs proposés (*type de projet*, *budget*) se règlent dans
`contact.form` de `content/site.ts`. Ces listes servent **aussi à la
validation** : une valeur hors liste est refusée. Les réponses sont
enregistrées telles quelles, donc modifier les listes plus tard ne réécrit pas
les messages déjà reçus.

**Sans base de données**, le formulaire laisse place aux coordonnées directes —
les messages n'auraient nulle part où atterrir.

#### Ce qui filtre les robots

Trois défenses, aucune ne demandant de clé d'API ni de service extérieur — le
formulaire marche dès l'installation :

| Filtre | Ce qu'il attrape |
| --- | --- |
| Champ leurre, invisible à l'écran | Les robots qui remplissent tout le formulaire |
| Délai minimal de 3 s entre affichage et envoi | Ceux qui exécutent du JavaScript mais vont trop vite |
| Quota de 3 messages par heure et 8 par jour | Le reste, y compris les envois en rafale |

Un envoi rejeté par un piège reçoit la **même confirmation** qu'un envoi
réussi : signaler l'échec ne ferait qu'aider à contourner le piège.

Le quota s'appuie sur une **empreinte salée de l'adresse IP** — l'adresse
elle-même n'est jamais enregistrée. Le sel est tiré au sort à la première
réception et conservé en base (`SiteSettings.contactSalt`) : sans lui,
l'empreinte d'une IPv4 se remonterait par force brute en quelques minutes.

Le délai n'est vérifié que si le navigateur a posé l'horodatage. Sans
JavaScript il est absent, et le test ne s'applique pas : refuser dans ce cas
écarterait des visiteurs légitimes, alors que le quota, lui, rattrape les
robots qui en profiteraient. Le formulaire fonctionne donc **sans JavaScript**,
c'est une Server Action posée sur `action`.

### Le carrousel de réalisations

Les projets clients ne s'empilent pas en liste : ils défilent **un par un, en
grand**, sur fond sombre et pleine largeur — un projet se regarde, il ne se
parcourt pas.

Chaque fiche affiche le visuel en portrait au centre, le nom et le résumé à
gauche, et à droite l'**année**, le **rôle** (champ *Rôle* de la fiche) et les
**prestations** (une par ligne ; vide, la colonne disparaît).

Le visuel du projet sert deux fois : net au centre, et agrandi/flouté en fond.
Le décor change donc avec la fiche sans qu'aucune couleur soit à saisir dans
l'administration. Sans visuel, un dégradé prend exactement la même place.

La piste est une zone à défilement horizontal avec accroche : elle fonctionne
**au doigt, au trackpad et au clavier sans JavaScript**. Les flèches et les
pastilles sont un confort ajouté à l'hydratation — sans elles, on fait défiler
à la main et rien n'est perdu.

### Images du titre d'accueil

Trois vignettes rondes s'insèrent entre les mots du grand titre, à la manière
de la référence. Elles s'envoient depuis `/admin/parametres`.

Les **emplacements** sont déclarés dans `content/site.ts` (`imageSlot: 1 | 2 | 3`
sur un fragment du titre) ; les **images** vivent en base et se gèrent depuis
l'administration. Sans image, une pastille neutre occupe exactement la même
place : la mise en page ne bouge pas au moment de la remplacer.

Format conseillé : carré, 400 × 400 px minimum, sujet centré — l'image est
recadrée en cercle. Sa taille est exprimée en `em`, elle suit donc l'échelle du
titre à tous les points de rupture.

### CMS — les visuels des blocs

Le troisième onglet des paramètres gère les photos des blocs de l'accueil :

| Visuel | Bloc alimenté | Format conseillé |
| --- | --- | --- |
| Fond de la carte de présentation | La grande carte sombre, avant les services | Paysage large, 2000 × 900 px |
| Photo de la section « Le studio » | Le portrait à côté du texte de présentation | Portrait, 1000 × 1250 px |

Même principe que les vignettes du titre : **la mise en page vit dans le code,
les images en base**. Aucun chemin d'image ne se saisit dans `content/site.ts`.

Chaque bloc fonctionne sans image — un dégradé occupe alors exactement la même
place, donc rien ne bouge au moment d'en ajouter une. Vider le champ remet le
dégradé.

Pour brancher un visuel de plus : une colonne dans `SiteSettings`, une entrée
dans `settingsSchema` et `SETTINGS_IMAGE_FIELDS` (`lib/schemas.ts`), une ligne
dans `BLOCK_IMAGES` (`SettingsForm.tsx`), et le composant reçoit son image en
prop depuis `app/(site)/page.tsx`.

### Mode maintenance

`/admin/parametres` ferme le site au public : les visiteurs voient une page
d'attente à la place de l'accueil et du blog. Le titre, le message, une date
d'ouverture facultative et l'affichage des coordonnées se règlent depuis la
même page.

Trois garde-fous :

- **Vous continuez de voir le vrai site** tant que vous êtes connecté à
  l'administration, avec un bandeau qui rappelle que le site est fermé — sans
  quoi on oublie vite que les visiteurs, eux, voient une porte close.
- **L'administration reste accessible** en permanence.
- **Le site fermé n'est pas indexable** : `robots: noindex, nofollow` est posé
  automatiquement sur toutes les pages publiques.

Le mode est vérifié *avant* toute lecture de cookie : tant qu'il est inactif,
la session n'est jamais consultée et les pages publiques restent prégénérées.

Une réserve à connaître : la page d'attente répond en **HTTP 200**, pas 503.
Next 16 ne permet pas de choisir le code d'état depuis un layout, et le
middleware — qui le pourrait — tourne sur Edge, sans accès à la base. Le
`noindex` couvre le besoin courant ; si le 503 devient nécessaire (fermeture
longue sur un site déjà référencé), il faudra sortir le drapeau de la base
vers une variable d'environnement lisible par le middleware.

### Sécurité

- Mot de passe haché avec **scrypt** (fourni par Node), comparé à temps constant.
- Session stockée **en base**, cookie `httpOnly` — se déconnecter révoque
  réellement l'accès, ce qu'un simple cookie signé ne permet pas.
- Le middleware bloque `/admin` sans cookie ; la session est *réellement*
  validée dans `app/admin/(protege)/layout.tsx` (le middleware tourne sur Edge,
  où Prisma n'est pas disponible).
- `/admin` est exclu de l'indexation par les moteurs de recherche.

## Pages légales

Les trois documents référencés dans le pied de page — `/mentions-legales`,
`/confidentialite` et `/cgv` — vivent dans
[`content/legal.ts`](content/legal.ts), en Markdown, et se rendent côté serveur
comme les articles du blog. Les coordonnées sont lues depuis `content/site.ts` :
un changement d'adresse ou d'e-mail se propage tout seul.

**Le cadre retenu est celui d'une société de droit ivoirien** établie à Abidjan
et démarchant aussi des clients en France. Deux régimes se superposent donc, et
les textes le disent : la loi ivoirienne n°2013-450 sous le contrôle de l'ARTCI,
et le RGPD, applicable par extraterritorialité dès lors que le studio propose
ses services à des personnes situées dans l'Union.

⚠️ **Ces pages ne sont pas publiables en l'état.** Elles contiennent des
`[À REMPLIR]` qui, ici, ne sont pas des imperfections : une mention légale
incomplète est une infraction. Il manque notamment la forme juridique, le
capital, le RCCM, le compte contribuable, le directeur de la publication, et
les échéances de paiement des CGV.

```bash
grep -rn "À REMPLIR" content/legal.ts
```

Une fois complétées, **fais-les relire par un juriste**. Ce sont des documents
qui engagent la société ; le travail fourni ici est une base sérieuse et
documentée, pas un avis juridique.

Deux choix à connaître :

- **Elles échappent au mode maintenance.** Les routes sont dans `app/(legal)/`,
  hors du groupe `(site)`. Un client qui suit le lien vers les CGV depuis un
  devis, ou un visiteur qui cherche à identifier l'éditeur, ne doit pas tomber
  sur la page d'attente. Elles ne lisent rien en base, donc rien ne justifiait
  de les fermer avec le reste du site — et elles restent prégénérées en
  statique.
- **Elles sont en `noindex, follow`.** Accessibles et citables, mais absentes
  des résultats de recherche, où elles ne feraient que diluer le site.

Pour ajouter un quatrième document, ajoute-le à `legalDocuments` dans
`content/legal.ts`, crée `app/(legal)/<slug>/page.tsx` sur le modèle des trois
autres, et référence-le dans `site.footer`.

## Modifier les textes

Le contenu se répartit en trois endroits :

- **L'administration `/admin`** gère les contenus qui bougent : services,
  réalisations, projets maison, actualités, blog, témoignages.
- **[`content/site.ts`](content/site.ts)** garde les textes fixes : hero, titres
  de section, méthode, FAQ, coordonnées, logos partenaires.
- **[`content/legal.ts`](content/legal.ts)** porte les trois pages légales.

Aucun texte n'est écrit en dur dans les composants.

Les informations que toi seul connais sont marquées `[À REMPLIR]`. Pour lister
ce qui reste à compléter :

```bash
grep -rn "À REMPLIR" content/
```

Il en reste dans : le badge de disponibilité, la présentation du studio, deux
réponses de la FAQ, les coordonnées, et les trois pages légales. Les
réalisations, projets maison et témoignages se remplissent désormais depuis
l'administration.

## Ajouter des images

Le site fonctionne sans aucune image : les projets et le portrait affichent des
visuels dégradés en attendant. Pour mettre les vraies :

**Presque toutes les images se déposent depuis l'administration** — réalisations
et projets maison depuis leur fiche, visuels des blocs d'accueil depuis
[Paramètres → CMS](#cms--les-visuels-des-blocs). Rien à écrire dans le code.

Reste `content/site.ts` pour les seuls visuels figés du dépôt :

1. Dépose le fichier dans `public/` (ex. `public/partners/mon-client.png`).
2. Renseigne le chemin dans `trustedBy.logos`.

### Le bandeau de présentation

La grande carte sombre placée juste avant les services vit dans
[`components/AboutBanner.tsx`](components/AboutBanner.tsx), son texte et ses
chiffres dans `aboutBanner` (`content/site.ts`).

À distinguer de la section `about` (`#studio`) plus bas : le bandeau pose
l'ambition en deux phrases, la section raconte le studio en détail.

**La photo de fond est facultative** et se dépose depuis
[Paramètres → CMS](#cms--les-visuels-des-blocs). Sans elle, la carte reste
sombre et lisible — le dégradé occupe exactement la même place, donc la mise en
page ne bouge pas au moment de la remplacer.

Les chiffres de la carte flottante défilent horizontalement, **sans une ligne
de JavaScript** : une zone à défilement avec accroche, et un curseur de
pastilles piloté par le défilement lui-même (`.stat-carousel` dans
`app/globals.css`). Ajoute ou retire une entrée de `aboutBanner.stats`, les
pastilles suivent.

Sur les navigateurs sans *scroll-driven animations* (Firefox), le curseur reste
sur la première pastille — l'état initial du carrousel, donc un affichage juste
— et le défilement fonctionne normalement.

### Logos partenaires

Les 8 logos clients sont dans `public/partners/` et listés dans
`trustedBy.logos` (l'ordre du tableau est l'ordre d'affichage du bandeau). Pour
en ajouter un : dépose le fichier, ajoute une entrée avec ses dimensions
réelles. Fond transparent recommandé, 800 px de large suffisent — le bandeau les
normalise à hauteur égale.

## Changer les couleurs et la typographie

Tout est centralisé dans le bloc `@theme` de [`app/globals.css`](app/globals.css) :

| Token             | Valeur    | Usage                        |
| ----------------- | --------- | ---------------------------- |
| `--color-accent`  | `#e82050` | Rouge framboise de la marque  |
| `--color-ink`     | `#101114` | Texte principal, fonds noirs |
| `--color-muted`   | `#5c6169` | Texte secondaire             |
| `--color-surface` | `#f5f7fa` | Fonds de section clairs      |
| `--color-line`    | `#e3e7ec` | Bordures                     |

Change une seule ligne et la couleur se propage à tout le site.

Polices : **Cal Sans** pour les titres, **Inter** pour le texte, chargées via
`next/font` dans [`app/layout.tsx`](app/layout.tsx). Elles sont
auto-hébergées — aucun appel à Google Fonts depuis le navigateur.

## Structure

```
app/
  layout.tsx           polices, métadonnées SEO
  globals.css          design system (couleurs, typo, animations, corps d'article)
  (site)/
    layout.tsx         portail public — applique le mode maintenance
    page.tsx           accueil — charge les contenus et assemble les sections
    blog/              liste et pages d'articles
  (legal)/             mentions légales, confidentialité, CGV
  admin/
    actions.ts         toutes les Server Actions (CRUD + connexion)
    connexion/         page de connexion
    (protege)/         tout le reste de l'admin, derrière l'authentification
      fields.ts        description des formulaires de chaque collection
components/
  ui.tsx               boutons, en-têtes de section, icônes
  Reveal.tsx           apparition au défilement
  AboutBanner.tsx      grande carte sombre de présentation, avant les services
  LegalPage.tsx        gabarit commun aux trois pages légales
  admin/               coquille, formulaire générique, actions de ligne
  Nav.tsx  Hero.tsx  TrustedBy.tsx  Services.tsx  Works.tsx
  Testimonials.tsx  About.tsx  Process.tsx  Products.tsx
  LatestArticles.tsx  Faq.tsx  Cta.tsx  Footer.tsx
content/
  site.ts              textes fixes du site
  legal.ts             mentions légales, confidentialité, CGV (Markdown)
lib/
  db.ts                client Prisma
  content.ts           lecture des contenus (base, ou repli statique)
  auth.ts              mots de passe et sessions
  schemas.ts           validation zod
  upload.ts            envoi d'images
prisma/
  schema.prisma        modèle de données
  seed.ts              compte admin + import initial
```

Pour retirer ou réordonner une section, il suffit d'éditer
[`app/page.tsx`](app/page.tsx).

## Choix techniques

**Les animations sont en CSS pur, sans JavaScript.** Les apparitions au
défilement utilisent les *scroll-driven animations*
(`animation-timeline: view()`). Conséquence : le contenu est présent et visible
dans le HTML servi — bon pour le référencement, et la page reste lisible même si
le JS ne se charge pas. Sur les navigateurs qui ne gèrent pas encore ces
animations (Firefox), le contenu s'affiche simplement sans effet.

**Le rendu est côté serveur par défaut.** Seuls cinq composants sont
interactifs (`"use client"`) : la navigation (menu mobile), la FAQ (accordéon),
et trois briques de l'admin (formulaire, actions de ligne, connexion). Les
écritures passent par des **Server Actions**, sans routes d'API à maintenir.

Le réglage système « réduire les animations » est respecté partout.

### Images distantes et réseaux NAT64

L'optimiseur d'images de Next refuse les hôtes qui résolvent vers une adresse
privée, par protection anti-SSRF. Sur un réseau **NAT64** — fréquent chez
certains opérateurs et sur les réseaux IPv6 seuls — un hôte pourtant public
comme `…blob.vercel-storage.com` résout en IPv6 mappé `64:ff9b::/96`, que ce
contrôle prend pour une adresse privée. Les images distantes renvoient alors
`400 "url" parameter is not allowed`, alors que la configuration est correcte.

Le cas ne se produit pas sur Vercel. En local, sur une machine concernée :

```bash
ALLOW_LOCAL_IP_IMAGES="true"   # dans .env
```

La protection reste active par défaut, donc en production.

## Mise en ligne sur Vercel

### 1. Importer le projet

Pousse le dépôt sur GitHub, puis importe-le sur
[vercel.com/new](https://vercel.com/new). Le dépôt a sa racine dans `nwc-site`,
donc **Root Directory** reste `./`.

### 2. Réglages de build

| Réglage | Valeur |
| --- | --- |
| Framework Preset | Next.js (détecté) |
| Build Command | *laisser par défaut* |
| Install Command | *laisser par défaut* |
| Node.js Version | 20.x ou plus |

Rien à surcharger : Vercel exécute `next build`, et `postinstall` régénère le
client Prisma.

**Les migrations ne tournent pas pendant le build**, et c'est délibéré. Prisma
pose un verrou consultatif de session au début d'une migration ; à travers un
pooler, la connexion est rendue au pool en conservant ce verrou, qui devient
orphelin — la migration suivante expire alors sur `P1002`, et le déploiement
échoue sans raison apparente.

Après une modification du schéma, applique donc la migration depuis ta machine,
**avant** de pousser :

```bash
npm run db:deploy
```

### 3. Variables d'environnement

| Variable | Obligatoire | Valeur |
| --- | --- | --- |
| `DATABASE_URL` | oui | Connection string Neon, endpoint **poolé** (`-pooler` dans l'hôte) |
| `DIRECT_DATABASE_URL` | non | Inutile sur Vercel depuis que les migrations n'y tournent plus. À garder dans ton `.env` local, où elle sert à `db:deploy` et `db:migrate`. |
| `BLOB_READ_WRITE_TOKEN` | oui | Ajoutée automatiquement en connectant un store Blob au projet |
| `ADMIN_EMAIL` | une fois | Sert au premier `db:seed`, retirable ensuite |
| `ADMIN_PASSWORD` | une fois | Idem, 10 caractères minimum |

> **Les deux variables prennent la chaîne de connexion ENTIÈRE**, pas seulement
> le nom d'hôte :
> `postgresql://utilisateur:motdepasse@hote/base?sslmode=require`.
> Seul l'hôte diffère entre les deux (`-pooler` ou non).
>
> **Et sans guillemets.** Dans un fichier `.env` on écrit
> `DATABASE_URL="postgresql://…"` ; dans l'interface de Vercel, on saisit
> uniquement `postgresql://…`.
>
> Une valeur mal formée est signalée dans les journaux de build et ignorée : le
> déploiement se poursuit tant qu'au moins une des deux est exploitable.

Pour obtenir les valeurs exactes, prêtes à coller :

```bash
npm run env:print
```

Le script lit ton `.env` local et n'envoie rien nulle part.

Les deux URL Neon ne sont pas un détail : le pooler encaisse les connexions
éphémères du runtime serverless, mais ne gère pas les verrous de session dont
Prisma a besoin pour migrer. `prisma.config.ts` utilise `DIRECT_DATABASE_URL`
quand elle existe, et retombe sur `DATABASE_URL` sinon — d'où une seule
variable suffisante en local.

### 4. Stockage des images

Vercel → ton projet → **Storage** → **Blob** → *Create store*, en choisissant
**l'accès public**.

**Créer le store ne suffit pas : il faut le connecter au projet.** Le jeton
`BLOB_READ_WRITE_TOKEN` n'est injecté qu'à ce moment-là. Sans lui, l'admin
refuse les envois de fichiers avec un message explicite — le site continue de
fonctionner normalement, mais on ne peut plus déposer d'image.

À défaut, ajoute la variable à la main : `npm run env:print` affiche la valeur.

Vercel nomme la variable d'après le préfixe choisi pour le store :
`BLOB_READ_WRITE_TOKEN` par défaut, `BLOB_<PREFIXE>_READ_WRITE_TOKEN` si tu en
as donné un. **Les deux formes sont reconnues**, inutile de renommer quoi que
ce soit. Les guillemets résiduels autour de la valeur sont retirés aussi.

Le mode d'accès se choisit à la création et ne se change pas ensuite. Un store
privé renverrait une erreur 403 à chaque visiteur : ses fichiers ne sont
lisibles que via des URL signées, qui expirent — incompatible avec un site
public dont les pages sont mises en cache.

Si des images ont déjà été envoyées en stockage local, transfère-les :

```bash
npm run images:migrate -- --dry-run   # aperçu, n'écrit rien
npm run images:migrate                # transfère et met à jour la base
```

Le script est ré-exécutable sans risque : il ignore les images déjà distantes,
signale les fichiers introuvables sans casser le lien en base, et conserve les
originaux dans `public/uploads/`.

### Migration bloquée : `P1002`

Prisma prend un verrou consultatif au démarrage d'une migration. Deux
situations le laissent orphelin, et toute migration suivante expire alors sur
`P1002` bien que la base réponde normalement :

- le processus est interrompu avant de relâcher le verrou ;
- la migration passe par un **pooler**, qui rend la connexion au pool sans
  libérer le verrou de session. D'où la règle : migrer par la connexion
  directe, jamais par l'endpoint `-pooler`.

Pour libérer, via la connexion directe :

```sql
select a.pid from pg_locks l join pg_stat_activity a on a.pid = l.pid
where l.locktype = 'advisory' and a.state = 'idle';
-- puis, pour chaque pid trouvé :
select pg_terminate_backend(<pid>);
```

### 5. Premier déploiement

Après le premier build, crée le compte d'administration une seule fois, depuis
ta machine, avec le `DATABASE_URL` de production :

```bash
npm run db:seed
```

Avant de publier, pense à :

- remplacer tous les `[À REMPLIR]` restants ;
- déclarer `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` et
  `BLOB_READ_WRITE_TOKEN` dans les variables d'environnement Vercel, puis
  lancer `npm run db:deploy` et `npm run db:seed` une fois ;
- compléter les `[À REMPLIR]` des [pages légales](#pages-légales) — RCCM,
  forme juridique, capital, directeur de la publication, échéances de paiement
  — et les faire relire par un juriste.
