// =============================================================================
// NameYourProject — POST /api/admin/mode   { unlimited: true | false }
// Bascule, pour l'admin uniquement, entre "illimité" et "mode visiteur",
// sans ressaisir le secret. Refusé (403) pour tout autre visiteur.
// =============================================================================

import { NextResponse } from "next/server";
import { ADMIN_COOKIE_MAX_AGE, ADMIN_PAUSE_COOKIE, getAdminState } from "@/lib/admin";
import { quotaFor } from "@/lib/quota";
import type { ApiErrorBody } from "@/types";

export async function POST(req: Request) {
  if (!getAdminState(req).isAdmin) {
    const body: ApiErrorBody = { error: "INVALID_INPUT" };
    return Response.json(body, { status: 403 });
  }

  let unlimited: unknown;
  try {
    unlimited = (await req.json())?.unlimited;
  } catch {
    unlimited = undefined;
  }
  if (typeof unlimited !== "boolean") {
    const body: ApiErrorBody = { error: "INVALID_INPUT" };
    return Response.json(body, { status: 400 });
  }

  const response = NextResponse.json(await quotaFor(req, !unlimited));
  if (unlimited) {
    response.cookies.delete(ADMIN_PAUSE_COOKIE);
  } else {
    response.cookies.set(ADMIN_PAUSE_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });
  }
  return response;
}
