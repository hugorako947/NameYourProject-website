// =============================================================================
// NameYourProject — POST /api/stripe/webhook  (notifications de Stripe)
//
// Stripe appelle cette adresse à chaque paiement réussi, même si le client a
// fermé son onglet avant de revenir sur le site. La signature de chaque
// notification est vérifiée avec STRIPE_WEBHOOK_SECRET : personne d'autre
// que Stripe ne peut déclencher un crédit de générations.
//
// À déclarer dans le tableau de bord Stripe (Développeurs → Webhooks) :
//   adresse : https://TON-DOMAINE/api/stripe/webhook
//   événements : checkout.session.completed, checkout.session.async_payment_succeeded
// =============================================================================

import type Stripe from "stripe";
import { fulfillCheckoutSession, siteUrlFrom, stripe, webhookSecret } from "@/lib/stripe";

const HANDLED = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);

export async function POST(req: Request) {
  if (!stripe || !webhookSecret) return new Response("Webhook non configuré", { status: 501 });

  const signature = req.headers.get("stripe-signature");
  const payload = await req.text(); // corps brut, indispensable pour vérifier la signature
  if (!signature) return new Response("Signature manquante", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }

  if (HANDLED.has(event.type)) {
    try {
      await fulfillCheckoutSession(event.data.object as Stripe.Checkout.Session, siteUrlFrom(req));
    } catch (error) {
      console.error("[paiement] Crédit impossible, Stripe va réessayer :", error instanceof Error ? error.message : error);
      return new Response("Erreur temporaire", { status: 500 }); // Stripe renverra la notification
    }
  }
  return Response.json({ received: true });
}
