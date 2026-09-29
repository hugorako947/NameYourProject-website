// =============================================================================
// NameYourProject — POST /api/credits/verify  { email, code }
// Vérifie le code reçu par e-mail et relie CE navigateur aux générations achetées.
// =============================================================================

import { NextResponse } from "next/server";
import { creditsSecret, getCredits, maskEmail, normalizeEmail } from "@/lib/credits";
import { verifyLoginCode } from "@/lib/login-codes";
import { CREDITS_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/credits-session";
import type { ApiErrorBody } from "@/types";

function jsonError(error: ApiErrorBody["error"], status: number) {
  const body: ApiErrorBody = { error };
  return Response.json(body, { status });
}

export async function POST(req: Request) {
  if (!creditsSecret()) return jsonError("PAYMENT_NOT_CONFIGURED", 501);
  let body: { email?: unknown; code?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError("INVALID_INPUT", 400);
  }
  const email = normalizeEmail(body.email);
  if (!email) return jsonError("INVALID_EMAIL", 400);
  if (typeof body.code !== "string") return jsonError("INVALID_CODE", 400);

  try {
    const result = await verifyLoginCode(email, body.code);
    if (!result.ok) return jsonError(result.error, result.error === "TOO_MANY_ATTEMPTS" ? 429 : 400);

    const token = createSessionToken(result.h, maskEmail(email));
    const response = NextResponse.json({ ok: true, credits: await getCredits(result.h), creditsEmail: maskEmail(email) });
    if (token) response.cookies.set(CREDITS_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("[connexion] Vérification du code impossible :", error instanceof Error ? error.message : error);
    return jsonError("GENERIC", 500);
  }
}
