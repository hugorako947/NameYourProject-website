// =============================================================================
// NameYourProject — Quota gratuit, prix et devises
//
// Source unique pour : le nombre de générations gratuites par jour, le prix
// d'une génération achetée, et l'affichage du prix dans la devise locale.
// =============================================================================

/** Générations gratuites par jour et par IP. */
export const FREE_GENERATIONS_PER_DAY = 3;

/** Analyses « Qu'évoque ce nom ? » gratuites par jour et par IP (recherche Google + IA). */
export const FREE_INSIGHTS_PER_DAY = 5;

/** Noms proposés à chaque génération. */
export const NAMES_PER_GENERATION = 10;

/** Prix de référence d'UNE génération, en dollars US (devise de facturation). */
export const PRICE_PER_GENERATION_USD = 1;

// ─── Packs de générations ────────────────────────────────────────────────────
// Vendus par packs plutôt qu'à l'unité : chaque paiement coûte des frais fixes
// (~0,25-0,30 $), qui mangeraient une grosse part d'un achat à 1 $.
// Les générations achetées n'expirent jamais (engagement affiché aux clients).
// 👉 Pour changer les packs ou les prix, c'est ici — et nulle part ailleurs :
//    le serveur recalcule toujours le prix à partir de cette liste.

export type PackId = "starter" | "plus" | "pro";

export interface CreditPack {
  id: PackId;
  generations: number;
  priceUsd: number;
  /** Badge affiché sur la carte du pack */
  badge?: "recommended" | "bestValue";
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "starter", generations: 5, priceUsd: 5 },
  { id: "plus", generations: 15, priceUsd: 10, badge: "recommended" },
  { id: "pro", generations: 40, priceUsd: 20, badge: "bestValue" },
];

export const DEFAULT_PACK_ID: PackId = "plus";

export function getPack(id: unknown): CreditPack | null {
  return CREDIT_PACKS.find((p) => p.id === id) ?? null;
}

/** Économie par rapport au prix de référence (1 $ = 1 génération), en %. */
export function packSavingsPercent(pack: CreditPack): number {
  const reference = pack.generations * PRICE_PER_GENERATION_USD;
  return Math.round((1 - pack.priceUsd / reference) * 100);
}

// ─── Devise locale selon le pays ─────────────────────────────────────────────

const EUROZONE = [
  "AT", "BE", "BG", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT",
  "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
  // Territoires / micro-États utilisant l'euro
  "AD", "MC", "SM", "VA", "ME", "XK", "GP", "MQ", "GF", "RE", "YT", "PM", "BL", "MF",
];

const COUNTRY_CURRENCY: Record<string, string> = {
  GB: "GBP", CA: "CAD", CH: "CHF", LI: "CHF", AU: "AUD", JP: "JPY",
  CN: "CNY", IN: "INR", MX: "MXN", SA: "SAR", AE: "AED", MA: "MAD", EG: "EGP",
};

export function currencyForCountry(country: string | null): string {
  if (!country) return "USD";
  if (EUROZONE.includes(country)) return "EUR";
  return COUNTRY_CURRENCY[country] ?? "USD";
}

// ─── Conversion INDICATIVE ───────────────────────────────────────────────────
// ⚠️ Taux approximatifs (ordre de grandeur), codés en dur : ils vieillissent.
// Ils servent UNIQUEMENT à afficher "≈ 8,60 €" à côté du prix en dollars.
// Le montant réellement débité sera calculé par le prestataire de paiement
// au moment du paiement (voir app/api/checkout/route.ts).
// TODO: mettre à jour ces taux avant la mise en ligne, ou les remplacer par
// une source de taux en temps réel / la conversion automatique de Stripe.
const APPROX_RATES_FROM_USD: Record<string, number> = {
  USD: 1,
  EUR: 0.86,
  GBP: 0.75,
  CAD: 1.38,
  CHF: 0.8,
  AUD: 1.52,
  JPY: 148,
  CNY: 7.15,
  INR: 88,
  MXN: 18.5,
  SAR: 3.75, // parité fixe avec le dollar
  AED: 3.6725, // parité fixe avec le dollar
  MAD: 9.1,
  EGP: 48.5,
};

/** Formate un montant en dollars US, dans les conventions de la langue. */
export function formatUsd(amountUsd: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(amountUsd);
}

/**
 * Montant indicatif dans la devise locale, ou null si la devise locale est
 * déjà le dollar (ou inconnue) — auquel cas on n'affiche rien de plus.
 */
export function formatApproxLocal(amountUsd: number, currency: string, locale: string): string | null {
  const rate = APPROX_RATES_FROM_USD[currency];
  if (!rate || currency === "USD") return null;
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amountUsd * rate);
}
