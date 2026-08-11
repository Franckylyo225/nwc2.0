/* ============================================================================
 * NEW WAVE CONCEPTION — CONTENU DU SITE
 * ----------------------------------------------------------------------------
 * C'EST LE SEUL FICHIER QUE TU AS BESOIN D'ÉDITER pour changer les textes.
 * Tout le site lit ses contenus ici. Aucun texte n'est écrit en dur ailleurs.
 *
 * CONVENTION :
 *   [À REMPLIR] = information que toi seul connais (coordonnées, vrais clients,
 *                 chiffres, tarifs, liens). Remplace-la avant la mise en ligne.
 *   Le reste est une base rédactionnelle crédible : garde-la, ajuste-la ou
 *   réécris-la entièrement, la mise en page s'adapte.
 *
 * ASTUCE : pour retrouver tout ce qui reste à compléter :
 *   grep -rn "À REMPLIR" content/
 * ==========================================================================*/

export const site = {
  /* ---------------------------------------------------------------- MARQUE */
  brand: {
    name: "New Wave Conception",
    short: "NWC",
    tagline: "Studio de création web",
    /** Utilisé dans le <title> et le partage sur les réseaux. */
    metaTitle: "New Wave Conception — Studio de création web",
    metaDescription:
      "Studio de création web. Nous concevons des sites et des identités qui donnent envie de cliquer, et qui convertissent.",
    /** Ex. "https://newwaveconception.fr" — sert aux balises SEO et à l'OG image. */
    url: "https://www.nwc-agency.com",
    city: "Abidjan",
    country: "Côte d'Ivoire",
  },

  /* ----------------------------------------------------------- NAVIGATION */
  nav: {
    links: [
      { label: "Services", href: "#services" },
      { label: "Réalisations", href: "#realisations" },
      { label: "Studio", href: "#studio" },
      { label: "Produits", href: "#produits" },
      { label: "FAQ", href: "#faq" },
    ],
    cta: { label: "Démarrer un projet", href: "#contact" },
  },

  /* ----------------------------------------------------------------- HERO */
  hero: {
    /** Petit badge de disponibilité, en haut. Mets-le à null pour le masquer. */
    badge: "[À REMPLIR — ex. 2 places disponibles en septembre]",
    /**
     * Le titre est découpé en fragments pour permettre la mise en page
     * « éclatée » du modèle. Chaque fragment est un mot ou groupe de mots ;
     * `accent` le colore en bleu, `chip` l'affiche dans une pastille.
     */
    headline: [
      { text: "Nous construisons" },
      { text: "la présence", chip: "avatars" as const },
      { text: "digitale", accent: true },
      { text: "des plus grandes marques" },
      { text: "d'Abidjan", chip: "arrow" as const },
      { text: "et d'ailleurs." },
    ],
    subline:
      "New Wave Conception conçoit des sites rapides, clairs et pensés pour la conversion — de la première maquette à la mise en ligne.",
    primaryCta: { label: "Démarrer un projet", href: "#contact" },
    secondaryCta: { label: "Voir nos réalisations", href: "#realisations" },
    /** Chiffres affichés sous le hero. Mets un tableau vide pour les masquer. */
    stats: [
      { value: "+60", label: "projets livrés" },
      { value: "+10", label: "années d'expérience" },
      { value: "97%", label: "clients satisfaits" },
    ],
  },

  /* ------------------------------------------------ BANDEAU DE CONFIANCE */
  trustedBy: {
    label: "Ils nous ont fait confiance",
    /**
     * Logos défilants, dans l'ordre d'affichage.
     *
     * Pour en ajouter un : dépose le fichier dans `public/partners/`, puis
     * ajoute une entrée ici. `width` et `height` sont les dimensions réelles
     * du fichier (elles évitent que la page saute au chargement) ; l'affichage
     * est normalisé à hauteur égale par le composant.
     *
     * Les logos sont affichés dans leurs couleurs de marque. Pour un rendu
     * plus sobre (niveaux de gris, couleur au survol), voir la note dans
     * components/TrustedBy.tsx.
     */
    logos: [
      { name: "PISAM", src: "/partners/pisam.png", width: 800, height: 314 },
      { name: "Civotech", src: "/partners/civotech.png", width: 800, height: 166 },
      { name: "SIFEC", src: "/partners/sifec.png", width: 800, height: 442 },
      {
        name: "Africa Reflets Éditions",
        src: "/partners/africa-reflets-editions.png",
        width: 800,
        height: 314,
      },
      { name: "ADA", src: "/partners/ada.png", width: 800, height: 274 },
      {
        name: "Maison Ocoli",
        src: "/partners/maison-ocoli.png",
        width: 800,
        height: 362,
      },
      { name: "AfrikMag", src: "/partners/afrikmag.webp", width: 3274, height: 939 },
      {
        name: "Mohamedias Media Group",
        src: "/partners/mohamedias.png",
        width: 800,
        height: 377,
      },
    ],
  },

  /* ------------------------------------------------------------- SERVICES */
  services: {
    eyebrow: "Services",
    title: "Tout ce qu'il faut pour exister en ligne",
    intro:
      "Une équipe unique du cadrage à la mise en ligne. Pas de sous-traitance en cascade, pas d'aller-retours qui traînent.",
    items: [
      {
        title: "Sites vitrines & landing pages",
        description:
          "Un site clair, rapide, qui explique ce que vous faites et transforme le visiteur en contact.",
        bullets: ["Design sur-mesure", "Rédaction assistée", "Responsive complet"],
      },
      {
        title: "Identité visuelle & logo",
        description:
          "Une identité cohérente : logo, palette, typographies, règles d'usage. Livrée prête à l'emploi.",
        bullets: ["Logo & déclinaisons", "Charte graphique", "Kit réseaux sociaux"],
      },
      {
        title: "E-commerce",
        description:
          "Boutique en ligne installée, configurée et optimisée pour vendre dès le premier jour.",
        bullets: ["Shopify / WooCommerce", "Tunnel d'achat", "Paiement & livraison"],
      },
      {
        title: "Refonte & optimisation",
        description:
          "On repart de l'existant : on garde ce qui marche, on corrige la vitesse, le SEO et les conversions.",
        bullets: ["Audit technique", "Core Web Vitals", "SEO on-page"],
      },
      {
        title: "Applications web sur-mesure",
        description:
          "Espaces clients, tableaux de bord, outils métier. Développés proprement, pensés pour durer.",
        bullets: ["Next.js / React", "API & intégrations", "Hébergement inclus"],
      },
      {
        title: "Maintenance & évolutions",
        description:
          "Mises à jour, sauvegardes, sécurité et petites évolutions mensuelles. Vous ne touchez à rien.",
        bullets: ["Sauvegardes", "Correctifs sécurité", "Support réactif"],
      },
    ],
  },

  /* --------------------------------------------------------- RÉALISATIONS */
  works: {
    eyebrow: "Réalisations",
    title: "Projets récents",
    intro: "Une sélection de travaux menés de bout en bout.",
    /**
     * `image` : chemin d'une image dans /public (ex. "/works/mon-projet.jpg").
     * Laisse la valeur à null : un visuel dégradé propre s'affiche à la place.
     */
    items: [
      {
        name: "[À REMPLIR — nom du projet]",
        year: "[Année]",
        category: "Site vitrine & identité",
        summary:
          "[À REMPLIR — une phrase sur le contexte et le résultat obtenu, idéalement chiffré.]",
        href: "#",
        image: null as string | null,
      },
      {
        name: "[À REMPLIR — nom du projet]",
        year: "[Année]",
        category: "E-commerce",
        summary:
          "[À REMPLIR — une phrase sur le contexte et le résultat obtenu, idéalement chiffré.]",
        href: "#",
        image: null as string | null,
      },
      {
        name: "[À REMPLIR — nom du projet]",
        year: "[Année]",
        category: "Refonte & SEO",
        summary:
          "[À REMPLIR — une phrase sur le contexte et le résultat obtenu, idéalement chiffré.]",
        href: "#",
        image: null as string | null,
      },
    ],
    cta: { label: "Voir tous les projets", href: "#contact" },
  },

  /* ---------------------------------------------------------- TÉMOIGNAGES */
  testimonials: {
    eyebrow: "Témoignages",
    title: "Ce qu'en disent nos clients",
    items: [
      {
        quote:
          "[À REMPLIR — citation client. Le plus efficace : une phrase concrète sur le résultat obtenu.]",
        author: "[Prénom Nom]",
        role: "[Fonction]",
        company: "[Entreprise]",
      },
      {
        quote:
          "[À REMPLIR — citation client. Le plus efficace : une phrase concrète sur le résultat obtenu.]",
        author: "[Prénom Nom]",
        role: "[Fonction]",
        company: "[Entreprise]",
      },
      {
        quote:
          "[À REMPLIR — citation client. Le plus efficace : une phrase concrète sur le résultat obtenu.]",
        author: "[Prénom Nom]",
        role: "[Fonction]",
        company: "[Entreprise]",
      },
      {
        quote:
          "[À REMPLIR — citation client. Le plus efficace : une phrase concrète sur le résultat obtenu.]",
        author: "[Prénom Nom]",
        role: "[Fonction]",
        company: "[Entreprise]",
      },
    ],
  },

  /* --------------------------------------------------------------- STUDIO */
  about: {
    eyebrow: "Le studio",
    title: "Une nouvelle vague de conception web",
    /** Chaque entrée = un paragraphe. */
    paragraphs: [
      "[À REMPLIR — présente le studio : qui tu es, depuis quand, pour qui tu travailles. Deux ou trois phrases suffisent, écrites simplement.]",
      "[À REMPLIR — ta manière de travailler et ce qui te distingue : proximité, délais, expertise technique, accompagnement dans la durée…]",
    ],
    /** Photo du fondateur / de l'équipe, dans /public (ex. "/studio/portrait.jpg"). */
    image: null as string | null,
    signature: {
      name: "Franck TCHETEHO",
      role: "Fondateur, New Wave Conception",
    },
    highlights: [
      { value: "+80", label: "clients accompagnés" },
      { value: "5 semaines", label: "délai moyen de livraison" },
      { value: "100 %", label: "des projets suivis par le fondateur" },
    ],
  },

  /* ------------------------------------------------------------- PROCESS */
  process: {
    eyebrow: "Méthode",
    title: "Quatre étapes, zéro mauvaise surprise",
    intro:
      "Un cadre simple et annoncé à l'avance : vous savez toujours où en est le projet et ce qu'on attend de vous.",
    steps: [
      {
        title: "Cadrage",
        description:
          "Un appel pour comprendre votre activité, vos objectifs et vos contraintes. On repart avec un périmètre écrit et un devis ferme.",
      },
      {
        title: "Design",
        description:
          "Maquettes des pages clés, validées avant toute ligne de code. Deux séries de retours incluses.",
      },
      {
        title: "Développement",
        description:
          "Intégration, contenus, performance, référencement. Vous suivez l'avancée sur un lien de préproduction.",
      },
      {
        title: "Mise en ligne",
        description:
          "Recette finale, mise en production, prise en main. Puis un mois de suivi offert pour les ajustements.",
      },
    ],
  },

  /* ------------------------------------------------------ PROJETS MAISON */
  products: {
    eyebrow: "Projets maison",
    title: "Les produits que nous construisons pour nous",
    intro:
      "En parallèle des projets clients, nous développons nos propres SaaS et plateformes web, et nous les ouvrons au grand public.",
    note: "Une idée de produit à construire ? Nous savons aussi le faire pour vous.",
    /**
     * `status` colore la pastille : « En ligne » la met en bleu, toute autre
     * valeur (« Bêta », « Bientôt », « En développement »…) la laisse en gris.
     * `image` : capture d'écran dans /public (ex. "/products/mon-saas.jpg").
     * Laisse à `null` et un visuel dégradé avec l'initiale s'affiche.
     */
    items: [
      {
        name: "[À REMPLIR — nom du produit]",
        tagline: "[À REMPLIR — ce que fait le produit, en une ligne]",
        description:
          "[À REMPLIR — deux phrases : le problème que ça résout, et pour qui.]",
        status: "En ligne",
        tags: ["SaaS", "[Secteur]"],
        href: "[À REMPLIR — url du produit]",
        image: null as string | null,
      },
      {
        name: "[À REMPLIR — nom du produit]",
        tagline: "[À REMPLIR — ce que fait le produit, en une ligne]",
        description:
          "[À REMPLIR — deux phrases : le problème que ça résout, et pour qui.]",
        status: "En ligne",
        tags: ["Plateforme web", "[Secteur]"],
        href: "[À REMPLIR — url du produit]",
        image: null as string | null,
      },
      {
        name: "[À REMPLIR — nom du produit]",
        tagline: "[À REMPLIR — ce que fait le produit, en une ligne]",
        description:
          "[À REMPLIR — deux phrases : le problème que ça résout, et pour qui.]",
        status: "Bientôt",
        tags: ["SaaS", "[Secteur]"],
        href: "[À REMPLIR — url du produit]",
        image: null as string | null,
      },
    ],
    cta: { label: "Construire un produit avec nous", href: "#contact" },
  },

  /* ----------------------------------------------------------------- FAQ */
  faq: {
    eyebrow: "FAQ",
    title: "Les questions qu'on nous pose",
    items: [
      {
        q: "Combien de temps prend un projet ?",
        a: "Comptez 2 à 3 semaines pour un site vitrine, 4 à 6 semaines pour un projet complet avec identité et contenus. Le délai est confirmé par écrit au moment du devis, et il dépend surtout de la vitesse à laquelle vous validez les étapes.",
      },
      {
        q: "Comment se passe le paiement ?",
        a: "[À REMPLIR — ex. 40 % à la commande, le solde à la mise en ligne. Paiement en 3 fois possible.]",
      },
      {
        q: "Puis-je modifier mon site moi-même ensuite ?",
        a: "Oui. Le site est livré avec une interface d'administration et une prise en main d'une heure en visio. Vous modifiez textes, images et pages sans nous solliciter.",
      },
      {
        q: "Que se passe-t-il si le résultat ne me convient pas ?",
        a: "On valide les maquettes avant de développer, ce qui évite les mauvaises surprises. Deux séries de retours sont incluses à l'étape design, et rien n'est développé tant que vous n'avez pas donné votre accord.",
      },
      {
        q: "L'hébergement et le nom de domaine sont-ils compris ?",
        a: "[À REMPLIR — précise ce que tu prends en charge : achat du domaine, hébergement la première année, ou simple accompagnement.]",
      },
      {
        q: "Travaillez-vous avec des clients hors de votre région ?",
        a: "Oui, l'essentiel se fait en visio et par e-mail. Nous accompagnons des clients partout en France, et à l'étranger sur demande.",
      },
    ],
  },

  /* ------------------------------------------------------- CTA & CONTACT */
  cta: {
    title: "Un projet en tête ?",
    subtitle:
      "Racontez-nous en deux lignes ce que vous voulez construire. Réponse sous 24 h ouvrées, sans engagement.",
    primary: { label: "Écrire au studio", href: "mailto:hello@nwc-agency.com" },
    secondary: { label: "Réserver un appel", href: "[À REMPLIR — lien Calendly]" },
  },

  contact: {
    email: "hello@nwc-agency.com",
    phone: "+225 07 58 16 09 04",
    address: "Codody, Abidjan",
    /** Retire les entrées que tu n'utilises pas. */
    socials: [
      { label: "LinkedIn", href: "[À REMPLIR — url LinkedIn]" },
      { label: "Instagram", href: "[À REMPLIR — url Instagram]" },
      { label: "Behance", href: "[À REMPLIR — url Behance]" },
      { label: "Dribbble", href: "[À REMPLIR — url Dribbble]" },
    ],
  },

  /* -------------------------------------------------------------- FOOTER */
  footer: {
    blurb:
      "Studio de création web. Sites, identités et applications sur-mesure pour les marques qui montent.",
    columns: [
      {
        title: "Studio",
        links: [
          { label: "Services", href: "#services" },
          { label: "Réalisations", href: "#realisations" },
          { label: "Méthode", href: "#methode" },
          { label: "Produits", href: "#produits" },
        ],
      },
      {
        title: "Légal",
        links: [
          { label: "Mentions légales", href: "/mentions-legales" },
          { label: "Politique de confidentialité", href: "/confidentialite" },
          { label: "CGV", href: "/cgv" },
        ],
      },
    ],
    legal: `© ${new Date().getFullYear()} New Wave Conception. Tous droits réservés.`,
  },
} as const;

export type Site = typeof site;
