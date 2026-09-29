import { Fragment } from "react";

// =============================================================================
// Affiche un texte en mettant en gras les passages entourés de **...**
// (utilisé pour la description du site, voir `explanation` dans lib/i18n.ts).
// Aucun HTML n'est interprété : pas de risque d'injection.
// =============================================================================

export function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-ink">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}
