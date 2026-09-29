"use client";

import Link from "next/link";
import { useApp } from "@/lib/app-context";
import { SITE_NAME } from "@/lib/i18n";
import { SEO_PAGES, seoPath } from "@/lib/seo/pages";

// =============================================================================
// Pied de page : avertissement IA + liens vers les pages légales
// =============================================================================

const linkClass = "transition-colors hover:text-ink";

export function SiteFooter() {
  const { t, lang } = useApp();
  return (
    <footer className="mx-auto mt-auto w-full max-w-6xl border-t border-border px-6 py-8 text-sm text-muted sm:px-10">
      <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-start md:justify-between md:text-start">
        <p className="max-w-xl leading-relaxed">{t.footerAiNotice}</p>
        <nav aria-label={t.footerNavLabel} className="flex shrink-0 flex-wrap justify-center gap-x-5 gap-y-2">
          <Link href="/mentions-legales" className={linkClass}>{t.legalNoticeLink}</Link>
          <Link href="/conditions-utilisation" className={linkClass}>{t.termsLink}</Link>
          <Link href="/confidentialite" className={linkClass}>{t.privacyLink}</Link>
        </nav>
      </div>
      {/* Pages SEO (en français) : liens utiles aussi pour que Google les découvre */}
      {lang === "fr" && (
        <nav aria-label="Générateurs de noms" className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs md:justify-start">
          <span className="font-medium text-ink/80">Générateurs de noms :</span>
          {SEO_PAGES.map((p) => (
            <Link key={p.slug} href={seoPath(p.slug)} className={linkClass}>
              {p.menuLabel}
            </Link>
          ))}
        </nav>
      )}
      <p className="mt-4 text-center text-xs md:text-start">© {new Date().getFullYear()} {SITE_NAME}</p>
    </footer>
  );
}
