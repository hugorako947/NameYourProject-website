import type { DomainStatus } from "@/types";

// =============================================================================
// NameYourProject — Classement des noms selon la disponibilité de leur .com
//
// Ordre : .com libre → .com non vérifié → .com pris. À statut égal, on garde
// l'ordre proposé par l'IA (ses meilleures idées d'abord).
// =============================================================================

const PRIORITY: Record<DomainStatus, number> = { available: 0, unknown: 1, checking: 1, taken: 2 };

export function rankByComStatus<T extends { comStatus: DomainStatus }>(candidates: T[], count: number): T[] {
  return candidates
    .map((candidate, index) => ({ candidate, index }))
    .sort((a, b) => PRIORITY[a.candidate.comStatus] - PRIORITY[b.candidate.comStatus] || a.index - b.index)
    .slice(0, count)
    .map(({ candidate }) => candidate);
}
