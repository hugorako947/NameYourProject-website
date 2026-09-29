// =============================================================================
// NameYourProject — Quota de générations gratuites
//
// DEUX MODES, choisis AUTOMATIQUEMENT au démarrage :
//
//   • Upstash Redis — si UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN
//     sont définis (ou KV_REST_API_URL / KV_REST_API_TOKEN, les noms utilisés
//     par l'intégration Upstash de Vercel). Compteur partagé entre tous les
//     serveurs et conservé lors des redémarrages : indispensable sur Vercel.
//
//   • Mémoire du serveur — sinon. Parfait pour le développement ; en ligne,
//     le compteur repart à zéro à chaque redémarrage et n'est pas partagé
//     entre plusieurs serveurs.
//
// Aucune ligne de code à changer pour passer de l'un à l'autre : il suffit
// d'ajouter (ou retirer) les deux variables chez l'hébergeur.
//
// Confidentialité : chez Upstash, l'adresse IP n'est jamais stockée en clair,
// seulement une empreinte non réversible, effacée automatiquement après 24 h.
// Si Upstash est injoignable, le site continue de fonctionner avec le compteur
// en mémoire au lieu de tomber en panne.
// =============================================================================

import { createHmac } from "node:crypto";
import { redis, redisToken } from "@/lib/redis";
import { FREE_GENERATIONS_PER_DAY, FREE_INSIGHTS_PER_DAY } from "@/lib/pricing";

export const DAILY_LIMIT = FREE_GENERATIONS_PER_DAY;

/** Chaque compteur a son nom et sa limite par jour (générations, analyses…). */
export interface QuotaBucket {
  name: string;
  limit: number;
}
export const GENERATIONS_BUCKET: QuotaBucket = { name: "gen", limit: FREE_GENERATIONS_PER_DAY };
export const INSIGHTS_BUCKET: QuotaBucket = { name: "insight", limit: FREE_INSIGHTS_PER_DAY };
const WINDOW_SECONDS = 24 * 60 * 60;
const WINDOW_MS = WINDOW_SECONDS * 1000;

export interface RateLimitResult {
  /** true si la requête est autorisée, false si le quota est épuisé */
  allowed: boolean;
  /** Générations restantes APRÈS cette requête */
  remaining: number;
}

let modeLogged = false;
function logModeOnce() {
  if (modeLogged) return;
  modeLogged = true;
  console.info(
    redis
      ? "[quota] Compteur : Upstash Redis (partagé entre serveurs, conservé aux redémarrages)"
      : "[quota] Compteur : mémoire du serveur (ajoute les clés Upstash pour la mise en ligne sur Vercel)"
  );
}

let lastRedisWarning = 0;
function warnRedisDown(error: unknown) {
  if (Date.now() - lastRedisWarning < 60_000) return; // au plus 1 message par minute
  lastRedisWarning = Date.now();
  console.warn(
    "[quota] Upstash injoignable → compteur en mémoire utilisé temporairement :",
    error instanceof Error ? error.message : error
  );
}

/** Empreinte non réversible de l'IP (jamais stockée en clair chez Upstash). */
function redisKey(ip: string, bucket: QuotaBucket): string {
  const salt = process.env.IP_HASH_SALT || redisToken || "nyp-local";
  const prefix = bucket.name === GENERATIONS_BUCKET.name ? "nyp:quota" : `nyp:quota-${bucket.name}`;
  return `${prefix}:${createHmac("sha256", salt).update(ip).digest("hex").slice(0, 32)}`;
}

const memKey = (ip: string, bucket: QuotaBucket) => `${bucket.name}:${ip}`;

// ─── Mode mémoire ────────────────────────────────────────────────────────────

const memoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Efface toutes les IP dont la fenêtre de 24 h est terminée (au plus une fois
 * par minute). Garantit qu'aucune adresse IP n'est conservée plus de 24 h,
 * comme l'indique la politique de confidentialité.
 */
let lastPrune = 0;
function pruneExpired() {
  const now = Date.now();
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [ip, entry] of memoryStore) {
    if (entry.resetAt <= now) memoryStore.delete(ip);
  }
}

function currentEntry(ip: string) {
  pruneExpired();
  const entry = memoryStore.get(ip);
  if (!entry || entry.resetAt <= Date.now()) {
    memoryStore.delete(ip);
    return null;
  }
  return entry;
}

function memoryConsume(ip: string, bucket: QuotaBucket): RateLimitResult {
  const key = memKey(ip, bucket);
  const entry = currentEntry(key);
  if (!entry) {
    memoryStore.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
    return { allowed: true, remaining: bucket.limit - 1 };
  }
  if (entry.count >= bucket.limit) return { allowed: false, remaining: 0 };
  entry.count += 1;
  return { allowed: true, remaining: bucket.limit - entry.count };
}

function memoryRemaining(ip: string, bucket: QuotaBucket): number {
  const entry = currentEntry(memKey(ip, bucket));
  return entry ? Math.max(0, bucket.limit - entry.count) : bucket.limit;
}

function memoryRefund(ip: string, bucket: QuotaBucket): void {
  const entry = currentEntry(memKey(ip, bucket));
  if (entry && entry.count > 0) entry.count -= 1;
}

// ─── API utilisée par les routes (identique quel que soit le mode) ───────────

/** Consomme une unité du compteur (par défaut : une génération) si possible. */
export async function checkRateLimit(ip: string, bucket: QuotaBucket = GENERATIONS_BUCKET): Promise<RateLimitResult> {
  logModeOnce();
  if (!redis) return memoryConsume(ip, bucket);
  try {
    const key = redisKey(ip, bucket);
    // Crée le compteur à 0 avec une durée de vie de 24 h s'il n'existe pas, puis +1
    const [, count] = await redis.pipeline().set(key, 0, { nx: true, ex: WINDOW_SECONDS }).incr(key).exec<[unknown, number]>();
    if (count > bucket.limit) {
      await redis.decr(key); // on n'augmente pas un compteur déjà plein
      return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: bucket.limit - count };
  } catch (error) {
    warnRedisDown(error);
    return memoryConsume(ip, bucket);
  }
}

/** Lit le quota restant SANS consommer de génération (pour l'affichage). */
export async function getRemaining(ip: string, bucket: QuotaBucket = GENERATIONS_BUCKET): Promise<number> {
  logModeOnce();
  if (!redis) return memoryRemaining(ip, bucket);
  try {
    const count = Number((await redis.get<string>(redisKey(ip, bucket))) ?? 0);
    return Math.max(0, bucket.limit - count);
  } catch (error) {
    warnRedisDown(error);
    return memoryRemaining(ip, bucket);
  }
}

/** Rend une génération consommée — utilisé quand l'IA échoue (l'utilisateur n'a rien reçu). */
export async function refundRateLimit(ip: string, bucket: QuotaBucket = GENERATIONS_BUCKET): Promise<void> {
  if (!redis) return memoryRefund(ip, bucket);
  try {
    const key = redisKey(ip, bucket);
    const count = Number((await redis.get<string>(key)) ?? 0);
    // Uniquement si le compteur existe : ne jamais créer une clé sans durée de vie
    if (count > 0) await redis.decr(key);
  } catch (error) {
    warnRedisDown(error);
    memoryRefund(ip, bucket);
  }
}

/**
 * IP du visiteur. Derrière Vercel ou Cloudflare, x-forwarded-for contient
 * l'IP réelle. En local, tout le monde partage le même compteur.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local-dev"
  );
}
