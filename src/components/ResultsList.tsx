"use client";

import type { NameResult } from "@/types";
import { ResultCard } from "./ResultCard";

interface ResultsListProps {
  results: NameResult[] | null;
  favorites: NameResult[];
  onToggleFavorite: (r: NameResult) => void;
  /** « Plus comme celui-ci » */
  onMoreLikeThis: (r: NameResult) => void;
  /** Carte dont les variantes sont en cours de génération */
  variantLoadingId: string | null;
  /** Une génération est en cours (boutons désactivés) */
  busy: boolean;
  emptyMessage: string;
}

export function ResultsList({
  results,
  favorites,
  onToggleFavorite,
  onMoreLikeThis,
  variantLoadingId,
  busy,
  emptyMessage,
}: ResultsListProps) {
  if (!results || results.length === 0) {
    return <p className="mt-8 text-center text-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-10 grid grid-cols-1 gap-x-12 lg:grid-cols-2">
      {results.map((result) => (
        <li key={result.id} className="border-t border-border">
          <ResultCard
            result={result}
            isFavorite={favorites.some((f) => f.id === result.id)}
            onToggleFavorite={() => onToggleFavorite(result)}
            onMoreLikeThis={() => onMoreLikeThis(result)}
            variantLoading={variantLoadingId === result.id}
            busy={busy}
          />
        </li>
      ))}
    </ul>
  );
}
