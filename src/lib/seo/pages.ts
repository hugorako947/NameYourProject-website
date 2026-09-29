import type { Category, Vibe } from "@/types";

// =============================================================================
// NameYourProject — Pages SEO « générateur de noms de … »
//
// Chaque entrée crée automatiquement une page /generateur-nom-<slug>, ajoutée
// au plan du site (sitemap.xml) et au pied de page. Le générateur y est
// déjà réglé sur la bonne catégorie et la bonne vibe.
//
// 👉 Pour créer une nouvelle page : ajoute une entrée ici, rien d'autre.
// Textes en français (comme les adresses) ; des versions dans les autres
// langues demanderaient des adresses dédiées (ex : /en/app-name-generator).
// =============================================================================

export interface SeoPage {
  slug: string;
  /** Libellé court, pour le pied de page */
  menuLabel: string;
  category: Category;
  /** Précision de la catégorie "Autre" (ex : restaurant) */
  customCategory?: string;
  vibe: Vibe;
  /** Titre de l'onglet et de Google (60 caractères environ) */
  title: string;
  /** Description sous le titre dans Google (150 caractères environ) */
  description: string;
  h1: string;
  intro: string;
  tips: string[];
}

export const SEO_PAGES: SeoPage[] = [
  {
    slug: "application",
    menuLabel: "Application",
    category: "App/Software",
    vibe: "Tech",
    title: "Générateur de noms d'application gratuit | NameYourProject",
    description:
      "Trouvez un nom d'application original et mémorable, avec vérification instantanée du nom de domaine. Gratuit et sans inscription.",
    h1: "Générateur de noms d'application",
    intro:
      "Décrivez votre application en quelques mots : l'IA vous propose des noms courts, faciles à retenir et à taper dans un store, puis vérifie leur nom de domaine.",
    tips: [
      "Visez un nom court, qui tient sous l'icône de l'application sans être coupé.",
      "Vérifiez qu'il se prononce sans hésitation : on recommande une appli à voix haute.",
      "Un .com ou un .app libre facilite la page de téléchargement et la confiance.",
    ],
  },
  {
    slug: "startup",
    menuLabel: "Startup",
    category: "Business/Startup",
    vibe: "Futuriste",
    title: "Générateur de noms de startup | NameYourProject",
    description:
      "Des noms de startup originaux, pensés pour grandir, avec vérification du nom de domaine en temps réel. Gratuit, sans compte.",
    h1: "Générateur de noms de startup",
    intro:
      "Une startup a besoin d'un nom qui porte une ambition sans enfermer son activité. Décrivez votre projet : l'IA propose des noms distinctifs et vérifie leur domaine.",
    tips: [
      "Évitez un nom trop descriptif : votre produit évoluera, votre nom doit suivre.",
      "Testez-le auprès de quelques personnes : le retiennent-elles le lendemain ?",
      "Vérifiez qu'aucune marque déposée proche n'existe dans votre secteur.",
    ],
  },
  {
    slug: "entreprise",
    menuLabel: "Entreprise",
    category: "Business/Startup",
    vibe: "Sérieux",
    title: "Générateur de noms d'entreprise | NameYourProject",
    description:
      "Trouvez le nom de votre entreprise, société ou cabinet : des propositions sérieuses et originales, avec vérification du domaine.",
    h1: "Générateur de noms d'entreprise",
    intro:
      "Société, cabinet, agence ou activité indépendante : décrivez votre métier et vos valeurs, l'IA vous propose des noms crédibles et vérifie leur disponibilité en ligne.",
    tips: [
      "Un nom d'entreprise doit inspirer confiance dès la première lecture.",
      "Pensez à la dénomination sociale : vérifiez qu'elle n'est pas déjà utilisée dans votre pays.",
      "Un nom facile à épeler au téléphone vous fera gagner du temps au quotidien.",
    ],
  },
  {
    slug: "boutique-en-ligne",
    menuLabel: "Boutique en ligne",
    category: "Store/E-commerce",
    vibe: "Fun",
    title: "Générateur de noms de boutique en ligne | NameYourProject",
    description:
      "Des idées de noms pour votre boutique en ligne ou votre e-commerce, avec vérification du .com et du .shop. Gratuit, sans inscription.",
    h1: "Générateur de noms de boutique en ligne",
    intro:
      "Pour un e-commerce, le nom et l'adresse du site ne font qu'un. Décrivez ce que vous vendez : l'IA propose des noms accrocheurs et vérifie leur domaine en direct.",
    tips: [
      "Choisissez un nom qui laisse de la place pour élargir votre catalogue.",
      "Vérifiez aussi la disponibilité du nom sur les réseaux sociaux où vous vendrez.",
      "Un nom court et sans tiret est plus facile à retenir et à taper.",
    ],
  },
  {
    slug: "marque",
    menuLabel: "Marque",
    category: "Product/Physical",
    vibe: "Luxe",
    title: "Générateur de noms de marque | NameYourProject",
    description:
      "Créez un nom de marque unique et évocateur pour vos produits, avec vérification du nom de domaine. Gratuit et sans compte.",
    h1: "Générateur de noms de marque",
    intro:
      "Une marque raconte une histoire en un mot. Décrivez vos produits et l'univers que vous visez : l'IA propose des noms évocateurs et vérifie leur domaine.",
    tips: [
      "Un bon nom de marque évoque une émotion ou une image, pas seulement un produit.",
      "Avant de lancer, vérifiez les dépôts de marque existants (INPI, EUIPO, OMPI).",
      "Pensez à l'international : le nom a-t-il un sens gênant dans une autre langue ?",
    ],
  },
  {
    slug: "restaurant",
    menuLabel: "Restaurant",
    category: "Other",
    customCategory: "restaurant",
    vibe: "Fun",
    title: "Générateur de noms de restaurant | NameYourProject",
    description:
      "Trouvez un nom de restaurant, café ou food truck qui donne envie, avec vérification du nom de domaine. Gratuit, sans inscription.",
    h1: "Générateur de noms de restaurant",
    intro:
      "Restaurant, café, bar ou food truck : décrivez votre cuisine et l'ambiance du lieu, l'IA vous propose des noms qui donnent faim et vérifie leur domaine.",
    tips: [
      "Le nom doit refléter votre cuisine ou votre ambiance dès la devanture.",
      "Vérifiez qu'aucun établissement proche ne porte déjà un nom similaire.",
      "Un nom facile à rechercher aide vos clients à vous retrouver sur les cartes en ligne.",
    ],
  },
  {
    slug: "chaine-youtube",
    menuLabel: "Chaîne YouTube",
    category: "Creative/Content",
    vibe: "Fun",
    title: "Générateur de noms de chaîne YouTube | NameYourProject",
    description:
      "Des idées de noms pour votre chaîne YouTube, faciles à retenir et à rechercher, avec vérification du nom de domaine.",
    h1: "Générateur de noms de chaîne YouTube",
    intro:
      "Un nom de chaîne doit se retenir après une seule vidéo. Décrivez votre contenu et votre ton : l'IA propose des noms percutants et vérifie leur domaine.",
    tips: [
      "Choisissez un nom facile à taper dans une barre de recherche.",
      "Vérifiez que le même nom est libre sur les autres réseaux que vous utilisez.",
      "Évitez un nom trop lié à un seul sujet si vous comptez varier vos vidéos.",
    ],
  },
  {
    slug: "podcast",
    menuLabel: "Podcast",
    category: "Creative/Content",
    vibe: "Nature",
    title: "Générateur de noms de podcast | NameYourProject",
    description:
      "Trouvez le nom de votre podcast : original, facile à prononcer et à retrouver, avec vérification du nom de domaine.",
    h1: "Générateur de noms de podcast",
    intro:
      "Un podcast se découvre souvent de bouche à oreille : son nom doit se dire facilement. Décrivez votre émission, l'IA propose des noms et vérifie leur domaine.",
    tips: [
      "Prononcez le nom à voix haute : il doit sonner clairement, sans épeler.",
      "Vérifiez sa disponibilité sur les principales plateformes de podcasts.",
      "Un nom court s'affiche mieux sur les miniatures des applications d'écoute.",
    ],
  },
];

export function getSeoPage(slug: string): SeoPage | undefined {
  return SEO_PAGES.find((p) => p.slug === slug);
}

export const seoPath = (slug: string) => `/generateur-nom-${slug}`;
