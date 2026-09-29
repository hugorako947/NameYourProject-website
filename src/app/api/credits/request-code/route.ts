// =============================================================================
// NameYourProject — POST /api/credits/request-code  { email, lang }
// Envoie un code à 6 chiffres à l'e-mail d'un acheteur (voir lib/login-codes.ts).
// La réponse est la même que l'e-mail ait des générations ou non.
// =============================================================================

import { isLang } from "@/lib/i18n";
import { creditsSecret, normalizeEmail } from "@/lib/credits";
import { requestLoginCode } from "@/lib/login-codes";
import { getClientIp } from "@/lib/ratelimit";
import type { ApiErrorBody } from "@/types";

function jsonError(error: ApiErrorBody["error"], status: number) {
  const body: ApiErrorBody = { error };
  return Response.json(body, { status });
}

export async function POST(req: Request) {
  if (!creditsSecret()) return jsonError("PAYMENT_NOT_CONFIGURED", 501);
  let body: { email?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError("INVALID_INPUT", 400);
  }
  const email = normalizeEmail(body.email);
  if (!email) return jsonError("INVALID_EMAIL", 400);

  try {
    const result = await requestLoginCode(email, isLang(body.lang) ? body.lang : "en", getClientIp(req));
    if (!result.ok) return jsonError(result.error, 429);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[connexion] Demande de code impossible :", error instanceof Error ? error.message : error);
    return jsonError("GENERIC", 500);
  }
}
