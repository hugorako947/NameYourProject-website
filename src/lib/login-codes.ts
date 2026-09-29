import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { kv } from "@/lib/kv";
import { creditsSecret, emailHash, isBuyer } from "@/lib/credits";
import { sendLoginCodeEmail } from "@/lib/email";
import type { Lang } from "@/lib/i18n";

// =============================================================================
// NameYourProject — Codes de connexion à 6 chiffres envoyés par e-mail
//
// Sécurité :
//   • code valable 15 minutes, utilisable une seule fois, 5 essais maximum
//   • 1 demande par minute et par e-mail, 10 demandes par heure et par IP
//   • le code n'est jamais stocké en clair (empreinte HMAC)
//   • la réponse est identique que l'e-mail ait des générations ou non :
//     impossible de savoir qui est client du site
// =============================================================================

const CODE_TTL = 15 * 60;
const MAX_ATTEMPTS = 5;

function fingerprint(value: string): string {
  return createHmac("sha256", creditsSecret() ?? "").update(value).digest("hex");
}

export type CodeRequestResult = { ok: true } | { ok: false; error: "CODE_RATE_LIMITED" };
export type CodeVerifyResult = { ok: true; h: string } | { ok: false; error: "INVALID_CODE" | "TOO_MANY_ATTEMPTS" };

export async function requestLoginCode(email: string, lang: Lang, ip: string): Promise<CodeRequestResult> {
  const h = emailHash(email);

  if (!(await kv.set(`nyp:code-wait:${h}`, "1", { nx: true, ttlSeconds: 60 }))) {
    return { ok: false, error: "CODE_RATE_LIMITED" };
  }
  const ipKey = `nyp:code-ip:${fingerprint(`ip:${ip}`).slice(0, 32)}`;
  const count = await kv.incrBy(ipKey, 1);
  if (count === 1) await kv.expire(ipKey, 3600);
  if (count > 10) return { ok: false, error: "CODE_RATE_LIMITED" };

  // Aucun achat avec cet e-mail : on ne dit rien (même réponse), on n'envoie rien
  if (!(await isBuyer(h))) return { ok: true };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await kv.set(`nyp:code:${h}`, fingerprint(`code:${h}:${code}`), { ttlSeconds: CODE_TTL });
  await kv.del(`nyp:code-att:${h}`);
  await sendLoginCodeEmail(email, code, lang);
  return { ok: true };
}

export async function verifyLoginCode(email: string, code: string): Promise<CodeVerifyResult> {
  const h = emailHash(email);
  const attemptsKey = `nyp:code-att:${h}`;
  const attempts = await kv.incrBy(attemptsKey, 1);
  if (attempts === 1) await kv.expire(attemptsKey, CODE_TTL);
  if (attempts > MAX_ATTEMPTS) {
    await kv.del(`nyp:code:${h}`);
    return { ok: false, error: "TOO_MANY_ATTEMPTS" };
  }

  const stored = await kv.get(`nyp:code:${h}`);
  const clean = code.replace(/\D/g, "");
  if (!stored || clean.length !== 6) return { ok: false, error: "INVALID_CODE" };

  const expected = Buffer.from(stored);
  const given = Buffer.from(fingerprint(`code:${h}:${clean}`));
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, error: "INVALID_CODE" };

  await kv.del(`nyp:code:${h}`);
  await kv.del(attemptsKey);
  return { ok: true, h };
}
