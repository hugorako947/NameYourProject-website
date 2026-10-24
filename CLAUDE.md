@AGENTS.md

# NameYourProject — mémoire du projet pour Claude Code

## Contexte

Générateur de noms de projets par IA (Next.js + Gemini), avec vérification réelle des noms de domaine.
Propriétaire : Hugo. **Réponds-lui en français, de façon claire et pédagogique : explique ce que tu fais
et pourquoi.** Le code (commentaires compris) est en français.

État actuel : en ligne sur Vercel (offre Hobby), déploiement automatique à chaque `git push` sur `main`.
Une base Redis a été ajoutée via Vercel pour le compteur partagé (vérifier dans les logs Vercel la ligne
« [quota] Compteur : Upstash Redis »). Paiement Stripe, e-mails Resend et anti-robots Turnstile sont codés
mais NON configurés : ils restent fermés et doivent continuer à fonctionner ainsi.

## Commandes

- `npm run dev` : site en local sur http://localhost:3000
- `npm test` : tests Vitest (dossier `tests/`, ~43 tests, ~2 s)
- `npx tsc --noEmit` : vérification TypeScript. Sans dossier `.next`, il signale à tort `LayoutProps` et
  `PageProps` introuvables (types générés par Next au build) : ce n'est pas une vraie erreur. Après l'ajout
  d'une page ou d'une route, lancer `npx next typegen` pour régénérer ces types (`PageProps<"/nouvelle">`).
- Tester la PWA (service worker, bouton « Installer ») : `npm run build` puis `npx next start`. Le service
  worker n'est enregistré qu'en production, jamais avec `npm run dev`.
- `npm run build` : build de production complet (TypeScript compris, tests inclus dans la vérification)

**Après chaque modification : `npx tsc --noEmit` puis `npm test`.** Pour un changement important, `npm run build`.

## Versions et pièges (ta mémoire peut être en retard sur ces versions)

- **Next.js 16** (App Router, Turbopack) : `cookies()`, `headers()`, `params` et `searchParams` sont des
  Promises (await). Types globaux `PageProps<"/route">` / `LayoutProps<"/">`. Le middleware s'appelle
  désormais `proxy.ts`. En cas de doute, lire la doc embarquée : `node_modules/next/dist/docs/`.
- **React 19**, **TypeScript 5**, **Tailwind CSS 4** : pas de `tailwind.config` ; les couleurs et polices sont
  des variables CSS déclarées dans `@theme` (`src/app/globals.css`).
- **Vercel AI SDK v7** : utiliser `instructions` (et non `system`, obsolète). Fournisseur : `@ai-sdk/google`,
  toujours importé via `src/lib/ai/provider.ts`. Délai maximal : option `timeout` pour `generateText`, mais
  `generateObject` ne l'a pas → `abortSignal: AbortSignal.timeout(ms)` (erreur `TimeoutError`).
- **Gemini, offre gratuite** : l'outil « Grounding with Google Search » (`google.tools.googleSearch`) n'y est
  PAS inclus (erreur 429 sur tous les modèles). Les modèles très demandés peuvent aussi rester muets sans
  erreur : d'où le délai par modèle dans `runWithModelChain` (15 s, 25 s pour le dernier).
- **lucide-react v1** : plus d'icônes de marques (pas de `Github`…) ; vérifier un nom d'icône dans
  `node_modules/lucide-react/dist/lucide-react.d.ts`.
- **Zod 4**, **Vitest 5**, **Stripe 22**, `@upstash/redis` (créé avec `automaticDeserialization: false`).
- Les variables `NEXT_PUBLIC_*` sont figées au moment du build : après les avoir changées, il faut rebuilder.
- Vérifier une API dans `node_modules/**/*.d.ts` plutôt que de la supposer.

## Carte du projet

- `src/app/` : pages et routes API. Routes clés : `api/generate` (génération + tri par `.com`),
  `api/check-domain`, `api/name-insight` (« Qu'évoque ce nom ? »), `api/competitors` (recherche de
  concurrence), `api/quota`, `api/admin/*`, `api/checkout*`, `api/credits/*`, `api/stripe/webhook`.
  Pages SEO : `generateur/[type]` (adresses `/generateur-nom-*` via `next.config.ts`). Pages légales,
  `admin`, `favoris`, `achat/*`, `concurrence` (« ce projet existe-t-il déjà ? », `?q=` pré-remplit),
  `installer` (PWA + QR code), `hors-ligne` (page affichée sans connexion). `loading.tsx` : cercle de
  chargement pendant tout changement de page.
- PWA : `app/manifest.ts`, icônes PNG `app/app-icon/[variant]` + `app/apple-icon.tsx` (dessinées par
  `lib/app-icon.tsx`), service worker `public/sw.js` (ne met JAMAIS `/api/` en cache ; changer
  `CACHE_VERSION` pour vider les anciens caches), `lib/pwa-client.ts` (enregistrement + invitation à
  installer captée globalement par `components/PwaSetup.tsx`).
- `src/components/` : interface. `SearchForm.tsx` est le cœur (état, génération, favoris, onglets).
  `NameCheck.tsx` : liens sous chaque nom (Google, Images, Marques/WIPO, Concurrence) + analyse.
  `CompetitorSearch.tsx`, `InstallGuide.tsx`, `QrCode.tsx` (bibliothèque `uqr`), `BackLink.tsx`.
  `ui/Spinner.tsx` : `Spinner`, `PendingLink`, `usePendingAction` ; `ui/SubmitButton.tsx` (formulaires HTML).
- `src/lib/ai/` : `client.ts` (chaîne de modèles de secours `runWithModelChain`, délai par modèle,
  nettoyage des noms, filtre des clichés), `prompts.ts` (+ `cleanCustomCategory`), `schema.ts`,
  `insight.ts` (par défaut : sources publiques + résumé Gemini ; recherche Google seulement si
  `GEMINI_SEARCH_GROUNDING=true`, avec repli automatique sur les sources gratuites).
- `src/lib/web-search.ts` : recherche serveur sur des sources publiques gratuites sans clé (Wikipédia,
  GitHub, App Store, Steam, Hacker News), en parallèle, délai 6 s, cache 24 h. Utilisée par la page
  Concurrence et par « Qu'évoque ce nom ? ». `src/lib/web-links.ts` : liens externes (Google sans
  guillemets, recherche WIPO pré-remplie via `asStructure`, « Tout voir », « Chercher aussi sur »).
- `src/lib/domains/` : `checker.ts` (RDAP + annuaire IANA, cache), `tlds.ts` (choix des extensions),
  `select.ts` (classement), `client-check.ts` (vérifications depuis le navigateur, 6 en parallèle max).
- `src/lib/i18n.ts` : **tous** les textes affichés, en 6 langues. `src/lib/theme.ts` : thèmes.
- `src/lib/ratelimit.ts` (quota par IP, Upstash sinon mémoire), `kv.ts`, `redis.ts`, `credits*.ts`,
  `login-codes.ts`, `email.ts`, `stripe.ts`, `turnstile.ts`, `admin.ts`, `pricing.ts`.
- `src/lib/legal.ts` (coordonnées) et `legal-content.tsx` (textes légaux FR + EN).
- `src/lib/seo/pages.ts` : définition des pages SEO (une entrée = une page).
- `src/proxy.ts` + `src/lib/site-closed.ts` : interrupteur `SITE_CLOSED` (si présents dans le projet).

## Règles à respecter

**Textes et langues**
- Aucun texte visible écrit en dur dans un composant : tout passe par `src/lib/i18n.ts`, dans les 6 langues
  (fr, en, es, zh, hi, ar). Un test vérifie que toutes les langues ont exactement les mêmes clés.
- L'arabe s'affiche de droite à gauche : utiliser les classes logiques (`ms-`, `me-`, `ps-`, `pe-`,
  `text-start`, `text-end`), jamais `left`/`right`. Pas de parenthèses autour d'un nombre (affichage inversé).
- Les recherches Google ouvertes depuis le site contiennent le nom tel quel, **sans guillemets**.

**Apparence**
- Couleurs uniquement via les variables du thème (`paper`, `ink`, `muted`, `border`, `danger`, `accent`,
  `on-accent`) : jamais de couleur en dur, sinon les thèmes inversé et personnalisé cassent.
- Contraste minimal 4,5:1 pour le texte (déjà vérifié par calcul pour les thèmes existants).
- Exceptions assumées aux couleurs en dur : icônes de l'application (`lib/app-icon.tsx`, couleurs du logo) et
  `manifest.ts` (couleurs du thème clair). Le QR code utilise `ink`/`paper` en les inversant si le fond est
  sombre (un lecteur de QR attend du foncé sur clair).
- **Retour visuel immédiat** : toute action qui peut prendre du temps affiche un cercle tournant SUR
  l'élément cliqué jusqu'à la fin de l'action. Liens internes → `PendingLink` (ou `BackLink`), jamais
  `next/link` nu ; actions asynchrones → `usePendingAction` ou un état `loading` + `<Spinner />` ;
  formulaires HTML classiques → `SubmitButton`. Les liens externes (nouvel onglet) n'en ont pas besoin.

**Sécurité**
- Valider côté serveur tout ce qui vient du navigateur. Un nom transmis à l'IA doit respecter
  `/^[A-Za-z0-9]{2,40}$/` (aucun texte libre non contrôlé dans les prompts). La précision de catégorie
  « Autre » (200 caractères max, `MAX_CUSTOM_CATEGORY_LENGTH`) passe par `cleanCustomCategory`.
- La recherche de concurrence (texte libre, 100 caractères max, `cleanSearchQuery`) n'est JAMAIS envoyée
  à l'IA. Les résultats du web transmis à Gemini (« Qu'évoque ce nom ? ») sont placés dans un bloc de
  données délimité, avec consigne de n'exécuter aucune instruction qui s'y trouverait. Liens venant des
  sources : http(s) uniquement (`safeUrl`).
- Ne jamais faire confiance au navigateur pour un prix, un quota ou un droit : tout est recalculé côté serveur.
- Ordre dans `api/generate` : validation → quota → anti-robots → IA ; en cas d'échec de l'IA, rendre la
  génération consommée. L'admin (`getAdminState`) n'a pas de limite.
- Secrets uniquement dans les variables d'environnement. Ne jamais les afficher, les journaliser ni les
  écrire dans le code. Ne jamais journaliser d'e-mail ni d'adresse IP.

**Données personnelles (RGPD)**
- `src/lib/legal-content.tsx` décrit exactement ce que fait le site. **Tout nouveau traitement de données
  ou nouveau prestataire doit y être ajouté (FR et EN).** Les services optionnels sont décrits selon
  `src/lib/active-services.ts`.
- IP conservées 24 h maximum ; e-mails jamais stockés en clair (empreinte HMAC) ; favoris uniquement dans
  le navigateur. `CREDITS_SECRET` ne doit jamais changer une fois utilisé.
- Les sources publiques (Wikipédia, GitHub, Apple, Steam, Hacker News) sont interrogées depuis le SERVEUR :
  l'IP du visiteur ne leur est jamais transmise. Recherches gardées 24 h sous une empreinte (sha256).
  `ActiveServices.googleSearch` adapte le texte légal selon `GEMINI_SEARCH_GROUNDING`.

**Robustesse**
- Chaque service optionnel (Upstash, Stripe, Resend, Turnstile) ne s'active que si ses clés sont présentes ;
  sans elles, le site doit fonctionner normalement. Ne jamais en rendre un obligatoire.
- Tout appel à l'IA passe par `runWithModelChain` (modèles de secours en cas de surcharge, de quota ou de
  délai dépassé) et transmet le `timeout` reçu à l'appel IA.
- Quotas gratuits par IP et par jour (`lib/pricing.ts`) : générations, analyses (`INSIGHTS_BUCKET`),
  recherches de concurrence (`SEARCHES_BUCKET`, 20/jour). Un résultat en cache ne consomme rien ; un échec
  total est rendu (`refundRateLimit`).
- Une nouvelle variable d'environnement se documente dans `.env.example`.

**Code**
- Commentaires en français, qui expliquent le « pourquoi ». Garder les en-têtes de fichiers à jour.
- Toute modification de logique s'accompagne d'un test dans `tests/` (ou de la mise à jour d'un test).
- Ne pas ajouter de dépendance npm sans l'accord d'Hugo. Dépendances validées : `uqr` (QR code, 24/10/2026).

## Façon de travailler avec Hugo

1. Avant une modification importante, présente ton plan en quelques phrases et attends son accord.
2. Travaille par petites étapes ; lance `npx tsc --noEmit` et `npm test` avant de dire que c'est terminé.
3. Termine par un résumé en français : ce qui a changé, ce qu'il doit vérifier lui-même dans le navigateur.
4. Rappelle-lui d'enregistrer son travail : `git add .`, `git commit -m "…"`, `git push`
   (le push redéploie le site sur Vercel). Ne fais jamais de `git push` à sa place sans le lui demander.
5. Ne touche jamais à `.env.local` sans qu'il le demande, et ne lui demande jamais d'y coller une clé
   dans la conversation. Pour un test réel, il peut être chargé via `node --env-file=.env.local`, sans
   jamais afficher les valeurs.
6. Mets à jour ce fichier dès qu'une nouvelle règle ou décision apparaît (demande d'Hugo).

## Points à surveiller

- Recherche WIPO pré-remplie (`wipoBrandSearchUrl`) : format des liens de branddb.wipo.int, non documenté
  officiellement. Si l'OMPI change son site, le nom reste copié dans le presse-papiers en secours.
- GitHub limite les recherches sans jeton à 10/minute pour tout le serveur : `GITHUB_TOKEN` facultatif.
