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

Facultatif. Sans `BLOB_READ_WRITE_TOKEN`, tout fonctionne — il faut simplement
coller une URL d'image dans les formulaires au lieu d'envoyer un fichier.
Pour l'activer : Vercel → ton projet → Storage → Blob → créer un store, puis
copier le jeton dans `.env`. Limite : 4 Mo par image.

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

Points communs à tous les contenus :

- **Ordre d'affichage** — un nombre ; les plus petits passent devant.
- **Publié** — décoché, le contenu reste invisible sur le site public.
- **Slug** — rempli automatiquement à partir du titre, modifiable.

Actualités et articles de fond partagent une seule liste, séparés par leur
catégorie. La page `/blog` propose un filtre entre les deux.

Le contenu des articles s'écrit en **Markdown** (`## titre`, `**gras**`,
`- liste`, `[lien](url)`), rendu en HTML côté serveur.

Toute publication rafraîchit immédiatement les pages publiques concernées.

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

## Mise en ligne

Le plus simple est **Vercel** : pousse le dossier sur un dépôt Git, importe-le
sur [vercel.com/new](https://vercel.com/new), rien à configurer.

Avant de publier, pense à :

- remplacer tous les `[À REMPLIR]` restants ;
- renseigner `brand.url` dans `content/site.ts` (balises SEO) ;
- déclarer `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` et
  `BLOB_READ_WRITE_TOKEN` dans les variables d'environnement Vercel, puis
  lancer `npm run db:deploy` et `npm run db:seed` une fois ;
- créer les pages `/mentions-legales`, `/confidentialite` et `/cgv`,
  référencées dans le pied de page — obligatoire en France.
