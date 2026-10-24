import { createHash } from "node:crypto";
import { kv } from "@/lib/kv";
import { siteUrl } from "@/lib/site";
import type { Lang } from "@/lib/i18n";
import { MAX_SEARCH_QUERY_LENGTH, WEB_SOURCES, type WebHit, type WebSourceId, type WebSourceResult } from "@/types";

// =============================================================================
// NameYourProject — Recherche sur le web via des sources publiques GRATUITES
//
// Utilisée par :
//   • la page Concurrence (/concurrence) : « ce projet existe-t-il déjà ? »
//   • l'analyse « Qu'évoque ce nom ? » (lib/ai/insight.ts), qui fait résumer
//     ces résultats par Gemini sans l'option payante « recherche Google »
//
// Sources (aucune clé requise, toutes interrogées en parallèle) :
//   Wikipédia (entreprises, marques, œuvres connues) · GitHub (projets de code)
//   · App Store (applications) · Steam (jeux) · Hacker News (startups, lancements)
//
// Les appels partent du SERVEUR : l'adresse IP du visiteur n'est jamais
// transmise à ces sites. Une source en panne n'empêche pas les autres de
// répondre (elle est signalée « indisponible »). Résultats gardés 24 h.
// GITHUB_TOKEN (facultatif) relève la limite de GitHub (10 recherches/minute
// sans jeton, partagées par tout le serveur).
// =============================================================================

const CACHE_TTL = 24 * 60 * 60;
const TIMEOUT_MS = 6000;
const HITS_PER_SOURCE = 5;
const MAX_DESCRIPTION = 200;

/**
 * Nettoie la recherche du visiteur : une ligne, sans caractères de contrôle ni
 * chevrons, espaces compactés, longueur bornée. null si elle ne contient pas
 * au moins 2 lettres ou chiffres.
 */
export function cleanSearchQuery(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value
    .replace(/[\p{Cc}\p{Cf}<>]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SEARCH_QUERY_LENGTH)
    .trim();
  return (cleaned.match(/[\p{L}\p{N}]/gu)?.length ?? 0) >= 2 ? cleaned : null;
}

/** Clé de comparaison : minuscules, sans accents, lettres et chiffres seulement. */
export function matchKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/**
 * Le titre correspond-il exactement à la recherche ? On compare aussi le début
 * du titre, avant un séparateur : « MemeMasters - Card Game » ou
 * « MemeMasters: Party » comptent comme le nom « MemeMasters ».
 */
export function isExactMatch(title: string, query: string): boolean {
  const q = matchKey(query);
  if (!q) return false;
  const head = title.split(/\s[-–—|]\s|[:(（]/)[0];
  return matchKey(title) === q || matchKey(head) === q;
}

/** Retire les balises HTML et décode les entités courantes (extraits de Wikipédia). */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function shorten(text: string | null | undefined): string | null {
  const clean = stripHtml(text ?? "");
  if (!clean) return null;
  return clean.length > MAX_DESCRIPTION ? `${clean.slice(0, MAX_DESCRIPTION - 1)}…` : clean;
}

/** N'accepte que des liens http(s) : une source ne peut pas injecter de lien « javascript: ». */
function safeUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
}

async function getJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": `NameYourProject (+${siteUrl()})`, Accept: "application/json", ...headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

type Fetcher = (query: string, lang: Lang) => Promise<{ total: number; hits: WebHit[] }>;

function makeHit(query: string, title: string, url: string | null, description?: string | null, metric?: number | null, matchOn = title): WebHit | null {
  if (!title || !url) return null;
  return { title, url, description: shorten(description), metric: metric ?? null, exact: isExactMatch(matchOn, query) };
}

const isHit = (hit: WebHit | null): hit is WebHit => hit !== null;

// ─── Wikipédia : langue du visiteur + anglais (la plus complète) ─────────────

interface WikiResponse {
  query?: { searchinfo?: { totalhits?: number }; search?: { title: string; snippet?: string }[] };
}

const wikipedia: Fetcher = async (query, lang) => {
  const wikis = [...new Set<string>([lang, "en"])];
  const responses = await Promise.allSettled(
    wikis.map(async (wiki) => {
      // Un seul mot (un nom) : recherche du mot exact, sinon Wikipédia renvoie
      // des pages sans rapport (« MemeMasters » → « Masters de tennis »)
      const srsearch = query.includes(" ") ? query : `"${query}"`;
      const params = new URLSearchParams({ action: "query", list: "search", srsearch, srlimit: String(HITS_PER_SOURCE), format: "json", utf8: "1" });
      const data = await getJson<WikiResponse>(`https://${wiki}.wikipedia.org/w/api.php?${params}`);
      return { wiki, data };
    })
  );
  const ok = responses.filter((r) => r.status === "fulfilled").map((r) => r.value);
  if (ok.length === 0) throw new Error("Wikipédia injoignable");

  const seen = new Set<string>();
  const hits: WebHit[] = [];
  let total = 0;
  for (const { wiki, data } of ok) {
    total = Math.max(total, data.query?.searchinfo?.totalhits ?? 0);
    for (const page of data.query?.search ?? []) {
      const key = matchKey(page.title);
      if (seen.has(key)) continue;
      seen.add(key);
      const url = `https://${wiki}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`;
      const hit = makeHit(query, page.title, url, page.snippet);
      if (hit) hits.push(hit);
    }
  }
  return { total, hits };
};

// ─── GitHub : projets de code, triés par étoiles ─────────────────────────────

interface GitHubResponse {
  total_count?: number;
  items?: { name: string; full_name: string; html_url: string; description: string | null; stargazers_count: number }[];
}

const github: Fetcher = async (query) => {
  const token = process.env.GITHUB_TOKEN?.trim();
  const params = new URLSearchParams({ q: query, sort: "stars", order: "desc", per_page: String(HITS_PER_SOURCE) });
  const data = await getJson<GitHubResponse>(`https://api.github.com/search/repositories?${params}`, {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });
  const hits = (data.items ?? [])
    .map((repo) => makeHit(query, repo.full_name, safeUrl(repo.html_url), repo.description, repo.stargazers_count, repo.name))
    .filter(isHit);
  return { total: data.total_count ?? hits.length, hits };
};

// ─── App Store : applications (iPhone, iPad, Mac) ────────────────────────────

/** Boutique d'Apple consultée selon la langue du visiteur. */
const APP_STORE_COUNTRY: Record<Lang, string> = { fr: "FR", en: "US", es: "ES", zh: "CN", hi: "IN", ar: "SA" };

interface ITunesResponse {
  resultCount?: number;
  results?: { trackName?: string; trackViewUrl?: string; sellerName?: string; primaryGenreName?: string; userRatingCount?: number }[];
}

const appstore: Fetcher = async (query, lang) => {
  const params = new URLSearchParams({ term: query, entity: "software", limit: String(HITS_PER_SOURCE), country: APP_STORE_COUNTRY[lang] });
  const data = await getJson<ITunesResponse>(`https://itunes.apple.com/search?${params}`);
  const hits = (data.results ?? [])
    .map((app) =>
      makeHit(
        query,
        app.trackName ?? "",
        safeUrl(app.trackViewUrl),
        [app.sellerName, app.primaryGenreName].filter(Boolean).join(" · "),
        app.userRatingCount ?? null
      )
    )
    .filter(isHit);
  return { total: data.resultCount ?? hits.length, hits };
};

// ─── Steam : jeux vidéo ──────────────────────────────────────────────────────

interface SteamResponse {
  total?: number;
  items?: { id: number; name: string }[];
}

const steam: Fetcher = async (query) => {
  const params = new URLSearchParams({ term: query, l: "english", cc: "US" });
  const data = await getJson<SteamResponse>(`https://store.steampowered.com/api/storesearch/?${params}`);
  const hits = (data.items ?? [])
    .slice(0, HITS_PER_SOURCE)
    .map((game) => makeHit(query, game.name, Number.isInteger(game.id) ? `https://store.steampowered.com/app/${game.id}` : null))
    .filter(isHit);
  return { total: data.total ?? hits.length, hits };
};

// ─── Hacker News : lancements de startups et projets (« Show HN ») ───────────

interface HnResponse {
  nbHits?: number;
  hits?: { objectID: string; title?: string; url?: string | null; points?: number }[];
}

const hackernews: Fetcher = async (query) => {
  const params = new URLSearchParams({ query, tags: "story", hitsPerPage: String(HITS_PER_SOURCE) });
  const data = await getJson<HnResponse>(`https://hn.algolia.com/api/v1/search?${params}`);
  const hits = (data.hits ?? [])
    .map((story) =>
      makeHit(
        query,
        story.title ?? "",
        safeUrl(story.url) ?? `https://news.ycombinator.com/item?id=${encodeURIComponent(story.objectID)}`,
        null,
        story.points ?? null
      )
    )
    .filter(isHit);
  return { total: data.nbHits ?? hits.length, hits };
};

const FETCHERS: Record<WebSourceId, Fetcher> = { wikipedia, github, appstore, steam, hackernews };

const cacheKey = (query: string, lang: Lang) =>
  `nyp:web:${lang}:${createHash("sha256").update(query.toLowerCase()).digest("hex").slice(0, 32)}`;

/** Résultats déjà en mémoire (24 h), sinon null. */
export async function getCachedWebSearch(query: string, lang: Lang): Promise<WebSourceResult[] | null> {
  const raw = await kv.get(cacheKey(query, lang)).catch(() => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WebSourceResult[];
  } catch {
    return null;
  }
}

/**
 * Interroge toutes les sources en parallèle. `query` doit déjà être passée par
 * cleanSearchQuery(). Ne lève jamais d'erreur : une source en échec renvoie
 * ok: false. Les résultats exacts remontent en tête de chaque source.
 */
export async function searchWeb(query: string, lang: Lang): Promise<WebSourceResult[]> {
  const cached = await getCachedWebSearch(query, lang);
  if (cached) return cached;

  const results = await Promise.all(
    WEB_SOURCES.map(async (source): Promise<WebSourceResult> => {
      try {
        const { total, hits } = await FETCHERS[source](query, lang);
        const sorted = [...hits.filter((h) => h.exact), ...hits.filter((h) => !h.exact)];
        return { source, ok: true, total, hits: sorted };
      } catch (error) {
        console.warn(`[recherche] Source ${source} indisponible :`, error instanceof Error ? error.message : error);
        return { source, ok: false, total: 0, hits: [] };
      }
    })
  );

  // On ne garde en mémoire que si au moins une source a répondu
  if (results.some((r) => r.ok)) {
    await kv.set(cacheKey(query, lang), JSON.stringify(results), { ttlSeconds: CACHE_TTL }).catch(() => undefined);
  }
  return results;
}
