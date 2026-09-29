// =============================================================================
// NameYourProject — POST /api/check-domain
//
// Vérifie la disponibilité d'un domaine complet (ex: "monapp.com").
// Retourne également l'URL d'achat affiliée Namecheap si le domaine est libre.
//
// Vérification réelle via RDAP (voir lib/domains/checker.ts). Le lien
// Namecheap est fourni quand le domaine est libre ("Réserver") ET quand le
// registre n'a pas pu répondre ("Vérifier") : le visiteur n'est jamais
// laissé sans solution, et on n'affiche jamais un statut inventé.
// =============================================================================

import { type NextRequest } from "next/server";
import type { CheckDomainRequest, CheckDomainResponse } from "@/types";
import { checkDomainAvailability } from "@/lib/domains/checker";
import { buildAffiliateUrl } from "@/lib/domains/affiliate";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

// Regex simple : au moins un caractère avant le point, TLD de 2 à 6 lettres
const DOMAIN_REGEX = /^[a-z0-9][a-z0-9-]{0,62}\.[a-z]{2,24}$/i;

export async function POST(req: NextRequest) {
  // ── Valider le body ────────────────────────────────────────────────────────
  let body: CheckDomainRequest;
  try {
    body = await req.json();
  } catch {
    return jsonError("Body JSON invalide.", 400);
  }

  const { domain } = body;

  if (!domain || typeof domain !== "string") {
    return jsonError("Le champ 'domain' est requis.", 400);
  }

  const normalized = domain.trim().toLowerCase();

  if (!DOMAIN_REGEX.test(normalized)) {
    return jsonError(`'${domain}' n'est pas un nom de domaine valide.`, 400);
  }

  // ── Vérifier la disponibilité ─────────────────────────────────────────────
  try {
    const { status } = await checkDomainAvailability(normalized);

    const response: CheckDomainResponse & { affiliateUrl: string | null } = {
      domain: normalized,
      status,
      affiliateUrl: status === "taken" ? null : buildAffiliateUrl(normalized),
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("[/api/check-domain] Error:", error);
    return jsonError("Vérification du domaine impossible. Réessaie.", 502);
  }
}
