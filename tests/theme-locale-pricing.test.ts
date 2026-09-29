import { describe, expect, it } from "vitest";
import { invertHex, onAccentFor, parseCustomColors, serializeCustomColors, DEFAULT_CUSTOM_COLORS, resolveAccent } from "@/lib/theme";
import { countryFromHeaders, detectLang, langFromAcceptLanguage } from "@/lib/locale";
import { CREDIT_PACKS, getPack, packSavingsPercent, currencyForCountry, formatApproxLocal } from "@/lib/pricing";

const headers = (h: Record<string, string>) => ({ get: (n: string) => h[n.toLowerCase()] ?? null });

describe("Thèmes", () => {
  it("inverse exactement une couleur", () => {
    expect(invertHex("#fafafc")).toBe("#050503");
    expect(invertHex(invertHex("#2f5cff"))).toBe("#2f5cff");
  });
  it("choisit un texte lisible sur l'accent", () => {
    expect(onAccentFor("#2f5cff")).toBe("#ffffff"); // bleu foncé → texte blanc
    expect(onAccentFor("#ff5d73")).toBe("#14171f"); // corail clair → texte encre
  });
  it("relit les couleurs personnalisées et rejette les valeurs piégées", () => {
    const colors = { paper: "#112233", ink: "#eeeeee", muted: "#aaaaaa", accent: "#ff8800" };
    expect(parseCustomColors(serializeCustomColors(colors))).toEqual(colors);
    expect(parseCustomColors("<script>-zz-12-ff")).toEqual(DEFAULT_CUSTOM_COLORS);
  });
  it("adapte l'accent au thème", () => {
    expect(resolveAccent("invert", DEFAULT_CUSTOM_COLORS, "#2f5cff")).toBe("#d0a300");
    expect(resolveAccent("custom", DEFAULT_CUSTOM_COLORS, "#2f5cff")).toBe(DEFAULT_CUSTOM_COLORS.accent);
  });
});

describe("Langue automatique", () => {
  it("suit le pays, puis le navigateur, puis l'anglais", () => {
    expect(detectLang({ cookieLang: undefined, country: "MX", acceptLanguage: "en" })).toBe("es");
    expect(detectLang({ cookieLang: undefined, country: "CH", acceptLanguage: "fr-CH,fr;q=0.9" })).toBe("fr");
    expect(detectLang({ cookieLang: undefined, country: "DE", acceptLanguage: "de-DE" })).toBe("en");
  });
  it("respecte le choix mémorisé et ignore un cookie trafiqué", () => {
    expect(detectLang({ cookieLang: "ar", country: "FR", acceptLanguage: null })).toBe("ar");
    expect(detectLang({ cookieLang: "xx", country: "FR", acceptLanguage: null })).toBe("fr");
  });
  it("lit les préférences du navigateur par ordre de priorité", () => {
    expect(langFromAcceptLanguage("de;q=0.9,zh-CN;q=0.8,en;q=0.7")).toBe("zh");
  });
  it("ignore les pays inconnus ou Tor", () => {
    expect(countryFromHeaders(headers({ "cf-ipcountry": "T1" }))).toBeNull();
    expect(countryFromHeaders(headers({ "x-vercel-ip-country": "fr" }))).toBe("FR");
  });
});

describe("Prix", () => {
  it("calcule les économies des packs", () => {
    expect(CREDIT_PACKS.map(packSavingsPercent)).toEqual([0, 33, 50]);
  });
  it("refuse un pack inventé", () => {
    expect(getPack("gratuit")).toBeNull();
    expect(getPack("plus")?.priceUsd).toBe(10);
  });
  it("choisit la devise du pays et n'affiche rien de plus en dollars", () => {
    expect(currencyForCountry("BE")).toBe("EUR");
    expect(currencyForCountry("SA")).toBe("SAR");
    expect(formatApproxLocal(10, "USD", "en-US")).toBeNull();
  });
});
