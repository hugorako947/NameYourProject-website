import type { WebSourceId } from "@/types";

// =============================================================================
// NameYourProject — Liens de recherche externes (ouverts dans un nouvel onglet)
//
// Aucun appel réseau ici : on fabrique seulement des adresses. Les recherches
// sont donc faites par le navigateur du visiteur, directement chez ces sites.
// =============================================================================

const enc = encodeURIComponent;

/** Recherche Google simple (sans guillemets : le nom tel quel). */
export function googleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${enc(query)}`;
}

export function googleImagesUrl(query: string): string {
  return `https://www.google.com/search?tbm=isch&q=${enc(query)}`;
}

/**
 * Base mondiale des marques de l'OMPI (WIPO Global Brand Database), recherche
 * « Brand name » déjà remplie et lancée. Format des liens de résultats du site
 * (paramètre asStructure : la recherche décrite en JSON).
 */
export function wipoBrandSearchUrl(name: string): string {
  const structure = {
    _id: "nyp1",
    boolean: "AND",
    bricks: [{ _id: "nyp2", key: "brandName", value: name, strategy: "Simple" }],
  };
  // encodeURIComponent (espace → %20) plutôt que URLSearchParams (espace → +) :
  // le site de l'OMPI ne décode pas le « + » en espace.
  const params: [string, string][] = [
    ["sort", "score desc"],
    ["strategy", "concept"],
    ["rows", "30"],
    ["start", "0"],
    ["asStructure", JSON.stringify(structure)],
    ["fg", "_void_"],
  ];
  return `https://branddb.wipo.int/en/quicksearch/results?${params.map(([k, v]) => `${k}=${enc(v)}`).join("&")}`;
}

/** Page de recherche complète de chaque source (« Tout voir »), si elle existe. */
export function sourceSearchUrl(source: WebSourceId, query: string): string | null {
  switch (source) {
    case "wikipedia":
      return `https://en.wikipedia.org/w/index.php?search=${enc(query)}&fulltext=1`;
    case "github":
      return `https://github.com/search?type=repositories&q=${enc(query)}`;
    case "steam":
      return `https://store.steampowered.com/search/?term=${enc(query)}`;
    case "hackernews":
      return `https://hn.algolia.com/?q=${enc(query)}`;
    case "appstore":
      return null; // l'App Store n'a pas de page de recherche sur le web
  }
}

/** « Chercher aussi sur » : sites sans accès gratuit pour le serveur. */
export function alsoSearchLinks(query: string): { label: string; url: string }[] {
  return [
    { label: "Google", url: googleSearchUrl(query) },
    { label: "Google Play", url: `https://play.google.com/store/search?q=${enc(query)}&c=apps` },
    { label: "Product Hunt", url: `https://www.producthunt.com/search?q=${enc(query)}` },
    { label: "itch.io", url: `https://itch.io/search?q=${enc(query)}` },
  ];
}
