import { SITE_NAME, type Lang } from "@/lib/i18n";

// =============================================================================
// NameYourProject — Envoi d'e-mails (via Resend, https://resend.com)
//
// RESEND_API_KEY : clé du service d'envoi
// EMAIL_FROM     : expéditeur, ex. "NameYourProject <contact@nameyourproject.com>"
//                  (le domaine doit être vérifié chez Resend)
//
// En développement sans RESEND_API_KEY, l'e-mail n'est pas envoyé : son
// contenu (dont le code) s'affiche simplement dans le terminal.
// =============================================================================

const RESEND_API_URL = "https://api.resend.com/emails";

interface EmailContent {
  subject: string;
  /** Lignes de texte ; {{code}} est mis en valeur */
  lines: string[];
  code?: string;
  cta?: { label: string; url: string };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function renderHtml(content: EmailContent, rtl: boolean): string {
  const p = (t: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#14171f">${escapeHtml(t)}</p>`;
  const code = content.code
    ? `<p style="margin:8px 0 24px;font-size:34px;font-weight:700;letter-spacing:8px;color:#14171f">${escapeHtml(content.code)}</p>`
    : "";
  const cta = content.cta
    ? `<p style="margin:24px 0"><a href="${escapeHtml(content.cta.url)}" style="background:#14171f;color:#ffffff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">${escapeHtml(content.cta.label)}</a></p>`
    : "";
  const [first, ...rest] = content.lines;
  return `<!doctype html><html dir="${rtl ? "rtl" : "ltr"}"><body style="margin:0;padding:32px;background:#fafafc;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;text-align:${rtl ? "right" : "left"}">
<p style="margin:0 0 24px;font-size:20px;font-weight:700;color:#14171f">${SITE_NAME}</p>
${first ? p(first) : ""}${code}${rest.map(p).join("")}${cta}
</div></body></html>`;
}

function renderText(content: EmailContent): string {
  const [first, ...rest] = content.lines;
  return [SITE_NAME, "", first, content.code ?? "", ...rest, content.cta ? `${content.cta.label} : ${content.cta.url}` : ""]
    .filter((l) => l !== undefined)
    .join("\n");
}

/** Renvoie true si l'e-mail est parti (ou affiché dans le terminal en développement). */
async function send(to: string, content: EmailContent, lang: Lang): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`\n[e-mail] (développement : non envoyé, RESEND_API_KEY absent)\n  À : ${to}\n  Objet : ${content.subject}\n  ${renderText(content).replace(/\n/g, "\n  ")}\n`);
      return true;
    }
    console.error("[e-mail] RESEND_API_KEY manquant : impossible d'envoyer l'e-mail.");
    return false;
  }
  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM?.trim() || `${SITE_NAME} <onboarding@resend.dev>`,
        to: [to],
        subject: content.subject,
        html: renderHtml(content, lang === "ar"),
        text: renderText(content),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`[e-mail] Refus du service d'envoi (${res.status}) :`, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (error) {
    console.error("[e-mail] Envoi impossible :", error instanceof Error ? error.message : error);
    return false;
  }
}

// ─── Textes des e-mails, dans les 6 langues ──────────────────────────────────

const CODE_EMAIL: Record<Lang, (code: string) => EmailContent> = {
  fr: (code) => ({ subject: `Votre code ${SITE_NAME} : ${code}`, code, lines: [
    `Voici votre code pour retrouver les générations achetées sur ${SITE_NAME} :`,
    "Il est valable 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail."] }),
  en: (code) => ({ subject: `Your ${SITE_NAME} code: ${code}`, code, lines: [
    `Here is your code to access the generations you purchased on ${SITE_NAME}:`,
    "It is valid for 15 minutes. If you didn't request it, you can safely ignore this email."] }),
  es: (code) => ({ subject: `Tu código de ${SITE_NAME}: ${code}`, code, lines: [
    `Este es tu código para acceder a las generaciones que compraste en ${SITE_NAME}:`,
    "Es válido durante 15 minutos. Si no lo has solicitado, ignora este correo."] }),
  zh: (code) => ({ subject: `你的 ${SITE_NAME} 验证码：${code}`, code, lines: [
    `这是你用于访问在 ${SITE_NAME} 购买的生成次数的验证码：`,
    "15 分钟内有效。如果这不是你本人的操作，请忽略此邮件。"] }),
  hi: (code) => ({ subject: `आपका ${SITE_NAME} कोड: ${code}`, code, lines: [
    `${SITE_NAME} पर खरीदी गई जनरेशन तक पहुंचने के लिए आपका कोड:`,
    "यह 15 मिनट तक मान्य है। अगर आपने इसका अनुरोध नहीं किया है, तो इस ईमेल को अनदेखा करें।"] }),
  ar: (code) => ({ subject: `رمز ${SITE_NAME} الخاص بك: ${code}`, code, lines: [
    `إليك الرمز للوصول إلى عمليات التوليد التي اشتريتها على ${SITE_NAME}:`,
    "الرمز صالح لمدة 15 دقيقة. إذا لم تطلبه، يمكنك تجاهل هذه الرسالة."] }),
};

const PURCHASE_EMAIL: Record<Lang, (added: number, total: number, url: string) => EmailContent> = {
  fr: (a, t, url) => ({ subject: `Vos ${a} générations ${SITE_NAME} sont prêtes`, cta: { label: `Ouvrir ${SITE_NAME}`, url }, lines: [
    `Merci pour votre achat ! ${a} générations ont été ajoutées à cette adresse e-mail.`,
    `Solde actuel : ${t} génération${t > 1 ? "s" : ""}. Elles n'expirent pas.`,
    "Pour les utiliser sur un autre appareil, cliquez sur « Retrouver mes générations » sur le site et saisissez cette adresse e-mail."] }),
  en: (a, t, url) => ({ subject: `Your ${a} ${SITE_NAME} generations are ready`, cta: { label: `Open ${SITE_NAME}`, url }, lines: [
    `Thank you for your purchase! ${a} generations have been added to this email address.`,
    `Current balance: ${t} generation${t === 1 ? "" : "s"}. They never expire.`,
    "To use them on another device, click “Find my generations” on the site and enter this email address."] }),
  es: (a, t, url) => ({ subject: `Tus ${a} generaciones de ${SITE_NAME} están listas`, cta: { label: `Abrir ${SITE_NAME}`, url }, lines: [
    `¡Gracias por tu compra! Se han añadido ${a} generaciones a esta dirección de correo.`,
    `Saldo actual: ${t} generaci${t === 1 ? "ón" : "ones"}. Nunca caducan.`,
    "Para usarlas en otro dispositivo, haz clic en «Recuperar mis generaciones» en el sitio e introduce esta dirección."] }),
  zh: (a, t, url) => ({ subject: `你的 ${a} 次 ${SITE_NAME} 生成次数已到账`, cta: { label: `打开 ${SITE_NAME}`, url }, lines: [
    `感谢你的购买！已向此邮箱地址添加 ${a} 次生成。`,
    `当前余额：${t} 次，永不过期。`,
    "如需在其他设备上使用，请在网站上点击“找回我的生成次数”并输入此邮箱地址。"] }),
  hi: (a, t, url) => ({ subject: `आपकी ${a} ${SITE_NAME} जनरेशन तैयार हैं`, cta: { label: `${SITE_NAME} खोलें`, url }, lines: [
    `खरीदारी के लिए धन्यवाद! इस ईमेल पते में ${a} जनरेशन जोड़ दी गई हैं।`,
    `मौजूदा बैलेंस: ${t} जनरेशन। ये कभी समाप्त नहीं होतीं।`,
    "किसी दूसरे डिवाइस पर इस्तेमाल करने के लिए, साइट पर “मेरी जनरेशन वापस पाएं” पर क्लिक करें और यह ईमेल पता दर्ज करें।"] }),
  ar: (a, t, url) => ({ subject: `عمليات التوليد (${a}) من ${SITE_NAME} جاهزة`, cta: { label: `افتح ${SITE_NAME}`, url }, lines: [
    `شكرًا لشرائك! تمت إضافة ${a} عملية توليد إلى عنوان البريد هذا.`,
    `الرصيد الحالي: ${t}. لا تنتهي صلاحيتها أبدًا.`,
    "لاستخدامها على جهاز آخر، انقر على «استعادة عمليات التوليد» على الموقع وأدخل عنوان البريد هذا."] }),
};

export function sendLoginCodeEmail(to: string, code: string, lang: Lang): Promise<boolean> {
  return send(to, CODE_EMAIL[lang](code), lang);
}

export function sendPurchaseEmail(to: string, added: number, total: number, siteUrl: string, lang: Lang): Promise<boolean> {
  return send(to, PURCHASE_EMAIL[lang](added, total, siteUrl), lang);
}
