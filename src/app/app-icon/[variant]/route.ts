import { renderAppIcon } from "@/lib/app-icon";

// =============================================================================
// NameYourProject — Icônes PNG de l'application installée, déclarées dans
// app/manifest.ts : /app-icon/192, /app-icon/512, /app-icon/maskable-512.
// Générées une fois au build (aucune autre adresse n'existe).
// =============================================================================

const VARIANTS = {
  "192": { size: 192, purpose: "any" },
  "512": { size: 512, purpose: "any" },
  "maskable-512": { size: 512, purpose: "maskable" },
} as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((variant) => ({ variant }));
}

export async function GET(_req: Request, { params }: RouteContext<"/app-icon/[variant]">) {
  const { variant } = await params;
  const icon = VARIANTS[variant as keyof typeof VARIANTS];
  if (!icon) return new Response(null, { status: 404 });
  return renderAppIcon(icon.size, icon.purpose);
}
