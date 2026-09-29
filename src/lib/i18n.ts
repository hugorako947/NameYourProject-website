// =============================================================================
// NameYourProject — Tous les textes affichés sur le site, dans les 6 langues
//
// 👉 C'EST ICI qu'on modifie le slogan, la description, les boutons, etc.
//
// Mise en gras : entourez un passage de **doubles astérisques** dans
// `explanation` (ex: "**10 noms**") — il s'affichera en gras sur le site.
// =============================================================================

import type { Category, NameLength, NameStyle, Vibe, ApiErrorCode, InsightVerdict } from "@/types";
import type { Theme, CustomColors } from "@/lib/theme";
import type { PackId } from "@/lib/pricing";

/** Nom de marque, identique dans toutes les langues. */
export const SITE_NAME = "NameYourProject";

export type Lang = "fr" | "en" | "es" | "zh" | "hi" | "ar";

export interface LangMeta {
  code: Lang;
  label: string;
  flag: string;
  dir: "ltr" | "rtl";
  htmlLang: string;
  /** Locale utilisée pour formater les prix (Intl.NumberFormat) */
  locale: string;
}

export const LANGUAGES: LangMeta[] = [
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr", htmlLang: "fr", locale: "fr-FR" },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr", htmlLang: "en", locale: "en-US" },
  { code: "es", label: "Español", flag: "🇪🇸", dir: "ltr", htmlLang: "es", locale: "es-ES" },
  { code: "zh", label: "中文", flag: "🇨🇳", dir: "ltr", htmlLang: "zh", locale: "zh-CN" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳", dir: "ltr", htmlLang: "hi", locale: "hi-IN" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl", htmlLang: "ar", locale: "ar-SA" },
];

export const LANG_CODES: Lang[] = LANGUAGES.map((l) => l.code);

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANG_CODES as string[]).includes(value);
}

export function getLangMeta(lang: Lang): LangMeta {
  return LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[1];
}

export interface Translations {
  metaDescription: string;

  subtitle: string;
  /** Texte descriptif — **passage** = en gras */
  explanation: string;

  inputLabel: string;
  inputPlaceholder: string;

  categoryLabel: string;
  categories: Record<Category, { label: string; description: string }>;
  otherLabel: string;
  otherPlaceholder: string;

  vibeLabel: string;
  vibes: Record<Vibe, string>;
  lengthLabel: string;
  lengths: Record<NameLength, string>;
  styleLabel: string;
  styles: Record<NameStyle, string>;

  generateBtn: string;
  generatingBtn: string;

  quotaRemaining: (remaining: number, limit: number) => string;
  quotaUnlimited: string;
  adminToVisitor: string;
  adminVisitorNotice: string;
  adminToUnlimited: string;
  buyCreditsBtn: string;
  buyTitle: string;
  packNames: Record<PackId, string>;
  packGenerations: (n: number) => string;
  packNamesCount: (n: number) => string;
  packPerGeneration: (price: string) => string;
  packSavings: (percent: number) => string;
  badgeRecommended: string;
  badgeBestValue: string;
  buyNoExpiry: string;
  buyApproxNote: string;
  buyPayBtn: (total: string) => string;
  buyClose: string;
  buyUnavailable: string;

  errorEmpty: string;
  errors: Record<ApiErrorCode, string>;

  domainAvailable: string;
  domainTaken: string;
  domainChecking: string;
  domainUnknown: string;
  buyBtn: string;
  /** Lien vers le registraire quand le statut n'a pas pu être vérifié */
  domainVerifyBtn: string;
  addFavorite: string;
  removeFavorite: string;
  generatedNamesTab: string;
  favoritesTab: string;
  noResults: string;
  noFavorites: string;
  /** Rappel affiché au-dessus des résultats : vérifier la marque avant de se lancer */
  trademarkNote: string;
  /** Résumé au-dessus des résultats : combien de noms ont leur .com libre */
  freeComSummary: (free: number, total: number) => string;

  themeLabel: string;
  themes: Record<Theme, string>;
  customColorsTitle: string;
  customColors: Record<keyof CustomColors, string>;
  customReset: string;
  langLabel: string;

  /** Sous le champ de description : ne pas saisir d'informations confidentielles */
  inputPrivacyHint: string;
  /** Case à cocher obligatoire avant paiement (accès immédiat + droit de rétractation) */
  buyConsent: string;
  footerAiNotice: string;
  footerNavLabel: string;
  legalNoticeLink: string;
  termsLink: string;
  privacyLink: string;
  backHome: string;
  /** Pages légales disponibles seulement en français et en anglais */
  legalOnlyFrEn: string;

  // ── Générations achetées et connexion par e-mail ──
  creditsBalance: (n: number) => string;
  creditsLinkedTo: (maskedEmail: string) => string;
  creditsSignOut: string;
  restoreLink: string;
  restoreIntro: string;
  emailLabel: string;
  sendCodeBtn: string;
  codeSentNotice: string;
  codeLabel: string;
  verifyBtn: string;
  restoreSuccess: string;
  changeEmail: string;
  buyEmailNote: string;
  buyRedirecting: string;
  thanksTitle: string;
  thanksOk: string;
  thanksElsewhere: string;
  thanksPending: string;
  thanksError: string;
  backToGenerator: string;
  cancelTitle: string;
  cancelText: string;

  // ── Vérifier un nom (liens rapides + « Qu'évoque ce nom ? ») ──
  checkGoogle: string;
  checkImages: string;
  checkTrademarks: string;
  trademarkCopied: string;
  insightBtn: string;
  insightLoading: string;
  insightVerdicts: Record<InsightVerdict, string>;
  insightAssociation: (theme: string) => string;
  insightUses: string;
  insightSources: string;
  insightDisclaimer: string;
  insightRemaining: (n: number) => string;

  // ── Variantes ──
  moreLikeThis: string;
  variantsOf: (name: string) => string;

  // ── Aperçu logo ──
  logoPreviewBtn: string;
  logoPreviewTitle: (name: string) => string;
  logoStyles: { elegant: string; modern: string; tech: string; bold: string };
  appIconLabel: string;
  businessCardLabel: string;
  logoPreviewNote: string;

  // ── Favoris : comparer, exporter, partager ──
  favViewList: string;
  favViewCompare: string;
  favCopy: string;
  favDownload: string;
  favShare: string;
  favCopied: string;
  favLinkCopied: string;
  compareName: string;
  compareMeaning: string;
  sharedTitle: string;
  sharedIntro: string;
  sharedImport: string;
  sharedImported: string;
  sharedInvalid: string;
  sharedCta: string;
}

export const TRANSLATIONS: Record<Lang, Translations> = {
  // ───────────────────────────────── ENGLISH ─────────────────────────────────
  en: {
    metaDescription:
      "Generate catchy names for any project — app, business, brand, store, agency, youtube channel — with real-time domain availability checks.",
    subtitle: "Find the name that will stick",
    explanation:
      "App, business, brand, store, agency, youtube channel… Describe your project in a few words, and we'll suggest **10 original names** designed for **strong SEO potential**, with real-time availability checks for their **domain name**.",
    inputLabel: "Describe your project",
    inputPlaceholder:
      "A new social media for dogs, a minimalist coffee shop in Tokyo, an AI-powered accounting software, a sustainable clothing brand...",
    categoryLabel: "Category",
    categories: {
      "Business/Startup": { label: "Business / Startup", description: "Company, startup, firm, agency" },
      "App/Software": { label: "App / Software", description: "Mobile app, SaaS, website, tool" },
      "Creative/Content": { label: "Creative / Content", description: "youtube channel, podcast, blog, studio" },
      "Store/E-commerce": { label: "Store / E-commerce", description: "Shop, online store, retail brand" },
      "Product/Physical": { label: "Physical product", description: "Object, gadget, accessory, invention" },
      Other: { label: "Other", description: "Tell us what you're naming" },
    },
    otherLabel: "Specify your category (optional)",
    otherPlaceholder: "e.g. sports club, music festival, food truck…",
    vibeLabel: "Vibe",
    vibes: { Sérieux: "Serious", Fun: "Fun", Futuriste: "Futuristic", Luxe: "Luxury", Nature: "Nature", Tech: "Tech" },
    lengthLabel: "Length",
    lengths: { Any: "Any", Short: "Short", Medium: "Medium", Long: "Long" },
    styleLabel: "Style",
    styles: { Any: "Any", Modern: "Modern", Classic: "Classic", Compound: "Compound", Playful: "Playful" },
    generateBtn: "Generate",
    generatingBtn: "Generating & checking domains…",
    quotaRemaining: (n, limit) => `${n} / ${limit} free generation${n === 1 ? "" : "s"} left today`,
    quotaUnlimited: "Unlimited access (admin)",
    adminToVisitor: "Switch to visitor mode",
    adminVisitorNotice: "Visitor mode (admin)",
    adminToUnlimited: "Turn unlimited back on",
    buyCreditsBtn: "Get more generations",
    buyTitle: "Buy generations",
    packNames: { starter: "Starter", plus: "Plus", pro: "Pro" },
    packGenerations: (n) => `${n} generations`,
    packNamesCount: (n) => `${n} names`,
    packPerGeneration: (price) => `${price} per generation`,
    packSavings: (pct) => `Save ${pct}%`,
    badgeRecommended: "Recommended",
    badgeBestValue: "Best price",
    buyNoExpiry: "Purchased generations never expire.",
    buyApproxNote: "The amount in your currency is an estimate; the exact amount is shown at checkout.",
    buyPayBtn: (total) => `Pay ${total}`,
    buyClose: "Close",
    buyUnavailable: "Online payment is coming very soon. Your free quota resets every 24 hours.",
    errorEmpty: "Add a few keywords to get started.",
    errors: {
      INVALID_INPUT: "Some fields are invalid. Please check your entry.",
      RATE_LIMITED: "You've used all your free generations for today. Get more or come back tomorrow.",
      GENERATION_FAILED: "Name generation failed. Please try again in a moment.",
      PAYMENT_NOT_CONFIGURED: "Online payment is coming very soon.",
      CONSENT_REQUIRED: "Tick the acceptance box to continue.",
      INVALID_EMAIL: "Invalid email address.",
      INVALID_CODE: "Incorrect or expired code.",
      TOO_MANY_ATTEMPTS: "Too many attempts. Request a new code.",
      CODE_RATE_LIMITED: "Please wait a minute before requesting a new code.",
      INSIGHT_LIMITED: "You've used your free analyses for today. Use the Google and Images links, or come back tomorrow.",
      INSIGHT_FAILED: "The analysis couldn't be completed. Please try again in a moment.",
      BOT_CHECK_FAILED: "The anti-bot check didn't go through. Please try again in a moment.",
      GENERIC: "An unexpected error occurred.",
    },
    domainAvailable: "available",
    domainTaken: "taken",
    domainChecking: "checking…",
    domainUnknown: "not verified",
    buyBtn: "Register",
    domainVerifyBtn: "Check",
    addFavorite: "Add to favorites",
    removeFavorite: "Remove from favorites",
    generatedNamesTab: "Generated Names",
    favoritesTab: "Favorites",
    noResults: "No names to show yet.",
    noFavorites: "No favorites yet. Tap the heart next to a name to save it.",
    trademarkNote: "These names are generated by AI and may be incorrect, incomplete or misleading. Before you launch, check that they aren't already in use or registered as a trademark: you remain responsible for how you use them.",
    freeComSummary: (free, total) => free === 0 ? "No .com is free among these names: try other keywords or another style." : free === total ? `All ${total} names have a free .com` : `${free} of ${total} names have a free .com`,
    themeLabel: "Theme",
    themes: { light: "Light", dark: "Dark", invert: "Inverted", custom: "Custom" },
    customColorsTitle: "Your colors",
    customColors: { paper: "Background", ink: "Text", muted: "Secondary text", accent: "Accent" },
    customReset: "Reset",
    langLabel: "Language",
    inputPrivacyHint: "Avoid confidential information: your description is sent to an AI service to generate names.",
    buyConsent: "I accept the terms of use and request immediate access to the purchased generations; I acknowledge that I lose my right of withdrawal once access begins.",
    footerAiNotice: "NameYourProject uses artificial intelligence: suggested names may be incorrect, incomplete or misleading. You are responsible for how you use them.",
    footerNavLabel: "Legal information",
    legalNoticeLink: "Legal notice",
    termsLink: "Terms of use",
    privacyLink: "Privacy",
    backHome: "Back to home",
    legalOnlyFrEn: "",
    creditsBalance: (n) => `${n} purchased generation${n === 1 ? "" : "s"}`,
    creditsLinkedTo: (m) => `linked to ${m}`,
    creditsSignOut: "Sign out this browser",
    restoreLink: "Find my generations",
    restoreIntro: "Enter the email address you used for your purchase: we'll send you a 6-digit code.",
    emailLabel: "Email address",
    sendCodeBtn: "Send me a code",
    codeSentNotice: "If generations are linked to this address, a code has just been sent to it. It is valid for 15 minutes.",
    codeLabel: "Code received by email",
    verifyBtn: "Confirm",
    restoreSuccess: "Done: your purchased generations are now available in this browser.",
    changeEmail: "Use another address",
    buyEmailNote: "Your generations will be linked to the email address entered at checkout: it lets you find them on any device, without an account.",
    buyRedirecting: "Redirecting to secure checkout…",
    thanksTitle: "Thank you for your purchase!",
    thanksOk: "Your generations have been added and are available in this browser. A confirmation email has been sent to you.",
    thanksElsewhere: "Your generations have been added. To use them in this browser, click “Find my generations” and enter the email address used for your purchase.",
    thanksPending: "Your payment is being confirmed. Your generations will be added as soon as it clears, and you'll receive an email.",
    thanksError: "We couldn't confirm this payment. If you were charged, contact us and your generations will be added.",
    backToGenerator: "Back to the generator",
    cancelTitle: "Payment cancelled",
    cancelText: "You haven't been charged. You can resume your purchase whenever you like.",
    checkGoogle: "Google",
    checkImages: "Images",
    checkTrademarks: "Trademarks",
    trademarkCopied: "Name copied: paste it into the WIPO search.",
    insightBtn: "What does this name evoke?",
    insightLoading: "Searching the web…",
    insightVerdicts: { FREE: "Looks free", IN_USE: "Already in use", ASSOCIATED: "Strongly associated with something else", UNKNOWN: "Uncertain result" },
    insightAssociation: (x) => `Mainly evokes: ${x}`,
    insightUses: "Uses found",
    insightSources: "Sources",
    insightDisclaimer: "Indicative analysis by an AI based on a Google search: check the sources.",
    insightRemaining: (n) => `${n} free analysis${n === 1 ? "" : "es"} left today`,
    moreLikeThis: "More like this",
    variantsOf: (n) => `Variations on “${n}”`,
    logoPreviewBtn: "Logo preview",
    logoPreviewTitle: (n) => `“${n}” in action`,
    logoStyles: { elegant: "Elegant", modern: "Modern", tech: "Tech", bold: "Bold" },
    appIconLabel: "App icon",
    businessCardLabel: "Business card",
    logoPreviewNote: "An indicative preview to help you picture it: a real logo deserves a designer's work.",
    favViewList: "List",
    favViewCompare: "Compare",
    favCopy: "Copy list",
    favDownload: "Download",
    favShare: "Share",
    favCopied: "List copied.",
    favLinkCopied: "Link copied: send it to anyone, no account needed.",
    compareName: "Name",
    compareMeaning: "Explanation",
    sharedTitle: "A shortlist of names for you",
    sharedIntro: "Someone sent you these names found on NameYourProject. Domains are checked again live.",
    sharedImport: "Add them to my favorites",
    sharedImported: "Added to your favorites",
    sharedInvalid: "This share link is incomplete or damaged.",
    sharedCta: "Find my own names",
  },

  // ───────────────────────────────── FRANÇAIS ────────────────────────────────
  fr: {
    metaDescription:
      "Générez des noms percutants pour n'importe quel projet — appli, business, marque, boutique, agence, chaîne youtube — avec vérification du domaine en temps réel.",
    subtitle: "Trouvez le nom qui restera",
    explanation:
      "Appli, business, marque, boutique, agence, chaîne youtube… Décrivez votre projet en quelques mots et nous vous proposerons **10 noms originaux**, pensés pour un **fort potentiel SEO**, avec vérification en temps réel de la disponibilité du **nom de domaine**.",
    inputLabel: "Décrivez votre projet",
    inputPlaceholder: "Un réseau social pour chiens, un café minimaliste à Tokyo, un logiciel IA de compta...",
    categoryLabel: "Catégorie",
    categories: {
      "Business/Startup": { label: "Entreprise / Startup", description: "Société, start-up, cabinet, agence" },
      "App/Software": { label: "Appli / Logiciel", description: "Application, SaaS, site web, outil" },
      "Creative/Content": { label: "Création / Contenu", description: "Chaîne youtube, podcast, blog, studio" },
      "Store/E-commerce": { label: "Boutique / E-commerce", description: "Magasin, boutique en ligne, marque" },
      "Product/Physical": { label: "Produit physique", description: "Objet, gadget, accessoire, invention" },
      Other: { label: "Autre", description: "Précisez ce que vous nommez" },
    },
    otherLabel: "Précisez votre catégorie (facultatif)",
    otherPlaceholder: "Ex. : club de sport, festival de musique, food truck…",
    vibeLabel: "Humeur",
    vibes: { Sérieux: "Sérieux", Fun: "Fun", Futuriste: "Futuriste", Luxe: "Luxe", Nature: "Nature", Tech: "Tech" },
    lengthLabel: "Longueur",
    lengths: { Any: "Peu importe", Short: "Court", Medium: "Moyen", Long: "Long" },
    styleLabel: "Style",
    styles: { Any: "Peu importe", Modern: "Moderne", Classic: "Classique", Compound: "Composé", Playful: "Ludique" },
    generateBtn: "Générer",
    generatingBtn: "Génération et vérification…",
    quotaRemaining: (n, limit) =>
      `${n} / ${limit} génération${n > 1 ? "s" : ""} gratuite${n > 1 ? "s" : ""} restante${n > 1 ? "s" : ""} aujourd'hui`,
    quotaUnlimited: "Accès illimité (admin)",
    adminToVisitor: "Passer en mode visiteur",
    adminVisitorNotice: "Mode visiteur (admin)",
    adminToUnlimited: "Réactiver l'illimité",
    buyCreditsBtn: "Obtenir plus de générations",
    buyTitle: "Acheter des générations",
    packNames: { starter: "Découverte", plus: "Plus", pro: "Pro" },
    packGenerations: (n) => `${n} générations`,
    packNamesCount: (n) => `${n} noms`,
    packPerGeneration: (price) => `${price} la génération`,
    packSavings: (pct) => `−${pct} %`,
    badgeRecommended: "Recommandé",
    badgeBestValue: "Meilleur prix",
    buyNoExpiry: "Les générations achetées n'expirent jamais.",
    buyApproxNote: "Le montant dans votre devise est indicatif ; le montant exact est affiché au moment du paiement.",
    buyPayBtn: (total) => `Payer ${total}`,
    buyClose: "Fermer",
    buyUnavailable: "Le paiement en ligne arrive très bientôt. Votre quota gratuit se recharge toutes les 24 h.",
    errorEmpty: "Ajoutez quelques mots-clés pour commencer.",
    errors: {
      INVALID_INPUT: "Certains champs sont invalides. Vérifiez votre saisie.",
      RATE_LIMITED: "Vous avez utilisé toutes vos générations gratuites du jour. Obtenez-en plus ou revenez demain.",
      GENERATION_FAILED: "La génération a échoué. Réessayez dans un instant.",
      PAYMENT_NOT_CONFIGURED: "Le paiement en ligne arrive très bientôt.",
      CONSENT_REQUIRED: "Cochez la case d'acceptation pour continuer.",
      INVALID_EMAIL: "Adresse e-mail invalide.",
      INVALID_CODE: "Code incorrect ou expiré.",
      TOO_MANY_ATTEMPTS: "Trop d'essais. Demandez un nouveau code.",
      CODE_RATE_LIMITED: "Patientez une minute avant de demander un nouveau code.",
      INSIGHT_LIMITED: "Vous avez utilisé vos analyses gratuites du jour. Utilisez les liens Google et Images, ou revenez demain.",
      INSIGHT_FAILED: "L'analyse n'a pas pu aboutir. Réessayez dans un instant.",
      BOT_CHECK_FAILED: "La vérification anti-robots n'a pas abouti. Réessayez dans un instant.",
      GENERIC: "Une erreur inattendue est survenue.",
    },
    domainAvailable: "disponible",
    domainTaken: "pris",
    domainChecking: "vérification…",
    domainUnknown: "non vérifié",
    buyBtn: "Réserver",
    domainVerifyBtn: "Vérifier",
    addFavorite: "Ajouter aux favoris",
    removeFavorite: "Retirer des favoris",
    generatedNamesTab: "Noms générés",
    favoritesTab: "Favoris",
    noResults: "Aucun nom à afficher pour l'instant.",
    noFavorites: "Aucun favori pour l'instant. Touchez le cœur à côté d'un nom pour l'enregistrer.",
    trademarkNote: "Ces noms sont générés par une IA et peuvent être incorrects, incomplets ou trompeurs. Avant de vous lancer, vérifiez qu'ils ne sont pas déjà utilisés ou déposés comme marque : vous restez responsable de l'usage que vous en faites.",
    freeComSummary: (free, total) => free === 0 ? "Aucun .com libre parmi ces noms : essayez d'autres mots-clés ou un autre style." : free === total ? `Les ${total} noms ont leur .com libre` : `${free} nom${free > 1 ? "s" : ""} sur ${total} ${free > 1 ? "ont" : "a"} leur .com libre`,
    themeLabel: "Thème",
    themes: { light: "Clair", dark: "Sombre", invert: "Inversé", custom: "Personnalisé" },
    customColorsTitle: "Vos couleurs",
    customColors: { paper: "Fond", ink: "Texte", muted: "Texte secondaire", accent: "Accent" },
    customReset: "Réinitialiser",
    langLabel: "Langue",
    inputPrivacyHint: "Évitez les informations confidentielles : votre description est transmise à un service d'IA pour générer les noms.",
    buyConsent: "J'accepte les conditions d'utilisation et je demande l'accès immédiat aux générations achetées ; je reconnais perdre mon droit de rétractation dès cet accès.",
    footerAiNotice: "NameYourProject utilise l'intelligence artificielle : les noms proposés peuvent être incorrects, incomplets ou trompeurs. Vous restez responsable de l'usage que vous en faites.",
    footerNavLabel: "Informations légales",
    legalNoticeLink: "Mentions légales",
    termsLink: "Conditions d'utilisation",
    privacyLink: "Confidentialité",
    backHome: "Retour à l'accueil",
    legalOnlyFrEn: "",
    creditsBalance: (n) => `${n} génération${n > 1 ? "s" : ""} achetée${n > 1 ? "s" : ""}`,
    creditsLinkedTo: (m) => `liées à ${m}`,
    creditsSignOut: "Déconnecter ce navigateur",
    restoreLink: "Retrouver mes générations",
    restoreIntro: "Saisissez l'adresse e-mail utilisée lors de votre achat : nous vous enverrons un code à 6 chiffres.",
    emailLabel: "Adresse e-mail",
    sendCodeBtn: "Recevoir un code",
    codeSentNotice: "Si des générations sont associées à cette adresse, un code vient d'y être envoyé. Il est valable 15 minutes.",
    codeLabel: "Code reçu par e-mail",
    verifyBtn: "Valider",
    restoreSuccess: "C'est fait : vos générations achetées sont disponibles sur ce navigateur.",
    changeEmail: "Changer d'adresse",
    buyEmailNote: "Vos générations seront liées à l'adresse e-mail saisie lors du paiement : elle vous permettra de les retrouver sur n'importe quel appareil, sans compte.",
    buyRedirecting: "Redirection vers le paiement sécurisé…",
    thanksTitle: "Merci pour votre achat !",
    thanksOk: "Vos générations ont été ajoutées et sont disponibles sur ce navigateur. Un e-mail de confirmation vous a été envoyé.",
    thanksElsewhere: "Vos générations ont été ajoutées. Pour les utiliser sur ce navigateur, cliquez sur « Retrouver mes générations » et saisissez l'adresse e-mail de votre achat.",
    thanksPending: "Votre paiement est en cours de confirmation. Vos générations seront ajoutées dès sa validation, et vous recevrez un e-mail.",
    thanksError: "Nous n'avons pas pu confirmer ce paiement. Si vous avez été débité, contactez-nous : vos générations vous seront ajoutées.",
    backToGenerator: "Revenir au générateur",
    cancelTitle: "Paiement annulé",
    cancelText: "Aucun montant n'a été débité. Vous pouvez reprendre votre achat quand vous le souhaitez.",
    checkGoogle: "Google",
    checkImages: "Images",
    checkTrademarks: "Marques",
    trademarkCopied: "Nom copié : collez-le dans la recherche de l'OMPI.",
    insightBtn: "Qu'évoque ce nom ?",
    insightLoading: "Recherche sur le web…",
    insightVerdicts: { FREE: "Semble libre", IN_USE: "Déjà utilisé", ASSOCIATED: "Fortement associé à un autre univers", UNKNOWN: "Résultat incertain" },
    insightAssociation: (x) => `Évoque surtout : ${x}`,
    insightUses: "Usages trouvés",
    insightSources: "Sources",
    insightDisclaimer: "Analyse indicative réalisée par une IA à partir d'une recherche Google : vérifiez les sources.",
    insightRemaining: (n) => `${n} analyse${n > 1 ? "s" : ""} gratuite${n > 1 ? "s" : ""} restante${n > 1 ? "s" : ""} aujourd'hui`,
    moreLikeThis: "Plus comme celui-ci",
    variantsOf: (n) => `Variantes de « ${n} »`,
    logoPreviewBtn: "Aperçu logo",
    logoPreviewTitle: (n) => `« ${n} » en situation`,
    logoStyles: { elegant: "Élégant", modern: "Moderne", tech: "Tech", bold: "Audacieux" },
    appIconLabel: "Icône d'application",
    businessCardLabel: "Carte de visite",
    logoPreviewNote: "Aperçu indicatif pour vous projeter : un vrai logo mérite le travail d'un graphiste.",
    favViewList: "Liste",
    favViewCompare: "Comparer",
    favCopy: "Copier la liste",
    favDownload: "Télécharger",
    favShare: "Partager",
    favCopied: "Liste copiée.",
    favLinkCopied: "Lien copié : envoyez-le à qui vous voulez, aucun compte n'est nécessaire.",
    compareName: "Nom",
    compareMeaning: "Explication",
    sharedTitle: "Une sélection de noms pour vous",
    sharedIntro: "Quelqu'un vous a envoyé ces noms trouvés sur NameYourProject. Les domaines sont revérifiés en direct.",
    sharedImport: "Les ajouter à mes favoris",
    sharedImported: "Ajoutés à vos favoris",
    sharedInvalid: "Ce lien de partage est incomplet ou abîmé.",
    sharedCta: "Trouver mes propres noms",
  },

  // ───────────────────────────────── ESPAÑOL ─────────────────────────────────
  es: {
    metaDescription:
      "Genera nombres impactantes para cualquier proyecto — app, negocio, marca, tienda, agencia, canal de youtube — con verificación de dominio en tiempo real.",
    subtitle: "Encuentra el nombre que perdurará",
    explanation:
      "App, negocio, marca, tienda, agencia, canal de youtube… Describe tu proyecto en pocas palabras y te propondremos **10 nombres originales**, pensados para un **gran potencial SEO**, con verificación en tiempo real de la disponibilidad del **nombre de dominio**.",
    inputLabel: "Describe tu proyecto",
    inputPlaceholder: "Una red social para perros, un café minimalista en Tokio...",
    categoryLabel: "Categoría",
    categories: {
      "Business/Startup": { label: "Empresa / Startup", description: "Sociedad, startup, despacho, agencia" },
      "App/Software": { label: "App / Software", description: "App móvil, SaaS, sitio web, herramienta" },
      "Creative/Content": { label: "Creativo / Contenido", description: "Canal de youtube, pódcast, blog, estudio" },
      "Store/E-commerce": { label: "Tienda / E-commerce", description: "Comercio, tienda online, marca" },
      "Product/Physical": { label: "Producto físico", description: "Objeto, gadget, accesorio, invento" },
      Other: { label: "Otro", description: "Indica qué quieres nombrar" },
    },
    otherLabel: "Especifica tu categoría (opcional)",
    otherPlaceholder: "p. ej.: club deportivo, festival de música, food truck…",
    vibeLabel: "Vibra",
    vibes: { Sérieux: "Serio", Fun: "Divertido", Futuriste: "Futurista", Luxe: "Lujo", Nature: "Naturaleza", Tech: "Tech" },
    lengthLabel: "Longitud",
    lengths: { Any: "Cualquiera", Short: "Corto", Medium: "Medio", Long: "Largo" },
    styleLabel: "Estilo",
    styles: { Any: "Cualquiera", Modern: "Moderno", Classic: "Clásico", Compound: "Compuesto", Playful: "Lúdico" },
    generateBtn: "Generar",
    generatingBtn: "Generando y verificando…",
    quotaRemaining: (n, limit) =>
      `${n} / ${limit} generaci${n === 1 ? "ón gratuita restante" : "ones gratuitas restantes"} hoy`,
    quotaUnlimited: "Acceso ilimitado (admin)",
    adminToVisitor: "Pasar al modo visitante",
    adminVisitorNotice: "Modo visitante (admin)",
    adminToUnlimited: "Reactivar el modo ilimitado",
    buyCreditsBtn: "Obtener más generaciones",
    buyTitle: "Comprar generaciones",
    packNames: { starter: "Inicial", plus: "Plus", pro: "Pro" },
    packGenerations: (n) => `${n} generaciones`,
    packNamesCount: (n) => `${n} nombres`,
    packPerGeneration: (price) => `${price} por generación`,
    packSavings: (pct) => `Ahorra un ${pct} %`,
    badgeRecommended: "Recomendado",
    badgeBestValue: "Mejor precio",
    buyNoExpiry: "Las generaciones compradas nunca caducan.",
    buyApproxNote: "El importe en tu moneda es orientativo; el importe exacto se muestra al pagar.",
    buyPayBtn: (total) => `Pagar ${total}`,
    buyClose: "Cerrar",
    buyUnavailable: "El pago en línea llegará muy pronto. Tu cuota gratuita se renueva cada 24 h.",
    errorEmpty: "Añade algunas palabras clave para empezar.",
    errors: {
      INVALID_INPUT: "Algunos campos no son válidos. Revisa tu entrada.",
      RATE_LIMITED: "Has usado todas tus generaciones gratuitas de hoy. Consigue más o vuelve mañana.",
      GENERATION_FAILED: "La generación ha fallado. Inténtalo de nuevo en un momento.",
      PAYMENT_NOT_CONFIGURED: "El pago en línea llegará muy pronto.",
      CONSENT_REQUIRED: "Marca la casilla de aceptación para continuar.",
      INVALID_EMAIL: "Dirección de correo no válida.",
      INVALID_CODE: "Código incorrecto o caducado.",
      TOO_MANY_ATTEMPTS: "Demasiados intentos. Solicita un nuevo código.",
      CODE_RATE_LIMITED: "Espera un minuto antes de pedir un nuevo código.",
      INSIGHT_LIMITED: "Has usado tus análisis gratuitos de hoy. Usa los enlaces de Google e Imágenes, o vuelve mañana.",
      INSIGHT_FAILED: "No se pudo completar el análisis. Inténtalo de nuevo en un momento.",
      BOT_CHECK_FAILED: "La verificación anti-bots no se ha completado. Inténtalo de nuevo en un momento.",
      GENERIC: "Ocurrió un error inesperado.",
    },
    domainAvailable: "disponible",
    domainTaken: "ocupado",
    domainChecking: "verificando…",
    domainUnknown: "sin verificar",
    buyBtn: "Registrar",
    domainVerifyBtn: "Comprobar",
    addFavorite: "Añadir a favoritos",
    removeFavorite: "Quitar de favoritos",
    generatedNamesTab: "Nombres generados",
    favoritesTab: "Favoritos",
    noResults: "Aún no hay nombres para mostrar.",
    noFavorites: "Aún no hay favoritos. Toca el corazón junto a un nombre para guardarlo.",
    trademarkNote: "Estos nombres los genera una IA y pueden ser incorrectos, incompletos o engañosos. Antes de lanzarte, comprueba que no estén ya en uso ni registrados como marca: eres responsable del uso que hagas de ellos.",
    freeComSummary: (free, total) => free === 0 ? "Ningún .com está libre entre estos nombres: prueba otras palabras clave u otro estilo." : free === total ? `Los ${total} nombres tienen su .com libre` : `${free} de ${total} nombres tienen su .com libre`,
    themeLabel: "Tema",
    themes: { light: "Claro", dark: "Oscuro", invert: "Invertido", custom: "Personalizado" },
    customColorsTitle: "Tus colores",
    customColors: { paper: "Fondo", ink: "Texto", muted: "Texto secundario", accent: "Acento" },
    customReset: "Restablecer",
    langLabel: "Idioma",
    inputPrivacyHint: "Evita la información confidencial: tu descripción se envía a un servicio de IA para generar los nombres.",
    buyConsent: "Acepto las condiciones de uso y solicito el acceso inmediato a las generaciones compradas; reconozco que pierdo mi derecho de desistimiento desde ese acceso.",
    footerAiNotice: "NameYourProject utiliza inteligencia artificial: los nombres sugeridos pueden ser incorrectos, incompletos o engañosos. Eres responsable del uso que hagas de ellos.",
    footerNavLabel: "Información legal",
    legalNoticeLink: "Aviso legal",
    termsLink: "Condiciones de uso",
    privacyLink: "Privacidad",
    backHome: "Volver al inicio",
    legalOnlyFrEn: "Esta página solo está disponible en francés y en inglés.",
    creditsBalance: (n) => `${n} generaci${n === 1 ? "ón comprada" : "ones compradas"}`,
    creditsLinkedTo: (m) => `vinculadas a ${m}`,
    creditsSignOut: "Desconectar este navegador",
    restoreLink: "Recuperar mis generaciones",
    restoreIntro: "Introduce la dirección de correo que usaste al comprar: te enviaremos un código de 6 dígitos.",
    emailLabel: "Correo electrónico",
    sendCodeBtn: "Recibir un código",
    codeSentNotice: "Si hay generaciones vinculadas a esta dirección, acabamos de enviarle un código. Es válido durante 15 minutos.",
    codeLabel: "Código recibido por correo",
    verifyBtn: "Confirmar",
    restoreSuccess: "Listo: tus generaciones compradas ya están disponibles en este navegador.",
    changeEmail: "Cambiar de dirección",
    buyEmailNote: "Tus generaciones se vincularán al correo introducido al pagar: te permitirá recuperarlas en cualquier dispositivo, sin cuenta.",
    buyRedirecting: "Redirigiendo al pago seguro…",
    thanksTitle: "¡Gracias por tu compra!",
    thanksOk: "Tus generaciones se han añadido y están disponibles en este navegador. Te hemos enviado un correo de confirmación.",
    thanksElsewhere: "Tus generaciones se han añadido. Para usarlas en este navegador, haz clic en «Recuperar mis generaciones» e introduce el correo de tu compra.",
    thanksPending: "Tu pago se está confirmando. Tus generaciones se añadirán en cuanto se valide y recibirás un correo.",
    thanksError: "No hemos podido confirmar este pago. Si se te ha cobrado, contáctanos y añadiremos tus generaciones.",
    backToGenerator: "Volver al generador",
    cancelTitle: "Pago cancelado",
    cancelText: "No se ha realizado ningún cargo. Puedes retomar tu compra cuando quieras.",
    checkGoogle: "Google",
    checkImages: "Imágenes",
    checkTrademarks: "Marcas",
    trademarkCopied: "Nombre copiado: pégalo en la búsqueda de la OMPI.",
    insightBtn: "¿Qué evoca este nombre?",
    insightLoading: "Buscando en la web…",
    insightVerdicts: { FREE: "Parece libre", IN_USE: "Ya en uso", ASSOCIATED: "Muy asociado a otra cosa", UNKNOWN: "Resultado incierto" },
    insightAssociation: (x) => `Evoca sobre todo: ${x}`,
    insightUses: "Usos encontrados",
    insightSources: "Fuentes",
    insightDisclaimer: "Análisis orientativo realizado por una IA a partir de una búsqueda en Google: revisa las fuentes.",
    insightRemaining: (n) => `${n} análisis gratuito${n === 1 ? "" : "s"} restante${n === 1 ? "" : "s"} hoy`,
    moreLikeThis: "Más como este",
    variantsOf: (n) => `Variantes de «${n}»`,
    logoPreviewBtn: "Vista de logo",
    logoPreviewTitle: (n) => `«${n}» en acción`,
    logoStyles: { elegant: "Elegante", modern: "Moderno", tech: "Tech", bold: "Audaz" },
    appIconLabel: "Icono de app",
    businessCardLabel: "Tarjeta de visita",
    logoPreviewNote: "Vista orientativa para imaginarlo: un logo de verdad merece el trabajo de un diseñador.",
    favViewList: "Lista",
    favViewCompare: "Comparar",
    favCopy: "Copiar la lista",
    favDownload: "Descargar",
    favShare: "Compartir",
    favCopied: "Lista copiada.",
    favLinkCopied: "Enlace copiado: envíalo a quien quieras, sin necesidad de cuenta.",
    compareName: "Nombre",
    compareMeaning: "Explicación",
    sharedTitle: "Una selección de nombres para ti",
    sharedIntro: "Alguien te ha enviado estos nombres encontrados en NameYourProject. Los dominios se vuelven a comprobar en directo.",
    sharedImport: "Añadirlos a mis favoritos",
    sharedImported: "Añadidos a tus favoritos",
    sharedInvalid: "Este enlace para compartir está incompleto o dañado.",
    sharedCta: "Encontrar mis propios nombres",
  },

  // ───────────────────────────────── 中文 ────────────────────────────────────
  zh: {
    metaDescription: "为任何项目生成响亮的名字——应用、企业、品牌、商店、机构、youtube频道——并实时检查域名可用性。",
    subtitle: "找到深入人心的名字",
    explanation:
      "应用、企业、品牌、商店、机构、youtube频道……用几句话描述你的项目，我们将为你推荐 **10 个原创名字**，兼顾**强大的 SEO 潜力**，并实时检查**域名**是否可用。",
    inputLabel: "描述你的项目",
    inputPlaceholder: "狗狗专属社交媒体，东京极简风咖啡馆，AI会计软件...",
    categoryLabel: "类别",
    categories: {
      "Business/Startup": { label: "企业 / 初创公司", description: "公司、初创企业、事务所、代理机构" },
      "App/Software": { label: "应用 / 软件", description: "移动应用、SaaS、网站、工具" },
      "Creative/Content": { label: "创意 / 内容", description: "youtube频道、播客、博客、工作室" },
      "Store/E-commerce": { label: "商店 / 电商", description: "实体店、网店、零售品牌" },
      "Product/Physical": { label: "实体产品", description: "物品、小工具、配件、发明" },
      Other: { label: "其他", description: "告诉我们你要命名什么" },
    },
    otherLabel: "请说明你的类别（可选）",
    otherPlaceholder: "例如：体育俱乐部、音乐节、餐车…",
    vibeLabel: "风格",
    vibes: { Sérieux: "稳重", Fun: "有趣", Futuriste: "未来感", Luxe: "奢华", Nature: "自然", Tech: "科技" },
    lengthLabel: "长度",
    lengths: { Any: "不限", Short: "短", Medium: "中等", Long: "长" },
    styleLabel: "样式",
    styles: { Any: "不限", Modern: "现代", Classic: "经典", Compound: "组合", Playful: "俏皮" },
    generateBtn: "生成",
    generatingBtn: "正在生成并检查域名…",
    quotaRemaining: (n, limit) => `今日剩余免费生成次数：${n} / ${limit}`,
    quotaUnlimited: "无限次使用（管理员）",
    adminToVisitor: "切换到访客模式",
    adminVisitorNotice: "访客模式（管理员）",
    adminToUnlimited: "重新启用无限次使用",
    buyCreditsBtn: "获取更多生成次数",
    buyTitle: "购买生成次数",
    packNames: { starter: "入门", plus: "进阶", pro: "专业" },
    packGenerations: (n) => `${n} 次生成`,
    packNamesCount: (n) => `${n} 个名字`,
    packPerGeneration: (price) => `每次生成 ${price}`,
    packSavings: (pct) => `节省 ${pct}%`,
    badgeRecommended: "推荐",
    badgeBestValue: "最划算",
    buyNoExpiry: "购买的生成次数永不过期。",
    buyApproxNote: "本地货币金额仅供参考，确切金额以付款页面为准。",
    buyPayBtn: (total) => `支付 ${total}`,
    buyClose: "关闭",
    buyUnavailable: "在线支付即将上线。你的免费额度每 24 小时重置一次。",
    errorEmpty: "请添加一些关键词以开始。",
    errors: {
      INVALID_INPUT: "部分字段无效，请检查你的输入。",
      RATE_LIMITED: "你今天的免费生成次数已用完。获取更多次数，或明天再来。",
      GENERATION_FAILED: "名字生成失败，请稍后再试。",
      PAYMENT_NOT_CONFIGURED: "在线支付即将上线。",
      CONSENT_REQUIRED: "请勾选同意框以继续。",
      INVALID_EMAIL: "邮箱地址无效。",
      INVALID_CODE: "验证码错误或已过期。",
      TOO_MANY_ATTEMPTS: "尝试次数过多，请重新获取验证码。",
      CODE_RATE_LIMITED: "请等待一分钟后再获取新的验证码。",
      INSIGHT_LIMITED: "你今天的免费分析次数已用完。请使用 Google 和图片链接，或明天再来。",
      INSIGHT_FAILED: "分析未能完成，请稍后再试。",
      BOT_CHECK_FAILED: "人机验证未通过，请稍后再试。",
      GENERIC: "发生了意外错误。",
    },
    domainAvailable: "可用",
    domainTaken: "已占用",
    domainChecking: "检查中…",
    domainUnknown: "未能验证",
    buyBtn: "注册",
    domainVerifyBtn: "查看",
    addFavorite: "加入收藏",
    removeFavorite: "取消收藏",
    generatedNamesTab: "生成的名字",
    favoritesTab: "收藏夹",
    noResults: "暂无可显示的名字。",
    noFavorites: "还没有收藏。点击名字旁的爱心即可收藏。",
    trademarkNote: "这些名字由人工智能生成，可能不正确、不完整或具有误导性。正式使用前，请确认它们尚未被使用或注册为商标：你需对自己的使用方式负责。",
    freeComSummary: (free, total) => free === 0 ? "这些名字的 .com 都已被注册：试试其他关键词或样式。" : free === total ? `全部 ${total} 个名字的 .com 都可注册` : `${total} 个名字中有 ${free} 个的 .com 可注册`,
    themeLabel: "主题",
    themes: { light: "浅色", dark: "深色", invert: "反色", custom: "自定义" },
    customColorsTitle: "你的配色",
    customColors: { paper: "背景", ink: "文字", muted: "次要文字", accent: "强调色" },
    customReset: "重置",
    langLabel: "语言",
    inputPrivacyHint: "请勿填写机密信息：你的描述将发送给人工智能服务以生成名字。",
    buyConsent: "我接受使用条款，并要求立即使用所购买的生成次数；我知悉自开始使用起即丧失撤销权。",
    footerAiNotice: "NameYourProject 使用人工智能：推荐的名字可能不正确、不完整或具有误导性。你需对自己如何使用这些名字负责。",
    footerNavLabel: "法律信息",
    legalNoticeLink: "法律声明",
    termsLink: "使用条款",
    privacyLink: "隐私政策",
    backHome: "返回首页",
    legalOnlyFrEn: "本页面仅提供法语和英语版本。",
    creditsBalance: (n) => `已购生成次数：${n}`,
    creditsLinkedTo: (m) => `绑定邮箱：${m}`,
    creditsSignOut: "在此浏览器上退出",
    restoreLink: "找回我的生成次数",
    restoreIntro: "请输入购买时使用的邮箱地址：我们将向你发送 6 位验证码。",
    emailLabel: "邮箱地址",
    sendCodeBtn: "发送验证码",
    codeSentNotice: "如果此邮箱关联了生成次数，验证码已发送至该邮箱，15 分钟内有效。",
    codeLabel: "邮件中收到的验证码",
    verifyBtn: "确认",
    restoreSuccess: "完成：你购买的生成次数已可在此浏览器中使用。",
    changeEmail: "更换邮箱",
    buyEmailNote: "生成次数将与付款时填写的邮箱绑定：无需账户，即可在任何设备上找回。",
    buyRedirecting: "正在跳转到安全支付页面…",
    thanksTitle: "感谢你的购买！",
    thanksOk: "生成次数已添加，可在此浏览器中使用。确认邮件已发送给你。",
    thanksElsewhere: "生成次数已添加。如需在此浏览器中使用，请点击“找回我的生成次数”并输入购买时使用的邮箱。",
    thanksPending: "你的付款正在确认中。付款确认后将立即添加生成次数，并向你发送邮件。",
    thanksError: "我们无法确认此笔付款。如已扣款，请联系我们，我们会为你添加生成次数。",
    backToGenerator: "返回生成器",
    cancelTitle: "付款已取消",
    cancelText: "未扣除任何费用。你可以随时重新购买。",
    checkGoogle: "Google",
    checkImages: "图片",
    checkTrademarks: "商标",
    trademarkCopied: "已复制名字：请粘贴到 WIPO 搜索框中。",
    insightBtn: "这个名字会让人联想到什么？",
    insightLoading: "正在搜索网络…",
    insightVerdicts: { FREE: "似乎未被使用", IN_USE: "已被使用", ASSOCIATED: "与其他事物高度关联", UNKNOWN: "结果不确定" },
    insightAssociation: (x) => `主要联想：${x}`,
    insightUses: "发现的用途",
    insightSources: "来源",
    insightDisclaimer: "由人工智能基于 Google 搜索给出的参考分析：请核实来源。",
    insightRemaining: (n) => `今日剩余免费分析次数：${n}`,
    moreLikeThis: "更多类似的",
    variantsOf: (n) => `“${n}”的变体`,
    logoPreviewBtn: "Logo 预览",
    logoPreviewTitle: (n) => `“${n}”效果预览`,
    logoStyles: { elegant: "优雅", modern: "现代", tech: "科技", bold: "大胆" },
    appIconLabel: "应用图标",
    businessCardLabel: "名片",
    logoPreviewNote: "仅供参考的预览，帮助你想象效果：真正的 Logo 值得交给设计师打造。",
    favViewList: "列表",
    favViewCompare: "对比",
    favCopy: "复制列表",
    favDownload: "下载",
    favShare: "分享",
    favCopied: "列表已复制。",
    favLinkCopied: "链接已复制：可发送给任何人，无需账户。",
    compareName: "名字",
    compareMeaning: "说明",
    sharedTitle: "为你精选的名字",
    sharedIntro: "有人向你发送了这些在 NameYourProject 上找到的名字。域名会实时重新检查。",
    sharedImport: "添加到我的收藏",
    sharedImported: "已添加到你的收藏",
    sharedInvalid: "此分享链接不完整或已损坏。",
    sharedCta: "寻找我自己的名字",
  },

  // ───────────────────────────────── हिन्दी ────────────────────────────────────
  hi: {
    metaDescription:
      "किसी भी प्रोजेक्ट के लिए दमदार नाम बनाएं — ऐप, बिज़नेस, ब्रांड, दुकान, एजेंसी, youtube चैनल — रियल-टाइम डोमेन जांच के साथ।",
    subtitle: "ऐसा नाम खोजें जो याद रहे",
    explanation:
      "ऐप, बिज़नेस, ब्रांड, दुकान, एजेंसी, youtube चैनल… कुछ शब्दों में अपने प्रोजेक्ट का वर्णन करें, और हम आपको **10 मौलिक नाम** सुझाएंगे, जो **मज़बूत SEO क्षमता** को ध्यान में रखकर बनाए गए हैं, साथ ही उनके **डोमेन नाम** की उपलब्धता की रियल-टाइम जांच भी करेंगे।",
    inputLabel: "अपने प्रोजेक्ट का वर्णन करें",
    inputPlaceholder: "कुत्तों के लिए सोशल मीडिया, टोक्यो में एक कॉफ़ी शॉप...",
    categoryLabel: "श्रेणी",
    categories: {
      "Business/Startup": { label: "बिज़नेस / स्टार्टअप", description: "कंपनी, स्टार्टअप, फ़र्म, एजेंसी" },
      "App/Software": { label: "ऐप / सॉफ़्टवेयर", description: "मोबाइल ऐप, SaaS, वेबसाइट, टूल" },
      "Creative/Content": { label: "क्रिएटिव / कंटेंट", description: "youtube चैनल, पॉडकास्ट, ब्लॉग, स्टूडियो" },
      "Store/E-commerce": { label: "स्टोर / ई-कॉमर्स", description: "दुकान, ऑनलाइन स्टोर, रिटेल ब्रांड" },
      "Product/Physical": { label: "भौतिक उत्पाद", description: "वस्तु, गैजेट, एक्सेसरी, आविष्कार" },
      Other: { label: "अन्य", description: "बताइए आप किसका नाम रख रहे हैं" },
    },
    otherLabel: "अपनी श्रेणी बताएं (वैकल्पिक)",
    otherPlaceholder: "जैसे: स्पोर्ट्स क्लब, म्यूज़िक फ़ेस्टिवल, फ़ूड ट्रक…",
    vibeLabel: "वाइब",
    vibes: { Sérieux: "गंभीर", Fun: "मज़ेदार", Futuriste: "भविष्यवादी", Luxe: "लग्ज़री", Nature: "प्रकृति", Tech: "टेक" },
    lengthLabel: "लंबाई",
    lengths: { Any: "कोई भी", Short: "छोटा", Medium: "मध्यम", Long: "लंबा" },
    styleLabel: "शैली",
    styles: { Any: "कोई भी", Modern: "मॉडर्न", Classic: "क्लासिक", Compound: "संयुक्त", Playful: "चंचल" },
    generateBtn: "बनाएं",
    generatingBtn: "नाम बनाए और जांचे जा रहे हैं…",
    quotaRemaining: (n, limit) => `आज बची मुफ़्त जनरेशन: ${n} / ${limit}`,
    quotaUnlimited: "असीमित पहुंच (एडमिन)",
    adminToVisitor: "विज़िटर मोड पर जाएं",
    adminVisitorNotice: "विज़िटर मोड (एडमिन)",
    adminToUnlimited: "असीमित मोड फिर से चालू करें",
    buyCreditsBtn: "और जनरेशन पाएं",
    buyTitle: "जनरेशन खरीदें",
    packNames: { starter: "स्टार्टर", plus: "प्लस", pro: "प्रो" },
    packGenerations: (n) => `${n} जनरेशन`,
    packNamesCount: (n) => `${n} नाम`,
    packPerGeneration: (price) => `${price} प्रति जनरेशन`,
    packSavings: (pct) => `${pct}% की बचत`,
    badgeRecommended: "सुझाया गया",
    badgeBestValue: "सबसे अच्छी कीमत",
    buyNoExpiry: "खरीदी गई जनरेशन कभी समाप्त नहीं होतीं।",
    buyApproxNote: "आपकी मुद्रा में राशि अनुमानित है; सटीक राशि भुगतान के समय दिखाई जाएगी।",
    buyPayBtn: (total) => `${total} का भुगतान करें`,
    buyClose: "बंद करें",
    buyUnavailable: "ऑनलाइन भुगतान बहुत जल्द आ रहा है। आपका मुफ़्त कोटा हर 24 घंटे में रीसेट होता है।",
    errorEmpty: "शुरू करने के लिए कुछ कीवर्ड जोड़ें।",
    errors: {
      INVALID_INPUT: "कुछ फ़ील्ड अमान्य हैं। कृपया अपनी प्रविष्टि जांचें।",
      RATE_LIMITED: "आज की आपकी सभी मुफ़्त जनरेशन इस्तेमाल हो चुकी हैं। और पाएं या कल फिर आएं।",
      GENERATION_FAILED: "नाम बनाना विफल रहा। कृपया थोड़ी देर में फिर से प्रयास करें।",
      PAYMENT_NOT_CONFIGURED: "ऑनलाइन भुगतान बहुत जल्द आ रहा है।",
      CONSENT_REQUIRED: "जारी रखने के लिए स्वीकृति बॉक्स पर टिक करें।",
      INVALID_EMAIL: "अमान्य ईमेल पता।",
      INVALID_CODE: "कोड गलत है या उसकी अवधि समाप्त हो गई है।",
      TOO_MANY_ATTEMPTS: "बहुत अधिक प्रयास। नया कोड मांगें।",
      CODE_RATE_LIMITED: "नया कोड मांगने से पहले एक मिनट प्रतीक्षा करें।",
      INSIGHT_LIMITED: "आज के आपके मुफ़्त विश्लेषण इस्तेमाल हो चुके हैं। Google और इमेज लिंक इस्तेमाल करें, या कल फिर आएं।",
      INSIGHT_FAILED: "विश्लेषण पूरा नहीं हो सका। कृपया थोड़ी देर में फिर से प्रयास करें।",
      BOT_CHECK_FAILED: "एंटी-बॉट जांच पूरी नहीं हुई। कृपया थोड़ी देर में फिर से प्रयास करें।",
      GENERIC: "एक अप्रत्याशित त्रुटि हुई।",
    },
    domainAvailable: "उपलब्ध",
    domainTaken: "लिया गया",
    domainChecking: "जांच हो रही है…",
    domainUnknown: "सत्यापित नहीं",
    buyBtn: "पंजीकृत करें",
    domainVerifyBtn: "जांचें",
    addFavorite: "पसंदीदा में जोड़ें",
    removeFavorite: "पसंदीदा से हटाएं",
    generatedNamesTab: "बनाए गए नाम",
    favoritesTab: "पसंदीदा",
    noResults: "अभी दिखाने के लिए कोई नाम नहीं है।",
    noFavorites: "अभी कोई पसंदीदा नहीं। किसी नाम को सहेजने के लिए उसके पास दिल पर टैप करें।",
    trademarkNote: "ये नाम AI द्वारा बनाए गए हैं और गलत, अधूरे या भ्रामक हो सकते हैं। शुरू करने से पहले जांच लें कि ये पहले से इस्तेमाल में या ट्रेडमार्क के रूप में पंजीकृत न हों: इनके उपयोग की ज़िम्मेदारी आपकी है।",
    freeComSummary: (free, total) => free === 0 ? "इनमें से किसी नाम का .com उपलब्ध नहीं है: दूसरे कीवर्ड या शैली आज़माएं।" : free === total ? `सभी ${total} नामों का .com उपलब्ध है` : `${total} में से ${free} नामों का .com उपलब्ध है`,
    themeLabel: "थीम",
    themes: { light: "लाइट", dark: "डार्क", invert: "उलटा", custom: "कस्टम" },
    customColorsTitle: "आपके रंग",
    customColors: { paper: "बैकग्राउंड", ink: "टेक्स्ट", muted: "सहायक टेक्स्ट", accent: "एक्सेंट" },
    customReset: "रीसेट करें",
    langLabel: "भाषा",
    inputPrivacyHint: "गोपनीय जानकारी न लिखें: नाम बनाने के लिए आपका विवरण एक AI सेवा को भेजा जाता है।",
    buyConsent: "मैं उपयोग की शर्तें स्वीकार करता/करती हूं और खरीदी गई जनरेशन तक तुरंत पहुंच का अनुरोध करता/करती हूं; मैं मानता/मानती हूं कि पहुंच शुरू होते ही मेरा वापसी का अधिकार समाप्त हो जाता है।",
    footerAiNotice: "NameYourProject आर्टिफ़िशियल इंटेलिजेंस का उपयोग करता है: सुझाए गए नाम गलत, अधूरे या भ्रामक हो सकते हैं। उनके उपयोग की ज़िम्मेदारी आपकी है।",
    footerNavLabel: "कानूनी जानकारी",
    legalNoticeLink: "कानूनी सूचना",
    termsLink: "उपयोग की शर्तें",
    privacyLink: "गोपनीयता",
    backHome: "होम पर वापस जाएं",
    legalOnlyFrEn: "यह पेज केवल फ़्रेंच और अंग्रेज़ी में उपलब्ध है।",
    creditsBalance: (n) => `खरीदी गई जनरेशन: ${n}`,
    creditsLinkedTo: (m) => `${m} से जुड़ी`,
    creditsSignOut: "इस ब्राउज़र से साइन आउट करें",
    restoreLink: "मेरी जनरेशन वापस पाएं",
    restoreIntro: "खरीदारी के समय इस्तेमाल किया गया ईमेल पता दर्ज करें: हम आपको 6 अंकों का कोड भेजेंगे।",
    emailLabel: "ईमेल पता",
    sendCodeBtn: "कोड भेजें",
    codeSentNotice: "अगर इस पते से जनरेशन जुड़ी हैं, तो उस पर अभी एक कोड भेजा गया है। यह 15 मिनट तक मान्य है।",
    codeLabel: "ईमेल से मिला कोड",
    verifyBtn: "पुष्टि करें",
    restoreSuccess: "हो गया: आपकी खरीदी गई जनरेशन अब इस ब्राउज़र में उपलब्ध हैं।",
    changeEmail: "दूसरा पता इस्तेमाल करें",
    buyEmailNote: "आपकी जनरेशन भुगतान के समय दर्ज किए गए ईमेल पते से जुड़ जाएंगी: बिना अकाउंट के, आप उन्हें किसी भी डिवाइस पर वापस पा सकेंगे।",
    buyRedirecting: "सुरक्षित भुगतान पेज पर भेजा जा रहा है…",
    thanksTitle: "खरीदारी के लिए धन्यवाद!",
    thanksOk: "आपकी जनरेशन जोड़ दी गई हैं और इस ब्राउज़र में उपलब्ध हैं। आपको पुष्टि ईमेल भेज दिया गया है।",
    thanksElsewhere: "आपकी जनरेशन जोड़ दी गई हैं। इस ब्राउज़र में इस्तेमाल करने के लिए, “मेरी जनरेशन वापस पाएं” पर क्लिक करें और खरीदारी वाला ईमेल पता दर्ज करें।",
    thanksPending: "आपके भुगतान की पुष्टि की जा रही है। पुष्टि होते ही आपकी जनरेशन जोड़ दी जाएंगी और आपको ईमेल मिलेगा।",
    thanksError: "हम इस भुगतान की पुष्टि नहीं कर सके। अगर आपसे राशि ली गई है, तो हमसे संपर्क करें, आपकी जनरेशन जोड़ दी जाएंगी।",
    backToGenerator: "जनरेटर पर वापस जाएं",
    cancelTitle: "भुगतान रद्द किया गया",
    cancelText: "आपसे कोई राशि नहीं ली गई है। आप जब चाहें खरीदारी फिर से शुरू कर सकते हैं।",
    checkGoogle: "Google",
    checkImages: "इमेज",
    checkTrademarks: "ट्रेडमार्क",
    trademarkCopied: "नाम कॉपी हो गया: इसे WIPO खोज में पेस्ट करें।",
    insightBtn: "यह नाम किस बात की याद दिलाता है?",
    insightLoading: "वेब पर खोजा जा रहा है…",
    insightVerdicts: { FREE: "खाली लगता है", IN_USE: "पहले से इस्तेमाल में", ASSOCIATED: "किसी और चीज़ से गहराई से जुड़ा", UNKNOWN: "अनिश्चित परिणाम" },
    insightAssociation: (x) => `मुख्य रूप से याद दिलाता है: ${x}`,
    insightUses: "मिले उपयोग",
    insightSources: "स्रोत",
    insightDisclaimer: "Google खोज के आधार पर AI द्वारा किया गया संकेतात्मक विश्लेषण: स्रोतों की जांच करें।",
    insightRemaining: (n) => `आज बचे मुफ़्त विश्लेषण: ${n}`,
    moreLikeThis: "ऐसे और नाम",
    variantsOf: (n) => `“${n}” जैसे और नाम`,
    logoPreviewBtn: "लोगो प्रीव्यू",
    logoPreviewTitle: (n) => `“${n}” का प्रीव्यू`,
    logoStyles: { elegant: "सुरुचिपूर्ण", modern: "मॉडर्न", tech: "टेक", bold: "दमदार" },
    appIconLabel: "ऐप आइकन",
    businessCardLabel: "बिज़नेस कार्ड",
    logoPreviewNote: "कल्पना करने में मदद के लिए संकेतात्मक प्रीव्यू: असली लोगो के लिए डिज़ाइनर का काम ज़रूरी है।",
    favViewList: "सूची",
    favViewCompare: "तुलना करें",
    favCopy: "सूची कॉपी करें",
    favDownload: "डाउनलोड करें",
    favShare: "शेयर करें",
    favCopied: "सूची कॉपी हो गई।",
    favLinkCopied: "लिंक कॉपी हो गया: इसे किसी को भी भेजें, अकाउंट की ज़रूरत नहीं।",
    compareName: "नाम",
    compareMeaning: "विवरण",
    sharedTitle: "आपके लिए चुने गए नाम",
    sharedIntro: "किसी ने आपको NameYourProject पर मिले ये नाम भेजे हैं। डोमेन की जांच फिर से लाइव की जाती है।",
    sharedImport: "इन्हें मेरे पसंदीदा में जोड़ें",
    sharedImported: "आपके पसंदीदा में जोड़ दिए गए",
    sharedInvalid: "यह शेयर लिंक अधूरा या खराब है।",
    sharedCta: "अपने खुद के नाम खोजें",
  },

  // ───────────────────────────────── العربية ─────────────────────────────────
  ar: {
    metaDescription:
      "أنشئ أسماء لافتة لأي مشروع — تطبيق، مشروع تجاري، علامة تجارية، متجر، وكالة، قناة يوتيوب — مع التحقق الفوري من توفر النطاق.",
    subtitle: "اعثر على الاسم الذي سيعلق في الأذهان",
    explanation:
      "تطبيق، مشروع تجاري، علامة تجارية، متجر، وكالة، قناة يوتيوب… صف مشروعك في بضع كلمات، وسنقترح عليك **10 أسماء مبتكرة** مصممة لتحقيق **إمكانات قوية في تحسين محركات البحث (SEO)**، مع التحقق الفوري من توفر **اسم النطاق**.",
    inputLabel: "صف مشروعك",
    inputPlaceholder: "شبكة اجتماعية للكلاب، مقهى في طوكيو، تطبيق ذكاء اصطناعي...",
    categoryLabel: "الفئة",
    categories: {
      "Business/Startup": { label: "شركة / شركة ناشئة", description: "شركة، مشروع ناشئ، مكتب، وكالة" },
      "App/Software": { label: "تطبيق / برنامج", description: "تطبيق جوال، SaaS، موقع ويب، أداة" },
      "Creative/Content": { label: "إبداع / محتوى", description: "قناة يوتيوب، بودكاست، مدونة، استوديو" },
      "Store/E-commerce": { label: "متجر / تجارة إلكترونية", description: "محل، متجر إلكتروني، علامة تجارية" },
      "Product/Physical": { label: "منتج مادي", description: "غرض، أداة، إكسسوار، اختراع" },
      Other: { label: "أخرى", description: "أخبرنا بما تريد تسميته" },
    },
    otherLabel: "حدّد فئتك (اختياري)",
    otherPlaceholder: "مثال: نادٍ رياضي، مهرجان موسيقي، عربة طعام…",
    vibeLabel: "الأجواء",
    vibes: { Sérieux: "جاد", Fun: "ممتع", Futuriste: "مستقبلي", Luxe: "فاخر", Nature: "طبيعة", Tech: "تقني" },
    lengthLabel: "الطول",
    lengths: { Any: "أي طول", Short: "قصير", Medium: "متوسط", Long: "طويل" },
    styleLabel: "الأسلوب",
    styles: { Any: "أي أسلوب", Modern: "عصري", Classic: "كلاسيكي", Compound: "مركّب", Playful: "مرح" },
    generateBtn: "توليد",
    generatingBtn: "جارٍ التوليد والتحقق…",
    quotaRemaining: (n, limit) => `عمليات التوليد المجانية المتبقية اليوم: ${n} / ${limit}`,
    quotaUnlimited: "وصول غير محدود (المسؤول)",
    adminToVisitor: "التبديل إلى وضع الزائر",
    adminVisitorNotice: "وضع الزائر (المسؤول)",
    adminToUnlimited: "إعادة تفعيل الوصول غير المحدود",
    buyCreditsBtn: "احصل على المزيد من عمليات التوليد",
    buyTitle: "شراء عمليات توليد",
    packNames: { starter: "المبتدئ", plus: "بلس", pro: "الاحترافي" },
    packGenerations: (n) => `عمليات التوليد: ${n}`,
    packNamesCount: (n) => `الأسماء: ${n}`,
    packPerGeneration: (price) => `${price} لكل عملية توليد`,
    packSavings: (pct) => `وفّر ${pct}%`,
    badgeRecommended: "موصى به",
    badgeBestValue: "أفضل سعر",
    buyNoExpiry: "لا تنتهي صلاحية عمليات التوليد المشتراة أبدًا.",
    buyApproxNote: "المبلغ بعملتك تقريبي؛ يظهر المبلغ الدقيق عند الدفع.",
    buyPayBtn: (total) => `ادفع ${total}`,
    buyClose: "إغلاق",
    buyUnavailable: "الدفع الإلكتروني متاح قريبًا جدًا. يتجدد رصيدك المجاني كل 24 ساعة.",
    errorEmpty: "أضف بعض الكلمات المفتاحية للبدء.",
    errors: {
      INVALID_INPUT: "بعض الحقول غير صالحة. يرجى التحقق من إدخالك.",
      RATE_LIMITED: "لقد استخدمت كل عمليات التوليد المجانية لليوم. احصل على المزيد أو عُد غدًا.",
      GENERATION_FAILED: "فشل توليد الأسماء. يرجى المحاولة مرة أخرى بعد قليل.",
      PAYMENT_NOT_CONFIGURED: "الدفع الإلكتروني متاح قريبًا جدًا.",
      CONSENT_REQUIRED: "ضع علامة في مربع الموافقة للمتابعة.",
      INVALID_EMAIL: "عنوان البريد الإلكتروني غير صالح.",
      INVALID_CODE: "الرمز غير صحيح أو منتهي الصلاحية.",
      TOO_MANY_ATTEMPTS: "محاولات كثيرة جدًا. اطلب رمزًا جديدًا.",
      CODE_RATE_LIMITED: "يُرجى الانتظار دقيقة قبل طلب رمز جديد.",
      INSIGHT_LIMITED: "لقد استخدمت تحليلاتك المجانية لهذا اليوم. استخدم روابط Google والصور، أو عُد غدًا.",
      INSIGHT_FAILED: "تعذّر إكمال التحليل. يرجى المحاولة مرة أخرى بعد قليل.",
      BOT_CHECK_FAILED: "لم يكتمل التحقق من أنك لست روبوتًا. يرجى المحاولة مرة أخرى بعد قليل.",
      GENERIC: "حدث خطأ غير متوقع.",
    },
    domainAvailable: "متاح",
    domainTaken: "محجوز",
    domainChecking: "جارٍ التحقق…",
    domainUnknown: "لم يتم التحقق",
    buyBtn: "تسجيل",
    domainVerifyBtn: "تحقق",
    addFavorite: "إضافة إلى المفضلة",
    removeFavorite: "إزالة من المفضلة",
    generatedNamesTab: "الأسماء المولّدة",
    favoritesTab: "المفضلة",
    noResults: "لا توجد أسماء لعرضها بعد.",
    noFavorites: "لا توجد مفضلات بعد. اضغط على القلب بجانب الاسم لحفظه.",
    trademarkNote: "هذه الأسماء من توليد الذكاء الاصطناعي وقد تكون غير صحيحة أو ناقصة أو مضللة. قبل الانطلاق، تأكد من أنها غير مستخدمة أو مسجلة كعلامة تجارية: أنت مسؤول عن طريقة استخدامك لها.",
    freeComSummary: (free, total) => free === 0 ? "لا يوجد نطاق .com متاح لهذه الأسماء: جرّب كلمات مفتاحية أو أسلوبًا آخر." : free === total ? `نطاق .com متاح لجميع الأسماء الـ ${total}` : `نطاق .com متاح لـ ${free} من أصل ${total} أسماء`,
    themeLabel: "المظهر",
    themes: { light: "فاتح", dark: "داكن", invert: "معكوس", custom: "مخصص" },
    customColorsTitle: "ألوانك",
    customColors: { paper: "الخلفية", ink: "النص", muted: "النص الثانوي", accent: "لون التمييز" },
    customReset: "إعادة الضبط",
    langLabel: "اللغة",
    inputPrivacyHint: "تجنّب المعلومات السرية: يُرسَل وصفك إلى خدمة ذكاء اصطناعي لتوليد الأسماء.",
    buyConsent: "أوافق على شروط الاستخدام وأطلب الوصول الفوري إلى عمليات التوليد المشتراة، وأقرّ بأنني أفقد حقي في التراجع بمجرد بدء هذا الوصول.",
    footerAiNotice: "يستخدم NameYourProject الذكاء الاصطناعي: قد تكون الأسماء المقترحة غير صحيحة أو ناقصة أو مضللة. أنت مسؤول عن طريقة استخدامك لها.",
    footerNavLabel: "معلومات قانونية",
    legalNoticeLink: "إشعار قانوني",
    termsLink: "شروط الاستخدام",
    privacyLink: "الخصوصية",
    backHome: "العودة إلى الصفحة الرئيسية",
    legalOnlyFrEn: "هذه الصفحة متاحة باللغتين الفرنسية والإنجليزية فقط.",
    creditsBalance: (n) => `عمليات التوليد المشتراة: ${n}`,
    creditsLinkedTo: (m) => `مرتبطة بـ ${m}`,
    creditsSignOut: "تسجيل الخروج من هذا المتصفح",
    restoreLink: "استعادة عمليات التوليد",
    restoreIntro: "أدخل عنوان البريد الإلكتروني الذي استخدمته عند الشراء: سنرسل إليك رمزًا من 6 أرقام.",
    emailLabel: "البريد الإلكتروني",
    sendCodeBtn: "أرسل لي رمزًا",
    codeSentNotice: "إذا كانت هناك عمليات توليد مرتبطة بهذا العنوان، فقد أُرسل إليه رمز للتو. الرمز صالح لمدة 15 دقيقة.",
    codeLabel: "الرمز المستلم عبر البريد",
    verifyBtn: "تأكيد",
    restoreSuccess: "تم: أصبحت عمليات التوليد التي اشتريتها متاحة على هذا المتصفح.",
    changeEmail: "استخدام عنوان آخر",
    buyEmailNote: "ستُربط عمليات التوليد بعنوان البريد الإلكتروني الذي تُدخله عند الدفع: يتيح لك استعادتها على أي جهاز، دون حساب.",
    buyRedirecting: "جارٍ التحويل إلى صفحة الدفع الآمن…",
    thanksTitle: "شكرًا لشرائك!",
    thanksOk: "تمت إضافة عمليات التوليد وهي متاحة على هذا المتصفح. أرسلنا إليك رسالة تأكيد.",
    thanksElsewhere: "تمت إضافة عمليات التوليد. لاستخدامها على هذا المتصفح، انقر على «استعادة عمليات التوليد» وأدخل البريد الإلكتروني الذي استخدمته عند الشراء.",
    thanksPending: "جارٍ تأكيد دفعتك. ستُضاف عمليات التوليد فور تأكيدها، وستصلك رسالة بريد إلكتروني.",
    thanksError: "تعذّر علينا تأكيد هذه الدفعة. إذا تم خصم المبلغ، تواصل معنا وسنضيف عمليات التوليد.",
    backToGenerator: "العودة إلى المولّد",
    cancelTitle: "تم إلغاء الدفع",
    cancelText: "لم يتم خصم أي مبلغ. يمكنك استئناف الشراء متى شئت.",
    checkGoogle: "Google",
    checkImages: "صور",
    checkTrademarks: "العلامات التجارية",
    trademarkCopied: "تم نسخ الاسم: الصقه في بحث الويبو.",
    insightBtn: "بماذا يوحي هذا الاسم؟",
    insightLoading: "جارٍ البحث على الويب…",
    insightVerdicts: { FREE: "يبدو متاحًا", IN_USE: "مستخدم بالفعل", ASSOCIATED: "مرتبط بقوة بشيء آخر", UNKNOWN: "نتيجة غير مؤكدة" },
    insightAssociation: (x) => `يوحي أساسًا بـ: ${x}`,
    insightUses: "استخدامات تم العثور عليها",
    insightSources: "المصادر",
    insightDisclaimer: "تحليل إرشادي أجراه الذكاء الاصطناعي استنادًا إلى بحث على Google: تحقق من المصادر.",
    insightRemaining: (n) => `التحليلات المجانية المتبقية اليوم: ${n}`,
    moreLikeThis: "المزيد مثل هذا",
    variantsOf: (n) => `بدائل قريبة من «${n}»`,
    logoPreviewBtn: "معاينة الشعار",
    logoPreviewTitle: (n) => `«${n}» في الواقع`,
    logoStyles: { elegant: "أنيق", modern: "عصري", tech: "تقني", bold: "جريء" },
    appIconLabel: "أيقونة التطبيق",
    businessCardLabel: "بطاقة العمل",
    logoPreviewNote: "معاينة إرشادية لتتخيل النتيجة: الشعار الحقيقي يستحق عمل مصمم محترف.",
    favViewList: "قائمة",
    favViewCompare: "مقارنة",
    favCopy: "نسخ القائمة",
    favDownload: "تنزيل",
    favShare: "مشاركة",
    favCopied: "تم نسخ القائمة.",
    favLinkCopied: "تم نسخ الرابط: أرسله لمن تشاء، دون حاجة إلى حساب.",
    compareName: "الاسم",
    compareMeaning: "الشرح",
    sharedTitle: "مجموعة أسماء مختارة لك",
    sharedIntro: "أرسل إليك أحدهم هذه الأسماء التي وجدها على NameYourProject. يُعاد التحقق من النطاقات مباشرة.",
    sharedImport: "أضفها إلى مفضلتي",
    sharedImported: "تمت إضافتها إلى مفضلتك",
    sharedInvalid: "رابط المشاركة هذا ناقص أو تالف.",
    sharedCta: "ابحث عن أسمائي الخاصة",
  },
};
