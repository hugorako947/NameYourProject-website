// =============================================================================
// NameYourProject — Thèmes de couleurs
//
// Fonctions pures (aucune dépendance navigateur/serveur) : utilisées à la fois
// par le layout (rendu serveur, pour éviter tout "flash" au chargement) et par
// le sélecteur de thème (changement en direct dans le navigateur).
//
// - light / dark : palettes fixes définies dans globals.css
// - invert       : inversion mathématique EXACTE de chaque couleur du site
//                  (fond, textes, bordures, accent de chaque vibe...)
// - custom       : 4 couleurs choisies par l'utilisateur (voir CustomColors)
// =============================================================================

export type Theme = "light" | "dark" | "invert" | "custom";

export const THEME_IDS: Theme[] = ["light", "dark", "invert", "custom"];

/** Les 4 couleurs réglables par l'utilisateur dans le thème Personnalisé. */
export interface CustomColors {
  /** Fond de page */
  paper: string;
  /** Texte principal */
  ink: string;
  /** Texte secondaire (descriptions, libellés discrets) */
  muted: string;
  /** Couleur d'accent (bouton Générer, sélections...) */
  accent: string;
}

export const CUSTOM_COLOR_KEYS: (keyof CustomColors)[] = ["paper", "ink", "muted", "accent"];

/** Palette de départ du thème Personnalisé (contrastes vérifiés WCAG AA). */
export const DEFAULT_CUSTOM_COLORS: CustomColors = {
  paper: "#fdf6ec",
  ink: "#2d1f0e",
  muted: "#7a5f42",
  accent: "#0f766e",
};

// ─── Cookies (lus par le serveur au chargement de la page) ───────────────────
export const THEME_COOKIE = "nyp-theme";
export const CUSTOM_COLORS_COOKIE = "nyp-colors";

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEME_IDS as string[]).includes(value);
}

const HEX_REGEX = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_REGEX.test(value);
}

/**
 * Format compact stocké dans le cookie : "fdf6ec-2d1f0e-7a5f42-0f766e"
 * (pas de caractères spéciaux → aucun souci d'encodage de cookie).
 */
export function serializeCustomColors(colors: CustomColors): string {
  return CUSTOM_COLOR_KEYS.map((k) => colors[k].slice(1).toLowerCase()).join("-");
}

/** Relit le cookie ; toute valeur invalide est remplacée par la valeur par défaut. */
export function parseCustomColors(raw: string | undefined | null): CustomColors {
  const parts = (raw ?? "").split("-");
  const result = { ...DEFAULT_CUSTOM_COLORS };
  CUSTOM_COLOR_KEYS.forEach((key, i) => {
    const candidate = `#${parts[i] ?? ""}`;
    if (isHexColor(candidate)) result[key] = candidate.toLowerCase();
  });
  return result;
}

// ─── Calculs de couleur ──────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Inversion exacte : chaque canal RVB devient 255 - valeur. */
export function invertHex(hex: string): string {
  if (!isHexColor(hex)) return hex;
  return (
    "#" +
    hexToRgb(hex)
      .map((c) => (255 - c).toString(16).padStart(2, "0"))
      .join("")
  );
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const LIGHT_TEXT = "#ffffff";
const DARK_TEXT = "#14171f";

/** Couleur de texte la plus lisible (blanc ou encre) par-dessus un accent donné. */
export function onAccentFor(accent: string): string {
  if (!isHexColor(accent)) return DARK_TEXT;
  return contrastRatio(accent, LIGHT_TEXT) >= contrastRatio(accent, DARK_TEXT)
    ? LIGHT_TEXT
    : DARK_TEXT;
}

/**
 * Accent réellement affiché selon le thème :
 * - light / dark : couleur de la vibe
 * - invert       : couleur de la vibe inversée
 * - custom       : accent choisi par l'utilisateur
 */
export function resolveAccent(theme: Theme, custom: CustomColors, vibeAccent: string): string {
  if (theme === "invert") return invertHex(vibeAccent);
  if (theme === "custom") return custom.accent;
  return vibeAccent;
}

/** Indique au navigateur si les contrôles natifs (listes, barres de défilement) doivent être clairs ou sombres. */
export function colorSchemeFor(theme: Theme, custom: CustomColors): "light" | "dark" {
  if (theme === "dark" || theme === "invert") return "dark";
  if (theme === "custom") return relativeLuminance(custom.paper) < 0.4 ? "dark" : "light";
  return "light";
}

/** Variables CSS à poser sur <html> quand le thème Personnalisé est actif. */
export function customColorsCssVars(colors: CustomColors): Record<string, string> {
  return {
    "--color-paper": colors.paper,
    "--color-ink": colors.ink,
    "--color-muted": colors.muted,
    "--color-accent": colors.accent,
    "--color-on-accent": onAccentFor(colors.accent),
  };
}
