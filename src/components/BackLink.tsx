"use client";

import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { PendingLink } from "./ui/Spinner";

// =============================================================================
// Lien « Retour » commun (pages légales, Concurrence, Installer…) : la flèche
// devient un cercle de chargement pendant le changement de page.
// =============================================================================

export function BackLink({ href = "/", label, className }: { href?: string; label: string; className?: string }) {
  return (
    <PendingLink
      href={href}
      icon={<ArrowLeft aria-hidden className="h-4 w-4 rtl:rotate-180" />}
      className={cn("inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink", className)}
    >
      {label}
    </PendingLink>
  );
}
