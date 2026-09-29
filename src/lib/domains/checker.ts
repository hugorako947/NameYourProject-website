// =============================================================================
// NameYourProject — Vérification RÉELLE de disponibilité d'un domaine (RDAP)
//
// RDAP est le service officiel des registres de noms de domaine (successeur
// du WHOIS) : Verisign pour le .com, l'AFNIC pour le .fr, etc. Gratuit, sans
// compte ni clé API. On interroge directement le registre du domaine :
//   - réponse 200 → le domaine est enregistré            → "taken"
//   - réponse 404 → le registre ne le connaît pas         → "available"
//   - autre (délai dépassé, limite, panne)                → "unknown"
//
// Limite à connaître : quelques domaines "libres" au sens du registre sont en
// réalité réservés ou vendus à prix premium ; le registraire (Namecheap)
// affichera alors le vrai prix au moment de la réservation. C'est rare.
//
// L'adresse du registre de chaque extension est lue dans l'annuaire officiel
// de l'IANA (data.iana.org), mis en cache 24 h, avec des adresses de secours.
// =============================================================================

import type { DomainStatus } from "@/types";

export interface DomainAvailabilityResult {
  domain: string;
  status: DomainStatus;
}

const IANA_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const REQUEST_TIMEOUT_MS = 6000;
const BOOTSTRAP_TTL_MS = 24 * 60 * 60 * 1000;
/** Un résultat reste valable 10 min (évite d'interroger 2 fois le registre pour rien). */
const RESULT_TTL_MS = 10 * 60 * 1000;

/** Adresses de secours si l'annuaire IANA est momentanément injoignable. */
const FALLBACK_RDAP_BASES: Record<string, string> = {
  com: "https://rdap.verisign.com/com/v1/",
  net: "https://rdap.verisign.com/net/v1/",
  fr: "https://rdap.nic.fr/",
};

// ─── Annuaire IANA : extension → adresse RDAP du registre ────────────────────

interface BootstrapFile {
  services: [string[], string[]][];
}

let bootstrapCache: { bases: Record<string, string>; expiresAt: number } | null = null;

async function loadBootstrap(): Promise<Record<string, string>> {
  if (bootstrapCache && bootstrapCache.expiresAt > Date.now()) return bootstrapCache.bases;
  try {
    const res = await fetch(IANA_BOOTSTRAP_URL, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`IANA ${res.status}`);
    const data = (await res.json()) as BootstrapFile;
    const bases: Record<string, string> = {};
    for (const [tlds, urls] of data.services ?? []) {
      const url = urls.find((u) => u.startsWith("https://")) ?? urls[0];
      if (!url) continue;
      for (const tld of tlds) bases[tld.toLowerCase()] = url.endsWith("/") ? url : `${url}/`;
    }
    bootstrapCache = { bases, expiresAt: Date.now() + BOOTSTRAP_TTL_MS };
    return bases;
  } catch (error) {
    console.warn("[domains] Annuaire IANA injoignable, adresses de secours utilisées :", error);
    return FALLBACK_RDAP_BASES;
  }
}

async function rdapBaseFor(tld: string): Promise<string | null> {
  const bases = await loadBootstrap();
  return bases[tld] ?? FALLBACK_RDAP_BASES[tld] ?? null;
}

/** Cette extension (ex: ".app") peut-elle être vérifiée auprès de son registre ? */
export async function canCheckTld(tld: string): Promise<boolean> {
  return (await rdapBaseFor(tld.replace(/^\./, "").toLowerCase())) !== null;
}

// ─── Vérification ────────────────────────────────────────────────────────────

const resultCache = new Map<string, { status: DomainStatus; expiresAt: number }>();

/**
 * Vérifie la disponibilité d'un nom de domaine complet (ex: "monapp.com").
 * Ne lève jamais d'erreur : en cas de doute, renvoie "unknown".
 */
export async function checkDomainAvailability(
  domain: string,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<DomainAvailabilityResult> {
  const normalized = domain.trim().toLowerCase();

  const cached = resultCache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) return { domain: normalized, status: cached.status };

  const tld = normalized.split(".").pop() ?? "";
  const base = await rdapBaseFor(tld);
  if (!base) return { domain: normalized, status: "unknown" };

  let status: DomainStatus = "unknown";
  try {
    const res = await fetch(`${base}domain/${encodeURIComponent(normalized)}`, {
      headers: { Accept: "application/rdap+json" },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    if (res.status === 200) status = "taken";
    else if (res.status === 404) status = "available";
    else console.warn(`[domains] RDAP ${normalized} → réponse ${res.status}`);
  } catch (error) {
    console.warn(`[domains] RDAP ${normalized} → injoignable :`, error instanceof Error ? error.message : error);
  }

  // On ne garde en cache que les réponses sûres ("unknown" sera retenté)
  if (status !== "unknown") resultCache.set(normalized, { status, expiresAt: Date.now() + RESULT_TTL_MS });
  return { domain: normalized, status };
}

// ─── Vérification groupée (utilisée pour trier les noms générés) ─────────────

/**
 * Vérifie plusieurs domaines en parallèle, par petits groupes (pour ne pas
 * saturer le registre), dans une limite de temps globale. Ce qui n'a pas pu
 * être vérifié à temps est renvoyé "unknown" : le navigateur le revérifiera.
 */
export async function checkDomainsBatch(
  domains: string[],
  { concurrency = 6, deadlineMs = 8000, timeoutMs = 4000 } = {}
): Promise<Map<string, DomainStatus>> {
  const results = new Map<string, DomainStatus>();
  const deadline = Date.now() + deadlineMs;
  let next = 0;

  async function worker() {
    while (next < domains.length) {
      const domain = domains[next++];
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        results.set(domain, "unknown");
        continue;
      }
      const { status } = await checkDomainAvailability(domain, Math.min(timeoutMs, remaining));
      results.set(domain, status);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, domains.length) }, worker));
  return results;
}
