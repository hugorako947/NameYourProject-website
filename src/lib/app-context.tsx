"use client";

// =============================================================================
// NameYourProject — Contexte global (thème, couleurs perso, langue, devise)
//
// Les valeurs initiales viennent du SERVEUR (voir lib/request-prefs.ts), donc
// la page s'affiche directement correcte. Chaque changement est enregistré
// dans un cookie, relu par le serveur à la visite suivante.
// =============================================================================

import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { TRANSLATIONS, getLangMeta, type Lang, type Translations } from "@/lib/i18n";
import { LANG_COOKIE } from "@/lib/locale";
import {
  CUSTOM_COLORS_COOKIE,
  DEFAULT_CUSTOM_COLORS,
  THEME_COOKIE,
  colorSchemeFor,
  customColorsCssVars,
  serializeCustomColors,
  type CustomColors,
  type Theme,
} from "@/lib/theme";

interface AppContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customColors: CustomColors;
  setCustomColor: (key: keyof CustomColors, value: string) => void;
  resetCustomColors: () => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Raccourci : TRANSLATIONS[lang] */
  t: Translations;
  /** Locale de formatage des prix, ex: "fr-FR" */
  locale: string;
  /** Devise locale du visiteur (ISO 4217), ex: "EUR" */
  currency: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp() doit être utilisé à l'intérieur de <AppProvider>.");
  return ctx;
}

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

/** Applique thème + couleurs sur <html>, exactement comme le fait le serveur au chargement. */
function applyThemeToDocument(theme: Theme, colors: CustomColors) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = colorSchemeFor(theme, colors);
  const vars = customColorsCssVars(colors);
  for (const [name, value] of Object.entries(vars)) {
    if (theme === "custom") root.style.setProperty(name, value);
    else root.style.removeProperty(name);
  }
}

interface AppProviderProps {
  children: ReactNode;
  initialTheme: Theme;
  initialCustomColors: CustomColors;
  initialLang: Lang;
  currency: string;
}

export function AppProvider({
  children,
  initialTheme,
  initialCustomColors,
  initialLang,
  currency,
}: AppProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [customColors, setCustomColors] = useState<CustomColors>(initialCustomColors);
  const [lang, setLangState] = useState<Lang>(initialLang);
  const router = useRouter();

  const setTheme = (next: Theme) => {
    setThemeState(next);
    writeCookie(THEME_COOKIE, next);
    applyThemeToDocument(next, customColors);
  };

  const saveColors = (next: CustomColors) => {
    setCustomColors(next);
    writeCookie(CUSTOM_COLORS_COOKIE, serializeCustomColors(next));
    applyThemeToDocument(theme, next);
  };

  const setCustomColor = (key: keyof CustomColors, value: string) =>
    saveColors({ ...customColors, [key]: value.toLowerCase() });

  const resetCustomColors = () => saveColors({ ...DEFAULT_CUSTOM_COLORS });

  const setLang = (next: Lang) => {
    setLangState(next);
    writeCookie(LANG_COOKIE, next);
    const meta = getLangMeta(next);
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = meta.dir;
    // Re-rend les parties calculées par le serveur (pages légales, métadonnées)
    // dans la nouvelle langue, sans recharger la page ni perdre la saisie.
    router.refresh();
  };

  const value: AppContextValue = {
    theme,
    setTheme,
    customColors,
    setCustomColor,
    resetCustomColors,
    lang,
    setLang,
    t: TRANSLATIONS[lang],
    locale: getLangMeta(lang).locale,
    currency,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
