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

Limite : **4 Mo par image**, formats JPG, PNG, WebP, AVIF et SVG. Cette limite
va de pair avec `serverActions.bodySizeLimit` dans `next.config.ts` — les
Server Actions plafonnent le corps des requêtes à 1 Mo par défaut, ce qui
rejetterait la plupart des photos. Si tu relèves l'une, relève l'autre.

## L'administration

Cinq rubriques, toutes sur le même fonctionnement — lister, créer, modifier,
publier/dépublier, supprimer :

| Rubrique | Ce qu'elle alimente |
| --- | --- |
| Services | La grille de services de l'accueil |
| Réalisations | Les projets clients |
| Projets maison | Vos SaaS et plateformes |
| Actualités & blog | `/blog` et les 3 dernières nouvelles sur l'accueil |
| Témoignages | Le carrousel de citations |

Plus une page **Paramètres**, décrite ci-dessous : mode maintenance et images
du titre d'accueil.

Points communs à tous les contenus :

- **Ordre d'affichage** — un nombre ; les plus petits passent devant.
- **Publié** — décoché, le contenu reste invisible sur le site public.
- **Slug** — rempli automatiquement à partir du titre, modifiable.

Actualités et articles de fond partagent une seule liste, séparés par leur
catégorie. La page `/blog` propose un filtre entre les deux.

Le contenu des articles s'écrit en **Markdown** (`## titre`, `**gras**`,
`- liste`, `[lien](url)`), rendu en HTML côté serveur.

Toute publication rafraîchit immédiatement les pages publiques concernées.

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

## Modifier les textes

Le contenu se répartit en deux endroits :

- **L'administration `/admin`** gère les contenus qui bougent : services,
  réalisations, projets maison, actualités, blog, témoignages.
- **[`content/site.ts`](content/site.ts)** garde les textes fixes : hero, titres
  de section, méthode, FAQ, coordonnées, logos partenaires.

Aucun texte n'est écrit en dur dans les composants.

Les informations que toi seul connais sont marquées `[À REMPLIR]`. Pour lister
ce qui reste à compléter :

```bash
grep -rn "À REMPLIR" content/
```

Il en reste dans : le badge de disponibilité, la présentation du studio, deux
réponses de la FAQ, et les coordonnées. Les réalisations, projets maison et
témoignages se remplissent désormais depuis l'administration.

## Ajouter des images

Le site fonctionne sans aucune image : les projets et le portrait affichent des
visuels dégradés en attendant. Pour mettre les vraies :

1. Dépose le fichier dans `public/` (ex. `public/works/mon-projet.jpg`).
2. Renseigne le chemin dans `content/site.ts` :
   - `works.items[].image` → `"/works/mon-projet.jpg"`
   - `about.image` → `"/studio/portrait.jpg"`

Format conseillé : 1600 × 1000 px pour les projets, 1000 × 1250 px pour le portrait.

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
  page.tsx             accueil — charge les contenus et assemble les sections
  globals.css          design system (couleurs, typo, animations, corps d'article)
  blog/                liste et pages d'articles
  admin/
    actions.ts         toutes les Server Actions (CRUD + connexion)
    connexion/         page de connexion
    (protege)/         tout le reste de l'admin, derrière l'authentification
      fields.ts        description des formulaires de chaque collection
components/
  ui.tsx               boutons, en-têtes de section, icônes
  Reveal.tsx           apparition au défilement
  admin/               coquille, formulaire générique, actions de ligne
  Nav.tsx  Hero.tsx  TrustedBy.tsx  Services.tsx  Works.tsx
  Testimonials.tsx  About.tsx  Process.tsx  Products.tsx
  LatestArticles.tsx  Faq.tsx  Cta.tsx  Footer.tsx
content/
  site.ts              textes fixes du site
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

Rien à surcharger : Vercel exécute `vercel-build`, qui applique les migrations
avant de construire le site (`prisma migrate deploy && next build`), et
`postinstall` régénère le client Prisma.

### 3. Variables d'environnement

| Variable | Obligatoire | Valeur |
| --- | --- | --- |
| `DATABASE_URL` | oui | Connection string Neon, endpoint **poolé** (`-pooler` dans l'hôte) |
| `DIRECT_DATABASE_URL` | oui | La même, endpoint **direct** (sans `-pooler`) — utilisée par les migrations |
| `BLOB_READ_WRITE_TOKEN` | oui | Ajoutée automatiquement en connectant un store Blob au projet |
| `ADMIN_EMAIL` | une fois | Sert au premier `db:seed`, retirable ensuite |
| `ADMIN_PASSWORD` | une fois | Idem, 10 caractères minimum |

> **Colle les valeurs sans guillemets.** Dans un fichier `.env` on écrit
> `DATABASE_URL="postgresql://…"` ; dans l'interface de Vercel, on saisit
> uniquement `postgresql://…`. Avec les guillemets, la chaîne commence par un
> `"` et le build échoue sur `P1013: the scheme is not recognized`.

Les deux URL Neon ne sont pas un détail : le pooler encaisse les connexions
éphémères du runtime serverless, mais ne gère pas les verrous de session dont
Prisma a besoin pour migrer. `prisma.config.ts` utilise `DIRECT_DATABASE_URL`
quand elle existe, et retombe sur `DATABASE_URL` sinon — d'où une seule
variable suffisante en local.

### 4. Stockage des images

Vercel → ton projet → **Storage** → **Blob** → *Create store*, en choisissant
**l'accès public**. Le jeton `BLOB_READ_WRITE_TOKEN` est injecté automatiquement
dans le projet.

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

Prisma prend un verrou consultatif au démarrage d'une migration. Si le
processus est interrompu avant de le relâcher, la session reste ouverte et
toute migration suivante expire avec `P1002`, alors que la base répond
normalement. Pour libérer :

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
- renseigner `brand.url` dans `content/site.ts` (balises SEO) ;
- déclarer `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` et
  `BLOB_READ_WRITE_TOKEN` dans les variables d'environnement Vercel, puis
  lancer `npm run db:deploy` et `npm run db:seed` une fois ;
- créer les pages `/mentions-legales`, `/confidentialite` et `/cgv`,
  référencées dans le pied de page — obligatoire en France.
