// =============================================================================
// NameYourProject — Informations légales du site
//
// 👉 À COMPLÉTER AVANT LA MISE EN LIGNE. Tant qu'un champ obligatoire est vide,
//    il s'affiche "[À compléter]" en rouge sur les pages légales.
//
// Ces informations sont exigées par la loi française (article 6 de la LCEN
// pour les mentions légales, RGPD pour la confidentialité, Code de la
// consommation pour la vente). Elles sont utilisées automatiquement par les
// pages /mentions-legales, /conditions-utilisation et /confidentialite.
// =============================================================================

export const LEGAL = {
  /** Date de dernière mise à jour des documents (AAAA-MM-JJ) */
  lastUpdated: "2026-09-28",

  /** Éditeur du site = toi (ou ta société) */
  publisher: {
    /** Nom et prénom (entrepreneur individuel) ou raison sociale (société) */
    name: "",
    /** Ex : "Entrepreneur individuel (micro-entreprise)" ou "SAS au capital de 1 000 €" */
    legalForm: "",
    /** Adresse postale complète (siège ou domicile professionnel) */
    address: "",
    /** Adresse e-mail de contact (obligatoire) */
    email: "",
    /** Téléphone (facultatif si l'e-mail permet un contact rapide) */
    phone: "",
    /** Numéro SIREN/SIRET (obligatoire dès que tu vends, même en micro-entreprise) */
    siret: "",
    /** Numéro de TVA intracommunautaire (seulement si tu y es assujetti) */
    vatNumber: "",
    /** Directeur ou directrice de la publication (en général : toi) */
    publicationDirector: "",
  },

  /** Hébergeur du site : copier ses coordonnées depuis son site officiel (Vercel, Render…) */
  host: {
    name: "",
    address: "",
    website: "",
  },

  /**
   * Médiateur de la consommation : obligatoire dès que tu vends aux
   * particuliers (articles L612-1 et suivants du Code de la consommation).
   * À choisir parmi les médiateurs agréés (liste sur le site de la CECMC).
   */
  consumerMediator: {
    name: "",
    website: "",
  },
};

/** Champs obligatoires : utilisés pour afficher "[À compléter]" s'ils sont vides. */
export const REQUIRED_LEGAL_FIELDS = {
  publisher: ["name", "legalForm", "address", "email", "siret", "publicationDirector"],
  host: ["name", "address"],
  consumerMediator: ["name", "website"],
} as const;
