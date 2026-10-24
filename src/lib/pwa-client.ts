"use client";

// =============================================================================
// NameYourProject — Application installable (PWA), côté navigateur
//
//   • enregistre le service worker (public/sw.js), en production seulement :
//     en développement, son cache gênerait le rechargement automatique
//   • capte l'invitation à installer de Chrome / Edge / Android
//     (« beforeinstallprompt ») dès le chargement, quelle que soit la page :
//     le bouton « Installer l'application » de /installer peut ainsi la
//     déclencher même si le visiteur est arrivé par l'accueil
//   • Safari (iPhone, Mac) n'a pas d'invitation : la page /installer affiche
//     alors les étapes à suivre
// =============================================================================

/** Événement non standard de Chrome (absent des types TypeScript). */
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallState = "unavailable" | "available" | "installed";

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
let started = false;

const notify = () => listeners.forEach((listener) => listener());

/** À appeler une fois, au chargement du site (composant PwaSetup). */
export function startPwa() {
  if (started || typeof window === "undefined") return;
  started = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // on garde l'invitation pour notre propre bouton
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferredPrompt = null;
    notify();
  });

  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
  }
}

/** Le site est-il ouvert DANS l'application installée ? */
export function isRunningStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function subscribeInstall(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getInstallState(): InstallState {
  if (installed) return "installed";
  return deferredPrompt ? "available" : "unavailable";
}

export const getServerInstallState = (): InstallState => "unavailable";

/** Ouvre la fenêtre d'installation du navigateur ; renvoie true si acceptée. */
export async function promptInstall(): Promise<boolean> {
  const event = deferredPrompt;
  if (!event) return false;
  deferredPrompt = null; // une invitation ne sert qu'une fois
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === "accepted") installed = true;
  notify();
  return outcome === "accepted";
}

export type Platform = "android" | "ios" | "desktop";

/** Devine l'appareil, pour montrer d'abord les bonnes instructions. */
export function detectPlatform(userAgent: string, maxTouchPoints = 0): Platform {
  if (/android/i.test(userAgent)) return "android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  // iPadOS se présente comme un Mac, mais avec un écran tactile
  if (/macintosh/i.test(userAgent) && maxTouchPoints > 1) return "ios";
  return "desktop";
}
