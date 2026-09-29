import { afterEach, describe, expect, it, vi } from "vitest";
import { toDomainSlug } from "@/lib/domains/slug";
import { rankByComStatus } from "@/lib/domains/select";

describe("Noms de domaine", () => {
  it("transforme un nom en domaine valide", () => {
    expect(toDomainSlug("Écho Lab!")).toBe("echolab");
  });

  it("classe les noms : .com libre, puis non vérifié, puis pris", () => {
    const list = [
      { nom: "A", comStatus: "taken" as const },
      { nom: "B", comStatus: "available" as const },
      { nom: "C", comStatus: "unknown" as const },
      { nom: "D", comStatus: "available" as const },
    ];
    expect(rankByComStatus(list, 3).map((n) => n.nom)).toEqual(["B", "D", "C"]);
  });
});

describe("Vérification RDAP et choix des extensions", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("interprète les réponses du registre et choisit les extensions vérifiables", async () => {
    vi.stubGlobal("fetch", async (url: string) => {
      if (String(url).includes("iana")) {
        return { ok: true, status: 200, json: async () => ({ services: [
          [["com", "net"], ["https://rdap.verisign.com/com/v1/"]],
          [["fr"], ["https://rdap.nic.fr/"]],
          [["app", "dev"], ["https://rdap.example/"]],
        ] }) };
      }
      if (String(url).endsWith("/pris.com")) return { ok: true, status: 200 };
      if (String(url).endsWith("/libre.com")) return { ok: false, status: 404 };
      return { ok: false, status: 503 };
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { checkDomainAvailability } = await import("@/lib/domains/checker");
    const { pickTlds, localTld } = await import("@/lib/domains/tlds");

    expect((await checkDomainAvailability("Pris.com")).status).toBe("taken");
    expect((await checkDomainAvailability("libre.com")).status).toBe("available");
    expect((await checkDomainAvailability("panne.com")).status).toBe("unknown");
    expect((await checkDomainAvailability("exemple.zz")).status).toBe("unknown");

    // .io et .ai absents de l'annuaire → remplacés par .dev
    expect(await pickTlds({ country: "FR", lang: "fr", category: "App/Software" })).toEqual([".com", ".fr", ".app", ".dev"]);
    expect(localTld("GB", "en")).toBe(".uk");
    expect(localTld("US", "en")).toBeNull();
    expect(localTld(null, "es")).toBe(".es");
  });
});
