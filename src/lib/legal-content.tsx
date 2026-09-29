import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL, loc, type Localized } from "@/lib/legal";
import { SITE_NAME } from "@/lib/i18n";

// =============================================================================
// NameYourProject — Contenu des pages légales (français = version de référence)
//
// Rédigé pour décrire EXACTEMENT ce que fait le site aujourd'hui (données,
// cookies, prestataires). Si tu ajoutes une fonctionnalité qui traite des
// données (statistiques, publicité, comptes…), ce texte doit être mis à jour.
//
// ⚠️ Modèle de départ sérieux, mais pas un avis juridique : à faire relire par
// un professionnel avant d'encaisser des paiements.
// =============================================================================

export type LegalLang = "fr" | "en";

/**
 * Services réellement actifs (lus côté serveur, voir lib/active-services.ts) :
 * les textes ne mentionnent comme actifs que les services effectivement utilisés.
 */
export interface ActiveServices {
  payments: boolean;
  emails: boolean;
  sharedStore: boolean;
  antiBot: boolean;
}

export interface LegalSection {
  title: string;
  body: ReactNode;
}

export interface LegalDoc {
  title: string;
  sections: LegalSection[];
}

/** Affiche la valeur, ou "[À compléter]" en rouge si elle est vide. */
function Fill({ value, lang }: { value: Localized; lang: LegalLang }) {
  const text = loc(value, lang);
  if (text.trim()) return <>{text}</>;
  return (
    <mark className="rounded bg-danger/15 px-1 font-medium text-danger">
      {lang === "fr" ? "[À compléter]" : "[To be completed]"}
    </mark>
  );
}

const P = ({ children }: { children: ReactNode }) => <p>{children}</p>;
const UL = ({ children }: { children: ReactNode }) => <ul className="list-disc space-y-1.5 ps-5">{children}</ul>;
const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} className="font-medium text-ink underline underline-offset-4">
    {children}
  </Link>
);
const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline underline-offset-4">
    {children}
  </a>
);

const pub = LEGAL.publisher;
const host = LEGAL.host;
const med = LEGAL.consumerMediator;

/** "a, b et c" / "a, b and c" */
function joinList(items: string[], lang: LegalLang): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${lang === "fr" ? "et" : "and"} ${items[items.length - 1]}`;
}

function providers(lang: LegalLang, s: ActiveServices): string {
  const h = loc(host.name, lang) || (lang === "fr" ? "[À compléter]" : "[To be completed]");
  const fr = [
    `l'hébergeur (${h})`,
    "Google (IA Gemini et recherche Google)",
    "les registres de noms de domaine",
    s.payments && "le prestataire de paiement Stripe",
    s.payments && s.emails && "le service d'envoi d'e-mails Resend",
    s.sharedStore && `la base de données Upstash (compteur de générations${s.payments ? " et générations achetées" : ""})`,
    s.antiBot && "le service anti-robots Cloudflare Turnstile",
  ];
  const en = [
    `the hosting provider (${h})`,
    "Google (Gemini AI and Google Search)",
    "domain name registries",
    s.payments && "the payment provider Stripe",
    s.payments && s.emails && "the email provider Resend",
    s.sharedStore && `the Upstash database (generation counter${s.payments ? " and purchased generations" : ""})`,
    s.antiBot && "the Cloudflare Turnstile anti-bot service",
  ];
  return joinList((lang === "fr" ? fr : en).filter((x): x is string => typeof x === "string"), lang);
}

function Contact({ lang }: { lang: LegalLang }) {
  return pub.email ? (
    <a href={`mailto:${pub.email}`} className="font-medium text-ink underline underline-offset-4">
      {pub.email}
    </a>
  ) : (
    <Fill value="" lang={lang} />
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MENTIONS LÉGALES
// ═════════════════════════════════════════════════════════════════════════════

export function legalNotice(lang: LegalLang): LegalDoc {
  if (lang === "fr") {
    return {
      title: "Mentions légales",
      sections: [
        {
          title: "Éditeur du site",
          body: (
            <UL>
              <li>Nom ou raison sociale : <Fill value={pub.name} lang={lang} /></li>
              <li>Forme juridique : <Fill value={pub.legalForm} lang={lang} /></li>
              <li>Adresse : <Fill value={pub.address} lang={lang} /></li>
              <li>E-mail : <Contact lang={lang} /></li>
              {pub.phone && <li>Téléphone : {pub.phone}</li>}
              <li>SIREN / SIRET : <Fill value={pub.siret} lang={lang} /></li>
              {pub.vatNumber && <li>TVA intracommunautaire : {pub.vatNumber}</li>}
            </UL>
          ),
        },
        {
          title: "Directeur de la publication",
          body: <P><Fill value={pub.publicationDirector} lang={lang} /></P>,
        },
        {
          title: "Hébergeur",
          body: (
            <UL>
              <li>Nom : <Fill value={host.name} lang={lang} /></li>
              <li>Adresse : <Fill value={host.address} lang={lang} /></li>
              {host.website && <li>Site web : <Ext href={host.website}>{host.website}</Ext></li>}
            </UL>
          ),
        },
        {
          title: "Propriété intellectuelle",
          body: (
            <P>
              Le nom {SITE_NAME}, le design, les textes et le code du site sont protégés. Toute reproduction ou
              réutilisation sans autorisation écrite de l&apos;éditeur est interdite. Les noms générés pour vous par le
              service sont régis par les <A href="/conditions-utilisation">conditions d&apos;utilisation</A>.
            </P>
          ),
        },
        {
          title: "Liens d'affiliation",
          body: (
            <P>
              Certains liens vers des sites de réservation de noms de domaine (comme Namecheap) sont des liens
              d&apos;affiliation : si vous réservez un domaine après avoir cliqué dessus, l&apos;éditeur peut percevoir
              une commission, sans modifier le prix que vous payez.
            </P>
          ),
        },
        {
          title: "Contact",
          body: <P>Pour toute question : <Contact lang={lang} />.</P>,
        },
      ],
    };
  }
  return {
    title: "Legal notice",
    sections: [
      {
        title: "Publisher",
        body: (
          <UL>
            <li>Name or company name: <Fill value={pub.name} lang={lang} /></li>
            <li>Legal form: <Fill value={pub.legalForm} lang={lang} /></li>
            <li>Address: <Fill value={pub.address} lang={lang} /></li>
            <li>Email: <Contact lang={lang} /></li>
            {pub.phone && <li>Phone: {pub.phone}</li>}
            <li>Company registration number (SIREN/SIRET): <Fill value={pub.siret} lang={lang} /></li>
            {pub.vatNumber && <li>EU VAT number: {pub.vatNumber}</li>}
          </UL>
        ),
      },
      { title: "Publication director", body: <P><Fill value={pub.publicationDirector} lang={lang} /></P> },
      {
        title: "Hosting provider",
        body: (
          <UL>
            <li>Name: <Fill value={host.name} lang={lang} /></li>
            <li>Address: <Fill value={host.address} lang={lang} /></li>
            {host.website && <li>Website: <Ext href={host.website}>{host.website}</Ext></li>}
          </UL>
        ),
      },
      {
        title: "Intellectual property",
        body: (
          <P>
            The {SITE_NAME} name, design, texts and code are protected. Any reproduction or reuse without the
            publisher&apos;s written permission is prohibited. Names generated for you are governed by the{" "}
            <A href="/conditions-utilisation">terms of use</A>.
          </P>
        ),
      },
      {
        title: "Affiliate links",
        body: (
          <P>
            Some links to domain registration websites (such as Namecheap) are affiliate links: if you register a
            domain after clicking one, the publisher may receive a commission, without changing the price you pay.
          </P>
        ),
      },
      { title: "Contact", body: <P>For any question: <Contact lang={lang} />.</P> },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// CONDITIONS D'UTILISATION (incluant les conditions de vente)
// ═════════════════════════════════════════════════════════════════════════════

export function termsOfUse(lang: LegalLang, services: ActiveServices): LegalDoc {
  if (lang === "fr") {
    return {
      title: "Conditions d'utilisation",
      sections: [
        {
          title: "1. Objet",
          body: (
            <P>
              Ces conditions encadrent l&apos;utilisation de {SITE_NAME}, un service qui propose des idées de noms pour
              vos projets à l&apos;aide de l&apos;intelligence artificielle. En utilisant le site, vous acceptez ces
              conditions.
            </P>
          ),
        },
        {
          title: "2. Le service",
          body: (
            <UL>
              <li>À partir de votre description et de vos choix, une intelligence artificielle propose des noms.</li>
              <li>
                Le site vérifie, auprès des registres officiels des noms de domaine, si le .com et le .fr de chaque nom
                semblent libres au moment de la vérification.
              </li>
              <li>
                Des liens vous permettent de réserver un domaine chez un registraire tiers, selon ses propres conditions.
              </li>
            </UL>
          ),
        },
        {
          title: "3. Accès gratuit et limite quotidienne",
          body: (
            <P>
              Le site est accessible gratuitement, sans création de compte, dans la limite d&apos;un nombre de
              générations gratuites par jour et par connexion. Il est interdit de contourner cette limite (robots,
              scripts, changements d&apos;adresse IP répétés…) ou de perturber le fonctionnement du service.
            </P>
          ),
        },
        {
          title: "4. Contenus générés par intelligence artificielle",
          body: (
            <>
              <P>
                Les noms et explications sont produits automatiquement par une intelligence artificielle. Ils peuvent
                être incorrects, incomplets, trompeurs, ou ressembler à des noms déjà existants.
              </P>
              <P>
                L&apos;éditeur ne garantit pas qu&apos;un nom proposé soit original, disponible, ou libre de tout droit
                de tiers (marque déposée, nom de société, nom de domaine…). Le « potentiel SEO » est une estimation de
                l&apos;IA, pas une mesure.
              </P>
            </>
          ),
        },
        {
          title: "5. Vérification des noms de domaine",
          body: (
            <P>
              L&apos;indication « disponible » reflète la réponse du registre au moment de la vérification. Un domaine
              peut être réservé par quelqu&apos;un d&apos;autre juste après, ou être réservé/vendu à un prix
              particulier. Seul le registraire confirme la disponibilité et le prix au moment de la réservation.
            </P>
          ),
        },
        {
          title: "6. Votre responsabilité",
          body: (
            <UL>
              <li>
                Vous êtes seul responsable de la manière dont vous utilisez le site, des noms que vous choisissez et de
                l&apos;usage que vous en faites.
              </li>
              <li>
                Avant d&apos;utiliser un nom, vérifiez qu&apos;il ne porte pas atteinte aux droits d&apos;un tiers,
                notamment auprès des bases de marques (INPI, EUIPO, OMPI).
              </li>
              <li>
                N&apos;indiquez pas d&apos;informations confidentielles ni de données personnelles concernant
                d&apos;autres personnes dans la description : elle est transmise à un service d&apos;IA tiers (voir la{" "}
                <A href="/confidentialite">politique de confidentialité</A>).
              </li>
              <li>Vous vous engagez à utiliser le site de manière licite.</li>
            </UL>
          ),
        },
        {
          title: "7. Droits sur les noms générés",
          body: (
            <P>
              L&apos;éditeur ne revendique aucun droit sur les noms proposés : vous êtes libre de les utiliser, sous
              réserve des droits des tiers. Aucune exclusivité n&apos;est accordée : d&apos;autres utilisateurs peuvent
              recevoir des noms identiques ou proches.
            </P>
          ),
        },
        {
          title: "8. Achat de générations",
          body: (
            <>
              {!services.payments && (
                <P>
                  <strong className="text-ink">L&apos;achat en ligne n&apos;est pas encore ouvert.</strong> Les conditions
                  ci-dessous s&apos;appliqueront dès son ouverture.
                </P>
              )}
              <P>
                Au-delà de la limite gratuite, vous pouvez acheter des packs de générations. Les prix affichés au moment
                du paiement font foi. Les générations achetées n&apos;expirent pas. Le paiement est traité par un
                prestataire de paiement sécurisé : le site n&apos;a jamais accès à vos données bancaires.
              </P>
              <P>
                Sans création de compte, les générations achetées sont liées à l&apos;adresse e-mail saisie lors du
                paiement. Vous pouvez les retrouver sur tout appareil grâce à un code envoyé à cette adresse : veillez
                à saisir une adresse exacte et à laquelle vous avez accès.
              </P>
              <P>
                Les générations achetées sont utilisables immédiatement. En validant votre achat, vous demandez
                expressément cet accès immédiat et reconnaissez perdre votre droit de rétractation dès cet accès,
                conformément à l&apos;article L221-28 du Code de la consommation.
              </P>
              <P>
                En cas de problème lié à un achat, contactez-nous : <Contact lang={lang} />. En cas de litige non
                résolu, vous pouvez recourir gratuitement au médiateur de la consommation :{" "}
                <Fill value={med.name} lang={lang} />
                {med.website && (
                  <>
                    {" "}(<Ext href={med.website}>{med.website}</Ext>)
                  </>
                )}
                .
              </P>
            </>
          ),
        },
        {
          title: "9. Disponibilité et évolution du service",
          body: (
            <P>
              Le service est fourni en l&apos;état. L&apos;éditeur s&apos;efforce de le maintenir accessible mais ne
              garantit pas une disponibilité sans interruption, et peut le faire évoluer, le suspendre ou
              l&apos;arrêter.
            </P>
          ),
        },
        {
          title: "10. Limitation de responsabilité",
          body: (
            <P>
              Dans les limites prévues par la loi, l&apos;éditeur n&apos;est pas responsable des décisions prises sur
              la base des noms proposés, ni des dommages indirects liés à leur utilisation. Rien dans ces conditions ne
              limite les droits dont vous disposez en tant que consommateur.
            </P>
          ),
        },
        {
          title: "11. Modification des conditions",
          body: (
            <P>
              Ces conditions peuvent être modifiées. La version applicable est celle publiée sur le site au moment de
              votre utilisation ou de votre achat.
            </P>
          ),
        },
        {
          title: "12. Droit applicable",
          body: (
            <P>
              Ces conditions sont soumises au droit français, sans vous priver de la protection des règles impératives
              du pays où vous résidez si vous êtes consommateur. La version française de ces conditions fait foi.
            </P>
          ),
        },
      ],
    };
  }
  return {
    title: "Terms of use",
    sections: [
      {
        title: "1. Purpose",
        body: (
          <P>
            These terms govern the use of {SITE_NAME}, a service that suggests name ideas for your projects using
            artificial intelligence. By using the site, you accept these terms.
          </P>
        ),
      },
      {
        title: "2. The service",
        body: (
          <UL>
            <li>Based on your description and choices, an artificial intelligence suggests names.</li>
            <li>
              The site checks with the official domain name registries whether the .com and .fr of each name appear to
              be free at the time of the check.
            </li>
            <li>Links let you register a domain with a third-party registrar, under its own terms.</li>
          </UL>
        ),
      },
      {
        title: "3. Free access and daily limit",
        body: (
          <P>
            The site is free to use, without an account, within a limited number of free generations per day and per
            connection. Circumventing this limit (bots, scripts, repeatedly changing IP address…) or disrupting the
            service is prohibited.
          </P>
        ),
      },
      {
        title: "4. AI-generated content",
        body: (
          <>
            <P>
              Names and explanations are produced automatically by an artificial intelligence. They may be incorrect,
              incomplete, misleading, or resemble existing names.
            </P>
            <P>
              The publisher does not guarantee that a suggested name is original, available, or free of third-party
              rights (registered trademark, company name, domain name…). &quot;SEO potential&quot; is an AI estimate,
              not a measurement.
            </P>
          </>
        ),
      },
      {
        title: "5. Domain name checks",
        body: (
          <P>
            &quot;Available&quot; reflects the registry&apos;s answer at the time of the check. A domain may be
            registered by someone else right afterwards, or be reserved or sold at a special price. Only the registrar
            confirms availability and price at the time of registration.
          </P>
        ),
      },
      {
        title: "6. Your responsibility",
        body: (
          <UL>
            <li>You alone are responsible for how you use the site, the names you choose and how you use them.</li>
            <li>
              Before using a name, check that it does not infringe third-party rights, in particular in trademark
              databases (INPI, EUIPO, WIPO).
            </li>
            <li>
              Do not include confidential information or other people&apos;s personal data in your description: it is
              sent to a third-party AI service (see the <A href="/confidentialite">privacy policy</A>).
            </li>
            <li>You agree to use the site lawfully.</li>
          </UL>
        ),
      },
      {
        title: "7. Rights to generated names",
        body: (
          <P>
            The publisher claims no rights to the suggested names: you are free to use them, subject to third-party
            rights. No exclusivity is granted: other users may receive identical or similar names.
          </P>
        ),
      },
      {
        title: "8. Buying generations",
        body: (
          <>
            {!services.payments && (
              <P>
                <strong className="text-ink">Online purchase is not open yet.</strong> The terms below will apply as soon
                as it opens.
              </P>
            )}
            <P>
              Beyond the free limit, you can buy packs of generations. The prices shown at checkout apply. Purchased
              generations do not expire. Payment is handled by a secure payment provider: the site never has access to
              your card details.
            </P>
            <P>
              Without an account, purchased generations are linked to the email address entered at checkout. You can
              recover them on any device with a code sent to that address: make sure you enter an accurate address that
              you have access to.
            </P>
            <P>
              Purchased generations are available immediately. By confirming your purchase, you expressly request this
              immediate access and acknowledge that you lose your right of withdrawal once access begins, in accordance
              with article L221-28 of the French Consumer Code.
            </P>
            <P>
              For any issue with a purchase, contact us: <Contact lang={lang} />. If a dispute remains unresolved, you
              may use the consumer mediator free of charge: <Fill value={med.name} lang={lang} />
              {med.website && (
                <>
                  {" "}(<Ext href={med.website}>{med.website}</Ext>)
                </>
              )}
              .
            </P>
          </>
        ),
      },
      {
        title: "9. Availability and changes",
        body: (
          <P>
            The service is provided as is. The publisher strives to keep it available but does not guarantee
            uninterrupted access, and may change, suspend or discontinue it.
          </P>
        ),
      },
      {
        title: "10. Limitation of liability",
        body: (
          <P>
            To the extent permitted by law, the publisher is not liable for decisions made based on the suggested
            names, nor for indirect damages related to their use. Nothing in these terms limits your rights as a
            consumer.
          </P>
        ),
      },
      {
        title: "11. Changes to these terms",
        body: (
          <P>
            These terms may change. The applicable version is the one published on the site when you use it or make a
            purchase.
          </P>
        ),
      },
      {
        title: "12. Governing law",
        body: (
          <P>
            These terms are governed by French law, without depriving consumers of the protection of the mandatory
            rules of their country of residence. The French version of these terms prevails.
          </P>
        ),
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// POLITIQUE DE CONFIDENTIALITÉ
// ═════════════════════════════════════════════════════════════════════════════

const COOKIES = [
  { name: "nyp-lang", fr: "Langue choisie", en: "Chosen language", duration: { fr: "1 an", en: "1 year" } },
  { name: "nyp-theme", fr: "Thème de couleurs choisi", en: "Chosen color theme", duration: { fr: "1 an", en: "1 year" } },
  { name: "nyp-colors", fr: "Couleurs du thème Personnalisé", en: "Custom theme colors", duration: { fr: "1 an", en: "1 year" } },
  { name: "nyp-credits", fr: "Relie ce navigateur à vos générations achetées (sans l'adresse e-mail complète)", en: "Links this browser to your purchased generations (without your full email address)", duration: { fr: "90 jours", en: "90 days" } },
  { name: "nyp-admin, nyp-admin-pause", fr: "Accès administrateur (uniquement pour l'éditeur du site)", en: "Administrator access (site publisher only)", duration: { fr: "1 an", en: "1 year" } },
];

function CookieTable({ lang, payments }: { lang: LegalLang; payments: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-start text-sm">
        <thead>
          <tr className="border-b border-border text-ink">
            <th className="py-2 pe-4 text-start font-semibold">{lang === "fr" ? "Nom" : "Name"}</th>
            <th className="py-2 pe-4 text-start font-semibold">{lang === "fr" ? "Rôle" : "Purpose"}</th>
            <th className="py-2 text-start font-semibold">{lang === "fr" ? "Durée" : "Duration"}</th>
          </tr>
        </thead>
        <tbody>
          {COOKIES.filter((c) => payments || c.name !== "nyp-credits").map((c) => (
            <tr key={c.name} className="border-b border-border">
              <td className="py-2 pe-4 font-mono text-xs text-ink">{c.name}</td>
              <td className="py-2 pe-4">{c[lang]}</td>
              <td className="py-2">{c.duration[lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function privacyPolicy(lang: LegalLang, services: ActiveServices): LegalDoc {
  if (lang === "fr") {
    return {
      title: "Politique de confidentialité",
      sections: [
        {
          title: "En bref",
          body: (
            <P>
              Pas de compte, pas de publicité, pas de mesure d&apos;audience. Le site ne traite que ce qui est
              nécessaire à son fonctionnement, et vos favoris restent dans votre navigateur.
            </P>
          ),
        },
        {
          title: "Responsable du traitement",
          body: (
            <P>
              <Fill value={pub.name} lang={lang} />, <Fill value={pub.address} lang={lang} /> — contact :{" "}
              <Contact lang={lang} />.
            </P>
          ),
        },
        {
          title: "Données traitées et pourquoi",
          body: (
            <UL>
              <li>
                <strong className="text-ink">Adresse IP</strong> : pour appliquer la limite de générations gratuites et
                prévenir les abus (intérêt légitime). Conservée au maximum 24 heures, puis effacée. Lorsque le compteur
                est stocké chez notre prestataire de base de données (Upstash), seule une empreinte chiffrée et non
                réversible de l&apos;adresse est conservée. L&apos;hébergeur peut aussi conserver des journaux techniques
                selon sa propre politique.
              </li>
              <li>
                <strong className="text-ink">Description du projet et options choisies</strong> : transmises au service
                d&apos;IA Gemini de Google pour générer les noms (exécution du service). Le site ne les enregistre pas.
                Tant que le site utilise l&apos;offre gratuite de l&apos;API Gemini, Google peut, selon ses conditions,
                utiliser ces contenus pour améliorer ses services, y compris par une relecture humaine : n&apos;y
                indiquez donc pas d&apos;informations personnelles ou confidentielles.
              </li>
              <li>
                <strong className="text-ink">Noms analysés</strong> : lorsque vous cliquez sur « Qu&apos;évoque ce nom ? »,
                le nom (et lui seul) est envoyé à Google, qui le recherche sur le web et en résume les résultats avec son
                IA Gemini. Le résultat est conservé 24 heures pour éviter de refaire la même recherche.
              </li>
              <li>
                <strong className="text-ink">Noms de domaine vérifiés</strong> : envoyés aux registres officiels
                (Verisign pour le .com, AFNIC pour le .fr) pour vérifier leur disponibilité. Aucune donnée personnelle
                n&apos;est transmise.
              </li>
              <li>
                <strong className="text-ink">Pays approximatif</strong> : fourni par l&apos;hébergeur pour choisir la
                langue et la devise affichées. Il n&apos;est pas enregistré.
              </li>
              <li>
                <strong className="text-ink">Favoris</strong> : enregistrés uniquement dans votre navigateur
                (stockage local). Ils ne sont jamais envoyés à nos serveurs et disparaissent si vous effacez les
                données de navigation.
              </li>
              {services.payments ? (
                <>
              <li>
                <strong className="text-ink">Achats</strong> : le paiement est réalisé sur la page sécurisée de Stripe,
                qui traite votre adresse e-mail, votre pays et vos informations de paiement (exécution du contrat). Vos
                données bancaires ne transitent jamais par le site. Les pièces comptables sont conservées 10 ans
                (obligation légale).
              </li>
              <li>
                <strong className="text-ink">Générations achetées et adresse e-mail</strong> : pour vous permettre de
                retrouver vos générations sans compte, le site conserve leur nombre associé à une empreinte chiffrée et
                non réversible de votre adresse e-mail, jamais l&apos;adresse elle-même. Lorsque vous demandez à retrouver
                vos générations, votre adresse sert uniquement à vous envoyer un code à 6 chiffres, valable 15 minutes.
                Les e-mails (code, confirmation d&apos;achat) sont envoyés par notre prestataire d&apos;envoi Resend.
              </li>
                </>
              ) : (
                <li>
                  <strong className="text-ink">Achats</strong> : l&apos;achat en ligne n&apos;est pas encore ouvert. Aucune
                  adresse e-mail ni aucune donnée de paiement n&apos;est collectée pour l&apos;instant.
                </li>
              )}
            </UL>
          ),
        },
        {
          title: "Cookies",
          body: (
            <>
              <P>
                Le site n&apos;utilise que des cookies nécessaires aux fonctions que vous demandez (préférences). Ils ne
                servent ni à la publicité ni au suivi, et ne nécessitent donc pas votre consentement.
              </P>
              <CookieTable lang={lang} payments={services.payments} />
            </>
          ),
        },
        {
          title: "Destinataires et prestataires",
          body: (
            <P>
              Les données ne sont ni vendues ni louées. Elles sont traitées uniquement par les prestataires nécessaires
              au service : {providers(lang, services)}.
            </P>
          ),
        },
        {
          title: "Transferts hors de l'Union européenne",
          body: (
            <P>
              Certains prestataires, notamment Google et l&apos;hébergeur, peuvent traiter des données hors de
              l&apos;Union européenne, en particulier aux États-Unis. Ces transferts sont encadrés par les garanties
              prévues par le RGPD (décision d&apos;adéquation ou clauses contractuelles types de la Commission
              européenne).
            </P>
          ),
        },
        {
          title: "Vos droits",
          body: (
            <P>
              Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, d&apos;opposition, de
              limitation et de portabilité de vos données. Pour les exercer : <Contact lang={lang} />. Vous pouvez
              aussi adresser une réclamation à la CNIL (<Ext href="https://www.cnil.fr">www.cnil.fr</Ext>).
            </P>
          ),
        },
        {
          title: "Modifications",
          body: <P>Cette politique sera mise à jour si le site évolue. La date de mise à jour figure en haut de la page.</P>,
        },
      ],
    };
  }
  return {
    title: "Privacy policy",
    sections: [
      {
        title: "In short",
        body: (
          <P>
            No account, no ads, no audience tracking. The site only processes what it needs to work, and your
            favorites stay in your browser.
          </P>
        ),
      },
      {
        title: "Data controller",
        body: (
          <P>
            <Fill value={pub.name} lang={lang} />, <Fill value={pub.address} lang={lang} /> — contact:{" "}
            <Contact lang={lang} />.
          </P>
        ),
      },
      {
        title: "Data processed and why",
        body: (
          <UL>
            <li>
              <strong className="text-ink">IP address</strong>: to enforce the free generation limit and prevent abuse
              (legitimate interest). Kept for at most 24 hours, then deleted. When the counter is stored by our database
              provider (Upstash), only an encrypted, non-reversible fingerprint of the address is kept. The hosting
              provider may also keep technical logs under its own policy.
            </li>
            <li>
              <strong className="text-ink">Project description and chosen options</strong>: sent to Google&apos;s
              Gemini AI service to generate names (performance of the service). The site does not store them. As long
              as the site uses the free tier of the Gemini API, Google may, under its terms, use this content to
              improve its services, including through human review: do not include personal or confidential
              information.
            </li>
            <li>
              <strong className="text-ink">Analysed names</strong>: when you click &quot;What does this name
              evoke?&quot;, the name (and nothing else) is sent to Google, which searches for it on the web and
              summarises the results with its Gemini AI. The result is kept for 24 hours to avoid repeating the search.
            </li>
            <li>
              <strong className="text-ink">Checked domain names</strong>: sent to the official registries (Verisign
              for .com, AFNIC for .fr) to check availability. No personal data is sent.
            </li>
            <li>
              <strong className="text-ink">Approximate country</strong>: provided by the hosting provider to choose
              the displayed language and currency. It is not stored.
            </li>
            <li>
              <strong className="text-ink">Favorites</strong>: stored only in your browser (local storage). They are
              never sent to our servers and are deleted if you clear your browsing data.
            </li>
            {services.payments ? (
              <>
            <li>
              <strong className="text-ink">Purchases</strong>: payment takes place on Stripe&apos;s secure page, which
              processes your email address, country and payment details (performance of the contract). Your card
              details never pass through the site. Accounting records are kept for 10 years (legal obligation).
            </li>
            <li>
              <strong className="text-ink">Purchased generations and email address</strong>: so you can recover your
              generations without an account, the site stores their number linked to an encrypted, non-reversible
              fingerprint of your email address, never the address itself. When you ask to recover your generations,
              your address is used only to send you a 6-digit code, valid for 15 minutes. Emails (code, purchase
              confirmation) are sent by our email provider Resend.
            </li>
              </>
            ) : (
              <li>
                <strong className="text-ink">Purchases</strong>: online purchase is not open yet. No email address or
                payment data is collected for now.
              </li>
            )}
          </UL>
        ),
      },
      {
        title: "Cookies",
        body: (
          <>
            <P>
              The site only uses cookies required for features you request (preferences). They are not used for
              advertising or tracking, and therefore do not require your consent.
            </P>
            <CookieTable lang={lang} payments={services.payments} />
          </>
        ),
      },
      {
        title: "Recipients and providers",
        body: (
          <P>
            Data is never sold or rented. It is processed only by the providers needed for the service:{" "}
            {providers(lang, services)}.
          </P>
        ),
      },
      {
        title: "Transfers outside the European Union",
        body: (
          <P>
            Some providers, including Google and the hosting provider, may process data outside the European Union,
            in particular in the United States. These transfers are covered by the safeguards provided by the GDPR
            (adequacy decision or European Commission standard contractual clauses).
          </P>
        ),
      },
      {
        title: "Your rights",
        body: (
          <P>
            You have the right to access, rectify, erase, object to, restrict and port your data. To exercise these
            rights: <Contact lang={lang} />. You may also file a complaint with the CNIL, the French data protection
            authority (<Ext href="https://www.cnil.fr">www.cnil.fr</Ext>).
          </P>
        ),
      },
      {
        title: "Changes",
        body: <P>This policy will be updated if the site changes. The update date is shown at the top of the page.</P>,
      },
    ],
  };
}
