"use client";

import { useState } from "react";
import { Heart, LoaderCircle, Palette, Sparkles } from "lucide-react";
import type { DomainResult, DomainStatus, NameResult } from "@/types";
import type { Translations } from "@/lib/i18n";
import { useApp } from "@/lib/app-context";
import { Button } from "./ui/Button";
import { NameCheck } from "./NameCheck";
import { LogoPreviewDialog } from "./LogoPreviewDialog";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  result: NameResult;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  /** « Plus comme celui-ci » (absent sur la page de partage) */
  onMoreLikeThis?: () => void;
  variantLoading?: boolean;
  busy?: boolean;
}

function statusLabel(t: Translations, status: DomainStatus): string {
  switch (status) {
    case "available":
      return t.domainAvailable;
    case "taken":
      return t.domainTaken;
    case "checking":
      return t.domainChecking;
    default:
      return t.domainUnknown;
  }
}

const statusDotClass: Record<DomainStatus, string> = {
  available: "bg-accent ring-1 ring-inset ring-ink/10",
  taken: "bg-muted ring-1 ring-inset ring-ink/10",
  unknown: "bg-muted/50 ring-1 ring-inset ring-ink/10",
  checking: "animate-pulse bg-muted ring-1 ring-inset ring-ink/10",
};

function DomainBadge({ domain, t }: { domain: DomainResult; t: Translations }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span aria-hidden className={cn("h-2 w-2 rounded-full", statusDotClass[domain.status])} />
      <span className="text-ink">{domain.tld}</span>
      <span className="text-muted">{statusLabel(t, domain.status)}</span>
      {domain.affiliateUrl && (domain.status === "available" || domain.status === "unknown") && (
        <Button href={domain.affiliateUrl} variant="ghost" className="ms-auto px-3 py-1.5 text-xs">
          {domain.status === "available" ? t.buyBtn : t.domainVerifyBtn}
        </Button>
      )}
    </div>
  );
}

export function ResultCard({ result, isFavorite, onToggleFavorite, onMoreLikeThis, variantLoading = false, busy = false }: ResultCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { t } = useApp();
  const favoriteLabel = isFavorite ? t.removeFavorite : t.addFavorite;

  return (
    <article className="border-s-4 border-accent py-8 ps-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-3xl font-semibold text-ink">{result.nom}</h3>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={favoriteLabel}
          title={favoriteLabel}
          className="rounded-full p-2 text-accent transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Heart aria-hidden className="h-6 w-6" fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="mt-2 max-w-prose text-muted">{result.explication}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {onMoreLikeThis && (
          <button
            type="button"
            onClick={onMoreLikeThis}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-accent/20 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {variantLoading ? (
              <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles aria-hidden className="h-4 w-4 text-accent" />
            )}
            {t.moreLikeThis}
          </button>
        )}
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-accent/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Palette aria-hidden className="h-4 w-4 text-accent" />
          {t.logoPreviewBtn}
        </button>
      </div>
      <LogoPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        name={result.nom}
        explication={result.explication}
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
        {result.domains.map((domain) => (
          <DomainBadge key={domain.tld} domain={domain} t={t} />
        ))}
      </div>
      <NameCheck name={result.nom} />
    </article>
  );
}
