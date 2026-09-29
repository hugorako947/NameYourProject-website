"use client";

import { VIBES, type Vibe } from "@/types";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

interface VibeSelectorProps {
  value: Vibe;
  onChange: (vibe: Vibe) => void;
  disabled?: boolean;
  labelledBy?: string;
}

export function VibeSelector({ value, onChange, disabled, labelledBy }: VibeSelectorProps) {
  const { t } = useApp();
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {VIBES.map((vibe) => {
        const selected = vibe === value;
        return (
          <button
            key={vibe}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(vibe)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              selected
                ? "border-accent bg-accent text-on-accent"
                : "border-muted/60 text-muted hover:border-ink hover:text-ink"
            )}
          >
            {t.vibes[vibe]}
          </button>
        );
      })}
    </div>
  );
}
