"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { toDomainSlug } from "@/lib/domains/slug";

// =============================================================================
// Aperçu « le nom en vrai » : 4 styles de logo typographique, une icône
// d'application et une carte de visite, aux couleurs de la vibe choisie.
// Aucune IA : uniquement de la mise en page, instantanée et gratuite.
// =============================================================================

interface LogoPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  name: string;
  explication: string;
}

export function LogoPreviewDialog({ open, onClose, name, explication }: LogoPreviewDialogProps) {
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
      aria-label={name}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[min(46rem,calc(100%-2rem))] rounded-2xl bg-paper p-0 text-ink shadow-2xl shadow-ink/20 backdrop:bg-ink/50 backdrop:backdrop-blur-sm"
    >
      {open && <PreviewContent name={name} explication={explication} onClose={onClose} />}
    </dialog>
  );
}

const tile = "flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl p-5 text-center [overflow-wrap:anywhere]";
const caption = "mt-2 text-center text-xs font-medium text-muted";

function PreviewContent({ name, explication, onClose }: { name: string; explication: string; onClose: () => void }) {
  const { t } = useApp();
  const domain = `${toDomainSlug(name)}.com`;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="max-h-[85vh] overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">{t.logoPreviewTitle(name)}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.buyClose}
          className="rounded-full p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <X aria-hidden className="h-5 w-5" />
        </button>
      </div>

      {/* 4 styles de logo */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <figure>
          <div className={`${tile} border border-border bg-paper`}>
            <span className="font-playfair text-3xl font-semibold italic tracking-wide text-ink sm:text-4xl">{name}</span>
          </div>
          <figcaption className={caption}>{t.logoStyles.elegant}</figcaption>
        </figure>

        <figure>
          <div className={`${tile} bg-ink`}>
            <span className="font-sans text-3xl font-bold tracking-tight text-paper lowercase sm:text-4xl">
              {name}
              <span className="text-accent">.</span>
            </span>
          </div>
          <figcaption className={caption}>{t.logoStyles.modern}</figcaption>
        </figure>

        <figure>
          <div className={`${tile} gap-3 border border-accent/40 bg-accent/10`}>
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent font-grotesk text-xl font-bold text-on-accent"
            >
              {initial}
            </span>
            <span className="font-grotesk text-2xl font-bold tracking-tight text-ink sm:text-3xl">{name}</span>
          </div>
          <figcaption className={caption}>{t.logoStyles.tech}</figcaption>
        </figure>

        <figure>
          <div className={`${tile} bg-accent`}>
            <span className="font-syne text-2xl font-extrabold tracking-widest text-on-accent uppercase sm:text-3xl">{name}</span>
          </div>
          <figcaption className={caption}>{t.logoStyles.bold}</figcaption>
        </figure>
      </div>

      {/* Mises en situation */}
      <div className="mt-6 grid grid-cols-1 items-end gap-6 sm:grid-cols-[auto_1fr]">
        <figure className="flex flex-col items-center">
          <div
            aria-hidden
            className="flex h-24 w-24 items-center justify-center rounded-[22%] font-syne text-5xl font-extrabold text-on-accent shadow-lg shadow-accent/30"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent), color-mix(in oklab, var(--color-accent) 70%, var(--color-ink)))",
            }}
          >
            {initial}
          </div>
          <figcaption className={caption}>{t.appIconLabel}</figcaption>
        </figure>

        <figure>
          <div className="flex aspect-[1.75] flex-col justify-between rounded-xl border border-border bg-paper p-5 shadow-md shadow-ink/10">
            <div>
              <p className="font-display text-2xl font-bold text-ink [overflow-wrap:anywhere]">{name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{explication}</p>
            </div>
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
              {domain}
            </p>
          </div>
          <figcaption className={caption}>{t.businessCardLabel}</figcaption>
        </figure>
      </div>

      <p className="mt-6 text-center text-xs text-muted">{t.logoPreviewNote}</p>
    </div>
  );
}
