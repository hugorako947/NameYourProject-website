// =============================================================================
// NameYourProject — POST /api/generate
//
// Ordre strict : validation → quota → Turnstile → IA → tri par domaine.
// On ne paie jamais un appel IA pour une requête qui devait être bloquée.
// L'administrateur en mode illimité (voir lib/admin.ts) saute le quota et
// Turnstile — mais pas la validation des champs.
//
// Sélection des noms :
//   0. Les noms déjà vus pendant la visite (envoyés par le navigateur) sont
//      exclus ; « Plus comme celui-ci » ajoute un nom d'inspiration
//   1. L'IA propose 20 candidats
//   2. On vérifie le .com de chacun auprès du registre officiel (RDAP)
//   3. Si moins de 8 ont un .com libre → 2e tour de 20 nouveaux candidats
//      (l'IA reçoit la liste des noms déjà vus, pour ne pas les répéter)
//   4. On renvoie les 10 meilleurs : .com libre d'abord, puis non vérifié,
//      puis pris (seulement s'il n'y a pas assez de noms libres)
// Extensions affichées : .com, celle du pays du visiteur, et deux extensions
// adaptées à la catégorie (voir lib/domains/tlds.ts).
// Une génération compte pour 1 dans le quota, même avec 2 tours.
// Ordre de consommation : générations gratuites du jour, PUIS générations
// achetées (si ce navigateur est relié à un e-mail acheteur).
// Si l'IA échoue, la génération est rendue à l'utilisateur.
//
// Les erreurs sont renvoyées sous forme de CODE (ex: "RATE_LIMITED") :
// le site les traduit dans la langue du visiteur (lib/i18n.ts → errors).
// =============================================================================

import {
  CATEGORIES,
  MAX_CUSTOM_CATEGORY_LENGTH,
  MAX_KEYWORDS_LENGTH,
  NAME_LENGTHS,
  NAME_STYLES,
  VIBES,
  type ApiErrorBody,
  type DomainStatus,
  type GenerateRequest,
  type GenerateResponse,
  type GeneratedName,
  type VerifiedName,
} from "@/types";
import { isLang } from "@/lib/i18n";
import { getAdminState } from "@/lib/admin";
import { turnstileEnabled, verifyTurnstileToken } from "@/lib/turnstile";
import { generateNames, NameGenerationError } from "@/lib/ai/client";
import type { NamingInput } from "@/lib/ai/prompts";
import { DAILY_LIMIT, checkRateLimit, getClientIp, refundRateLimit } from "@/lib/ratelimit";
import { checkDomainsBatch } from "@/lib/domains/checker";
import { buildAffiliateUrl } from "@/lib/domains/affiliate";
import { rankByComStatus } from "@/lib/domains/select";
import { toDomainSlug } from "@/lib/domains/slug";
import { pickTlds } from "@/lib/domains/tlds";
import { countryFromHeaders } from "@/lib/locale";
import { readSessionFromRequest } from "@/lib/credits-session";
import { consumeCredit, getCredits, refundCredit } from "@/lib/credits";

/** Laisse le temps aux 2 tours éventuels (IA + registres) chez l'hébergeur. */
export const maxDuration = 60;

const NAMES_RETURNED = 10;
const CANDIDATES_PER_ROUND = 20;
/** En dessous de ce nombre de .com libres après le 1er tour, on fait un 2e tour. */
const MIN_FREE_AFTER_FIRST_ROUND = 8;
const MAX_ROUNDS = 2;

function jsonError(error: ApiErrorBody["error"], status: number) {
  const body: ApiErrorBody = { error };
  return Response.json(body, { status });
}


/** Nombre maximal de noms déjà vus envoyés à l'IA (les plus récents). */
const MAX_EXCLUDED = 150;

/** Noms déjà vus envoyés par le navigateur : uniquement des noms valides, dédoublonnés. */
function cleanExclude(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const names = value.filter((v): v is string => typeof v === "string" && /^[A-Za-z0-9]{2,40}$/.test(v));
  return [...new Set(names)].slice(-MAX_EXCLUDED);
}

/** « Plus comme celui-ci » : nom valide + explication courte sur une ligne. */
function cleanInspiration(value: unknown): { nom: string; explication: string } | null {
  if (!value || typeof value !== "object") return null;
  const { nom, explication } = value as { nom?: unknown; explication?: unknown };
  if (typeof nom !== "string" || !/^[A-Za-z0-9]{2,40}$/.test(nom)) return null;
  const text = typeof explication === "string" ? explication.replace(/\s+/g, " ").trim().slice(0, 300) : "";
  return { nom, explication: text };
}

/** Nettoie la précision "Autre" : une seule ligne, espaces compactés, longueur bornée. */
function cleanCustomCategory(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/\s+/g, " ").trim().slice(0, MAX_CUSTOM_CATEGORY_LENGTH);
  return cleaned.length > 0 ? cleaned : null;
}

interface Candidate extends GeneratedName {
  comDomain: string;
  comStatus: DomainStatus;
}

/** Génère, vérifie le .com, et recommence une fois si trop peu de noms sont libres. */
async function generateAndRank(
  base: Omit<NamingInput, "count" | "exclude">,
  alreadyShown: string[]
): Promise<Candidate[]> {
  const pool: Candidate[] = [];
  // Noms à ne jamais reproposer : ceux déjà vus pendant la visite, le nom
  // d'inspiration, puis ceux de chaque tour
  const seen = new Set<string>(alreadyShown.map(toDomainSlug));
  const excludeNames = [...alreadyShown];
  if (base.inspiration) {
    seen.add(toDomainSlug(base.inspiration.nom));
    excludeNames.push(base.inspiration.nom);
  }

  for (let round = 0; round < MAX_ROUNDS; round++) {
    let names: GeneratedName[];
    try {
      names = await generateNames({ ...base, count: CANDIDATES_PER_ROUND, exclude: excludeNames.slice(-MAX_EXCLUDED) });
    } catch (error) {
      if (round === 0) throw error; // aucun nom du tout → vrai échec
      break; // 2e tour raté : on garde simplement les noms du 1er tour
    }

    // L'IA peut ignorer la consigne : les noms déjà vus sont retirés ici, quoi qu'il arrive
    const fresh = names.filter((n) => {
      const slug = toDomainSlug(n.nom);
      if (!slug || seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });
    excludeNames.push(...fresh.map((n) => n.nom));

    const domains = fresh.map((n) => `${toDomainSlug(n.nom)}.com`);
    const statuses = await checkDomainsBatch(domains);
    fresh.forEach((n, i) => pool.push({ ...n, comDomain: domains[i], comStatus: statuses.get(domains[i]) ?? "unknown" }));

    const freeCount = pool.filter((c) => c.comStatus === "available").length;
    if (freeCount >= MIN_FREE_AFTER_FIRST_ROUND) break;
  }

  return rankByComStatus(pool, NAMES_RETURNED);
}

export async function POST(req: Request) {
  // ── 1. Validation ──────────────────────────────────────────────────────────
  let body: Partial<GenerateRequest>;
  try {
    body = await req.json();
  } catch {
    return jsonError("INVALID_INPUT", 400);
  }

  const { keywords, vibe, category, length, style, lang, turnstileToken } = body;

  const valid =
    typeof keywords === "string" &&
    keywords.trim().length > 0 &&
    keywords.trim().length <= MAX_KEYWORDS_LENGTH &&
    !!vibe && VIBES.includes(vibe) &&
    !!category && CATEGORIES.includes(category) &&
    !!length && NAME_LENGTHS.includes(length) &&
    !!style && NAME_STYLES.includes(style) &&
    isLang(lang);

  if (!valid) return jsonError("INVALID_INPUT", 400);

  const customCategory = category === "Other" ? cleanCustomCategory(body.customCategory) : null;
  const alreadyShown = cleanExclude(body.exclude);
  const inspiration = cleanInspiration(body.inspiration);

  // ── 2. Quota (AVANT l'appel IA) — sauf pour l'administrateur ──────────────
  const isAdmin = getAdminState(req).unlimited;
  const ip = getClientIp(req);
  const creditsSession = readSessionFromRequest(req);
  let remaining = DAILY_LIMIT;
  let usedPurchasedCredit = false;
  if (!isAdmin) {
    const result = await checkRateLimit(ip);
    if (result.allowed) {
      remaining = result.remaining;
    } else if (creditsSession && (await consumeCredit(creditsSession.h))) {
      remaining = 0;
      usedPurchasedCredit = true;
    } else {
      return jsonError("RATE_LIMITED", 429);
    }
  }
  /** Rend la génération consommée au bon compteur (jamais consommée pour l'admin). */
  const refund = async () => {
    if (isAdmin) return;
    if (usedPurchasedCredit && creditsSession) await refundCredit(creditsSession.h);
    else await refundRateLimit(ip);
  };

  // ── 3. Anti-robots (AVANT l'appel IA) — sauf pour l'administrateur ───────
  if (turnstileEnabled() && !isAdmin && !(await verifyTurnstileToken(turnstileToken, ip))) {
    await refund();
    return jsonError("BOT_CHECK_FAILED", 403);
  }

  // ── 4. Génération + tri par disponibilité du .com ─────────────────────────
  try {
    const [ranked, tlds] = await Promise.all([
      generateAndRank(
        { keywords: keywords.trim(), category, customCategory, vibe, length, style, lang, inspiration },
        alreadyShown
      ),
      pickTlds({ country: countryFromHeaders(req.headers), lang, category }),
    ]);

    const names: VerifiedName[] = ranked.map((c) => ({
      nom: c.nom,
      explication: c.explication,
      checked: {
        ".com": {
          status: c.comStatus,
          affiliateUrl: c.comStatus === "taken" ? null : buildAffiliateUrl(c.comDomain),
        },
      },
    }));

    const response: GenerateResponse = {
      names,
      freeComCount: ranked.filter((c) => c.comStatus === "available").length,
      tlds,
      rateLimitRemaining: remaining,
      rateLimitLimit: DAILY_LIMIT,
      unlimited: isAdmin,
      credits: creditsSession ? await getCredits(creditsSession.h) : null,
    };
    return Response.json(response, { status: 200 });
  } catch (error) {
    await refund();
    // La cause détaillée est déjà affichée dans le terminal par lib/ai/client.ts
    if (error instanceof NameGenerationError) return jsonError("GENERATION_FAILED", 502);
    console.error("[/api/generate] Erreur inattendue :", error);
    return jsonError("GENERIC", 500);
  }
}
