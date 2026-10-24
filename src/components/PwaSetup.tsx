"use client";

import { useEffect } from "react";
import { startPwa } from "@/lib/pwa-client";

// Démarre l'application installable dès le chargement du site, sur n'importe
// quelle page (service worker + invitation à installer) : voir lib/pwa-client.ts.
export function PwaSetup() {
  useEffect(() => startPwa(), []);
  return null;
}
