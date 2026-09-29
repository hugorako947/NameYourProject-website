// =============================================================================
// NameYourProject — POST /api/admin/unlock
// Reçoit le secret saisi sur la page /admin (formulaire, jamais dans l'URL :
// il n'apparaît ni dans l'historique du navigateur ni dans les journaux).
// =============================================================================

import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, adminCookieValue, isValidAdminSecret } from "@/lib/admin";

export async function POST(req: Request) {
  let secret: unknown = null;
  try {
    secret = (await req.formData()).get("secret");
  } catch {
    // corps absent ou invalide → traité comme un mauvais secret
  }

  const token = adminCookieValue();
  if (!token || !isValidAdminSecret(secret)) {
    return NextResponse.redirect(new URL("/admin?error=1", req.url), 303);
  }

  const response = NextResponse.redirect(new URL("/", req.url), 303);
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true, // illisible par le JavaScript de la page
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return response;
}
