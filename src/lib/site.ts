// Adresse publique du site (sitemap, liens canoniques). En local : localhost.
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || "http://localhost:3000";
}
