// =============================================================================
// NameYourProject — POST /api/competitors  { query, lang }
// Recherche de concurrence : « ce projet ou ce nom existe-t-il déjà ? »
// Interroge des sources publiques gratuites (lib/web-search.ts). Aucune IA :
// la recherche du visiteur (texte libre) n'est jamais envoyée à Gemini.
//
// Protections :
//   • recherche nettoyée : une ligne, 100 caractères maximum
//   • recherches gratuites limitées par jour et par IP (FREE_SEARCHES_PER_DAY)
//   • un résultat déjà en mémoire (24 h) ne consomme rien
//   • si toutes les sources échouent, la recherche est rendue à l'utilisateur
//   • l'administrateur en mode illimité n'a pas de limite
// =============================================================================

import { isLang } from "@/lib/i18n";
import { getAdminState } from "@/lib/admin";
import { cleanSearchQuery, getCachedWebSearch, searchWeb } from "@/lib/web-search";
import { SEARCHES_BUCKET, checkRateLimit, getClientIp, getRemaining, refundRateLimit } from "@/lib/ratelimit";
import type { ApiErrorBody, CompetitorsResponse } from "@/types";

export const maxDuration = 30;

function jsonError(error: ApiErrorBody["error"], status: number) {
  const body: ApiErrorBody = { error };
  return Response.json(body, { status });
}

export async function POST(req: Request) {
  let body: { query?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError("INVALID_INPUT", 400);
  }
  const query = cleanSearchQuery(body.query);
  if (!query || !isLang(body.lang)) return jsonError("INVALID_INPUT", 400);
  const lang = body.lang;

  const unlimited = getAdminState(req).unlimited;
  const ip = getClientIp(req);
  const limit = SEARCHES_BUCKET.limit;

  // Déjà cherché récemment : réponse immédiate, rien n'est décompté
  const cached = await getCachedWebSearch(query, lang);
  if (cached) {
    const response: CompetitorsResponse = {
      query,
      sources: cached,
      remaining: unlimited ? limit : await getRemaining(ip, SEARCHES_BUCKET),
      limit,
      unlimited,
    };
    return Response.json(response);
  }

  let remaining = limit;
  if (!unlimited) {
    const quota = await checkRateLimit(ip, SEARCHES_BUCKET);
    if (!quota.allowed) return jsonError("SEARCH_LIMITED", 429);
    remaining = quota.remaining;
  }

  const sources = await searchWeb(query, lang);
  if (!sources.some((s) => s.ok)) {
    if (!unlimited) await refundRateLimit(ip, SEARCHES_BUCKET);
    return jsonError("SEARCH_FAILED", 502);
  }

  const response: CompetitorsResponse = { query, sources, remaining, limit, unlimited };
  return Response.json(response);
}
