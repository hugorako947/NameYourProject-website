import { isLang, type Lang } from "@/lib/i18n";

// =============================================================================
// NameYourProject — Choix automatique de la langue à la première visite
//
// Ordre de priorité :
//   1. Choix déjà fait par le visiteur (cookie posé par le sélecteur de langue)
//   2. Pays du visiteur, s'il est dans la liste ci-dessous (langue majoritaire)
//   3. Langue du navigateur, si elle fait partie des 6 langues du site
//      (utile pour les pays multilingues : Canada, Suisse, Belgique...)
//   4. Anglais
// =============================================================================

export const LANG_COOKIE = "nyp-lang";

const LANG_COUNTRIES: Record<Exclude<Lang, "en">, string[]> = {
  fr: [
    "FR", "MC",
    // Outre-mer
    "GP", "MQ", "GF", "RE", "YT", "PM", "BL", "MF", "NC", "PF", "WF",
    // Pays où le français est la principale langue officielle
    "SN", "CI", "ML", "BF", "NE", "GN", "BJ", "TG", "GA", "CG", "CD", "CF", "TD", "MG", "HT", "DJ", "KM", "BI",
  ],
  es: [
    "ES", "MX", "AR", "CO", "PE", "VE", "CL", "EC", "GT", "CU", "BO", "DO",
    "HN", "PY", "SV", "NI", "CR", "PA", "UY", "PR", "GQ",
  ],
  zh: ["CN", "TW", "HK", "MO"],
  hi: ["IN"],
  ar: [
    "SA", "AE", "EG", "IQ", "JO", "KW", "LB", "LY", "MA", "OM", "QA", "SY",
    "TN", "YE", "BH", "DZ", "SD", "PS", "MR",
  ],
};

const COUNTRY_TO_LANG: Record<string, Lang> = Object.fromEntries(
  Object.entries(LANG_COUNTRIES).flatMap(([lang, countries]) =>
    countries.map((country) => [country, lang as Lang])
  )
);

export function langFromCountry(country: string | null): Lang | null {
  if (!country) return null;
  return COUNTRY_TO_LANG[country] ?? null;
}

/** Lit l'en-tête Accept-Language (ex: "fr-CH,fr;q=0.9,en;q=0.8"). */
export function langFromAcceptLanguage(header: string | null): Lang | null {
  if (!header) return null;
  const candidates = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { base: tag.split("-")[0].toLowerCase(), q: q ? parseFloat(q.trim().slice(2)) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);

  const match = candidates.find((c) => isLang(c.base));
  return match ? (match.base as Lang) : null;
}

/**
 * Pays du visiteur, fourni par l'hébergeur :
 * - Vercel     : en-tête x-vercel-ip-country (automatique)
 * - Cloudflare : en-tête cf-ipcountry (si le site passe par Cloudflare,
 *                par exemple devant Render)
 * En local (npm run dev), aucun de ces en-têtes n'existe : on passe alors
 * directement à la langue du navigateur.
 */
export function countryFromHeaders(headers: { get(name: string): string | null }): string | null {
  const raw = headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry");
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  // "XX" = inconnu, "T1" = réseau Tor (conventions Cloudflare)
  if (!/^[A-Z]{2}$/.test(code) || code === "XX" || code === "T1") return null;
  return code;
}

export function detectLang(input: {
  cookieLang: string | undefined;
  country: string | null;
  acceptLanguage: string | null;
}): Lang {
  if (isLang(input.cookieLang)) return input.cookieLang;
  return langFromCountry(input.country) ?? langFromAcceptLanguage(input.acceptLanguage) ?? "en";
}
