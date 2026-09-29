import { LoaderCircle, Sparkles } from "lucide-react";

// =============================================================================
// Bouton principal "Générer" — le style est dans globals.css (.generate-btn)
// =============================================================================

interface GenerateButtonProps {
  label: string;
  loadingLabel: string;
  loading: boolean;
  /** true quand l'utilisateur a saisi une description → légère pulsation */
  ready: boolean;
}

export function GenerateButton({ label, loadingLabel, loading, ready }: GenerateButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      data-ready={ready && !loading ? "" : undefined}
      className="generate-btn"
    >
      {loading ? (
        <LoaderCircle aria-hidden className="h-5 w-5 animate-spin" />
      ) : (
        <Sparkles aria-hidden className="h-5 w-5" />
      )}
      <span>{loading ? loadingLabel : label}</span>
    </button>
  );
}
