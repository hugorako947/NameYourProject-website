// =============================================================================
// NameYourProject — GET /api/checkout/complete?session_id=...
//
// Stripe renvoie le client ici après le paiement. On vérifie le paiement
// directement auprès de Stripe (jamais sur la foi de l'adresse), on crédite
// les générations si ce n'est pas déjà fait, puis on relie CE navigateur à
// l'e-mail de l'achat — une seule fois par paiement, dans les 48 h.
// =============================================================================

import { NextResponse } from "next/server";
import { fulfillCheckoutSession, siteUrlFrom, stripe } from "@/lib/stripe";
import { claimPostPaymentLogin } from "@/lib/credits";
import { CREDITS_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/credits-session";

const MAX_LOGIN_DELAY_SECONDS = 48 * 60 * 60;

export async function GET(req: Request) {
  const site = siteUrlFrom(req);
  const to = (status: string) => NextResponse.redirect(new URL(`/achat/merci?status=${status}`, site), 303);

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!stripe || !sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return to("error");

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return to(session.status === "complete" ? "pending" : "error");

    const result = await fulfillCheckoutSession(session, site);
    if (!result.paid || !result.emailHash || !result.maskedEmail) return to("error");

    const recent = Date.now() / 1000 - session.created < MAX_LOGIN_DELAY_SECONDS;
    if (!recent || !(await claimPostPaymentLogin(session.id))) return to("ok-elsewhere");

    const token = createSessionToken(result.emailHash, result.maskedEmail);
    const response = to("ok");
    if (token) response.cookies.set(CREDITS_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("[paiement] Vérification du paiement impossible :", error instanceof Error ? error.message : error);
    return to("error");
  }
}
