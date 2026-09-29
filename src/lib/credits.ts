import { createHmac } from "node:crypto";
import { kv } from "@/lib/kv";

// =============================================================================
// NameYourProject — Générations achetées, rattachées à une adresse e-mail
//
// Pas de compte : les générations achetées sont liées à l'e-mail saisi au
// paiement. Le site ne stocke JAMAIS cet e-mail en clair, seulement une
// empreinte (HMAC) calculée avec CREDITS_SECRET. L'adresse elle-même n'est
// connue que de Stripe (pour le paiement) et, le temps d'un envoi, du
// service d'e-mail.
//
// ⚠️ CREDITS_SECRET ne doit JAMAIS changer après la mise en ligne : un autre
// secret donnerait d'autres empreintes, et les clients ne retrouveraient plus
// leurs générations.
// =============================================================================

const ONE_YEAR = 365 * 24 * 60 * 60;

export function creditsSecret(): string | null {
  const s = process.env.CREDITS_SECRET?.trim();
  return s && s.length >= 16 ? s : null;
}

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  return email;
}

/** Empreinte non réversible d'un e-mail (identifiant des générations achetées). */
export function emailHash(email: string): string {
  const secret = creditsSecret();
  if (!secret) throw new Error("CREDITS_SECRET manquant");
  return createHmac("sha256", secret).update(`email:${email}`).digest("hex").slice(0, 40);
}

/** "jean.dupont@gmail.com" → "j•••@gmail.com" (affichage uniquement). */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}•••@${domain}`;
}

const creditsKey = (h: string) => `nyp:credits:${h}`;
const buyerKey = (h: string) => `nyp:buyer:${h}`;

export async function getCredits(h: string): Promise<number> {
  return Math.max(0, Number((await kv.get(creditsKey(h))) ?? 0));
}

/** Ajoute des générations achetées et marque l'e-mail comme client. */
export async function addCredits(h: string, n: number): Promise<number> {
  const total = await kv.incrBy(creditsKey(h), n);
  await kv.set(buyerKey(h), "1");
  return total;
}

/** Consomme une génération achetée si possible. */
export async function consumeCredit(h: string): Promise<boolean> {
  const after = await kv.incrBy(creditsKey(h), -1);
  if (after < 0) {
    await kv.incrBy(creditsKey(h), 1); // rien à consommer : on annule
    return false;
  }
  return true;
}

/** Rend une génération achetée (quand l'IA a échoué). */
export async function refundCredit(h: string): Promise<void> {
  await kv.incrBy(creditsKey(h), 1);
}

/** Cet e-mail a-t-il déjà acheté des générations ? */
export async function isBuyer(h: string): Promise<boolean> {
  return (await kv.get(buyerKey(h))) === "1";
}

/** Marque un paiement Stripe comme traité. true = premier traitement (à créditer). */
export async function markPaymentProcessed(sessionId: string): Promise<boolean> {
  return kv.set(`nyp:paid:${sessionId}`, "1", { nx: true, ttlSeconds: ONE_YEAR });
}

/** Annule le marquage (si le crédit a échoué, pour que Stripe puisse réessayer). */
export async function unmarkPaymentProcessed(sessionId: string): Promise<void> {
  await kv.del(`nyp:paid:${sessionId}`);
}

/** La connexion automatique après paiement n'est possible qu'une fois par paiement. */
export async function claimPostPaymentLogin(sessionId: string): Promise<boolean> {
  return kv.set(`nyp:claimed:${sessionId}`, "1", { nx: true, ttlSeconds: 2 * 24 * 60 * 60 });
}
