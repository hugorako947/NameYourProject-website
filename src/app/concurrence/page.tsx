import type { Metadata } from "next";
import { CompetitorSearch } from "@/components/CompetitorSearch";
import { SITE_NAME, TRANSLATIONS } from "@/lib/i18n";
import { getRequestPrefs } from "@/lib/request-prefs";
import { MAX_SEARCH_QUERY_LENGTH } from "@/types";

// =============================================================================
// NameYourProject — Page Concurrence (/concurrence?q=…)
// « Ce projet existe-t-il déjà ? » : recherche sur des sources publiques
// gratuites (voir components/CompetitorSearch.tsx et lib/web-search.ts).
// =============================================================================

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getRequestPrefs();
  const t = TRANSLATIONS[lang];
  return {
    title: `${t.competitorsTitle} — ${SITE_NAME}`,
    description: t.competitorsMetaDescription,
    alternates: { canonical: "/concurrence" },
  };
}

export default async function Page({ searchParams }: PageProps<"/concurrence">) {
  const { q } = await searchParams;
  // Recherche reçue par l'adresse : simple pré-remplissage, revalidée par l'API
  const initialQuery = (typeof q === "string" ? q : "").slice(0, MAX_SEARCH_QUERY_LENGTH);
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-10 sm:py-14">
      <CompetitorSearch initialQuery={initialQuery} />
    </main>
  );
}
