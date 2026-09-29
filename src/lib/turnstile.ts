// =============================================================================
// NameYourProject — Anti-robots Cloudflare Turnstile (vérification serveur)
//
// Activé seulement si NEXT_PUBLIC_TURNSTILE_ENABLED=true ET que les deux clés
// sont renseignées (NEXT_PUBLIC_TURNSTILE_SITE_KEY côté page,
// TURNSTILE_SECRET_KEY côté serveur). Sinon : désactivé, sans rien bloquer.
//
// Le widget, dans la page, obtient un jeton à usage unique (le plus souvent
// sans que le visiteur ait rien à faire). Chaque génération vérifie ce jeton
// auprès de Cloudflare AVANT d'appeler l'IA.
// =============================================================================

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true" &&
    !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() &&
    !!process.env.TURNSTILE_SECRET_KEY?.trim()
  );
}

/** true si Cloudflare confirme que le jeton vient d'un vrai visiteur. */
export async function verifyTurnstileToken(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret || typeof token !== "string" || token.length < 10 || token.length > 2048) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "local-dev") body.set("remoteip", ip);
    const res = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.warn("[anti-robots] Vérification Turnstile impossible :", error instanceof Error ? error.message : error);
    return false;
  }
}
