import type { MetadataRoute } from "next";
import { SEO_PAGES, seoPath } from "@/lib/seo/pages";
import { siteUrl } from "@/lib/site";

// Plan du site pour Google (/sitemap.xml) : accueil, pages SEO, Concurrence, Installer et pages légales.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...SEO_PAGES.map((p) => ({ url: `${base}${seoPath(p.slug)}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${base}/concurrence`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/installer`, changeFrequency: "yearly", priority: 0.4 },
    ...["/mentions-legales", "/conditions-utilisation", "/confidentialite"].map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
