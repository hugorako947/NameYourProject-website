import type { Metadata } from "next";
import { InstallGuide } from "@/components/InstallGuide";
import { SITE_NAME, TRANSLATIONS } from "@/lib/i18n";
import { getRequestPrefs } from "@/lib/request-prefs";

// =============================================================================
// NameYourProject — Page /installer : installer le site comme une application
// (adresse encodée dans le QR code affiché sur ordinateur).
// =============================================================================

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getRequestPrefs();
  const t = TRANSLATIONS[lang];
  return { title: `${t.installTitle} — ${SITE_NAME}`, description: t.installMetaDescription };
}

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-10 sm:py-14">
      <InstallGuide />
    </main>
  );
}
