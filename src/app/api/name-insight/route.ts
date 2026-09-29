// =============================================================================
// NameYourProject — POST /api/name-insight  { name, lang }
// « Qu'évoque ce nom ? » : recherche Google + résumé par l'IA (lib/ai/insight.ts)
//
// Protections :
//   • nom limité à 40 lettres/chiffres (pas de texte libre envoyé à l'IA)
//   • analyses gratuites limitées par jour et par IP (FREE_INSIGHTS_PER_DAY)
//   • un résultat déjà en mémoire (24 h) ne consomme rien
//   • si l'analyse échoue, elle est rendue à l'utilisateur
//   • l'administrateur en mode illimité n'a pas de limite
// =============================================================================

import { isLang } from "@/lib/i18n";
import { getAdminState } from "@/lib/admin";
import { analyzeName, getCachedInsight } from "@/lib/ai/insight";
import { INSIGHTS_BUCKET, checkRateLimit, getClientIp, getRemaining, refundRateLimit } from "@/lib/ratelimit";
import type { ApiErrorBody, NameInsightResponse } from "@/types";

export const maxDuration = 60;

function jsonError(error: ApiErrorBody["error"], status: number) {
  const body: ApiErrorBody = { error };
  return Response.json(body, { status });
}

export async function POST(req: Request) {
  let body: { name?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError("INVALID_INPUT", 400);
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!/^[A-Za-z0-9]{2,40}$/.test(name) || !isLang(body.lang)) return jsonError("INVALID_INPUT", 400);
  const lang = body.lang;

  const unlimited = getAdminState(req).unlimited;
  const ip = getClientIp(req);
  const limit = INSIGHTS_BUCKET.limit;

  // Déjà analysé récemment : réponse immédiate, rien n'est décompté
  const cached = await getCachedInsight(name, lang);
  if (cached) {
    const response: NameInsightResponse = {
      insight: cached,
      remaining: unlimited ? limit : await getRemaining(ip, INSIGHTS_BUCKET),
      limit,
      unlimited,
    };
    return Response.json(response);
  }

  let remaining = limit;
  if (!unlimited) {
    const quota = await checkRateLimit(ip, INSIGHTS_BUCKET);
    if (!quota.allowed) return jsonError("INSIGHT_LIMITED", 429);
    remaining = quota.remaining;
  }

  try {
    const insight = await analyzeName(name, lang);
    const response: NameInsightResponse = { insight, remaining, limit, unlimited };
    return Response.json(response);
  } catch {
    // La cause détaillée est affichée dans le terminal par lib/ai/client.ts
    if (!unlimited) await refundRateLimit(ip, INSIGHTS_BUCKET);
    return jsonError("INSIGHT_FAILED", 502);
  }
}
