"use client";

import { useEffect, useState } from "react";
import { encode } from "uqr";

// =============================================================================
// QR code dessiné en SVG (bibliothèque uqr), aux couleurs du thème.
// Un lecteur de QR code attend des carrés FONCÉS sur fond CLAIR : en thème
// sombre, on inverse donc --color-ink et --color-paper pour le QR seulement.
// =============================================================================

/** Luminosité perçue (0 = noir, 1 = blanc) d'une couleur « rgb(r, g, b) ». */
export function luminance(rgb: string): number {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? ["0", "0", "0"]).map(Number);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export function QrCode({ value, label, size = 200 }: { value: string; label: string; size?: number }) {
  const { data, size: modules } = encode(value, { ecc: "M", border: 0 });
  const [darkPaper, setDarkPaper] = useState(false);

  useEffect(() => {
    const style = getComputedStyle(document.body);
    setDarkPaper(luminance(style.backgroundColor) < luminance(style.color));
  }, []);

  const background = darkPaper ? "var(--color-ink)" : "var(--color-paper)";
  const foreground = darkPaper ? "var(--color-paper)" : "var(--color-ink)";
  // Marge blanche de 4 modules autour du code : exigée par la norme QR
  const quiet = 4;
  const total = modules + quiet * 2;

  // Un seul chemin SVG (un petit carré par module foncé) : léger et net à toute taille
  let path = "";
  data.forEach((row, y) =>
    row.forEach((on, x) => {
      if (on) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    })
  );

  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      shapeRendering="crispEdges"
      className="rounded-xl"
    >
      <rect width={total} height={total} fill={background} />
      <path d={path} fill={foreground} />
    </svg>
  );
}
