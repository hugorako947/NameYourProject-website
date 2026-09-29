import type { CheckDomainRequest, CheckDomainResponse, DomainStatus, NameResult } from "@/types";
import { toDomainSlug } from "@/lib/domains/slug";

// =============================================================================
// NameYourProject — Vérification des domaines depuis le navigateur
// Partagée par le générateur et la page de partage des favoris.
// Au plus 6 vérifications en même temps, pour ménager les registres.
// =============================================================================

export interface DomainCheckResult {
  status: DomainStatus;
  affiliateUrl: string | null;
}

const MAX_PARALLEL_CHECKS = 6;
let runningChecks = 0;
const waitingChecks: (() => void)[] = [];

async function withCheckSlot<T>(task: () => Promise<T>): Promise<T> {
  if (runningChecks >= MAX_PARALLEL_CHECKS) await new Promise<void>((resolve) => waitingChecks.push(resolve));
  runningChecks++;
  try {
    return await task();
  } finally {
    runningChecks--;
    waitingChecks.shift()?.();
  }
}

export function checkDomain(domain: string): Promise<DomainCheckResult> {
  return withCheckSlot(async () => {
    try {
      const payload: CheckDomainRequest = { domain };
      const res = await fetch("/api/check-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return { status: "unknown", affiliateUrl: null };
      const data = (await res.json()) as CheckDomainResponse;
      return { status: data.status, affiliateUrl: data.affiliateUrl };
    } catch {
      return { status: "unknown", affiliateUrl: null };
    }
  });
}

/**
 * Vérifie chaque domaine encore marqué "vérification…" et appelle `onResult`
 * dès qu'une réponse arrive (pour mettre à jour l'affichage au fil de l'eau).
 */
export function verifyPendingDomains(
  items: NameResult[],
  onResult: (id: string, tld: string, result: DomainCheckResult) => void
): void {
  items.forEach((item) => {
    const slug = toDomainSlug(item.nom);
    item.domains
      .filter((d) => d.status === "checking")
      .forEach((d) => {
        checkDomain(`${slug}${d.tld}`).then((result) => onResult(item.id, d.tld, result));
      });
  });
}

/** Applique un résultat de vérification à une liste de noms. */
export function applyDomainResult(list: NameResult[], id: string, tld: string, result: DomainCheckResult): NameResult[] {
  return list.map((r) =>
    r.id === id
      ? { ...r, domains: r.domains.map((d) => (d.tld === tld ? { ...d, status: result.status, affiliateUrl: result.affiliateUrl } : d)) }
      : r
  );
}
