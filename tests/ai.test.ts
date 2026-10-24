import { describe, expect, it, vi } from "vitest";
import { cleanNames, isClicheName, runWithModelChain } from "@/lib/ai/client";
import { parseInsight } from "@/lib/ai/insight";
import { buildNamingPrompt, cleanCustomCategory } from "@/lib/ai/prompts";
import { MAX_CUSTOM_CATEGORY_LENGTH } from "@/types";

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

describe("Précision de la catégorie « Autre »", () => {
  it("accepte une phrase longue, sur une ligne, sans guillemets, bornée", () => {
    const phrase = "jeu de cartes multijoueur en ligne autour des mèmes, pour les soirées entre amis et les streamers";
    expect(cleanCustomCategory(phrase)).toBe(phrase);
    expect(cleanCustomCategory('  bar "à vin"\n  et   tapas ')).toBe("bar à vin et tapas");
    expect(cleanCustomCategory("x".repeat(500))).toHaveLength(MAX_CUSTOM_CATEGORY_LENGTH);
    expect(MAX_CUSTOM_CATEGORY_LENGTH).toBeGreaterThanOrEqual(200);
    expect(cleanCustomCategory("   ")).toBeNull();
    expect(cleanCustomCategory(42)).toBeNull();
  });
});

describe("Chaîne de modèles de secours", () => {
  it("passe au modèle suivant quand un modèle ne répond pas à temps", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    const timeouts: number[] = [];
    const models: string[] = [];
    const result = await runWithModelChain(async (modelId, _maxRetries, timeout) => {
      timeouts.push(timeout);
      models.push(modelId);
      if (models.length === 1) {
        const error = new Error("The operation was aborted due to timeout");
        error.name = "TimeoutError";
        throw error;
      }
      return "ok";
    }, "le test");
    expect(result).toBe("ok");
    expect(models).toHaveLength(2);
    expect(models[0]).not.toBe(models[1]);
    expect(timeouts[0]).toBeGreaterThan(0);
    expect(timeouts[0]).toBeLessThanOrEqual(30_000);
  });
});
