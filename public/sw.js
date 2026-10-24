// =============================================================================
// NameYourProject — Service worker de l'application installable (PWA)
//
// Rôle volontairement limité, pour ne JAMAIS afficher de données périmées :
//   • pages : toujours demandées au réseau ; sans connexion → page /hors-ligne
//   • fichiers du site (/_next/static/, noms uniques à chaque déploiement) :
//     gardés en cache pour un démarrage plus rapide
//   • /api/… (générations, quota, paiement…) : JAMAIS mis en cache
//
// Changer CACHE_VERSION vide les anciens caches au prochain chargement.
// Enregistré par src/lib/pwa-client.ts (en production uniquement).
// =============================================================================

const CACHE_VERSION = "nyp-v1";
const OFFLINE_URL = "/hors-ligne";
const PRECACHE = [OFFLINE_URL, "/icon.svg", "/app-icon/192"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Pages : réseau d'abord, page hors ligne en secours
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Fichiers du site, immuables : cache d'abord
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
  }
});
