import { describe, expect, it } from "vitest";
import { cleanNames, isClicheName } from "@/lib/ai/client";
import { parseInsight } from "@/lib/ai/insight";
import { buildNamingPrompt } from "@/lib/ai/prompts";

describe("Nettoyage des noms proposés par l'IA", () => {
  it("écarte les clichés du cahier des charges", () => {
    for (const n of ["Smartify", "Nestly", "ProBox", "SmartNest"]) expect(isClicheName(n)).toBe(true);
    for (const n of ["Tissura", "Velora", "Approach"]) expect(isClicheName(n)).toBe(false);
  });

  it("retire espaces, doublons et clichés, et respecte le nombre demandé", () => {
    const raw = ["Velo Ra", "Velora", "Taskify", "Aurora", "Nova", "Lumen"].map((nom) => ({ nom, explication: "x" }));
    expect(cleanNames(raw, 3).map((n) => n.nom)).toEqual(["VeloRa", "Aurora", "Nova"]);
  });
});

describe("Lecture de l'analyse « Qu'évoque ce nom ? »", () => {
  it("comprend le format attendu, même avec du gras", () => {
    const r = parseInsight("**VERDICT:** ASSOCIATED\nSUMMARY: Des peluches.\nASSOCIATION: jouets\nUSES:\n- Boutique de peluches");
    expect(r).toMatchObject({ verdict: "ASSOCIATED", association: "jouets", uses: ["Boutique de peluches"] });
  });
  it("gère « aucun usage » et un verdict manquant", () => {
    expect(parseInsight("VERDICT: FREE\nSUMMARY: Rien.\nASSOCIATION: NONE\nUSES:\n- NONE")).toMatchObject({ verdict: "FREE", association: null, uses: [] });
    expect(parseInsight("SUMMARY: Flou.")?.verdict).toBe("UNKNOWN");
    expect(parseInsight("Désolé.")).toBeNull();
  });
});

describe("Prompt envoyé à l'IA", () => {
  const base = { keywords: "café", category: "Other" as const, customCategory: "food truck", vibe: "Fun" as const, length: "Any" as const, style: "Any" as const, lang: "es" as const, count: 20 };
  it("contient les noms à éviter, la variante demandée et la langue", () => {
    const p = buildNamingPrompt({ ...base, exclude: ["Velora"], inspiration: { nom: "Tissura", explication: "trame" } });
    expect(p).toContain("Velora");
    expect(p).toContain("aimé le nom « Tissura »");
    expect(p).toContain("food truck");
    expect(p).toContain("en espagnol");
  });
});
