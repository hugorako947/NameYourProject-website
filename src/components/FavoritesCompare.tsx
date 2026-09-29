"use client";

import type { DomainStatus, NameResult } from "@/types";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

// =============================================================================
// Vue « Comparer » des favoris : un tableau, un nom par ligne, une colonne par
// extension de domaine, pour départager ses finalistes d'un coup d'œil.
// =============================================================================

const dot: Record<DomainStatus, string> = {
  available: "bg-accent",
  taken: "bg-muted",
  unknown: "bg-muted/40",
  checking: "animate-pulse bg-muted",
};

interface FavoritesCompareProps {
  favorites: NameResult[];
  tlds: string[];
  statusLabels: Record<DomainStatus, string>;
}

export function FavoritesCompare({ favorites, tlds, statusLabels }: FavoritesCompareProps) {
  const { t } = useApp();
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-ink/[0.03] text-ink">
            <th scope="col" className="px-4 py-3 text-start font-semibold">{t.compareName}</th>
            <th scope="col" className="px-4 py-3 text-start font-semibold">{t.compareMeaning}</th>
            {tlds.map((tld) => (
              <th key={tld} scope="col" className="px-3 py-3 text-start font-semibold whitespace-nowrap">
                {tld}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {favorites.map((f) => (
            <tr key={f.id} className="border-b border-border last:border-0">
              <th scope="row" className="px-4 py-3 text-start font-display text-lg font-semibold text-ink">
                {f.nom}
              </th>
              <td className="max-w-xs px-4 py-3 text-muted">{f.explication}</td>
              {tlds.map((tld) => {
                const d = f.domains.find((x) => x.tld === tld);
                return (
                  <td key={tld} className="px-3 py-3 whitespace-nowrap">
                    {d ? (
                      <span className="inline-flex items-center gap-1.5 text-ink/80">
                        <span aria-hidden className={cn("h-2 w-2 rounded-full ring-1 ring-inset ring-ink/10", dot[d.status])} />
                        {statusLabels[d.status]}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
