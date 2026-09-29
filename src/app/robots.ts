import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Consignes pour les moteurs de recherche (/robots.txt)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/achat/", "/favoris"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
