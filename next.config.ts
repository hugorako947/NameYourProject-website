import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages SEO : l'adresse publique /generateur-nom-application affiche la page
  // interne /generateur/application (contenu dans src/lib/seo/pages.ts).
  async rewrites() {
    return [{ source: "/generateur-nom-:type", destination: "/generateur/:type" }];
  },

  // Service worker de l'application installable (public/sw.js) : jamais gardé
  // en cache par le navigateur, sinon une nouvelle version du site mettrait
  // des heures à être prise en compte ; scripts limités au site lui-même.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
