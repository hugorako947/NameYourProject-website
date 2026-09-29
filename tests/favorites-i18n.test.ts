import { describe, expect, it } from "vitest";
import { collectTlds, decodeShare, encodeShare, favoritesToCsv } from "@/lib/favorites";
import { TRANSLATIONS, LANG_CODES } from "@/lib/i18n";
import type { NameResult } from "@/types";

const fav = (nom: string, tlds: string[]): NameResult => ({
  id: nom,
  nom,
  explication: `Explication « ${nom} » avec des accents éàü`,
  domains: tlds.map((tld) => ({ tld, status: "available", affiliateUrl: null })),
});
const labels = { available: "libre", taken: "pris", unknown: "?", checking: "…" };

describe("Partage des favoris par lien", () => {
  it("fait l'aller-retour sans perte, accents compris", () => {
    const shared = decodeShare(encodeShare([fav("Tissura", [".com", ".fr"]), fav("Velora", [".com", ".app"])]));
    expect(shared?.map((s) => s.nom)).toEqual(["Tissura", "Velora"]);
    expect(shared?.[0].explication).toContain("éàü");
    expect(shared?.[1].tlds).toEqual([".com", ".app"]);
  });
  it("rejette un lien abîmé et écarte les données piégées", () => {
    expect(decodeShare("n-importe-quoi")).toBeNull();
    const piege = Buffer.from(JSON.stringify({ v: 1, items: [{ n: "<script>", e: "x", t: [".com"] }, { n: "Bon", t: ["javascript:"] }] })).toString("base64url");
    expect(decodeShare(piege)).toEqual([{ nom: "Bon", explication: "", tlds: [".com"] }]);
  });
});

describe("Export des favoris", () => {
  it("produit un CSV lisible par Excel, une colonne par extension", () => {
    const csv = favoritesToCsv([fav("Tissura", [".com", ".fr"]), fav("Velora", [".com", ".app"])], labels, { name: "Nom", meaning: "Explication" }, ";");
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv.split("\r\n")[0]).toBe('\uFEFF"Nom";"Explication";".com";".fr";".app"');
    expect(csv).toContain('"Velora";"Explication « Velora » avec des accents éàü";"libre";"—";"libre"');
    expect(collectTlds([fav("A", [".fr"])])).toEqual([".com", ".fr"]);
  });
});

describe("Traductions", () => {
  it("chaque langue a exactement les mêmes textes", () => {
    const reference = Object.keys(TRANSLATIONS.fr).sort();
    for (const lang of LANG_CODES) expect(Object.keys(TRANSLATIONS[lang]).sort()).toEqual(reference);
  });
  it("aucun texte vide, et 3 passages en gras dans chaque description", () => {
    for (const lang of LANG_CODES) {
      const t = TRANSLATIONS[lang];
      for (const [key, value] of Object.entries(t)) {
        if (typeof value === "string" && key !== "legalOnlyFrEn") expect(value.trim(), `${lang}.${key}`).not.toBe("");
      }
      expect(t.explanation.match(/\*\*[^*]+\*\*/g)?.length, lang).toBe(3);
    }
  });
});
