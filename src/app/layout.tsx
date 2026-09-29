import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Fraunces, IBM_Plex_Sans, Playfair_Display, Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";
import { HeaderControls } from "@/components/HeaderControls";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteBackground } from "@/components/SiteBackground";
import { SITE_NAME, TRANSLATIONS, getLangMeta } from "@/lib/i18n";
import { getRequestPrefs } from "@/lib/request-prefs";
import { colorSchemeFor, customColorsCssVars } from "@/lib/theme";
import { siteUrl } from "@/lib/site";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
});

// Polices de l'aperçu logo : preload désactivé → téléchargées seulement quand
// l'aperçu est affiché, sans ralentir le chargement du site.
const playfair = Playfair_Display({ variable: "--font-nf-playfair", subsets: ["latin"], weight: ["600", "700"], style: ["italic"], preload: false });
const grotesk = Space_Grotesk({ variable: "--font-nf-grotesk", subsets: ["latin"], weight: ["700"], preload: false });
const syne = Syne({ variable: "--font-nf-syne", subsets: ["latin"], weight: ["800"], preload: false });

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Titre de l'onglet : le nom du site seul, identique dans toutes les langues.
// Description (résultats Google) dans la langue du visiteur : lib/i18n.ts → metaDescription.
export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getRequestPrefs();
  const t = TRANSLATIONS[lang];
  return { metadataBase: new URL(siteUrl()), title: SITE_NAME, description: t.metaDescription };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const prefs = await getRequestPrefs();
  const langMeta = getLangMeta(prefs.lang);

  // Thème appliqué dès le rendu serveur → aucun "flash" de couleurs au chargement
  const htmlStyle = {
    colorScheme: colorSchemeFor(prefs.theme, prefs.customColors),
    ...(prefs.theme === "custom" ? customColorsCssVars(prefs.customColors) : {}),
  } as CSSProperties;

  return (
    <html
      lang={langMeta.htmlLang}
      dir={langMeta.dir}
      data-theme={prefs.theme}
      style={htmlStyle}
      suppressHydrationWarning
      className={`${fraunces.variable} ${plexSans.variable} ${playfair.variable} ${grotesk.variable} ${syne.variable} h-full`}
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <SiteBackground />
        <AppProvider
          initialTheme={prefs.theme}
          initialCustomColors={prefs.customColors}
          initialLang={prefs.lang}
          currency={prefs.currency}
        >
          <header className="mx-auto w-full max-w-6xl px-6 pt-8 sm:px-10">
            <HeaderControls />
          </header>
          {children}
          <SiteFooter />
        </AppProvider>
      </body>
    </html>
  );
}
