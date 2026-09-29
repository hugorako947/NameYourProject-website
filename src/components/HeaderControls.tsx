"use client";

// =============================================================================
// NameYourProject — Boutons Thème + Langue (centrés en haut de la page)
//
// Chaque bouton ouvre un menu flottant. Fermeture : clic à l'extérieur,
// touche Échap, ou choix d'une option (sauf "Personnalisé", qui reste ouvert
// pour laisser régler les couleurs).
// =============================================================================

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { LANGUAGES } from "@/lib/i18n";
import { CUSTOM_COLOR_KEYS, THEME_IDS } from "@/lib/theme";
import { cn } from "@/lib/utils";

// ─── Menu déroulant générique ────────────────────────────────────────────────

interface DropdownProps {
  label: ReactNode;
  children: (close: () => void) => ReactNode;
}

function Dropdown({ label, children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          open ? "border-ink text-ink" : "border-muted/60 text-muted hover:border-ink hover:text-ink"
        )}
      >
        {label}
        <ChevronDown aria-hidden className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 overflow-hidden rounded-xl border border-muted/30 bg-paper shadow-lg shadow-ink/10">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function MenuItem({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-4 py-2.5 text-start text-sm transition-colors",
        selected ? "bg-accent/10 font-medium text-ink" : "text-ink hover:bg-ink/5"
      )}
    >
      {children}
      {selected && <Check aria-hidden className="ms-auto h-4 w-4 text-accent" />}
    </button>
  );
}

// ─── Thème ───────────────────────────────────────────────────────────────────

function ThemePicker() {
  const { t, theme, setTheme, customColors, setCustomColor, resetCustomColors } = useApp();

  return (
    <Dropdown label={t.themeLabel}>
      {(close) => (
        <>
          {THEME_IDS.map((id) => (
            <MenuItem
              key={id}
              selected={theme === id}
              onClick={() => {
                setTheme(id);
                if (id !== "custom") close();
              }}
            >
              {t.themes[id]}
            </MenuItem>
          ))}

          {theme === "custom" && (
            <div className="border-t border-muted/20 px-4 py-3">
              <p className="text-xs font-semibold text-muted">{t.customColorsTitle}</p>
              <div className="mt-2 flex flex-col gap-2">
                {CUSTOM_COLOR_KEYS.map((key) => (
                  <label key={key} className="flex cursor-pointer items-center justify-between gap-3 text-sm text-ink">
                    {t.customColors[key]}
                    <input
                      type="color"
                      value={customColors[key]}
                      onChange={(e) => setCustomColor(key, e.target.value)}
                      className="h-8 w-12 cursor-pointer rounded-md border border-muted/40 bg-transparent p-0.5"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={resetCustomColors}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
              >
                <RotateCcw aria-hidden className="h-3.5 w-3.5" />
                {t.customReset}
              </button>
            </div>
          )}
        </>
      )}
    </Dropdown>
  );
}

// ─── Langue ──────────────────────────────────────────────────────────────────

function LangPicker() {
  const { t, lang, setLang } = useApp();
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <Dropdown
      label={
        <>
          <span aria-hidden>{current.flag}</span>
          <span>{t.langLabel}</span>
        </>
      }
    >
      {(close) =>
        LANGUAGES.map((l) => (
          <MenuItem
            key={l.code}
            selected={lang === l.code}
            onClick={() => {
              setLang(l.code);
              close();
            }}
          >
            <span aria-hidden className="text-base leading-none">
              {l.flag}
            </span>
            <span lang={l.htmlLang}>{l.label}</span>
          </MenuItem>
        ))
      }
    </Dropdown>
  );
}

export function HeaderControls() {
  return (
    <div className="flex items-center justify-center gap-2">
      <ThemePicker />
      <LangPicker />
    </div>
  );
}
