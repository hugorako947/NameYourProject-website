import { renderAppIcon } from "@/lib/app-icon";

// Icône de l'écran d'accueil sur iPhone / iPad (« Sur l'écran d'accueil »).
// Fond plein bord à bord : iOS arrondit lui-même les coins.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderAppIcon(180, "maskable");
}
