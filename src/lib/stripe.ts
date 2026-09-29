import Stripe from "stripe";
import { hasPersistentStore } from "@/lib/redis";
import { configuredSiteUrl } from "@/lib/site";
import { getPack } from "@/lib/pricing";
import { isLang, type Lang } from "@/lib/i18n";
import {
  addCredits,
  creditsSecret,
  emailHash,
  getCredits,
  markPaymentProcessed,
  maskEmail,
  normalizeEmail,
  unmarkPaymentProcessed,
} from "@/lib/credits";
import { sendPurchaseEmail } from "@/lib/email";

// =============================================================================
// NameYourProject — Paiement avec Stripe Checkout
//
// La page de paiement est hébergée par Stripe : elle s'affiche dans la langue
// du visiteur, propose les moyens de paiement adaptés à son pays et peut
// convertir le prix dans sa devise (Adaptive Pricing). Le site ne voit jamais
// les données bancaires.
//
// Le paiement ne s'active QUE si tout ce qu'il faut est en place (voir
// paymentsStatus) ; sinon la fenêtre d'achat affiche "bientôt disponible".
// =============================================================================

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
export const stripe = secretKey ? new Stripe(secretKey) : null;

export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;

export interface PaymentsStatus {
  enabled: boolean;
  /** Ce qui manque, affiché dans le terminal pour t'aider à configurer */
  missing: string[];
}

let statusLogged = false;

export function paymentsStatus(): PaymentsStatus {
  const production = process.env.NODE_ENV === "production";
  const missing: string[] = [];
  if (!stripe) missing.push("STRIPE_SECRET_KEY");
  if (!creditsSecret()) missing.push("CREDITS_SECRET (16 caractères minimum)");
  // En ligne, les générations achetées DOIVENT survivre aux redémarrages
  if (production && !hasPersistentStore) missing.push("UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN");
  // En ligne, les notifications de Stripe sont indispensables (onglet fermé avant le retour sur le site…)
  if (production && !webhookSecret) missing.push("STRIPE_WEBHOOK_SECRET");

  if (!statusLogged && stripe) {
    statusLogged = true;
    if (missing.length) console.warn(`[paiement] Désactivé, il manque : ${missing.join(", ")}`);
    else console.info(`[paiement] Activé (${secretKey?.startsWith("sk_live") ? "mode RÉEL" : "mode test"})`);
  }
  return { enabled: missing.length === 0, missing };
}

export function siteUrlFrom(req: Request): string {
  return configuredSiteUrl() ?? new URL(req.url).origin;
}

export interface FulfillResult {
  /** Le paiement est confirmé et les générations sont (ou étaient déjà) créditées */
  paid: boolean;
  /** true seulement lors du premier traitement de ce paiement */
  newlyCredited: boolean;
  emailHash: string | null;
  maskedEmail: string | null;
  balance: number | null;
}

/**
 * Crédite les générations d'une session Stripe payée. Appelée à la fois par
 * le retour du client sur le site ET par la notification (webhook) de Stripe :
 * le premier des deux crédite, le second ne fait rien (jamais de double crédit).
 */
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session, siteUrl: string): Promise<FulfillResult> {
  const none: FulfillResult = { paid: false, newlyCredited: false, emailHash: null, maskedEmail: null, balance: null };
  if (session.payment_status !== "paid") return none;

  const email = normalizeEmail(session.customer_details?.email ?? session.customer_email);
  const pack = getPack(session.metadata?.packId);
  if (!email || !pack) {
    console.error(`[paiement] Session ${session.id} payée mais inexploitable (e-mail ou pack manquant) : à traiter manuellement.`);
    return none;
  }

  const h = emailHash(email);
  const base = { paid: true, emailHash: h, maskedEmail: maskEmail(email) };

  if (!(await markPaymentProcessed(session.id))) {
    return { ...base, newlyCredited: false, balance: await getCredits(h) };
  }

  let balance: number;
  try {
    balance = await addCredits(h, pack.generations);
  } catch (error) {
    await unmarkPaymentProcessed(session.id); // Stripe pourra réessayer
    throw error;
  }
  console.info(`[paiement] +${pack.generations} générations créditées (session ${session.id}).`);

  const lang: Lang = isLang(session.metadata?.lang) ? session.metadata.lang : "en";
  await sendPurchaseEmail(email, pack.generations, balance, siteUrl, lang);
  return { ...base, newlyCredited: true, balance };
}
