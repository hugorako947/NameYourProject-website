import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ShieldCheck } from "lucide-react";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/admin";

// =============================================================================
// NameYourProject — Page /admin (réservée au créateur du site)
// Aucun lien n'y mène depuis le site, et elle est exclue de Google.
// =============================================================================

export const metadata: Metadata = {
  title: "Administration — NameYourProject",
  robots: { index: false, follow: false },
};

const card = "mx-auto mt-16 w-full max-w-md rounded-2xl border border-border p-8";
const button =
  "w-full rounded-full bg-ink py-3 font-semibold text-paper transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const [cookieStore, params] = await Promise.all([cookies(), searchParams]);
  const isAdmin = isAdminCookie(cookieStore.get(ADMIN_COOKIE)?.value);
  const hasError = params.error === "1";

  return (
    <main className="flex-1 px-6">
      <div className={card}>
        <h1 className="font-display text-3xl font-bold text-ink">Administration</h1>

        {isAdmin ? (
          <>
            <p className="mt-4 flex items-center gap-2 font-medium text-ink">
              <ShieldCheck aria-hidden className="h-5 w-5" />
              Accès illimité actif sur ce navigateur.
            </p>
            <p className="mt-2 text-sm text-muted">
              Pour tester la limite comme un visiteur, utilise simplement le lien « Passer en mode visiteur »
              sous le compteur, sur la page d&apos;accueil : un clic pour sortir, un clic pour revenir, sans
              ressaisir ton secret.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a href="/" className={`${button} text-center`}>
                Aller au site
              </a>
              <form method="post" action="/api/admin/lock">
                <button type="submit" className="w-full rounded-full border border-muted/60 py-3 font-semibold text-ink transition hover:border-ink">
                  Déconnecter complètement ce navigateur
                </button>
              </form>
            </div>
          </>
        ) : (
          <form method="post" action="/api/admin/unlock" className="mt-6 flex flex-col gap-4">
            {/* Champ invisible : permet au navigateur d'enregistrer le secret comme un mot de passe */}
            <input type="text" name="username" value="admin" autoComplete="username" readOnly hidden />
            <label htmlFor="secret" className="text-sm font-medium text-ink">
              Secret administrateur
            </label>
            <input
              id="secret"
              name="secret"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-muted/60 bg-paper p-3 text-ink focus:border-ink focus:outline-none"
            />
            {hasError && (
              <p role="alert" className="text-sm font-medium text-danger">
                Secret incorrect, ou ADMIN_BYPASS_SECRET absent du fichier .env.local.
              </p>
            )}
            <button type="submit" className={button}>
              Activer l&apos;accès illimité
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
