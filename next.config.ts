import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages SEO : l'adresse publique /generateur-nom-application affiche la page
  // interne /generateur/application (contenu dans src/lib/seo/pages.ts).
  async rewrites() {
    return [{ source: "/generateur-nom-:type", destination: "/generateur/:type" }];
  },
};

export default nextConfig;
