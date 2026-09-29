import { createHmac, timingSafeEqual } from "node:crypto";
import { creditsSecret } from "@/lib/credits";

// =============================================================================
// NameYourProject — Connexion d'un navigateur à ses générations achetées
//
// Après un paiement ou la saisie d'un code reçu par e-mail, le navigateur
// reçoit un cookie signé "nyp-credits" (90 jours). Il contient l'empreinte
// de l'e-mail et sa version masquée pour l'affichage (j•••@gmail.com),
// jamais l'adresse complète. Signature HMAC : impossible à falsifier.
// =============================================================================

export const CREDITS_COOKIE = "nyp-credits";
export const CREDITS_COOKIE_MAX_AGE = 90 * 24 * 60 * 60;

export interface CreditsSession {
  /** Empreinte de l'e-mail (clé des générations achetées) */
  h: string;
  /** E-mail masqué, pour l'affichage */
  m: string;
  /** Expiration (ms) */
  exp: number;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(`session:${payload}`).digest("base64url");
}

export function createSessionToken(h: string, masked: string): string | null {
  const secret = creditsSecret();
  if (!secret) return null;
  const payload = Buffer.from(
    JSON.stringify({ h, m: masked, exp: Date.now() + CREDITS_COOKIE_MAX_AGE * 1000 } satisfies CreditsSession)
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function readSessionToken(token: string | undefined | null): CreditsSession | null {
  const secret = creditsSecret();
  if (!secret || !token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as CreditsSession;
    if (typeof data.h !== "string" || typeof data.m !== "string" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

/** Lit la connexion depuis une requête (routes API). */
export function readSessionFromRequest(req: { headers: { get(name: string): string | null } }): CreditsSession | null {
  const match = (req.headers.get("cookie") ?? "")
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CREDITS_COOKIE}=`));
  return readSessionToken(match ? decodeURIComponent(match.slice(CREDITS_COOKIE.length + 1)) : null);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: CREDITS_COOKIE_MAX_AGE,
};
