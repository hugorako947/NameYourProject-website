"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import {
  CREDIT_PACKS,
  DEFAULT_PACK_ID,
  NAMES_PER_GENERATION,
  formatApproxLocal,
  formatUsd,
  getPack,
  packSavingsPercent,
  type PackId,
} from "@/lib/pricing";
import type { ApiErrorBody, CheckoutRequest, CheckoutResponse } from "@/types";

// =============================================================================
// Fenêtre d'achat de générations — 3 packs dégressifs (voir lib/pricing.ts)
//
// Élément natif <dialog> : focus piégé, fermeture avec Échap, accessible au
// clavier et aux lecteurs d'écran sans librairie.
//
// Le bouton "Payer" redirige vers la page de paiement sécurisée de Stripe.
// Tant que le paiement n'est pas configuré (voir lib/stripe.ts →
// paymentsStatus), /api/checkout répond "PAYMENT_NOT_CONFIGURED" et la
// fenêtre affiche "Le paiement en ligne arrive très bientôt".
// =============================================================================

interface BuyCreditsDialogProps {
  open: boolean;
  onClose: () => void;
  /** false = paiement pas encore ouvert : les packs restent visibles, le paiement est désactivé */
  paymentsEnabled: boolean;
}

type CheckoutStatus = "idle" | "loading" | "unavailable" | "consent" | "error";

export function BuyCreditsDialog({ open, onClose, paymentsEnabled }: BuyCreditsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="buy-dialog-title"
      onClose={onClose}
      // Un clic sur le fond assombri (hors du panneau) ferme la fenêtre
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl bg-paper p-0 text-ink shadow-2xl shadow-ink/20 backdrop:bg-ink/50 backdrop:backdrop-blur-sm"
    >
      {/* Contenu monté uniquement à l'ouverture : les prix sont formatés
          dans le navigateur, jamais pendant le rendu serveur. */}
      {open && <DialogContent onClose={onClose} paymentsEnabled={paymentsEnabled} />}
    </dialog>
  );
}

function DialogContent({ onClose, paymentsEnabled }: { onClose: () => void; paymentsEnabled: boolean }) {
  const { t, lang, locale, currency } = useApp();
  const [packId, setPackId] = useState<PackId>(DEFAULT_PACK_ID);
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  /** Accord exprès obligatoire (CGU + accès immédiat + perte du droit de rétractation) */
  const [consent, setConsent] = useState(false);

  const selectedPack = getPack(packId) ?? CREDIT_PACKS[0];
  const hasApprox = formatApproxLocal(1, currency, locale) !== null;

  async function handlePay() {
    setStatus("loading");
    try {
      const payload: CheckoutRequest = { packId, lang, consent };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json()) as CheckoutResponse;
        window.location.href = data.url; // page de paiement Stripe (le statut "loading" reste affiché)
        return;
      }
      const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
      setStatus(
        body?.error === "PAYMENT_NOT_CONFIGURED" ? "unavailable" : body?.error === "CONSENT_REQUIRED" ? "consent" : "error"
      );
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 id="buy-dialog-title" className="font-display text-2xl font-bold">
          {t.buyTitle}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.buyClose}
          className="rounded-full p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <X aria-hidden className="h-5 w-5" />
        </button>
      </div>

      {/* Les 3 packs */}
      <div role="radiogroup" aria-labelledby="buy-dialog-title" className="mt-5 flex flex-col gap-3">
        {CREDIT_PACKS.map((pack) => {
          const selected = pack.id === packId;
          const savings = packSavingsPercent(pack);
          const approx = formatApproxLocal(pack.priceUsd, currency, locale);
          return (
            <button
              key={pack.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setPackId(pack.id);
                setStatus("idle");
              }}
              className={cn(
                "flex items-center justify-between gap-4 rounded-xl border-2 p-4 text-start transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                selected ? "border-accent bg-accent/10" : "border-border hover:border-muted"
              )}
            >
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{t.packNames[pack.id]}</span>
                  {pack.badge && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-on-accent">
                      {pack.badge === "recommended" ? t.badgeRecommended : t.badgeBestValue}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-ink/80">
                  {t.packGenerations(pack.generations)} · {t.packNamesCount(pack.generations * NAMES_PER_GENERATION)}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {t.packPerGeneration(formatUsd(pack.priceUsd / pack.generations, locale))}
                  {savings > 0 && <> · {t.packSavings(savings)}</>}
                </span>
              </span>
              <span className="shrink-0 text-end">
                <span className="block font-display text-2xl font-bold">{formatUsd(pack.priceUsd, locale)}</span>
                {approx && <span className="block text-xs text-muted">≈ {approx}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted">
        {t.buyEmailNote} {t.buyNoExpiry}
        {hasApprox && <> {t.buyApproxNote}</>}
      </p>

      {status === "unavailable" && (
        <p role="status" className="mt-4 rounded-lg bg-accent/10 p-3 text-sm text-ink">
          {t.buyUnavailable}
        </p>
      )}
      {(status === "error" || status === "consent") && (
        <p role="alert" className="mt-4 text-sm font-medium text-danger">
          {status === "consent" ? t.errors.CONSENT_REQUIRED : t.errors.GENERIC}
        </p>
      )}

      {!paymentsEnabled && (
        <p role="status" className="mt-5 rounded-lg bg-accent/10 p-3 text-sm text-ink">
          {t.buyUnavailable}
        </p>
      )}

      {paymentsEnabled && (
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
        />
        <span>
          {t.buyConsent}{" "}
          <a
            href="/conditions-utilisation"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            ({t.termsLink})
          </a>
        </span>
      </label>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={!paymentsEnabled || status === "loading" || !consent}
        className="mt-6 w-full rounded-full bg-accent py-3.5 text-base font-bold text-on-accent transition hover:brightness-95 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {!paymentsEnabled
          ? t.errors.PAYMENT_NOT_CONFIGURED
          : status === "loading"
            ? t.buyRedirecting
            : t.buyPayBtn(formatUsd(selectedPack.priceUsd, locale))}
      </button>
    </div>
  );
}
