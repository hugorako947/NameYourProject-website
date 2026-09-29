"use client";

import { Coins, Infinity as InfinityIcon, Plus } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

// =============================================================================
// Compteur de générations, au-dessus du champ de description :
//   • générations gratuites du jour ("2 / 3") avec des pastilles
//   • générations achetées, si ce navigateur est relié à un e-mail acheteur
//   • bouton d'achat + lien « Retrouver mes générations »
// Pour l'administrateur uniquement : bascule illimité ⇄ mode visiteur.
// =============================================================================

interface QuotaBarProps {
  /** null tant que le serveur n'a pas encore répondu */
  remaining: number | null;
  limit: number;
  /** true = admin en mode illimité */
  unlimited: boolean;
  /** true = ce navigateur est déverrouillé en admin */
  isAdmin: boolean;
  /** Générations achetées (null = navigateur non relié à un e-mail) */
  credits: number | null;
  creditsEmail: string | null;
  paymentsEnabled: boolean;
  onBuy: () => void;
  onRestore: () => void;
  onSignOut: () => void;
  onAdminToggle: (unlimited: boolean) => void;
}

const linkClass =
  "text-xs font-medium text-muted underline decoration-muted/40 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink";

export function QuotaBar(props: QuotaBarProps) {
  const { remaining, limit, unlimited, isAdmin, credits, creditsEmail, paymentsEnabled } = props;
  const { t } = useApp();

  if (unlimited) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          aria-live="polite"
          className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-ink"
        >
          <InfinityIcon aria-hidden className="h-4 w-4 text-accent" />
          {t.quotaUnlimited}
        </div>
        <button type="button" onClick={() => props.onAdminToggle(false)} className={linkClass}>
          {t.adminToVisitor}
        </button>
      </div>
    );
  }

  const hasCredits = credits !== null && credits > 0;
  const exhausted = remaining === 0 && !hasCredits;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div
          aria-live="polite"
          className={cn(
            "inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-sm font-medium",
            exhausted ? "bg-danger/10 text-danger" : "bg-accent/10 text-ink"
          )}
        >
          {/* Une pastille par génération gratuite : pleine = encore disponible */}
          <span aria-hidden className="flex gap-1">
            {Array.from({ length: limit }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full ring-1 ring-inset ring-ink/10",
                  remaining !== null && i < remaining ? "bg-accent" : "bg-muted/30"
                )}
              />
            ))}
          </span>
          <span>{remaining === null ? `… / ${limit}` : t.quotaRemaining(remaining, limit)}</span>
        </div>

        {credits !== null && (
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-ink">
            <Coins aria-hidden className="h-4 w-4 text-accent" />
            {t.creditsBalance(credits)}
          </div>
        )}
      </div>

      {/* Toujours visible : si le paiement n'est pas ouvert, la fenêtre d'achat l'indique */}
      <button
        type="button"
        onClick={props.onBuy}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          exhausted
            ? "border-accent bg-accent text-on-accent hover:brightness-95"
            : "border-accent/60 text-ink hover:border-accent hover:bg-accent/10"
        )}
      >
        <Plus aria-hidden className="h-4 w-4" />
        {t.buyCreditsBtn}
      </button>

      {credits !== null && creditsEmail ? (
        <p className="text-xs text-muted">
          {t.creditsLinkedTo(creditsEmail)} ·{" "}
          <button type="button" onClick={props.onSignOut} className={linkClass}>
            {t.creditsSignOut}
          </button>
        </p>
      ) : (
        paymentsEnabled && (
          <button type="button" onClick={props.onRestore} className={linkClass}>
            {t.restoreLink}
          </button>
        )
      )}

      {isAdmin && (
        <p className="text-xs text-muted">
          {t.adminVisitorNotice} ·{" "}
          <button type="button" onClick={() => props.onAdminToggle(true)} className={linkClass}>
            {t.adminToUnlimited}
          </button>
        </p>
      )}
    </div>
  );
}
