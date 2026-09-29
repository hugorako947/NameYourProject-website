import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// NameYourThing — Bouton partagé
//
// "primary" utilise --color-accent / --color-on-accent : ces deux variables
// sont fixées par vibe (voir SearchForm + lib/vibe-theme.ts), donc CE bouton
// change de couleur tout seul selon la vibe choisie, sans logique ici.
// =============================================================================

type ButtonVariant = "primary" | "ghost";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  /** Si fourni, le bouton devient un lien externe (ex: achat de domaine). */
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}

const base =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:brightness-95",
  ghost: "border border-muted/60 bg-transparent text-ink hover:border-ink",
};

export function Button({
  children,
  variant = "primary",
  className,
  href,
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  const classes = cn(base, variants[variant], className);

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}