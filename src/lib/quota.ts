import { getAdminState } from "@/lib/admin";
import { DAILY_LIMIT, getClientIp, getRemaining } from "@/lib/ratelimit";
import { readSessionFromRequest } from "@/lib/credits-session";
import { getCredits } from "@/lib/credits";
import { paymentsStatus } from "@/lib/stripe";
import type { QuotaResponse } from "@/types";

// =============================================================================
// NameYourProject — État du quota d'une requête (partagé par /api/quota et
// /api/admin/mode). pausedOverride : état admin qu'on vient de choisir, avant
// même que le navigateur ne renvoie le nouveau cookie.
// =============================================================================

export async function quotaFor(req: Request, pausedOverride?: boolean): Promise<QuotaResponse> {
  const { isAdmin, unlimited } = getAdminState(req);
  const isUnlimited = pausedOverride === undefined ? unlimited : isAdmin && !pausedOverride;
  const session = readSessionFromRequest(req);
  return {
    remaining: isUnlimited ? DAILY_LIMIT : await getRemaining(getClientIp(req)),
    limit: DAILY_LIMIT,
    unlimited: isUnlimited,
    isAdmin,
    credits: session ? await getCredits(session.h) : null,
    creditsEmail: session?.m ?? null,
    paymentsEnabled: paymentsStatus().enabled,
  };
}
