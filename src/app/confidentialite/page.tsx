import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { privacyPolicy } from "@/lib/legal-content";
import { SITE_NAME } from "@/lib/i18n";
import { getLegalPagePrefs } from "@/lib/request-prefs";
import { activeServices } from "@/lib/active-services";

export async function generateMetadata(): Promise<Metadata> {
  const { legalLang } = await getLegalPagePrefs();
  return { title: `${privacyPolicy(legalLang, activeServices()).title} — ${SITE_NAME}` };
}

export default async function Page() {
  const { legalLang, notice, backLabel } = await getLegalPagePrefs();
  return <LegalPage doc={privacyPolicy(legalLang, activeServices())} lang={legalLang} notice={notice} backLabel={backLabel} />;
}
