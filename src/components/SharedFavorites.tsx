"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/app-context";
import { decodeShare, loadFavorites, saveFavorites, MAX_FAVORITES } from "@/lib/favorites";
import { applyDomainResult, verifyPendingDomains } from "@/lib/domains/client-check";
import type { NameResult } from "@/types";
import { ResultCard } from "./ResultCard";

// =============================================================================
// Page de partage : affiche la sélection reçue, revérifie les domaines en
// direct (ils ont pu être réservés depuis), et permet de l'ajouter à ses
// propres favoris.
// =============================================================================

export function SharedFavorites() {
  const { t } = useApp();
  const [items, setItems] = useState<NameResult[] | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [myFavorites, setMyFavorites] = useState<NameResult[]>([]);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    const shared = decodeShare(window.location.hash);
    setMyFavorites(loadFavorites());
    if (!shared) {
      setInvalid(true);
      return;
    }
    const list: NameResult[] = shared.map((s) => ({
      id: crypto.randomUUID(),
      nom: s.nom,
      explication: s.explication,
      domains: s.tlds.map((tld) => ({ tld, status: "checking", affiliateUrl: null })),
    }));
    setItems(list);
    verifyPendingDomains(list, (id, tld, result) =>
      setItems((prev) => (prev ? applyDomainResult(prev, id, tld, result) : prev))
    );
  }, []);

  const isMine = (r: NameResult) => myFavorites.some((f) => f.nom.toLowerCase() === r.nom.toLowerCase());

  function toggle(r: NameResult) {
    const next = isMine(r)
      ? myFavorites.filter((f) => f.nom.toLowerCase() !== r.nom.toLowerCase())
      : [r, ...myFavorites].slice(0, MAX_FAVORITES);
    setMyFavorites(next);
    saveFavorites(next);
  }

  function importAll() {
    if (!items) return;
    const next = [...items.filter((r) => !isMine(r)), ...myFavorites].slice(0, MAX_FAVORITES);
    setMyFavorites(next);
    saveFavorites(next);
    setImported(true);
  }

  const cta = (
    <Link href="/" className="rounded-full bg-accent px-6 py-3 font-bold text-on-accent transition hover:brightness-95">
      {t.sharedCta}
    </Link>
  );

  if (invalid) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <p className="text-lg text-muted">{t.sharedInvalid}</p>
        {cta}
      </div>
    );
  }
  if (!items) return null;

  return (
    <div>
      <header className="text-center">
        <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">{t.sharedTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{t.sharedIntro}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={importAll}
            disabled={imported}
            className="rounded-full border border-accent px-6 py-3 font-semibold text-ink transition-colors hover:bg-accent/10 disabled:opacity-60"
          >
            {imported ? t.sharedImported : t.sharedImport}
          </button>
          {cta}
        </div>
      </header>

      <ul className="mt-12 grid grid-cols-1 gap-x-12 lg:grid-cols-2">
        {items.map((r) => (
          <li key={r.id} className="border-t border-border">
            <ResultCard result={r} isFavorite={isMine(r)} onToggleFavorite={() => toggle(r)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
