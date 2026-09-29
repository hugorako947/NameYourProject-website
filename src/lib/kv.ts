import { redis } from "@/lib/redis";

// =============================================================================
// NameYourProject — Petit stockage clé → valeur (Upstash, sinon mémoire)
// Utilisé pour les générations achetées, les codes de connexion par e-mail
// et le suivi des paiements déjà traités.
// =============================================================================

const memory = new Map<string, { value: string; expiresAt: number | null }>();

function memGet(key: string): string | null {
  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry.value;
}

export const kv = {
  async get(key: string): Promise<string | null> {
    if (!redis) return memGet(key);
    const value = await redis.get<string>(key);
    return value === null || value === undefined ? null : String(value);
  },

  /** Écrit une valeur. nx = seulement si la clé n'existe pas. Renvoie true si écrit. */
  async set(key: string, value: string, opts: { ttlSeconds?: number; nx?: boolean } = {}): Promise<boolean> {
    if (!redis) {
      if (opts.nx && memGet(key) !== null) return false;
      memory.set(key, { value, expiresAt: opts.ttlSeconds ? Date.now() + opts.ttlSeconds * 1000 : null });
      return true;
    }
    const result =
      opts.ttlSeconds && opts.nx
        ? await redis.set(key, value, { ex: opts.ttlSeconds, nx: true })
        : opts.ttlSeconds
          ? await redis.set(key, value, { ex: opts.ttlSeconds })
          : opts.nx
            ? await redis.set(key, value, { nx: true })
            : await redis.set(key, value);
    return result !== null;
  },

  /** Ajoute n (peut être négatif) et renvoie la nouvelle valeur. */
  async incrBy(key: string, n: number): Promise<number> {
    if (!redis) {
      const entry = memory.get(key);
      const next = Number(memGet(key) ?? 0) + n;
      memory.set(key, { value: String(next), expiresAt: entry?.expiresAt ?? null });
      return next;
    }
    return redis.incrby(key, n);
  },

  /** Donne une durée de vie à une clé existante. */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!redis) {
      const entry = memory.get(key);
      if (entry) entry.expiresAt = Date.now() + ttlSeconds * 1000;
      return;
    }
    await redis.expire(key, ttlSeconds);
  },

  async del(key: string): Promise<void> {
    if (!redis) {
      memory.delete(key);
      return;
    }
    await redis.del(key);
  },
};
