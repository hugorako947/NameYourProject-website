// =============================================================================
// NameYourProject — Adresse publique du site (sitemap, liens pour Google,
// liens dans les e-mails, retour après paiement)
//
// Lue dans NEXT_PUBLIC_SITE_URL. Tolérante aux erreurs de saisie : si le
// "https://" manque, il est ajouté ; si la valeur est inutilisable, le site
// ne plante pas et utilise l'adresse fournie par Vercel, sinon localhost.
// =============================================================================

let warned = false;

/** Adresse configurée dans NEXT_PUBLIC_SITE_URL, normalisée (ex: "https://mon-site.vercel.app"), ou null. */
export function configuredSiteUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(candidate).origin;
  } catch {
    if (!warned) {
      warned = true;
      console.error(`[site] NEXT_PUBLIC_SITE_URL invalide (« ${raw} »). Exemple attendu : https://mon-site.vercel.app`);
    }
    return null;
  }
}

export function siteUrl(): string {
  const configured = configuredSiteUrl();
  if (configured) return configured;
  // Adresse de production fournie automatiquement par Vercel (sans "https://")
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//i, "")}`;
  return "http://localhost:3000";
}
