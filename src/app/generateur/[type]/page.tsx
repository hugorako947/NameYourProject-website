import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { SearchForm } from "@/components/SearchForm";
import { SEO_PAGES, getSeoPage, seoPath } from "@/lib/seo/pages";
import { SITE_NAME } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

// =============================================================================
// NameYourProject — Pages SEO, accessibles à l'adresse /generateur-nom-<slug>
// (la redirection interne est définie dans next.config.ts). Contenu : lib/seo/pages.ts
// =============================================================================

/** Seules les pages déclarées existent ; toute autre adresse renvoie une page 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_PAGES.map((p) => ({ type: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/generateur/[type]">): Promise<Metadata> {
  const { type } = await params;
  const page = getSeoPage(type);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: seoPath(page.slug) },
    openGraph: { title: page.title, description: page.description, url: seoPath(page.slug), type: "website" },
  };
}

export default async function SeoGeneratorPage({ params }: PageProps<"/generateur/[type]">) {
  const { type } = await params;
  const page = getSeoPage(type);
  if (!page) notFound();

  // Fil d'Ariane décrit pour Google (peut s'afficher dans les résultats de recherche)
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${siteUrl()}/` },
      { "@type": "ListItem", position: 2, name: page.h1, item: `${siteUrl()}${seoPath(page.slug)}` },
    ],
  };

  const pill =
    "inline-flex rounded-full border border-muted/50 px-4 py-1.5 text-sm font-medium text-ink/80 transition-colors hover:border-ink hover:text-ink";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />

      {/* Fil d'Ariane : la flèche et le nom du site ramènent au générateur principal */}
      <nav aria-label="Fil d'Ariane">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm">
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full py-1 font-semibold text-ink/80 transition-colors hover:text-ink"
            >
              <ArrowLeft aria-hidden className="h-4 w-4 rtl:rotate-180" />
              {SITE_NAME}
            </Link>
          </li>
          <li aria-hidden className="text-muted">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </li>
          <li aria-current="page" className="text-muted">
            {page.h1}
          </li>
        </ol>
      </nav>

      <header className="mx-auto mt-6 max-w-3xl text-center">
        <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-6xl">{page.h1}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted lg:text-xl">{page.intro}</p>
      </header>

      <SearchForm
        hideHeader
        initialCategory={page.category}
        initialCustomCategory={page.customCategory}
        initialVibe={page.vibe}
      />

      <section className="mx-auto w-full max-w-3xl">
        <h2 className="font-display text-2xl font-bold text-ink">Conseils pour bien choisir</h2>
        <ul className="mt-4 list-disc space-y-2 ps-5 leading-relaxed text-ink/80">
          {page.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <nav aria-label="Autres générateurs" className="mx-auto mt-12 w-full max-w-3xl">
        <h2 className="font-display text-xl font-bold text-ink">Autres générateurs de noms</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          <li>
            <Link href="/" className={`${pill} items-center gap-1.5 border-accent/70 font-semibold text-ink hover:border-accent`}>
              <ArrowLeft aria-hidden className="h-4 w-4 rtl:rotate-180" />
              Générateur principal
            </Link>
          </li>
          {SEO_PAGES.filter((p) => p.slug !== page.slug).map((p) => (
            <li key={p.slug}>
              <Link href={seoPath(p.slug)} className={pill}>
                {p.menuLabel}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
