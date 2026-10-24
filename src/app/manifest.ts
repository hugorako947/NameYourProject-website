import type { MetadataRoute } from "next";
import { SITE_NAME, TRANSLATIONS } from "@/lib/i18n";
import { getRequestPrefs } from "@/lib/request-prefs";

// =============================================================================
// NameYourProject — Manifeste de l'application installable (PWA), servi à
// /manifest.webmanifest. Il permet d'installer le site comme une application
// (icône, plein écran) sur téléphone et ordinateur : voir la page /installer.
// Textes dans la langue du visiteur (lib/i18n.ts).
// =============================================================================

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { lang } = await getRequestPrefs();
  const t = TRANSLATIONS[lang];
  return {
    id: "/",
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: t.metaDescription,
    lang,
    start_url: "/",
    scope: "/",
    display: "standalone",
    // Couleurs du thème clair (--color-paper / --color-accent dans globals.css)
    background_color: "#fafafc",
    theme_color: "#fafafc",
    categories: ["productivity", "business", "utilities"],
    icons: [
      { src: "/app-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app-icon/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      {
        name: t.competitorsTitle,
        short_name: t.checkCompetitors,
        url: "/concurrence",
        icons: [{ src: "/app-icon/192", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
