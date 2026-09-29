// =============================================================================
// NameYourProject — POST /api/checkout  { packId, lang, consent }
//
// Crée une page de paiement Stripe Checkout pour le pack choisi et renvoie son
// adresse. Le navigateur n'envoie que l'identifiant du pack : prix et nombre
// de générations sont toujours relus dans lib/pricing.ts (jamais modifiables
// par le visiteur).
// =============================================================================

import { CREDIT_PACKS, getPack } from "@/lib/pricing";
import { SITE_NAME, TRANSLATIONS, isLang } from "@/lib/i18n";
import { paymentsStatus, siteUrlFrom, stripe } from "@/lib/stripe";
import type { ApiErrorBody, CheckoutResponse } from "@/types";

function jsonError(error: ApiErrorBody["error"], status: number) {
  const body: ApiErrorBody = { error };
  return Response.json(body, { status });
}

export async function POST(req: Request) {
  if (!paymentsStatus().enabled || !stripe) return jsonError("PAYMENT_NOT_CONFIGURED", 501);

  let body: { packId?: unknown; lang?: unknown; consent?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError("INVALID_INPUT", 400);
  }

  const pack = getPack(body.packId);
  if (!pack || !CREDIT_PACKS.includes(pack)) return jsonError("INVALID_INPUT", 400);
  // L'accord exprès est vérifié aussi côté serveur (pas seulement la case à cocher)
  if (body.consent !== true) return jsonError("CONSENT_REQUIRED", 400);
  const lang = isLang(body.lang) ? body.lang : "en";

  const site = siteUrlFrom(req);
  const consentAt = new Date().toISOString();
  const metadata = {
    packId: pack.id,
    generations: String(pack.generations),
    lang,
    // Preuve de l'accord exprès (accès immédiat + renonciation au droit de rétractation)
    withdrawal_waiver: "accepted",
    consent_at: consentAt,
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(pack.priceUsd * 100),
            product_data: {
              name: `${SITE_NAME} — ${TRANSLATIONS[lang].packGenerations(pack.generations)}`,
            },
          },
        },
      ],
      // Page de paiement dans la langue du navigateur du visiteur
      locale: "auto",
      // Prix converti dans la devise du visiteur quand c'est possible
      adaptive_pricing: { enabled: true },
      billing_address_collection: "auto",
      ...(process.env.STRIPE_AUTOMATIC_TAX === "true" ? { automatic_tax: { enabled: true } } : {}),
      ...(process.env.STRIPE_MANAGED_PAYMENTS === "true" ? { managed_payments: { enabled: true } } : {}),
      metadata,
      payment_intent_data: { metadata },
      success_url: `${site}/api/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/achat/annule`,
    });

    if (!session.url) return jsonError("GENERIC", 500);
    const response: CheckoutResponse = { url: session.url };
    return Response.json(response);
  } catch (error) {
    console.error("[paiement] Création de la page de paiement impossible :", error instanceof Error ? error.message : error);
    return jsonError("GENERIC", 502);
  }
}
