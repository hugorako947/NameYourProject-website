"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  BookOpen,
  CircleAlert,
  CircleCheck,
  Code,
  ExternalLink,
  Gamepad2,
  Rocket,
  Search,
  Smartphone,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { alsoSearchLinks, sourceSearchUrl } from "@/lib/web-links";
import {
  MAX_SEARCH_QUERY_LENGTH,
  type ApiErrorBody,
  type ApiErrorCode,
  type CompetitorsRequest,
  type CompetitorsResponse,
  type WebSourceId,
  type WebSourceResult,
} from "@/types";
import { BackLink } from "./BackLink";
import { Spinner } from "./ui/Spinner";

// =============================================================================
// Page Concurrence : « ce projet ou ce nom existe-t-il déjà ? »
// Le visiteur tape un nom ou une description ; le serveur interroge des sources
// publiques (POST /api/competitors) et on affiche les résultats par source,
// les noms identiques en tête, avec un verdict simple.
// L'adresse garde la recherche (?q=…) : on peut la partager ou y revenir.
// =============================================================================

const SOURCE_ICONS: Record<WebSourceId, LucideIcon> = {
  wikipedia: BookOpen,
  github: Code,
  appstore: Smartphone,
  steam: Gamepad2,
  hackernews: Rocket,
};

const pill =
  "inline-flex items-center gap-1.5 rounded-full border border-muted/50 px-3 py-1 text-xs font-medium text-ink/80 transition-colors hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

export function CompetitorSearch({ initialQuery }: { initialQuery: string }) {
  const { t, lang, locale } = useApp();
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorCode | null>(null);
  const [data, setData] = useState<CompetitorsResponse | null>(null);
  const autoRun = useRef(false);

  async function search(value: string) {
    const q = value.trim();
    if (q.length < 2 || loading) return;
    setLoading(true);
    setError(null);
    // L'adresse reflète la recherche, sans recharger la page
    window.history.replaceState(null, "", `/concurrence?q=${encodeURIComponent(q)}`);
    try {
      const payload: CompetitorsRequest = { query: q, lang };
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) setData((await res.json()) as CompetitorsResponse);
      else setError(((await res.json().catch(() => null)) as ApiErrorBody | null)?.error ?? "SEARCH_FAILED");
    } catch {
      setError("SEARCH_FAILED");
    }
    setLoading(false);
  }

  // Arrivée depuis le bouton « Concurrence » d'un nom : recherche lancée tout de suite
  useEffect(() => {
    if (autoRun.current || !initialQuery.trim()) return;
    autoRun.current = true;
    search(initialQuery);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    search(query);
  }

  const number = (n: number) => new Intl.NumberFormat(locale).format(n);
  const allHits = data?.sources.flatMap((s) => s.hits) ?? [];
  const exactCount = allHits.filter((h) => h.exact).length;
  const verdict =
    exactCount > 0
      ? { Icon: CircleAlert, className: "text-danger", text: t.competitorsVerdictTaken(exactCount) }
      : allHits.length > 0
        ? { Icon: TriangleAlert, className: "text-ink", text: t.competitorsVerdictCrowded }
        : { Icon: CircleCheck, className: "text-accent", text: t.competitorsVerdictClear };

  return (
    <div className="w-full">
      <BackLink label={t.backToGenerator} />

      <header className="mx-auto mt-6 max-w-3xl text-center">
        <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">{t.competitorsTitle}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">{t.competitorsIntro}</p>
      </header>

      <form onSubmit={handleSubmit} role="search" className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <label htmlFor="competitor-query" className="sr-only">
          {t.competitorsLabel}
        </label>
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            id="competitor-query"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={MAX_SEARCH_QUERY_LENGTH}
            placeholder={t.competitorsPlaceholder}
            autoComplete="off"
            className="w-full rounded-full border border-muted/50 bg-paper py-3.5 pe-5 ps-12 text-ink shadow-sm placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          aria-busy={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 font-bold text-on-accent transition hover:brightness-95 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {loading ? <Spinner className="h-5 w-5" /> : <Search aria-hidden className="h-5 w-5" />}
          {loading ? t.competitorsLoading : t.competitorsBtn}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-6 text-center text-sm font-medium text-danger">
          {t.errors[error]}
        </p>
      )}

      {data && (
        <section aria-live="polite" className={cn("mx-auto mt-10 max-w-5xl transition-opacity", loading && "opacity-60")}>
          <p className={cn("flex items-start justify-center gap-2 text-center text-lg font-semibold", verdict.className)}>
            <verdict.Icon aria-hidden className="mt-1 h-5 w-5 shrink-0" />
            <span>{verdict.text}</span>
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {data.sources.map((source) => (
              <SourceCard key={source.source} result={source} query={data.query} number={number} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-medium text-ink">{t.competitorsAlsoSearch}</span>
            {alsoSearchLinks(data.query).map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className={pill}>
                {link.label}
                <ExternalLink aria-hidden className="h-3 w-3" />
              </a>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            {t.competitorsDisclaimer}
            {!data.unlimited && <> · {t.competitorsRemaining(data.remaining)}</>}
          </p>
        </section>
      )}
    </div>
  );
}

function SourceCard({ result, query, number }: { result: WebSourceResult; query: string; number: (n: number) => string }) {
  const { t } = useApp();
  const Icon = SOURCE_ICONS[result.source];
  const label = t.competitorsSources[result.source];
  const seeAll = sourceSearchUrl(result.source, query);
  const metric = (n: number | null) => {
    if (n === null || n === 0) return null;
    const source = result.source;
    return source === "github" || source === "appstore" || source === "hackernews" ? t.competitorsMetric[source](number(n)) : null;
  };

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-paper/80 p-5 shadow-sm shadow-ink/5">
      <header className="flex items-start gap-3">
        <span className="rounded-xl bg-accent/10 p-2 text-accent">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold text-ink">{label.label}</h2>
          <p className="text-xs text-muted">{label.hint}</p>
        </div>
        {result.ok && result.total > 0 && (
          <span className="shrink-0 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium tabular-nums text-ink">
            {t.competitorsTotal(number(result.total))}
          </span>
        )}
      </header>

      {!result.ok ? (
        <p className="mt-4 text-sm text-muted">{t.competitorsUnavailable}</p>
      ) : result.hits.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{t.competitorsNone}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {result.hits.map((hit) => (
            <li key={hit.url} className="text-sm">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <a
                  href={hit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-ink underline decoration-muted/40 underline-offset-4 hover:decoration-ink"
                >
                  {hit.title}
                  <ExternalLink aria-hidden className="h-3 w-3 shrink-0" />
                </a>
                {hit.exact && (
                  <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">{t.competitorsExact}</span>
                )}
                {metric(hit.metric) && <span className="text-xs text-muted">{metric(hit.metric)}</span>}
              </div>
              {hit.description && <p className="mt-0.5 line-clamp-2 text-ink/70">{hit.description}</p>}
            </li>
          ))}
        </ul>
      )}

      {result.ok && seeAll && result.total > result.hits.length && (
        <a href={seeAll} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 self-start text-xs font-medium text-muted underline underline-offset-4 hover:text-ink">
          {t.competitorsSeeAll}
          <ExternalLink aria-hidden className="h-3 w-3" />
        </a>
      )}
    </article>
  );
}
