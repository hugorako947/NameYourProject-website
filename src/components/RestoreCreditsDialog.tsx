"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useApp } from "@/lib/app-context";
import type { ApiErrorBody, ApiErrorCode, RequestCodeRequest, VerifyCodeRequest } from "@/types";

// =============================================================================
// Fenêtre « Retrouver mes générations » — sans compte ni mot de passe :
//   1. l'utilisateur saisit l'e-mail de son achat
//   2. il reçoit un code à 6 chiffres et le saisit ici
//   3. ce navigateur est relié à ses générations achetées
// =============================================================================

interface RestoreCreditsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Appelé après une connexion réussie (pour rafraîchir le compteur) */
  onRestored: () => void;
}

export function RestoreCreditsDialog({ open, onClose, onRestored }: RestoreCreditsDialogProps) {
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
      aria-labelledby="restore-dialog-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl bg-paper p-0 text-ink shadow-2xl shadow-ink/20 backdrop:bg-ink/50 backdrop:backdrop-blur-sm"
    >
      {open && <RestoreContent onClose={onClose} onRestored={onRestored} />}
    </dialog>
  );
}

type Step = "email" | "code" | "done";

function RestoreContent({ onClose, onRestored }: { onClose: () => void; onRestored: () => void }) {
  const { t, lang } = useApp();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorCode | null>(null);

  async function post<T>(url: string, payload: T): Promise<ApiErrorCode | null> {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return null;
      const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
      return body?.error ?? "GENERIC";
    } catch {
      return "GENERIC";
    }
  }

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await post<RequestCodeRequest>("/api/credits/request-code", { email, lang });
    setLoading(false);
    if (err) setError(err);
    else setStep("code");
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await post<VerifyCodeRequest>("/api/credits/verify", { email, code });
    setLoading(false);
    if (err) {
      setError(err);
      if (err === "TOO_MANY_ATTEMPTS") setCode("");
      return;
    }
    setStep("done");
    onRestored();
  }

  const input =
    "w-full rounded-lg border border-muted/60 bg-paper p-3 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
  const primary =
    "w-full rounded-full bg-accent py-3 font-bold text-on-accent transition hover:brightness-95 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 id="restore-dialog-title" className="font-display text-2xl font-bold">
          {t.restoreLink}
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

      {step === "email" && (
        <form onSubmit={requestCode} className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-muted">{t.restoreIntro}</p>
          <label className="flex flex-col gap-2 text-sm font-medium">
            {t.emailLabel}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </label>
          {error && <p role="alert" className="text-sm font-medium text-danger">{t.errors[error]}</p>}
          <button type="submit" disabled={loading} className={primary}>
            {t.sendCodeBtn}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verify} className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-muted">{t.codeSentNotice}</p>
          <label className="flex flex-col gap-2 text-sm font-medium">
            {t.codeLabel}
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`${input} text-center font-display text-2xl tracking-[0.4em]`}
            />
          </label>
          {error && <p role="alert" className="text-sm font-medium text-danger">{t.errors[error]}</p>}
          <button type="submit" disabled={loading || code.length !== 6} className={primary}>
            {t.verifyBtn}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="text-sm font-medium text-muted underline underline-offset-4 hover:text-ink"
          >
            {t.changeEmail}
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="mt-4 flex flex-col gap-4">
          <p role="status" className="rounded-lg bg-accent/10 p-3 text-sm text-ink">
            {t.restoreSuccess}
          </p>
          <button type="button" onClick={onClose} className={primary}>
            {t.backToGenerator}
          </button>
        </div>
      )}
    </div>
  );
}
