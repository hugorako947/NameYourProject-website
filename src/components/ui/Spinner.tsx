"use client";

import Link, { useLinkStatus } from "next/link";
import { useState, type ComponentProps, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// NameYourProject — Indicateurs de chargement
//
// Règle du site : toute action qui prend un peu de temps affiche un cercle
// tournant SUR l'élément cliqué (bouton, lien, fil d'Ariane…) jusqu'à ce que
// l'action soit terminée.
//
//   • <Spinner />          : le cercle lui-même (couleur du texte, donc du thème)
//   • <PendingLink />      : lien interne qui tourne pendant le changement de page
//   • usePendingAction()   : enveloppe une action asynchrone et dit si elle tourne
// =============================================================================

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle aria-hidden className={cn("h-4 w-4 shrink-0 animate-spin", className)} />;
}

/** Affiche le cercle à la place de l'icône (ou à sa suite s'il n'y a pas d'icône) tant que la page charge. */
function LinkIndicator({ icon, spinnerClassName }: { icon?: ReactNode; spinnerClassName?: string }) {
  const { pending } = useLinkStatus();
  if (pending) return <Spinner className={spinnerClassName} />;
  return icon ?? null;
}

type PendingLinkProps = ComponentProps<typeof Link> & {
  /** Icône remplacée par le cercle pendant le chargement */
  icon?: ReactNode;
  /** Position du cercle quand il n'y a pas d'icône */
  spinnerAt?: "start" | "end";
  spinnerClassName?: string;
};

/**
 * Lien interne (next/link) avec retour visuel immédiat. Le lien doit avoir une
 * mise en page « inline-flex items-center gap-… » pour que le cercle s'aligne.
 */
export function PendingLink({ icon, spinnerAt = "end", spinnerClassName, children, ...props }: PendingLinkProps) {
  const indicator = <LinkIndicator icon={icon} spinnerClassName={spinnerClassName} />;
  return (
    <Link {...props}>
      {(icon || spinnerAt === "start") && indicator}
      {children}
      {!icon && spinnerAt === "end" && indicator}
    </Link>
  );
}

/**
 * Enveloppe une action asynchrone : `pending` vaut true du clic jusqu'à la fin
 * de l'action, et un second clic pendant ce temps est ignoré.
 */
export function usePendingAction<Args extends unknown[]>(
  action: (...args: Args) => unknown
): [pending: boolean, run: (...args: Args) => Promise<void>] {
  const [pending, setPending] = useState(false);
  async function run(...args: Args) {
    if (pending) return;
    setPending(true);
    try {
      await action(...args);
    } finally {
      setPending(false);
    }
  }
  return [pending, run];
}
