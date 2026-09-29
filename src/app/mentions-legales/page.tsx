import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalNotice } from "@/lib/legal-content";
import { SITE_NAME } from "@/lib/i18n";
import { getLegalPagePrefs } from "@/lib/request-prefs";

export async function generateMetadata(): Promise<Metadata> {
  const { legalLang } = await getLegalPagePrefs();
  return { title: `${legalNotice(legalLang).title} — ${SITE_NAME}` };
}

export default async function Page() {
  const { legalLang, notice, backLabel } = await getLegalPagePrefs();
  return <LegalPage doc={legalNotice(legalLang)} lang={legalLang} notice={notice} backLabel={backLabel} />;
}
