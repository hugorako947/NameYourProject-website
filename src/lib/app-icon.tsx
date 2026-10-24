import { ImageResponse } from "next/og";

// =============================================================================
// NameYourProject — Icônes de l'application installée (PWA), en PNG
//
// Dessinées à partir du logo (src/app/icon.svg) : mêmes couleurs de marque,
// fixes par nature (une icône ne suit pas le thème du site).
//   • "any"      : coins arrondis, comme le favicon
//   • "maskable" : fond plein bord à bord, logo réduit au centre (zone de
//                  sécurité) : Android découpe lui-même la forme (rond, goutte…)
// =============================================================================

const GRADIENT = "linear-gradient(135deg, #ff5d73 0%, #f97316 100%)";
const LOGO_INK = "#14171f";

export type AppIconPurpose = "any" | "maskable";

export function renderAppIcon(size: number, purpose: AppIconPurpose = "any"): ImageResponse {
  // Le logo occupe toute l'icône ("any") ou 70 % au centre ("maskable")
  const logo = purpose === "maskable" ? Math.round(size * 0.7) : size;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: GRADIENT,
          borderRadius: purpose === "maskable" ? 0 : size / 4,
        }}
      >
        <svg width={logo} height={logo} viewBox="0 0 64 64">
          <path d="M19 46V18h6l14 18V18h6v28h-6L25 28v18z" fill={LOGO_INK} />
          <path d="M50 9l1.6 3.9L55.5 14.5l-3.9 1.6L50 20l-1.6-3.9-3.9-1.6 3.9-1.6z" fill={LOGO_INK} />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
