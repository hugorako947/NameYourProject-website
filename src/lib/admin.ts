import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// =============================================================================
// NameYourProject — Accès administrateur (générations illimitées)
//
// Pas de compte ni d'inscription : un SECRET que toi seul connais, rangé dans
// ADMIN_BYPASS_SECRET (.env.local en local, variables d'environnement de
// l'hébergeur en production).
//
// 1. Tu vas sur /admin et tu saisis ce secret (une seule fois par navigateur)
// 2. Le serveur pose un cookie "nyp-admin" valable 1 an dans CE navigateur
// 3. Chaque génération vérifie ce cookie : s'il est valide → pas de limite
//
// Basculer entre "illimité" et "visiteur" (pour tester la limite comme un
// visiteur normal) se fait ensuite en UN CLIC sur la page d'accueil, sans
// ressaisir le secret : un 2e cookie "nyp-admin-pause" met l'illimité en pause.
//
// Le cookie ne contient jamais le secret : seulement une empreinte (HMAC)
// calculée à partir de lui, impossible à inverser. Pour révoquer tous les
// accès admin (ordinateur perdu, doute...), il suffit de changer le secret.
// Si ADMIN_BYPASS_SECRET est vide, l'accès admin est tout simplement désactivé.
// =============================================================================

export const ADMIN_COOKIE = "nyp-admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 an
/** Présent = l'admin a choisi le "mode visiteur" (illimité en pause). */
export const ADMIN_PAUSE_COOKIE = "nyp-admin-pause";

/** Changer ce texte invalide tous les cookies admin sans changer le secret. */
const SIGNING_PAYLOAD = "nyp-admin-v1";

function getSecret(): string | null {
  const secret = process.env.ADMIN_BYPASS_SECRET?.trim();
  return secret ? secret : null;
}

/** Comparaison à temps constant (on compare des empreintes de même longueur). */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Le secret saisi sur /admin est-il le bon ? */
export function isValidAdminSecret(candidate: unknown): boolean {
  const secret = getSecret();
  return !!secret && typeof candidate === "string" && safeEqual(candidate.trim(), secret);
}

/** Valeur à stocker dans le cookie une fois le secret validé. */
export function adminCookieValue(): string | null {
  const secret = getSecret();
  return secret ? createHmac("sha256", secret).update(SIGNING_PAYLOAD).digest("hex") : null;
}

/** Le cookie envoyé par le navigateur est-il un cookie admin valide ? */
export function isAdminCookie(value: string | undefined | null): boolean {
  const expected = adminCookieValue();
  return !!expected && !!value && safeEqual(value, expected);
}

type RequestLike = { headers: { get(name: string): string | null } };

function readCookie(req: RequestLike, name: string): string | null {
  const match = (req.headers.get("cookie") ?? "")
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

export interface AdminState {
  /** Ce navigateur a été déverrouillé avec le secret admin */
  isAdmin: boolean;
  /** Générations illimitées actives (admin ET pas en mode visiteur) */
  unlimited: boolean;
}

/** État admin d'une requête, pour les routes API. */
export function getAdminState(req: RequestLike): AdminState {
  const isAdmin = isAdminCookie(readCookie(req, ADMIN_COOKIE));
  return { isAdmin, unlimited: isAdmin && readCookie(req, ADMIN_PAUSE_COOKIE) !== "1" };
}
