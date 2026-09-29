import type { MetadataRoute } from "next";
import { SEO_PAGES, seoPath } from "@/lib/seo/pages";
import { siteUrl } from "@/lib/site";

// Plan du site pour Google (/sitemap.xml) : accueil, pages SEO et pages légales.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...SEO_PAGES.map((p) => ({ url: `${base}${seoPath(p.slug)}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...["/mentions-legales", "/conditions-utilisation", "/confidentialite"].map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
