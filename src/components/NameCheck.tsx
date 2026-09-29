"use client";

import { useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  CircleQuestionMark,
  ExternalLink,
  Image as ImageIcon,
  LoaderCircle,
  Scale,
  ScanSearch,
  Search,
  TriangleAlert,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import type { ApiErrorBody, ApiErrorCode, InsightVerdict, NameInsightRequest, NameInsightResponse } from "@/types";

// =============================================================================
// Vérifier un nom généré, sous chaque carte de résultat :
//   • 3 liens rapides : Google (nom exact), Google Images, base de marques OMPI
//   • « Qu'évoque ce nom ? » : recherche Google + résumé par l'IA, à la demande
// =============================================================================

const WIPO_BRAND_DB = "https://branddb.wipo.int/";

const VERDICT_STYLE: Record<InsightVerdict, { Icon: typeof CircleCheck; className: string }> = {
  FREE: { Icon: CircleCheck, className: "text-accent" },
  IN_USE: { Icon: CircleAlert, className: "text-danger" },
  ASSOCIATED: { Icon: TriangleAlert, className: "text-danger" },
  UNKNOWN: { Icon: CircleQuestionMark, className: "text-muted" },
};

const pill =
  "inline-flex items-center gap-1.5 rounded-full border border-muted/50 px-3 py-1 text-xs font-medium text-ink/80 transition-colors hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

export function NameCheck({ name }: { name: string }) {
  const { t, lang } = useApp();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorCode | null>(null);
  const [data, setData] = useState<NameInsightResponse | null>(null);

  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`"${name}"`)}`;
  const imagesUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(name)}`;

  async function openTrademarks() {
    // La base de l'OMPI n'accepte pas de recherche pré-remplie par lien :
    // on copie le nom pour que l'utilisateur n'ait plus qu'à le coller.
    try {
      await navigator.clipboard.writeText(name);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch {
      // presse-papiers indisponible : on ouvre quand même la base
    }
    window.open(WIPO_BRAND_DB, "_blank", "noopener,noreferrer");
  }

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const payload: NameInsightRequest = { name, lang };
      const res = await fetch("/api/name-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) setData((await res.json()) as NameInsightResponse);
      else setError(((await res.json().catch(() => null)) as ApiErrorBody | null)?.error ?? "INSIGHT_FAILED");
    } catch {
      setError("INSIGHT_FAILED");
    }
    setLoading(false);
  }

  const insight = data?.insight;
  const verdict = insight ? VERDICT_STYLE[insight.verdict] : null;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className={pill}>
          <Search aria-hidden className="h-3.5 w-3.5" />
          {t.checkGoogle}
        </a>
        <a href={imagesUrl} target="_blank" rel="noopener noreferrer" className={pill}>
          <ImageIcon aria-hidden className="h-3.5 w-3.5" />
          {t.checkImages}
        </a>
        <button type="button" onClick={openTrademarks} className={pill}>
          <Scale aria-hidden className="h-3.5 w-3.5" />
          {t.checkTrademarks}
        </button>
        {!insight && (
          <button
            type="button"
            onClick={analyze}
            disabled={loading}
            className={cn(pill, "border-accent/70 font-semibold text-ink hover:border-accent hover:bg-accent/10 disabled:opacity-70")}
          >
            {loading ? (
              <LoaderCircle aria-hidden className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ScanSearch aria-hidden className="h-3.5 w-3.5 text-accent" />
            )}
            {loading ? t.insightLoading : t.insightBtn}
          </button>
        )}
      </div>

      {copied && (
        <p role="status" className="mt-2 text-xs text-muted">
          {t.trademarkCopied}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-danger">
          {t.errors[error]}
        </p>
      )}

      {insight && verdict && (
        <div aria-live="polite" className="mt-4 rounded-xl border border-border bg-paper/80 p-4">
          <p className={cn("flex items-center gap-2 font-semibold", verdict.className)}>
            <verdict.Icon aria-hidden className="h-5 w-5 shrink-0" />
            {t.insightVerdicts[insight.verdict]}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink/85">{insight.summary}</p>
          {insight.association && <p className="mt-2 text-sm text-muted">{t.insightAssociation(insight.association)}</p>}

          {insight.uses.length > 0 && (
            <>
              <p className="mt-3 text-sm font-semibold text-ink">{t.insightUses}</p>
              <ul className="mt-1 list-disc space-y-0.5 ps-5 text-sm text-ink/80">
                {insight.uses.map((use) => (
                  <li key={use}>{use}</li>
                ))}
              </ul>
            </>
          )}

          {insight.sources.length > 0 && (
            <>
              <p className="mt-3 text-sm font-semibold text-ink">{t.insightSources}</p>
              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {insight.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-ink/80 underline decoration-muted/50 underline-offset-4 hover:text-ink"
                    >
                      {source.title}
                      <ExternalLink aria-hidden className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Suggestions de recherche de Google : affichage demandé par ses conditions.
              Isolées dans un cadre sans script, liens ouverts dans un nouvel onglet. */}
          {insight.searchSuggestionsHtml && (
            <iframe
              title="Google"
              sandbox="allow-popups allow-popups-to-escape-sandbox"
              srcDoc={`<!doctype html><html><head><base target="_blank"><meta name="color-scheme" content="light dark"></head><body style="margin:0">${insight.searchSuggestionsHtml}</body></html>`}
              className="mt-3 h-16 w-full border-0"
            />
          )}

          <p className="mt-3 text-xs text-muted">
            {t.insightDisclaimer}
            {data && !data.unlimited && <> · {t.insightRemaining(data.remaining)}</>}
          </p>
        </div>
      )}
    </div>
  );
}
