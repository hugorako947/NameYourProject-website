import type { Vibe } from "@/types";

// =============================================================================
// NameYourProject — Couleur d'accent de chaque Vibe
//
// La couleur du texte posé sur l'accent (blanc ou encre) est calculée
// automatiquement pour rester lisible : voir onAccentFor() dans lib/theme.ts.
// En thème Inversé, ces couleurs sont inversées automatiquement ; en thème
// Personnalisé, c'est l'accent choisi par l'utilisateur qui s'applique.
// =============================================================================

export const VIBE_ACCENT: Record<Vibe, string> = {
  Sérieux: "#2f5cff",
  Fun: "#ff5d73",
  Futuriste: "#8b5cf6",
  Luxe: "#c9a227",
  Nature: "#1e9e5a",
  Tech: "#06b6d4",
};
