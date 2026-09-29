import { Redis } from "@upstash/redis";

// =============================================================================
// NameYourProject — Connexion Upstash Redis (partagée par tout le site)
//
// Activée automatiquement si UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN
// sont définis (ou KV_REST_API_URL / KV_REST_API_TOKEN, noms utilisés par
// l'intégration Upstash de Vercel). Sinon : null, et le site utilise la
// mémoire du serveur (suffisant en développement).
// =============================================================================

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const redis: Redis | null =
  url && token
    ? new Redis({
        url,
        token,
        // Les valeurs restent des textes : chaque module les convertit lui-même
        automaticDeserialization: false,
        // Échouer vite plutôt que faire attendre le visiteur
        retry: { retries: 1, backoff: () => 150 },
      })
    : null;

/** true = les données survivent aux redémarrages et sont partagées entre serveurs. */
export const hasPersistentStore = redis !== null;

/** Jeton Upstash, réutilisé comme secret par défaut pour les empreintes d'IP. */
export const redisToken = token ?? null;
