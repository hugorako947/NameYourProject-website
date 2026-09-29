import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { LegalDoc, LegalLang } from "@/lib/legal-content";
import { LEGAL } from "@/lib/legal";

// =============================================================================
// Mise en page commune des pages légales (texte large, lisible, sobre)
// =============================================================================

interface LegalPageProps {
  doc: LegalDoc;
  lang: LegalLang;
  backLabel: string;
  /** Message affiché aux visiteurs dont la langue n'a pas de version légale */
  notice?: string;
}

export function LegalPage({ doc, lang, backLabel, notice }: LegalPageProps) {
  const updated = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${LEGAL.lastUpdated}T00:00:00Z`));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:px-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink">
        <ArrowLeft aria-hidden className="h-4 w-4 rtl:rotate-180" />
        {backLabel}
      </Link>

      {notice && <p className="mt-6 rounded-lg bg-accent/10 p-3 text-sm text-ink">{notice}</p>}

      <h1 lang={lang} className="mt-8 font-display text-4xl font-bold text-ink sm:text-5xl">
        {doc.title}
      </h1>
      <p lang={lang} className="mt-3 text-sm text-muted">
        {lang === "fr" ? "Dernière mise à jour : " : "Last updated: "}
        {updated}
      </p>
      {lang === "en" && (
        <p lang="en" className="mt-1 text-sm text-muted">
          This English version is provided for convenience. In case of discrepancy, the French version prevails.
        </p>
      )}

      <div lang={lang} className="mt-10 space-y-10 leading-relaxed text-ink/80">
        {doc.sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold text-ink">{section.title}</h2>
            <div className="mt-3 space-y-3">{section.body}</div>
          </section>
        ))}
      </div>
    </main>
  );
}
