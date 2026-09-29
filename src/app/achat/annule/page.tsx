import type { Metadata } from "next";
import Link from "next/link";
import { CircleX } from "lucide-react";
import { SITE_NAME, TRANSLATIONS } from "@/lib/i18n";
import { getRequestPrefs } from "@/lib/request-prefs";

// NameYourProject — Page affichée quand le visiteur quitte la page de paiement sans payer

export const metadata: Metadata = { title: `${SITE_NAME}`, robots: { index: false, follow: false } };

export default async function CancelPage() {
  const { lang } = await getRequestPrefs();
  const t = TRANSLATIONS[lang];
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-6 py-20 text-center">
      <CircleX aria-hidden className="h-14 w-14 text-muted" />
      <h1 className="mt-6 font-display text-4xl font-bold text-ink">{t.cancelTitle}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{t.cancelText}</p>
      <Link
        href="/"
        className="mt-10 rounded-full bg-accent px-8 py-3.5 font-bold text-on-accent transition hover:brightness-95"
      >
        {t.backToGenerator}
      </Link>
    </main>
  );
}
