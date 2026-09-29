// =============================================================================
// NameYourProject — Informations légales du site
//
// Utilisées automatiquement par /mentions-legales, /conditions-utilisation
// et /confidentialite. Un texte peut être donné dans une seule version
// (identique en français et en anglais), ou en deux : { fr: "…", en: "…" }.
// Un champ laissé vide s'affiche "[À compléter]" en rouge.
//
// Situation actuelle : projet personnel, non commercial, hébergé sur Vercel.
// À mettre à jour le jour où le site deviendrait une activité commerciale
// (forme juridique, SIRET, médiateur de la consommation…).
// =============================================================================

export type Localized = string | { fr: string; en: string };

export function loc(value: Localized, lang: "fr" | "en"): string {
  return typeof value === "string" ? value : value[lang];
}

export const LEGAL = {
  /** Date de dernière mise à jour des documents (AAAA-MM-JJ) */
  lastUpdated: "2026-09-29",

  /** Éditeur du site */
  publisher: {
    name: "Hugo RAKOTONANAHARY" as Localized,
    legalForm: {
      fr: "Particulier — projet personnel non commercial",
      en: "Individual — personal, non-commercial project",
    } as Localized,
    address: "Puteaux, France" as Localized,
    email: "hrakotona@gmail.com",
    /** Facultatif : laissé vide, il n'est pas affiché */
    phone: "",
    siret: {
      fr: "Aucun pour le moment : projet personnel, sans activité commerciale",
      en: "None for now: personal project with no commercial activity",
    } as Localized,
    /** Facultatif : laissé vide, il n'est pas affiché */
    vatNumber: "",
    publicationDirector: "Hugo RAKOTONANAHARY" as Localized,
  },

  /** Hébergeur : l'entreprise dont les serveurs font tourner le site (coordonnées à vérifier sur vercel.com) */
  host: {
    name: "Vercel Inc." as Localized,
    address: {
      fr: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
      en: "440 N Barranca Ave #4133, Covina, CA 91723, United States",
    } as Localized,
    website: "https://vercel.com",
  },

  /** Médiateur de la consommation : obligatoire seulement si le site vend à des particuliers */
  consumerMediator: {
    name: {
      fr: "aucun pour le moment, l'achat en ligne n'étant pas encore ouvert",
      en: "none for now, as online purchase is not open yet",
    } as Localized,
    website: "",
  },
};
