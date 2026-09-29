# NameYourProject

> 🇬🇧 [English version](README.md)

**Un générateur de noms par IA pour tout type de projet — application, startup, marque, boutique, chaîne YouTube… — qui ne propose que des noms qui valent le coup : il vérifie la vraie disponibilité des noms de domaine, écarte les clichés et indique ce que chaque nom évoque déjà sur le web.**

Sans compte ni inscription : décrivez votre projet, choisissez une humeur, et obtenez 10 noms originaux classés selon la disponibilité de leur `.com`.

<!-- Ajoute une capture d'écran : crée un dossier "docs", enregistre une capture sous docs/apercu.png, puis supprime cette ligne de commentaire et celle d'en dessous.
![Aperçu de NameYourProject](docs/apercu.png)
-->

## Fonctionnalités

**Génération de noms**
- Noms générés par IA (Google Gemini) à partir d'une description, d'une catégorie, d'une humeur, d'une longueur et d'un style
- 20 candidats par tour, **classés selon la vraie disponibilité du `.com`** ; un second tour se déclenche automatiquement quand trop peu de `.com` sont libres
- Jamais deux fois le même nom pendant une visite ; les clichés (`-ify`, `-ly`, `Smart…`, `Pro…`) sont écartés **côté serveur**, même si l'IA ignore la consigne
- **« Plus comme celui-ci »** : 10 variantes autour d'un nom qui plaît

**Vérifier un nom**
- **Disponibilité des domaines en temps réel** auprès des registres officiels (protocole RDAP, gratuit, sans API tierce)
- Extensions choisies selon le visiteur et le projet : `.com`, l'extension du pays du visiteur, et deux extensions adaptées à la catégorie (`.app`, `.shop`, `.studio`…), uniquement parmi celles réellement vérifiables
- **« Qu'évoque ce nom ? »** : Gemini fait une recherche Google (Search grounding) et résume les usages existants, l'univers associé et les sources
- Liens en un clic vers Google, Google Images et la base de marques de l'OMPI
- **Aperçu logo** : le nom en 4 styles typographiques, en icône d'application et sur une carte de visite

**Expérience**
- **6 langues** (français, anglais, espagnol, chinois, hindi, arabe avec affichage de droite à gauche), choisie automatiquement selon le pays du visiteur
- **4 thèmes** : clair, sombre, inversion mathématiquement exacte et couleurs personnalisées, avec un fond animé teinté par l'humeur choisie ; contrastes vérifiés selon les critères WCAG AA
- **Favoris** enregistrés dans le navigateur, avec tableau comparatif, export CSV et **partage par lien** (toute la sélection tient dans le fragment de l'adresse : rien n'est stocké sur le serveur)
- 8 pages SEO (`/generateur-nom-application`, `/generateur-nom-restaurant`…), plan du site, robots.txt et fil d'Ariane structuré pour Google

**Modèle économique et sécurité** — intégrés, désactivés par défaut
- Quota gratuit de 3 générations par jour, avec un mode administrateur pour le propriétaire du site
- Achat de packs de générations avec **Stripe Checkout** (moyens de paiement locaux, conversion de devise), crédits liés à une adresse e-mail **sans aucun compte**, retrouvés sur n'importe quel appareil grâce à un code à 6 chiffres envoyé par e-mail
- Anti-robots Cloudflare Turnstile, pages légales (mentions légales, conditions d'utilisation, politique de confidentialité)

## Technologies

| Domaine | Technologie |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript |
| Style | Tailwind CSS 4 |
| IA | [Vercel AI SDK](https://ai-sdk.dev) + Google Gemini (sortie structurée avec Zod, recherche Google intégrée) |
| Domaines | RDAP avec l'annuaire officiel de l'IANA |
| Stockage *(facultatif)* | Upstash Redis — repli en mémoire pour le développement local |
| Paiement / e-mails / anti-robots *(facultatifs)* | Stripe, Resend, Cloudflare Turnstile |
| Tests | Vitest (30 tests unitaires) |

## Choix techniques

- **RDAP plutôt qu'une API de domaines payante** : la disponibilité vient directement de chaque registre (Verisign pour le `.com`, l'AFNIC pour le `.fr`…), avec cache, limite de requêtes simultanées et délai maximal global.
- **Une IA résiliente** : une chaîne de modèles de secours. Si un modèle est surchargé, limité ou indisponible, le suivant répond, et les modèles en échec sont mis de côté quelques instants.
- **Confidentialité dès la conception** : adresses IP et e-mails ne sont stockés que sous forme d'empreintes HMAC, les favoris ne quittent jamais le navigateur, et une liste partagée tient dans le fragment de l'adresse (jamais envoyé au serveur).
- **Rien n'est cru sur parole côté navigateur** : les prix sont toujours relus par le serveur, chaque donnée transmise à l'IA est validée (les tentatives d'injection de consignes sont écartées), les notifications Stripe sont vérifiées par signature et un paiement ne peut jamais être crédité deux fois.
- **Aucun « flash » au chargement** : langue, thème et couleurs sont lus côté serveur depuis des cookies, donc le premier affichage est déjà correct.
- **Fonctionnement dégradé maîtrisé** : chaque service facultatif (Redis, Stripe, Resend, Turnstile) ne s'active que si ses clés sont présentes. Le site fonctionne entièrement en local avec une seule clé Gemini.

## Lancer le projet

Prérequis : **Node.js 20.9 ou plus récent** et une [clé API Gemini](https://aistudio.google.com) gratuite.

```bash
git clone https://github.com/hugorako947/NameYourProject.git
cd NameYourProject
npm install
cp .env.example .env.local   # sous Windows : copy .env.example .env.local
```

Ajoute ta clé dans `.env.local` :

```
GOOGLE_GENERATIVE_AI_API_KEY=ta-cle
```

Puis :

```bash
npm run dev    # http://localhost:3000
npm test       # lance les tests
```

Toutes les autres variables sont facultatives et documentées dans [`.env.example`](.env.example).

## Structure du projet

```
src/
├── app/              Pages et routes API (App Router)
│   ├── api/          generate, check-domain, name-insight, quota, checkout, credits…
│   └── generateur/   Pages SEO (/generateur-nom-*)
├── components/       Interface : SearchForm, ResultCard, NameCheck, fenêtres…
├── lib/
│   ├── ai/           Client Gemini, prompts, schéma, analyse d'un nom
│   ├── domains/      Vérification RDAP, choix des extensions, classement
│   ├── seo/          Définition des pages SEO
│   └── …             Traductions, thèmes, quota, crédits, paiement, e-mails
└── types/
tests/                Tests unitaires Vitest
```

## État du projet

Projet personnel, utilisé en local pour l'instant. Le paiement, les e-mails et le stockage sont entièrement implémentés, testés avec des services simulés, et s'activent dès que leurs clés sont configurées.

## Auteur

Réalisé par [@hugorako947](https://github.com/hugorako947).

© Tous droits réservés. Le code est public à titre de portfolio ; toute réutilisation nécessite l'accord de l'auteur.
