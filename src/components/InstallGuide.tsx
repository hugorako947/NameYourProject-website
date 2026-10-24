"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy, Download, Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import {
  detectPlatform,
  getInstallState,
  getServerInstallState,
  isRunningStandalone,
  promptInstall,
  subscribeInstall,
  type Platform,
} from "@/lib/pwa-client";
import { BackLink } from "./BackLink";
import { QrCode } from "./QrCode";
import { Spinner, usePendingAction } from "./ui/Spinner";

// =============================================================================
// Page /installer : installer NameYourProject comme une application.
//   • Chrome / Edge / Android : bouton « Installer l'application » (invitation
//     native du navigateur, captée par lib/pwa-client.ts)
//   • iPhone / iPad (Safari) : étapes « Partager → Sur l'écran d'accueil »
//   • sur ordinateur : QR code à scanner pour ouvrir CETTE page sur le
//     téléphone, avec les bonnes instructions
// L'onglet de l'appareil détecté est ouvert d'office ; les autres restent
// accessibles (détection imparfaite, ou installation pour quelqu'un d'autre).
// =============================================================================

const PLATFORMS: { id: Platform; Icon: LucideIcon }[] = [
  { id: "android", Icon: Smartphone },
  { id: "ios", Icon: Tablet },
  { id: "desktop", Icon: Monitor },
];

export function InstallGuide() {
  const { t } = useApp();
  const installState = useSyncExternalStore(subscribeInstall, getInstallState, getServerInstallState);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [standalone, setStandalone] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [installing, install] = usePendingAction(promptInstall);

  // Détection après l'affichage : le serveur ne connaît pas l'appareil
  useEffect(() => {
    setPlatform(detectPlatform(navigator.userAgent, navigator.maxTouchPoints));
    setStandalone(isRunningStandalone());
    setPageUrl(`${window.location.origin}/installer`);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // presse-papiers indisponible : l'adresse reste lisible sous le QR code
    }
  }

  const done = standalone || installState === "installed";

  return (
    <div className="w-full">
      <BackLink label={t.backToGenerator} />

      <header className="mx-auto mt-6 max-w-3xl text-center">
        <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">{t.installTitle}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">{t.installIntro}</p>
      </header>

      <div className="mt-8 flex flex-col items-center gap-3">
        {done ? (
          <p role="status" className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-5 py-2.5 font-semibold text-ink">
            <Check aria-hidden className="h-5 w-5 text-accent" />
            {standalone ? t.installAlready : t.installDone}
          </p>
        ) : (
          installState === "available" && (
            <button
              type="button"
              onClick={() => install()}
              disabled={installing}
              aria-busy={installing}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-lg font-bold text-on-accent shadow-md shadow-accent/30 transition hover:brightness-95 disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {installing ? <Spinner className="h-5 w-5" /> : <Download aria-hidden className="h-5 w-5" />}
              {t.installBtn}
            </button>
          )
        )}
      </div>

      <div className={cn("mx-auto mt-10 grid max-w-5xl gap-8", platform === "desktop" && "lg:grid-cols-[1fr_auto]")}>
        {/* Instructions par appareil */}
        <section className="rounded-2xl border border-border bg-paper/80 p-6 shadow-sm shadow-ink/5">
          <div role="tablist" className="flex flex-wrap gap-1.5">
            {PLATFORMS.map(({ id, Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={platform === id}
                onClick={() => setPlatform(id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  platform === id ? "bg-accent text-on-accent" : "text-muted hover:bg-ink/5 hover:text-ink"
                )}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {t.installPlatforms[id]}
              </button>
            ))}
          </div>
          <ol role="tabpanel" className="mt-6 space-y-4">
            {t.installSteps[platform].map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-ink/85">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold tabular-nums text-ink">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* QR code : sur ordinateur, pour ouvrir cette page sur le téléphone */}
        {platform === "desktop" && pageUrl && (
          <section className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-paper/80 p-6 text-center shadow-sm shadow-ink/5 lg:w-80">
            <h2 className="font-display text-xl font-semibold text-ink">{t.installQrTitle}</h2>
            <QrCode value={pageUrl} label={t.installQrTitle} />
            <p className="text-sm leading-relaxed text-muted">{t.installQrText}</p>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-muted/50 px-3.5 py-1.5 text-sm font-medium text-ink/80 transition-colors hover:border-ink hover:text-ink"
            >
              {copied ? <Check aria-hidden className="h-4 w-4 text-accent" /> : <Copy aria-hidden className="h-4 w-4" />}
              {copied ? t.installLinkCopied : t.installCopyLink}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
