import type { Category, NameLength, NameStyle, Vibe } from "@/types";
import type { Lang } from "@/lib/i18n";

// =============================================================================
// NameYourProject — Prompts envoyés à Gemini
//
//   - NAMING_INSTRUCTIONS : partie FIXE (persona + contraintes) → `instructions`
//   - buildNamingPrompt() : partie VARIABLE (la demande du visiteur) → `prompt`
// =============================================================================

export const NAMING_INSTRUCTIONS = `Tu es un expert mondial en Naming et Branding.
Tu peux nommer n'importe quel type de projet : application, marque, studio, agence, cabinet, propriété immobilière, modèle de voiture, gadget, jouet, business, chaîne YouTube, boutique, restaurant, podcast, et bien d'autres.

Contraintes strictes :
1. Génère exactement le nombre de noms demandé, tous différents.
2. Tous les noms suggérés doivent avoir un fort potentiel SEO (être distinctifs, faciles à épeler et mémorables).
3. Les noms doivent avoir une grande probabilité que le nom de domaine exact soit disponible (évite les mots du dictionnaire courants seuls).
4. N'utilise jamais le nom d'une marque, d'une entreprise, d'un produit ou d'un service existant que tu connais, ni un nom trop proche.
5. Écris chaque nom uniquement avec des lettres latines sans accents (a-z) et éventuellement des chiffres, sans espace ni tiret, pour qu'il soit utilisable tel quel comme nom de domaine.
6. Respecte la longueur et le style demandés. Sans longueur précisée : 2 ou 3 syllabes maximum.
7. Interdiction des clichés tech : aucun nom finissant par -ify ou -ly, aucun nom commençant par Smart ou Pro.
8. Privilégie les associations d'idées, les mots-valises et les métaphores plutôt que les descriptions littérales.
9. Adapte le registre au type de projet, à la catégorie et à la vibe.`;

/** Traduction des options du formulaire en consignes explicites pour l'IA. */
const LENGTH_HINTS: Record<NameLength, string> = {
  Any: "2 ou 3 syllabes maximum (règle par défaut)",
  Short: "court — 1 à 2 syllabes, environ 4 à 6 lettres",
  Medium: "moyen — 2 à 3 syllabes, environ 6 à 9 lettres",
  Long: "long — 3 à 4 syllabes, jusqu'à environ 12 lettres",
};

const STYLE_HINTS: Record<NameStyle, string> = {
  Any: "libre",
  Modern: "moderne — mot inventé / néologisme",
  Classic: "classique — vrais mots existants",
  Compound: "composé — deux mots accolés",
  Playful: "ludique — sonorité amusante, jeux de mots",
};

const LANGUAGE_NAMES: Record<Lang, string> = {
  fr: "français",
  en: "anglais",
  es: "espagnol",
  zh: "chinois simplifié",
  hi: "hindi",
  ar: "arabe",
};

export interface NamingInput {
  keywords: string;
  category: Category;
  /** Précision libre de l'utilisateur quand category === "Other" */
  customCategory: string | null;
  vibe: Vibe;
  length: NameLength;
  style: NameStyle;
  /** Langue de l'interface → langue des explications */
  lang: Lang;
  /** Nombre de noms à produire (le serveur en demande plus que 10, puis garde les meilleurs) */
  count: number;
  /** Noms déjà proposés (pendant la visite ou au tour précédent), à ne pas répéter */
  exclude: string[];
  /** « Plus comme celui-ci » : le nom aimé par l'utilisateur, dont on veut des variantes */
  inspiration: { nom: string; explication: string } | null;
}

export function buildNamingPrompt(input: NamingInput): string {
  const categoryLine =
    input.category === "Other" && input.customCategory
      ? `Autre — précisée par l'utilisateur : "${input.customCategory}"`
      : input.category;

  return `L'utilisateur cherche un nom basé sur ces éléments :
- Description du projet : ${input.keywords}
- Catégorie : ${categoryLine}
- Vibe / Humeur souhaitée : ${input.vibe}
- Longueur souhaitée : ${LENGTH_HINTS[input.length]}
- Style de nom : ${STYLE_HINTS[input.style]}

${
    input.inspiration
      ? `L'utilisateur a beaucoup aimé le nom « ${input.inspiration.nom} » (${input.inspiration.explication}). Propose des variantes dans le même esprit : sonorité, construction et univers proches, mais chaque nom doit être nettement différent de « ${input.inspiration.nom} » et des autres.\n`
      : ""
  }Fournis ${input.count} noms percutants qui collent à ces critères.
Rédige chaque explication en ${LANGUAGE_NAMES[input.lang]}.${
    input.exclude.length > 0
      ? `\nNe propose aucun de ces noms, déjà proposés à l'utilisateur : ${input.exclude.join(", ")}.`
      : ""
  }`;
}
