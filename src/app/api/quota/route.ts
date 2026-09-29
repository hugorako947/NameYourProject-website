// =============================================================================
// NameYourProject — GET /api/quota
// Générations gratuites restantes aujourd'hui, sans en consommer.
// Indique aussi si le visiteur est l'administrateur (voir lib/admin.ts).
// =============================================================================

import { quotaFor } from "@/lib/quota";

export async function GET(req: Request) {
  return Response.json(await quotaFor(req), { headers: { "Cache-Control": "no-store" } });
}
