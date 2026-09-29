import type { Category } from "@/types";
import type { Lang } from "@/lib/i18n";
import { canCheckTld } from "@/lib/domains/checker";

// =============================================================================
// NameYourProject — Extensions de domaine vérifiées pour chaque génération
//
//   1. .com, toujours (c'est lui qui sert à trier les noms)
//   2. l'extension du pays du visiteur (.fr, .de, .es…), s'il y en a une
//   3. deux extensions adaptées à la catégorie du projet
//
// Les extensions génériques (.app, .shop…) peuvent toujours être vérifiées
// auprès de leur registre ; les extensions de pays (.io, .ai, .de…) seulement
// si leur registre le permet. Le site vérifie donc au moment de la génération,
// dans l'annuaire officiel de l'IANA, et n'affiche que ce qu'il sait vérifier.
// L'extension du pays est gardée dans tous les cas : si elle n'est pas
// vérifiable, un bouton « Vérifier » renvoie vers le registraire.
// =============================================================================

/** Par ordre de préférence ; les 2 premières vérifiables sont retenues. */
const CATEGORY_EXTRAS: Record<Category, string[]> = {
  "Business/Startup": [".io", ".co", ".net", ".company"],
  "App/Software": [".app", ".io", ".ai", ".dev"],
  "Creative/Content": [".studio", ".tv", ".media", ".net"],
  "Store/E-commerce": [".shop", ".store", ".co", ".net"],
  "Product/Physical": [".shop", ".co", ".store", ".net"],
  Other: [".net", ".co", ".org", ".online"],
};

/** Pays dont l'extension ne suit pas le code du pays, ou n'est pas utilisée localement. */
const COUNTRY_TLD_EXCEPTIONS: Record<string, string | null> = {
  GB: ".uk",
  US: null, // le .us est peu utilisé : le .com joue ce rôle
};

/** Sans pays connu (en local, par exemple), on se fie à la langue. */
const LANG_TLD_FALLBACK: Partial<Record<Lang, string>> = { fr: ".fr", es: ".es", zh: ".cn", hi: ".in" };

const EXTRAS_COUNT = 2;

export function localTld(country: string | null, lang: Lang): string | null {
  if (country) {
    if (country in COUNTRY_TLD_EXCEPTIONS) return COUNTRY_TLD_EXCEPTIONS[country];
    return `.${country.toLowerCase()}`;
  }
  return LANG_TLD_FALLBACK[lang] ?? null;
}

export async function pickTlds(input: { country: string | null; lang: Lang; category: Category }): Promise<string[]> {
  const tlds = [".com"];
  const local = localTld(input.country, input.lang);
  if (local && !tlds.includes(local)) tlds.push(local);

  let added = 0;
  for (const tld of CATEGORY_EXTRAS[input.category]) {
    if (added === EXTRAS_COUNT) break;
    if (tlds.includes(tld)) continue;
    if (await canCheckTld(tld)) {
      tlds.push(tld);
      added++;
    }
  }
  return tlds;
}
