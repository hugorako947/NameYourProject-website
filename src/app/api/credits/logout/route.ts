// =============================================================================
// NameYourProject — POST /api/credits/logout
// Déconnecte CE navigateur de l'e-mail (les générations restent liées à l'e-mail).
// =============================================================================

import { NextResponse } from "next/server";
import { CREDITS_COOKIE } from "@/lib/credits-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(CREDITS_COOKIE);
  return response;
}
