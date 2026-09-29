"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { CircleCheck, Copy, Download, Heart, Info, Share2, Sparkles } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import {
  CATEGORIES,
  MAX_CUSTOM_CATEGORY_LENGTH,
  MAX_KEYWORDS_LENGTH,
  NAME_LENGTHS,
  NAME_STYLES,
  type ApiErrorBody,
  type ApiErrorCode,
  type Category,
  type CheckDomainRequest,
  type CheckDomainResponse,
  type DomainStatus,
  type GenerateRequest,
  type GenerateResponse,
  type NameLength,
  type NameResult,
  type NameStyle,
  type AdminModeRequest,
  type QuotaResponse,
  type Vibe,
} from "@/types";
import { SITE_NAME } from "@/lib/i18n";
import { useApp } from "@/lib/app-context";
import { VIBE_ACCENT } from "@/lib/vibe-theme";
import { onAccentFor, resolveAccent } from "@/lib/theme";
import { FREE_GENERATIONS_PER_DAY } from "@/lib/pricing";
import { applyDomainResult, verifyPendingDomains } from "@/lib/domains/client-check";
import {
  MAX_FAVORITES,
  collectTlds,
  encodeShare,
  favoritesToCsv,
  favoritesToText,
  loadFavorites,
  saveFavorites,
} from "@/lib/favorites";
import { cn } from "@/lib/utils";
import { RichText } from "./RichText";
import { VibeSelector } from "./VibeSelector";
import { ResultsList } from "./ResultsList";
import { GenerateButton } from "./GenerateButton";
import { QuotaBar } from "./QuotaBar";
import { BuyCreditsDialog } from "./BuyCreditsDialog";
import { FavoritesCompare } from "./FavoritesCompare";
import { RestoreCreditsDialog } from "./RestoreCreditsDialog";

interface SearchFormProps {
  initialKeywords?: string;
  initialVibe?: Vibe;
  /** Catégorie présélectionnée (pages SEO) */
  initialCategory?: Category;
  initialCustomCategory?: string;
  /** Masque le grand titre : les pages SEO affichent le leur */
  hideHeader?: boolean;
}

type Status = "idle" | "loading" | "success" | "error";

/**
 * Anti-robots Cloudflare Turnstile : affiché seulement s'il est activé ET que sa
 * clé publique est renseignée (voir .env.example). Le plus souvent invisible.
 */
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true" ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "" : "";

/** Noms déjà proposés pendant la visite, envoyés au serveur pour ne pas les reproposer. */
const MAX_SHOWN_NAMES = 150;

const selectClass =
  "w-full rounded-lg border border-muted/60 bg-paper p-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50";

export function SearchForm({
  initialKeywords = "",
  initialVibe = "Fun",
  initialCategory = "Other",
  initialCustomCategory = "",
  hideHeader = false,
}: SearchFormProps) {
  const { t, lang, theme, customColors } = useApp();

  const [keywords, setKeywords] = useState(initialKeywords);
  const [vibe, setVibe] = useState<Vibe>(initialVibe);
  const [category, setCategory] = useState<Category>(initialCategory);
  const [customCategory, setCustomCategory] = useState(initialCustomCategory);
  const [length, setLength] = useState<NameLength>("Any");
  const [style, setStyle] = useState<NameStyle>("Any");

  const [status, setStatus] = useState<Status>("idle");
  const [errorCode, setErrorCode] = useState<ApiErrorCode | "EMPTY" | null>(null);
  const [results, setResults] = useState<NameResult[] | null>(null);
  /** Nombre de noms de la dernière génération dont le .com est libre */
  const [freeComCount, setFreeComCount] = useState<number | null>(null);
  /** Tous les noms proposés depuis l'arrivée sur la page (jamais reproposés) */
  const [shownNames, setShownNames] = useState<string[]>([]);
  /** « Plus comme celui-ci » : nom dont les résultats affichés sont des variantes */
  const [variantOf, setVariantOf] = useState<string | null>(null);
  const [variantLoadingId, setVariantLoadingId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const formErrorRef = useRef<HTMLDivElement>(null);

  const [quota, setQuota] = useState<Omit<QuotaResponse, "remaining"> & { remaining: number | null }>({
    remaining: null,
    limit: FREE_GENERATIONS_PER_DAY,
    unlimited: false,
    isAdmin: false,
    credits: null,
    creditsEmail: null,
    paymentsEnabled: false,
  });
  const [buyOpen, setBuyOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const [favorites, setFavorites] = useState<NameResult[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"generated" | "favorites">("generated");
  const [favView, setFavView] = useState<"list" | "compare">("list");
  const [favNotice, setFavNotice] = useState<string | null>(null);

  // Favoris conservés dans CE navigateur (sans compte) : rechargés à l'arrivée…
  useEffect(() => {
    // Une vérification interrompue (page fermée entre-temps) devient "inconnu"
    setFavorites(
      loadFavorites().map((f) => ({
        ...f,
        domains: f.domains.map((d) => (d.status === "checking" ? { ...d, status: "unknown" as DomainStatus } : d)),
      }))
    );
    setFavoritesLoaded(true);
  }, []);

  // …et enregistrés à chaque ajout / retrait
  useEffect(() => {
    if (favoritesLoaded) saveFavorites(favorites);
  }, [favorites, favoritesLoaded]);

  const isLoading = status === "loading";

  // Accent de la vibe, adapté au thème (inversé / personnalisé)
  const accent = resolveAccent(theme, customColors, VIBE_ACCENT[vibe]);
  const themeStyle = {
    "--color-accent": accent,
    "--color-on-accent": onAccentFor(accent),
  } as CSSProperties;

  // Le fond du site (halos) prend la couleur de la vibe, avec un fondu doux
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--glow", accent);
    return () => {
      root.style.removeProperty("--glow");
    };
  }, [accent]);

  // Quota affiché dès l'arrivée sur la page (sans consommer de génération)
  async function refreshQuota() {
    try {
      const res = await fetch("/api/quota", { cache: "no-store" });
      if (res.ok) setQuota((await res.json()) as QuotaResponse);
    } catch {
      // réseau indisponible : l'affichage reste inchangé
    }
  }

  useEffect(() => {
    refreshQuota();
  }, []);

  /** Déconnecte ce navigateur de l'e-mail acheteur (les générations restent liées à l'e-mail). */
  async function signOutCredits() {
    await fetch("/api/credits/logout", { method: "POST" }).catch(() => null);
    await refreshQuota();
  }

  const toggleFavorite = (result: NameResult) => {
    setFavorites((prev) =>
      prev.some((r) => r.id === result.id)
        ? prev.filter((r) => r.id !== result.id)
        : [result, ...prev].slice(0, MAX_FAVORITES)
    );
  };

  // ── Favoris : copier, télécharger, partager ──────────────────────────────
  const statusLabels: Record<DomainStatus, string> = {
    available: t.domainAvailable,
    taken: t.domainTaken,
    checking: t.domainChecking,
    unknown: t.domainUnknown,
  };

  function notify(message: string) {
    setFavNotice(message);
    setTimeout(() => setFavNotice(null), 5000);
  }

  async function copyFavorites() {
    try {
      await navigator.clipboard.writeText(favoritesToText(favorites, statusLabels));
      notify(t.favCopied);
    } catch {
      notify(t.errors.GENERIC);
    }
  }

  function downloadFavorites() {
    const csv = favoritesToCsv(
      favorites,
      statusLabels,
      { name: t.compareName, meaning: t.compareMeaning },
      lang === "fr" || lang === "es" ? ";" : ","
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${SITE_NAME}-favoris.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function shareFavorites() {
    const url = `${window.location.origin}/favoris#${encodeShare(favorites)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: SITE_NAME, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      notify(t.favLinkCopied);
    } catch {
      // partage annulé par l'utilisateur : rien à faire
    }
  }

  /**
   * Vérifie (pour de vrai, via le registre officiel) les domaines de chaque
   * nom encore marqué "vérification…". Chaque ligne se met à jour dès que sa
   * réponse arrive, à la fois dans les résultats et dans les favoris.
   */
  function verifyDomains(items: NameResult[]) {
    verifyPendingDomains(items, (id, tld, result) => {
      setResults((prev) => (prev ? applyDomainResult(prev, id, tld, result) : prev));
      setFavorites((prev) => (prev.some((f) => f.id === id) ? applyDomainResult(prev, id, tld, result) : prev));
    });
  }

  // Les favoris peuvent dater de plusieurs jours : un domaine libre a pu être
  // réservé depuis. On les revérifie une fois par visite, à l'ouverture de l'onglet.
  const [favoritesRechecked, setFavoritesRechecked] = useState(false);

  function openTab(tab: "generated" | "favorites") {
    setActiveTab(tab);
    if (tab === "favorites" && !favoritesRechecked && favorites.length > 0) {
      setFavoritesRechecked(true);
      const checking = favorites.map((f) => ({
        ...f,
        domains: f.domains.map((d) => ({ ...d, status: "checking" as DomainStatus, affiliateUrl: null })),
      }));
      setFavorites(checking);
      verifyDomains(checking);
    }
  }

  // Admin uniquement : illimité ⇄ mode visiteur, en un clic
  async function toggleAdminMode(unlimited: boolean) {
    try {
      const payload: AdminModeRequest = { unlimited };
      const res = await fetch("/api/admin/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setQuota((await res.json()) as QuotaResponse);
        setErrorCode(null);
        if (status === "error") setStatus("idle");
      }
    } catch {
      // réseau indisponible : l'état affiché reste inchangé
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!keywords.trim()) {
      setStatus("error");
      setErrorCode("EMPTY");
      return;
    }
    await runGeneration(null);
  }

  /** « Plus comme celui-ci » : 10 variantes autour d'un nom aimé (1 génération). */
  async function moreLikeThis(result: NameResult) {
    setVariantLoadingId(result.id);
    const ok = await runGeneration({ nom: result.nom, explication: result.explication });
    setVariantLoadingId(null);
    if (ok) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    else formErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /** Lance une génération ; renvoie true si des noms ont été reçus. */
  async function runGeneration(inspiration: { nom: string; explication: string } | null): Promise<boolean> {
    setStatus("loading");
    setErrorCode(null);
    setActiveTab("generated");

    // Description : celle du formulaire, ou à défaut l'explication du nom aimé
    const description = keywords.trim() || inspiration?.explication || inspiration?.nom || "";
    // Jamais reproposer un nom déjà vu pendant la visite, ni un favori
    const exclude = [...new Set([...shownNames, ...favorites.map((f) => f.nom)])].slice(-MAX_SHOWN_NAMES);

    try {
      const payload: GenerateRequest = {
        keywords: description,
        category,
        customCategory: category === "Other" && customCategory.trim() ? customCategory.trim() : undefined,
        vibe,
        length,
        style,
        lang,
        turnstileToken,
        exclude,
        ...(inspiration ? { inspiration } : {}),
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // Un jeton anti-robots ne sert qu'une fois : on en demande un nouveau
      if (TURNSTILE_SITE_KEY) {
        setTurnstileToken(null);
        turnstileRef.current?.reset();
      }

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
        const code = body?.error ?? "GENERIC";
        if (code === "RATE_LIMITED") setQuota((q) => ({ ...q, remaining: 0 }));
        setStatus("error");
        setErrorCode(code);
        return false;
      }

      const data = (await res.json()) as GenerateResponse;
      setQuota((q) => ({
        ...q,
        remaining: data.rateLimitRemaining,
        limit: data.rateLimitLimit,
        unlimited: data.unlimited,
        credits: data.credits,
      }));

      // Le .com a déjà été vérifié par le serveur (c'est lui qui a trié les noms) ;
      // les autres extensions sont vérifiées ici, en direct.
      const shells: NameResult[] = data.names.map((n) => ({
        id: crypto.randomUUID(),
        nom: n.nom,
        explication: n.explication,
        domains: data.tlds.map((tld) => {
          const known = n.checked[tld];
          return known
            ? { tld, status: known.status, affiliateUrl: known.affiliateUrl }
            : { tld, status: "checking" as DomainStatus, affiliateUrl: null };
        }),
      }));

      setShownNames((prev) => [...prev, ...shells.map((r) => r.nom)].slice(-MAX_SHOWN_NAMES));
      setVariantOf(inspiration?.nom ?? null);
      setFreeComCount(data.freeComCount);
      setResults(shells);
      setStatus("success");

      verifyDomains(shells);
      return true;
    } catch {
      setStatus("error");
      setErrorCode("GENERIC");
      return false;
    }
  }

  const errorMessage =
    status === "error" && errorCode ? (errorCode === "EMPTY" ? t.errorEmpty : t.errors[errorCode]) : null;

  return (
    <div style={themeStyle} className="mb-24 mt-6 flex w-full flex-col items-center">
      {!hideHeader && (
      <header className="w-full text-center">
        <h1 className="font-display text-5xl font-black tracking-tight text-ink sm:text-7xl lg:text-8xl">{SITE_NAME}</h1>
        <h2 className="mt-4 font-display text-2xl font-bold text-accent sm:text-3xl lg:text-4xl">{t.subtitle}</h2>
        {/* Texte limité à ~70 caractères par ligne pour rester agréable à lire */}
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted lg:text-xl">
          <RichText text={t.explanation} />
        </p>
      </header>
      )}

      <form onSubmit={handleSubmit} className="mt-12 flex w-full flex-col gap-10 lg:mt-16">
        {/* Compteur de générations + bouton d'achat, au-dessus de la description */}
        <QuotaBar
          remaining={quota.remaining}
          limit={quota.limit}
          unlimited={quota.unlimited}
          isAdmin={quota.isAdmin}
          credits={quota.credits}
          creditsEmail={quota.creditsEmail}
          paymentsEnabled={quota.paymentsEnabled}
          onBuy={() => setBuyOpen(true)}
          onRestore={() => setRestoreOpen(true)}
          onSignOut={signOutCredits}
          onAdminToggle={toggleAdminMode}
        />

        {/* Description du projet */}
        <div className="group relative">
          <div
            aria-hidden
            className="absolute -inset-0.5 rounded-2xl bg-accent opacity-20 blur-md transition duration-500 group-focus-within:opacity-60"
          />
          <textarea
            rows={4}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={isLoading}
            maxLength={MAX_KEYWORDS_LENGTH}
            aria-label={t.inputLabel}
            placeholder={t.inputPlaceholder}
            className="relative w-full resize-none rounded-2xl border border-muted/30 bg-paper p-5 text-lg text-ink lg:p-6 lg:text-xl shadow-sm transition-shadow placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
        </div>

        <p className="-mt-7 text-center text-xs text-muted">{t.inputPrivacyHint}</p>

        {/* Catégories */}
        <div className="space-y-3">
          <p id="category-label" className="text-sm font-semibold text-ink">
            {t.categoryLabel}
          </p>
          <div role="radiogroup" aria-labelledby="category-label" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {CATEGORIES.map((cat) => {
              const selected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={isLoading}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "flex flex-col items-start justify-start rounded-xl border p-4 text-start transition-colors",
                    selected
                      ? "border-accent bg-accent/10 shadow-sm"
                      : "border-border bg-transparent hover:border-muted hover:bg-muted/5"
                  )}
                >
                  <span className={cn("font-semibold", selected ? "text-ink" : "text-ink/80")}>
                    {t.categories[cat].label}
                  </span>
                  <span className="mt-1 text-xs leading-snug text-muted">{t.categories[cat].description}</span>
                </button>
              );
            })}
          </div>

          {category === "Other" && (
            <div className="space-y-2 pt-2">
              <label htmlFor="custom-category" className="text-sm font-medium text-ink">
                {t.otherLabel}
              </label>
              <input
                id="custom-category"
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                disabled={isLoading}
                maxLength={MAX_CUSTOM_CATEGORY_LENGTH}
                placeholder={t.otherPlaceholder}
                className="w-full rounded-lg border border-muted/60 bg-paper p-3 text-sm text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
              />
            </div>
          )}
        </div>

        {/* Options avancées : la vibe prend la place dont elle a besoin */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-3 md:col-span-2 lg:col-span-1">
            <p id="vibe-label" className="text-sm font-semibold text-ink">
              {t.vibeLabel}
            </p>
            <VibeSelector value={vibe} onChange={setVibe} disabled={isLoading} labelledBy="vibe-label" />
          </div>

          <div className="space-y-3">
            <label htmlFor="length-select" className="block text-sm font-semibold text-ink">
              {t.lengthLabel}
            </label>
            <select
              id="length-select"
              value={length}
              onChange={(e) => setLength(e.target.value as NameLength)}
              disabled={isLoading}
              className={selectClass}
            >
              {NAME_LENGTHS.map((l) => (
                <option key={l} value={l}>
                  {t.lengths[l]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label htmlFor="style-select" className="block text-sm font-semibold text-ink">
              {t.styleLabel}
            </label>
            <select
              id="style-select"
              value={style}
              onChange={(e) => setStyle(e.target.value as NameStyle)}
              disabled={isLoading}
              className={selectClass}
            >
              {NAME_STYLES.map((s) => (
                <option key={s} value={s}>
                  {t.styles[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMessage && (
          <div ref={formErrorRef} role="alert" className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-medium text-danger">{errorMessage}</p>
            {errorCode === "RATE_LIMITED" && (quota.paymentsEnabled || process.env.NODE_ENV !== "production") && (
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBuyOpen(true)}
                  className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-on-accent transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {t.buyCreditsBtn}
                </button>
                {quota.credits === null && quota.paymentsEnabled && (
                  <button
                    type="button"
                    onClick={() => setRestoreOpen(true)}
                    className="text-xs font-medium text-muted underline underline-offset-4 hover:text-ink"
                  >
                    {t.restoreLink}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {TURNSTILE_SITE_KEY && (
          <div className="flex justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              options={{ appearance: "interaction-only", theme: "auto" }}
            />
          </div>
        )}

        {/* Bouton Générer */}
        <div className="mt-2 flex justify-center">
          <GenerateButton
            label={t.generateBtn}
            loadingLabel={t.generatingBtn}
            loading={isLoading}
            ready={keywords.trim().length > 0}
          />
        </div>
      </form>

      <BuyCreditsDialog open={buyOpen} onClose={() => setBuyOpen(false)} />
      <RestoreCreditsDialog
        open={restoreOpen}
        onClose={() => setRestoreOpen(false)}
        onRestored={() => {
          refreshQuota();
          setErrorCode(null);
          setStatus("idle");
        }}
      />

      {/* Onglets Résultats / Favoris */}
      {(results || favorites.length > 0) && (
        <div ref={resultsRef} className="mt-16 w-full scroll-mt-6">
          {/* Onglets : sélecteur à pastilles, avec le nombre de noms dans une pastille
              (pas de parenthèses : elles s'affichent parfois à l'envers selon le sens
              d'écriture de la langue). */}
          <div className="mb-8 flex justify-center">
            <div
              role="tablist"
              className="inline-flex gap-1 rounded-full border border-border bg-paper/80 p-1.5 shadow-sm shadow-ink/5 backdrop-blur"
            >
              {(
                [
                  ["generated", t.generatedNamesTab, results?.length ?? 0, Sparkles],
                  ["favorites", t.favoritesTab, favorites.length, Heart],
                ] as const
              ).map(([id, label, count, Icon]) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => openTab(id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold transition-all sm:px-5",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      active ? "bg-accent text-on-accent shadow-md shadow-accent/30" : "text-muted hover:bg-ink/5 hover:text-ink"
                    )}
                  >
                    <Icon aria-hidden className="h-4 w-4" fill={id === "favorites" && active ? "currentColor" : "none"} />
                    <span>{label}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums",
                          active ? "bg-paper text-ink" : "bg-ink/10 text-ink"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "generated" && variantOf && (
            <p className="mb-2 text-center font-display text-xl font-semibold text-ink">{t.variantsOf(variantOf)}</p>
          )}

          {/* Résumé : combien de noms ont leur .com libre */}
          {activeTab === "generated" && results && freeComCount !== null && (
            <p className="mb-3 flex items-center justify-center gap-2 text-center font-medium text-ink">
              <CircleCheck aria-hidden className="h-5 w-5 shrink-0 text-accent" />
              <span>{t.freeComSummary(freeComCount, results.length)}</span>
            </p>
          )}

          {activeTab === "favorites" && favorites.length > 0 && (
            <div className="mb-5 flex flex-col items-center gap-3">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div role="group" className="inline-flex rounded-full border border-muted/50 p-0.5">
                  {(["list", "compare"] as const).map((view) => (
                    <button
                      key={view}
                      type="button"
                      aria-pressed={favView === view}
                      onClick={() => setFavView(view)}
                      className={cn(
                        "rounded-full px-3.5 py-1 text-sm font-medium transition-colors",
                        favView === view ? "bg-accent text-on-accent" : "text-muted hover:text-ink"
                      )}
                    >
                      {view === "list" ? t.favViewList : t.favViewCompare}
                    </button>
                  ))}
                </div>
                {[
                  { icon: Copy, label: t.favCopy, action: copyFavorites },
                  { icon: Download, label: t.favDownload, action: downloadFavorites },
                  { icon: Share2, label: t.favShare, action: shareFavorites },
                ].map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={action}
                    className="inline-flex items-center gap-1.5 rounded-full border border-muted/50 px-3.5 py-1.5 text-sm font-medium text-ink/80 transition-colors hover:border-ink hover:text-ink"
                  >
                    <Icon aria-hidden className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              {favNotice && (
                <p role="status" className="text-sm text-muted">
                  {favNotice}
                </p>
              )}
            </div>
          )}

          {/* Rappel honnête : le site vérifie le domaine, pas les marques déposées */}
          <p className="flex items-start justify-center gap-2 text-center text-sm text-muted">
            <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t.trademarkNote}</span>
          </p>

          {activeTab === "favorites" && favView === "compare" && favorites.length > 0 ? (
            <FavoritesCompare favorites={favorites} tlds={collectTlds(favorites)} statusLabels={statusLabels} />
          ) : (
          <ResultsList
            results={activeTab === "generated" ? results : favorites}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onMoreLikeThis={moreLikeThis}
            variantLoadingId={variantLoadingId}
            busy={isLoading}
            emptyMessage={activeTab === "generated" ? t.noResults : t.noFavorites}
          />
          )}
        </div>
      )}
    </div>
  );
}
