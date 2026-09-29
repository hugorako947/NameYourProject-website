// =============================================================================
// NameYourProject — Liens d'affiliation Namecheap
//
// Génère un lien de recherche/achat de domaine sur Namecheap avec un
// paramètre d'affiliation. Si NAMECHEAP_AFFILIATE_ID est vide, un lien
// neutre sans commission est utilisé — le lien reste toujours fonctionnel.
//
// TODO: renseigner NAMECHEAP_AFFILIATE_ID dans .env.local / Vercel une fois
// le compte affilié Namecheap créé (Program: Impact Radius ou CJ Affiliate).
// Aucun autre fichier à modifier : cette fonction est le seul point de contact.
// =============================================================================

const NAMECHEAP_BASE = "https://www.namecheap.com/domains/registration/results/";

/**
 * Génère l'URL d'achat/réservation Namecheap pour un domaine donné.
 *
 * @param domain - Domaine complet, ex: "monapp.com"
 * @returns URL vers la page de résultats Namecheap avec l'ID affilié si dispo
 */
export function buildAffiliateUrl(domain: string): string {
  const affiliateId = process.env.NAMECHEAP_AFFILIATE_ID ?? "";

  const params = new URLSearchParams({
    domain,
    // Paramètre de tracking Namecheap (Impact Radius)
    // Placeholder vide si pas encore de compte affilié — le lien fonctionne quand même
    ...(affiliateId ? { aff_id: affiliateId } : {}),
  });

  return `${NAMECHEAP_BASE}?${params.toString()}`;
}
