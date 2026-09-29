// =============================================================================
// NameYourProject — POST /api/admin/lock
// Déconnecte complètement CE navigateur du mode admin (ordinateur partagé,
// par exemple). Pour juste tester la limite, utilise plutôt le bouton
// "Passer en mode visiteur" de la page d'accueil : il ne demande pas le secret.
// =============================================================================

import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_PAUSE_COOKIE } from "@/lib/admin";

export async function POST(req: Request) {
  const response = NextResponse.redirect(new URL("/admin", req.url), 303);
  response.cookies.delete(ADMIN_COOKIE);
  response.cookies.delete(ADMIN_PAUSE_COOKIE);
  return response;
}
