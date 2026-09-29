import { generateText } from "ai";
import type { GoogleProviderMetadata } from "@ai-sdk/google";
import { google } from "./provider";
import { runWithModelChain } from "./client";
import { kv } from "@/lib/kv";
import type { Lang } from "@/lib/i18n";
import type { InsightVerdict, NameInsight } from "@/types";

// =============================================================================
// NameYourProject — « Qu'évoque ce nom ? »
//
// Gemini recherche le nom sur Google (outil officiel "Grounding with Google
// Search"), puis résume à quoi il renvoie : usages existants, univers associé,
// verdict. Les sources consultées sont renvoyées pour que l'utilisateur puisse
// vérifier par lui-même.
//
// Résultat gardé 24 h par nom et par langue : une même analyse n'est jamais
// payée deux fois, même par deux visiteurs différents.
// =============================================================================

const CACHE_TTL = 24 * 60 * 60;
const MAX_USES = 4;
const MAX_SOURCES = 5;

const LANGUAGE_NAMES: Record<Lang, string> = {
  fr: "français",
  en: "anglais",
  es: "espagnol",
  zh: "chinois simplifié",
  hi: "hindi",
  ar: "arabe",
};

function buildPrompt(name: string, lang: Lang): string {
  return `Tu es un expert en naming et en analyse de marques. Recherche sur Google le nom « ${name} » (écrit exactement ainsi, et ses variantes très proches), puis dis à quoi il renvoie aujourd'hui sur le web.

Réponds UNIQUEMENT dans ce format, sans aucun autre texte. Garde les mots-clés VERDICT, SUMMARY, ASSOCIATION et USES en anglais ; rédige tout le reste en ${LANGUAGE_NAMES[lang]}.
VERDICT: FREE ou IN_USE ou ASSOCIATED
SUMMARY: une ou deux phrases sur ce que ce nom désigne ou évoque actuellement
ASSOCIATION: l'univers ou le thème dominant auquel le nom est associé, ou NONE
USES:
- un usage existant trouvé (entreprise, produit, marque, site…) et son secteur
- (4 usages au maximum, ou une seule ligne "- NONE" s'il n'y en a aucun)

Règles pour VERDICT :
- FREE : aucune entreprise, produit, marque ou site notable n'utilise ce nom, et il n'évoque pas fortement un thème précis.
- IN_USE : ce nom, ou un nom quasi identique, est déjà utilisé par une entreprise, un produit, une marque ou un site.
- ASSOCIATED : le nom n'est pas forcément utilisé, mais il évoque fortement un univers précis (jouets pour enfants, un personnage, un lieu, un terme médical…).
Appuie-toi uniquement sur les résultats de la recherche ; n'invente rien.`;
}

const clean = (text: string) => text.replace(/\*\*/g, "").trim();

/** Lit la réponse au format imposé ; tolérant aux petites variations. */
export function parseInsight(text: string): Omit<NameInsight, "sources" | "searchSuggestionsHtml"> | null {
  const verdictMatch = /VERDICT\s*:\s*\**\s*(FREE|IN_USE|ASSOCIATED)/i.exec(text);
  const summaryMatch = /SUMMARY\s*:\s*(.+)/i.exec(text);
  if (!summaryMatch) return null;

  const associationRaw = /ASSOCIATION\s*:\s*(.+)/i.exec(text)?.[1] ?? "";
  const association = clean(associationRaw);

  const usesBlock = /USES\s*:\s*([\s\S]*)$/i.exec(text)?.[1] ?? "";
  const uses = usesBlock
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-•*]\s+/.test(line))
    .map((line) => clean(line.replace(/^[-•*]\s+/, "")))
    .filter((line) => line && !/^none\b/i.test(line))
    .slice(0, MAX_USES);

  return {
    verdict: (verdictMatch?.[1]?.toUpperCase() as InsightVerdict | undefined) ?? "UNKNOWN",
    summary: clean(summaryMatch[1]),
    association: association && !/^none\b/i.test(association) ? association : null,
    uses,
  };
}

/** Garde une source par site, dans l'ordre de la recherche. */
function pickSources(sources: { sourceType: string; url?: string; title?: string }[]): NameInsight["sources"] {
  const seen = new Set<string>();
  const result: NameInsight["sources"] = [];
  for (const source of sources) {
    if (source.sourceType !== "url" || !source.url) continue;
    const title = (source.title || "").trim() || new URL(source.url).hostname;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ url: source.url, title });
    if (result.length === MAX_SOURCES) break;
  }
  return result;
}

const cacheKey = (name: string, lang: Lang) => `nyp:insight:${lang}:${name.toLowerCase()}`;

export async function getCachedInsight(name: string, lang: Lang): Promise<NameInsight | null> {
  const raw = await kv.get(cacheKey(name, lang)).catch(() => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NameInsight;
  } catch {
    return null;
  }
}

/**
 * Analyse un nom avec une recherche Google.
 * @throws {NameGenerationError} si aucun modèle n'a pu répondre
 */
export async function analyzeName(name: string, lang: Lang): Promise<NameInsight> {
  const insight = await runWithModelChain(async (modelId, maxRetries) => {
    const result = await generateText({
      model: google(modelId),
      tools: { google_search: google.tools.googleSearch({}) },
      prompt: buildPrompt(name, lang),
      temperature: 0.2,
      maxRetries,
    });
    const parsed = parseInsight(result.text);
    if (!parsed) return null; // format inexploitable : on essaie le modèle suivant
    const metadata = result.providerMetadata?.google as GoogleProviderMetadata | undefined;
    return {
      ...parsed,
      sources: pickSources(result.sources as { sourceType: string; url?: string; title?: string }[]),
      searchSuggestionsHtml: metadata?.groundingMetadata?.searchEntryPoint?.renderedContent ?? null,
    } satisfies NameInsight;
  }, "l'analyse du nom");

  await kv.set(cacheKey(name, lang), JSON.stringify(insight), { ttlSeconds: CACHE_TTL }).catch(() => undefined);
  return insight;
}
