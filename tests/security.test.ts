import { beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  process.env.CREDITS_SECRET = "secret-de-test-suffisamment-long";
  process.env.ADMIN_BYPASS_SECRET = "mon-secret-admin";
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("Accès administrateur", () => {
  it("n'accepte que le bon secret, et un cookie signé", async () => {
    const { isValidAdminSecret, adminCookieValue, isAdminCookie } = await import("@/lib/admin");
    expect(isValidAdminSecret("mon-secret-admin")).toBe(true);
    expect(isValidAdminSecret("mauvais")).toBe(false);
    const cookie = adminCookieValue()!;
    expect(cookie).not.toContain("mon-secret-admin");
    expect(isAdminCookie(cookie)).toBe(true);
    expect(isAdminCookie("0000")).toBe(false);
  });
});

describe("Quota de générations (mode mémoire)", () => {
  it("accepte 3 générations, refuse la 4e, rend une génération ratée", async () => {
    const { checkRateLimit, getRemaining, refundRateLimit, INSIGHTS_BUCKET } = await import("@/lib/ratelimit");
    const ip = "10.0.0.1";
    expect((await checkRateLimit(ip)).remaining).toBe(2);
    await checkRateLimit(ip);
    expect((await checkRateLimit(ip)).remaining).toBe(0);
    expect((await checkRateLimit(ip)).allowed).toBe(false);
    await refundRateLimit(ip);
    expect(await getRemaining(ip)).toBe(1);
    // Les analyses ont leur propre compteur
    expect(await getRemaining(ip, INSIGHTS_BUCKET)).toBe(5);
  });
});

describe("Générations achetées et e-mails", () => {
  it("normalise et masque les e-mails, sans jamais les stocker en clair", async () => {
    const { normalizeEmail, maskEmail, emailHash } = await import("@/lib/credits");
    expect(normalizeEmail("  Jean.Dupont@Example.COM ")).toBe("jean.dupont@example.com");
    expect(normalizeEmail("pas-un-email")).toBeNull();
    expect(maskEmail("jean.dupont@example.com")).toBe("j•••@example.com");
    const h = emailHash("jean.dupont@example.com");
    expect(h).toBe(emailHash("jean.dupont@example.com"));
    expect(h).not.toContain("dupont");
  });

  it("crédite, consomme et ne descend jamais sous zéro", async () => {
    const { addCredits, consumeCredit, getCredits } = await import("@/lib/credits");
    await addCredits("client-test", 2);
    expect(await consumeCredit("client-test")).toBe(true);
    expect(await consumeCredit("client-test")).toBe(true);
    expect(await consumeCredit("client-test")).toBe(false);
    expect(await getCredits("client-test")).toBe(0);
  });

  it("ne crédite jamais deux fois le même paiement", async () => {
    const { markPaymentProcessed } = await import("@/lib/credits");
    expect(await markPaymentProcessed("cs_test_1")).toBe(true);
    expect(await markPaymentProcessed("cs_test_1")).toBe(false);
  });

  it("refuse un cookie de connexion falsifié", async () => {
    const { createSessionToken, readSessionToken } = await import("@/lib/credits-session");
    const token = createSessionToken("empreinte", "j•••@example.com")!;
    expect(readSessionToken(token)?.h).toBe("empreinte");
    const [payload] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ h: "autre", m: "x", exp: Date.now() + 1e9 })).toString("base64url");
    expect(readSessionToken(`${forged}.${token.split(".")[1]}`)).toBeNull();
    expect(readSessionToken(`${payload}.signature-inventee`)).toBeNull();
  });
});
