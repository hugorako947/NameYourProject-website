import { cookies, headers } from "next/headers";
import { TRANSLATIONS, type Lang } from "@/lib/i18n";
import type { LegalLang } from "@/lib/legal-content";
import { LANG_COOKIE, countryFromHeaders, detectLang } from "@/lib/locale";
import {
  CUSTOM_COLORS_COOKIE,
  THEME_COOKIE,
  isTheme,
  parseCustomColors,
  type CustomColors,
  type Theme,
} from "@/lib/theme";
import { currencyForCountry } from "@/lib/pricing";

// =============================================================================
// NameYourProject — Préférences du visiteur, lues CÔTÉ SERVEUR
//
// Le serveur connaît la langue et le thème avant d'envoyer la page : elle
// arrive donc directement dans la bonne langue et les bonnes couleurs, sans
// "flash" de la mauvaise version au chargement.
// =============================================================================

export interface RequestPrefs {
  lang: Lang;
  theme: Theme;
  customColors: CustomColors;
  country: string | null;
  currency: string;
}

export async function getRequestPrefs(): Promise<RequestPrefs> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  const country = countryFromHeaders(headerStore);
  const lang = detectLang({
    cookieLang: cookieStore.get(LANG_COOKIE)?.value,
    country,
    acceptLanguage: headerStore.get("accept-language"),
  });

  const themeCookie = cookieStore.get(THEME_COOKIE)?.value;

  return {
    lang,
    // Thème clair par défaut, tant que le visiteur n'en a pas choisi un autre
    theme: isTheme(themeCookie) ? themeCookie : "light",
    customColors: parseCustomColors(cookieStore.get(CUSTOM_COLORS_COOKIE)?.value),
    country,
    currency: currencyForCountry(country),
  };
}

/**
 * Pages légales : rédigées en français (version de référence) et en anglais.
 * Les visiteurs d'une autre langue lisent la version anglaise, avec un message
 * dans leur langue le leur expliquant.
 */
export async function getLegalPagePrefs(): Promise<{ legalLang: LegalLang; notice?: string; backLabel: string }> {
  const { lang } = await getRequestPrefs();
  const t = TRANSLATIONS[lang];
  const legalLang: LegalLang = lang === "fr" ? "fr" : "en";
  return {
    legalLang,
    notice: lang === "fr" || lang === "en" ? undefined : t.legalOnlyFrEn,
    backLabel: t.backHome,
  };
}
