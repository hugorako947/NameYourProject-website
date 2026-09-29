import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CircleCheck, Clock, TriangleAlert } from "lucide-react";
import { SITE_NAME, TRANSLATIONS } from "@/lib/i18n";
import { getRequestPrefs } from "@/lib/request-prefs";
import { CREDITS_COOKIE, readSessionToken } from "@/lib/credits-session";
import { getCredits } from "@/lib/credits";

// =============================================================================
// NameYourProject — Page de retour après paiement (/achat/merci?status=…)
//   ok           : paiement confirmé, ce navigateur est relié à l'e-mail
//   ok-elsewhere : paiement confirmé, générations à retrouver par e-mail
//   pending      : paiement en cours de validation (virement, etc.)
//   error        : paiement non confirmé
// =============================================================================

export const metadata: Metadata = { title: `${SITE_NAME}`, robots: { index: false, follow: false } };

export default async function ThanksPage({ searchParams }: PageProps<"/achat/merci">) {
  const { lang } = await getRequestPrefs();
  const params = await searchParams;
  const cookieStore = await cookies();
  const t = TRANSLATIONS[lang];
  const status = typeof params.status === "string" ? params.status : "error";

  const session = readSessionToken(cookieStore.get(CREDITS_COOKIE)?.value);
  const balance = session ? await getCredits(session.h) : null;

  const content =
    status === "ok"
      ? { Icon: CircleCheck, title: t.thanksTitle, text: t.thanksOk }
      : status === "ok-elsewhere"
        ? { Icon: CircleCheck, title: t.thanksTitle, text: t.thanksElsewhere }
        : status === "pending"
          ? { Icon: Clock, title: t.thanksTitle, text: t.thanksPending }
          : { Icon: TriangleAlert, title: t.errors.GENERIC, text: t.thanksError };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-6 py-20 text-center">
      <content.Icon aria-hidden className={status === "error" ? "h-14 w-14 text-danger" : "h-14 w-14 text-accent"} />
      <h1 className="mt-6 font-display text-4xl font-bold text-ink">{content.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{content.text}</p>
      {balance !== null && status === "ok" && (
        <p className="mt-6 rounded-full bg-accent/10 px-5 py-2 font-semibold text-ink">{t.creditsBalance(balance)}</p>
      )}
      <Link
        href="/"
        className="mt-10 rounded-full bg-accent px-8 py-3.5 font-bold text-on-accent transition hover:brightness-95"
      >
        {t.backToGenerator}
      </Link>
    </main>
  );
}
