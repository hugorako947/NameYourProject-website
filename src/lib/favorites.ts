import type { DomainStatus, NameResult } from "@/types";

// =============================================================================
// NameYourProject — Favoris : stockage, export et partage (sans compte)
//
// • Stockage : dans le navigateur du visiteur (localStorage), 100 au maximum.
// • Export : texte à copier, ou fichier CSV lisible par Excel / Google Sheets.
// • Partage : toute la sélection est encodée dans le lien lui-même, après le
//   « # ». Cette partie d'une adresse n'est jamais envoyée au serveur par les
//   navigateurs : rien n'est stocké nulle part, aucun compte n'est nécessaire.
// =============================================================================

export const FAVORITES_STORAGE_KEY = "nyp-favorites";
export const MAX_FAVORITES = 100;
/** Au-delà, le lien deviendrait trop long pour certaines messageries. */
export const MAX_SHARED = 30;
const MAX_SHARED_EXPLANATION = 160;

export interface SharedName {
  nom: string;
  explication: string;
  /** Extensions à revérifier chez le destinataire */
  tlds: string[];
}

const VALID_NAME = /^[A-Za-z0-9]{2,40}$/;
const VALID_TLD = /^\.[a-z]{2,24}$/;

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

/** Transforme des favoris en partie de lien (à placer après « #»). */
export function encodeShare(favorites: NameResult[]): string {
  const items = favorites.slice(0, MAX_SHARED).map((f) => ({
    n: f.nom,
    e: f.explication.slice(0, MAX_SHARED_EXPLANATION),
    t: f.domains.map((d) => d.tld),
  }));
  return toBase64Url(JSON.stringify({ v: 1, items }));
}

/** Relit un lien de partage. Toute donnée invalide est écartée (lien trafiqué ou abîmé). */
export function decodeShare(hash: string): SharedName[] | null {
  try {
    const data = JSON.parse(fromBase64Url(hash.replace(/^#/, ""))) as { v?: number; items?: unknown };
    if (data.v !== 1 || !Array.isArray(data.items)) return null;
    const names = data.items
      .map((raw) => {
        const item = raw as { n?: unknown; e?: unknown; t?: unknown };
        if (typeof item.n !== "string" || !VALID_NAME.test(item.n)) return null;
        const tlds = Array.isArray(item.t) ? item.t.filter((t): t is string => typeof t === "string" && VALID_TLD.test(t)) : [];
        return {
          nom: item.n,
          explication: typeof item.e === "string" ? item.e.slice(0, MAX_SHARED_EXPLANATION) : "",
          tlds: tlds.length ? [...new Set(tlds)].slice(0, 6) : [".com"],
        };
      })
      .filter((n): n is SharedName => n !== null)
      .slice(0, MAX_SHARED);
    return names.length ? names : null;
  } catch {
    return null;
  }
}

/** Toutes les extensions présentes dans une liste, le .com en premier. */
export function collectTlds(favorites: { domains: { tld: string }[] }[]): string[] {
  const all = new Set<string>([".com"]);
  favorites.forEach((f) => f.domains.forEach((d) => all.add(d.tld)));
  return [...all];
}

type StatusLabels = Record<DomainStatus, string>;

/** Liste lisible, à coller dans un message ou un document. */
export function favoritesToText(favorites: NameResult[], labels: StatusLabels): string {
  return favorites
    .map((f) => {
      const domains = f.domains.map((d) => `${f.nom.toLowerCase()}${d.tld} : ${labels[d.status]}`).join(" · ");
      return `${f.nom}\n${f.explication}\n${domains}`;
    })
    .join("\n\n");
}

/** Fichier CSV (séparateur « ; » en français et en espagnol, pour Excel). */
export function favoritesToCsv(
  favorites: NameResult[],
  labels: StatusLabels,
  headers: { name: string; meaning: string },
  separator: "," | ";"
): string {
  const tlds = collectTlds(favorites);
  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    [headers.name, headers.meaning, ...tlds].map(cell).join(separator),
    ...favorites.map((f) =>
      [
        f.nom,
        f.explication,
        ...tlds.map((tld) => {
          const d = f.domains.find((x) => x.tld === tld);
          return d ? labels[d.status] : "—";
        }),
      ]
        .map(cell)
        .join(separator)
    ),
  ];
  // Marque BOM : Excel reconnaît ainsi les accents
  return "\uFEFF" + rows.join("\r\n");
}

/** Lit les favoris enregistrés dans ce navigateur. */
export function loadFavorites(): NameResult[] {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? (saved as NameResult[]).slice(0, MAX_FAVORITES) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: NameResult[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites.slice(0, MAX_FAVORITES)));
  } catch {
    // stockage plein ou bloqué (navigation privée stricte) : on ignore
  }
}
