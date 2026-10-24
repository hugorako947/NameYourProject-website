import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { SITE_NAME, TRANSLATIONS } from "@/lib/i18n";
import { getRequestPrefs } from "@/lib/request-prefs";

// =============================================================================
// NameYourProject — Page affichée par l'application installée quand il n'y a
// plus de connexion (gardée en mémoire par le service worker, public/sw.js).
// Volontairement sans JavaScript à exécuter : le bouton est un simple lien.
// =============================================================================

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getRequestPrefs();
  return { title: `${TRANSLATIONS[lang].offlineTitle} — ${SITE_NAME}`, robots: { index: false } };
}

export default async function Page() {
  const { lang } = await getRequestPrefs();
  const t = TRANSLATIONS[lang];
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <WifiOff aria-hidden className="h-12 w-12 text-muted" />
      <h1 className="font-display text-3xl font-bold text-ink">{t.offlineTitle}</h1>
      <p className="leading-relaxed text-muted">{t.offlineText}</p>
      <a href="/" className="rounded-full bg-accent px-6 py-3 font-bold text-on-accent transition hover:brightness-95">
        {t.offlineRetry}
      </a>
    </main>
  );
}
