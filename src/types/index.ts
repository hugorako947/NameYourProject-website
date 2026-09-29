// =============================================================================
// NameYourProject — Types globaux
//
// Les VALEURS ci-dessous (ex: "Business/Startup", "Modern") sont des
// identifiants internes, envoyés à l'API et au prompt IA. Elles ne sont
// jamais affichées telles quelles : les libellés visibles sont traduits
// dans lib/i18n.ts, pour chaque langue.
// =============================================================================

import type { Lang } from "@/lib/i18n";
import type { PackId } from "@/lib/pricing";

// ─── Vibes (tonalités de naming) ─────────────────────────────────────────────
export type Vibe = "Sérieux" | "Fun" | "Futuriste" | "Luxe" | "Nature" | "Tech";

export const VIBES: Vibe[] = ["Sérieux", "Fun", "Futuriste", "Luxe", "Nature", "Tech"];

// ─── Catégories ──────────────────────────────────────────────────────────────
export type Category =
  | "Business/Startup"
  | "App/Software"
  | "Creative/Content"
  | "Store/E-commerce"
  | "Product/Physical"
  | "Other";

export const CATEGORIES: Category[] = [
  "Business/Startup",
  "App/Software",
  "Creative/Content",
  "Store/E-commerce",
  "Product/Physical",
  "Other",
];

/** Longueur max du champ "Précisez" de la catégorie Autre. */
export const MAX_CUSTOM_CATEGORY_LENGTH = 60;

/** Longueur max de la description du projet. */
export const MAX_KEYWORDS_LENGTH = 300;

// ─── Longueur du nom ─────────────────────────────────────────────────────────
export type NameLength = "Any" | "Short" | "Medium" | "Long";
export const NAME_LENGTHS: NameLength[] = ["Any", "Short", "Medium", "Long"];

// ─── Style du nom ────────────────────────────────────────────────────────────
export type NameStyle = "Any" | "Modern" | "Classic" | "Compound" | "Playful";
export const NAME_STYLES: NameStyle[] = ["Any", "Modern", "Classic", "Compound", "Playful"];

// ─── Extensions de domaine ───────────────────────────────────────────────────
// Choisies à chaque génération (voir lib/domains/tlds.ts), ex: ".com", ".fr", ".app"
export type Tld = string;

// ─── Statut de disponibilité d'un domaine ────────────────────────────────────
export type DomainStatus = "available" | "taken" | "unknown" | "checking";

// ─── Un nom brut tel que renvoyé par l'IA ────────────────────────────────────
export interface GeneratedName {
  nom: string;
  explication: string;
}

// ─── Résultat d'une vérification de domaine ──────────────────────────────────
export interface DomainResult {
  tld: Tld;
  status: DomainStatus;
  /** URL d'achat affiliée Namecheap — null si domaine pris ou statut inconnu */
  affiliateUrl: string | null;
}

// ─── Résultat enrichi affiché dans une ResultCard ────────────────────────────
export interface NameResult {
  /** UUID généré côté client, utilisé comme key React et identifiant stable */
  id: string;
  nom: string;
  explication: string;
  domains: DomainResult[];
}

// ─── Codes d'erreur renvoyés par l'API (traduits côté client) ────────────────
export type ApiErrorCode =
  | "INVALID_INPUT"
  | "RATE_LIMITED"
  | "GENERATION_FAILED"
  | "PAYMENT_NOT_CONFIGURED"
  | "CONSENT_REQUIRED"
  | "INVALID_EMAIL"
  | "INVALID_CODE"
  | "TOO_MANY_ATTEMPTS"
  | "CODE_RATE_LIMITED"
  | "INSIGHT_LIMITED"
  | "INSIGHT_FAILED"
  | "BOT_CHECK_FAILED"
  | "GENERIC";

export interface ApiErrorBody {
  error: ApiErrorCode;
}

// ─── Payload envoyé à POST /api/generate ─────────────────────────────────────
export interface GenerateRequest {
  keywords: string;
  category: Category;
  /** Précision libre, uniquement quand category === "Other" */
  customCategory?: string;
  vibe: Vibe;
  length: NameLength;
  style: NameStyle;
  /** Langue de l'interface → langue des explications générées par l'IA */
  lang: Lang;
  /** Jeton anti-robots Turnstile (null quand l'anti-robots est désactivé) */
  turnstileToken: string | null;
  /** Noms déjà proposés pendant la visite : l'IA ne doit pas les reproposer */
  exclude?: string[];
  /** « Plus comme celui-ci » : nom aimé, dont on veut des variantes */
  inspiration?: { nom: string; explication: string };
}

// ─── Un nom renvoyé au navigateur, avec les domaines déjà vérifiés ───────────
export interface VerifiedName extends GeneratedName {
  /** Extensions déjà vérifiées par le serveur (le .com) ; les autres le seront par le navigateur */
  checked: Record<Tld, { status: DomainStatus; affiliateUrl: string | null }>;
}

// ─── Réponse de POST /api/generate ───────────────────────────────────────────
export interface GenerateResponse {
  /** Les 10 meilleurs noms, ceux dont le .com est libre en premier */
  names: VerifiedName[];
  /** Combien de ces noms ont un .com libre (confirmé par le registre) */
  freeComCount: number;
  /** Extensions à afficher pour chaque nom, dans l'ordre (.com d'abord) */
  tlds: Tld[];
  /** Générations gratuites restantes aujourd'hui pour cette IP */
  rateLimitRemaining: number;
  /** Nombre total de générations gratuites par jour */
  rateLimitLimit: number;
  /** true = administrateur, aucune limite */
  unlimited: boolean;
  /** Générations achetées restantes (null = navigateur non relié à un e-mail) */
  credits: number | null;
}

// ─── Réponse de GET /api/quota ───────────────────────────────────────────────
export interface QuotaResponse {
  remaining: number;
  limit: number;
  /** true = administrateur en mode illimité, aucune limite */
  unlimited: boolean;
  /** true = ce navigateur est déverrouillé en admin (même en mode visiteur) */
  isAdmin: boolean;
  /** Générations achetées restantes (null = navigateur non relié à un e-mail) */
  credits: number | null;
  /** E-mail masqué auquel ce navigateur est relié (ex: j•••@gmail.com) */
  creditsEmail: string | null;
  /** Le paiement en ligne est-il ouvert ? */
  paymentsEnabled: boolean;
}

// ─── Payload envoyé à POST /api/admin/mode ───────────────────────────────────
export interface AdminModeRequest {
  /** true = générations illimitées, false = mode visiteur (limite normale) */
  unlimited: boolean;
}

// ─── Payload envoyé à POST /api/checkout ─────────────────────────────────────
export interface CheckoutRequest {
  /** Pack choisi — le prix est toujours recalculé côté serveur */
  packId: PackId;
  /** Langue du visiteur (e-mail de confirmation, libellé du produit) */
  lang: Lang;
  /** Accord exprès : CGU + accès immédiat + perte du droit de rétractation */
  consent: boolean;
}

// ─── Retrouver ses générations par e-mail ────────────────────────────────────
export interface RequestCodeRequest {
  email: string;
  lang: Lang;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface CheckoutResponse {
  /** URL de la page de paiement (Stripe Checkout) vers laquelle rediriger */
  url: string;
}

// ─── Analyse « Qu'évoque ce nom ? » (recherche Google + IA) ──────────────────
/** FREE = semble libre · IN_USE = déjà utilisé · ASSOCIATED = fortement associé à un univers */
export type InsightVerdict = "FREE" | "IN_USE" | "ASSOCIATED" | "UNKNOWN";

export interface NameInsight {
  verdict: InsightVerdict;
  /** Une ou deux phrases : ce que le nom évoque ou désigne sur le web */
  summary: string;
  /** Univers dominant auquel le nom est associé (null si aucun) */
  association: string | null;
  /** Usages existants trouvés (entreprises, produits, sites…) */
  uses: string[];
  /** Pages consultées par la recherche */
  sources: { url: string; title: string }[];
  /** Suggestions de recherche fournies par Google (à afficher telles quelles) */
  searchSuggestionsHtml: string | null;
}

export interface NameInsightRequest {
  name: string;
  lang: Lang;
}

export interface NameInsightResponse {
  insight: NameInsight;
  /** Analyses gratuites restantes aujourd'hui */
  remaining: number;
  limit: number;
  unlimited: boolean;
}

// ─── Payload envoyé à POST /api/check-domain ─────────────────────────────────
export interface CheckDomainRequest {
  /** Domaine complet, ex: "monapp.com" */
  domain: string;
}

// ─── Réponse de POST /api/check-domain ───────────────────────────────────────
export interface CheckDomainResponse {
  domain: string;
  status: DomainStatus;
  /** Lien Namecheap — "Réserver" si libre, "Vérifier" si statut inconnu, absent si pris */
  affiliateUrl: string | null;
}
