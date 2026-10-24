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
- `npm test` : tests Vitest (dossier `tests/`, ~31 tests, ~2 s)
- `npx tsc --noEmit` : vérification TypeScript. Sans dossier `.next`, il signale à tort `LayoutProps` et
  `PageProps` introuvables (types générés par Next au build) : ce n'est pas une vraie erreur.
- `npm run build` : build de production complet (TypeScript compris, tests inclus dans la vérification)

**Après chaque modification : `npx tsc --noEmit` puis `npm test`.** Pour un changement important, `npm run build`.

## Versions et pièges (ta mémoire peut être en retard sur ces versions)

- **Next.js 16** (App Router, Turbopack) : `cookies()`, `headers()`, `params` et `searchParams` sont des
  Promises (await). Types globaux `PageProps<"/route">` / `LayoutProps<"/">`. Le middleware s'appelle
  désormais `proxy.ts`. En cas de doute, lire la doc embarquée : `node_modules/next/dist/docs/`.
- **React 19**, **TypeScript 5**, **Tailwind CSS 4** : pas de `tailwind.config` ; les couleurs et polices sont
  des variables CSS déclarées dans `@theme` (`src/app/globals.css`).
- **Vercel AI SDK v7** : utiliser `instructions` (et non `system`, obsolète). Fournisseur : `@ai-sdk/google`,
  toujours importé via `src/lib/ai/provider.ts`.
- **Zod 4**, **Vitest 5**, **Stripe 22**, `@upstash/redis` (créé avec `automaticDeserialization: false`).
- Les variables `NEXT_PUBLIC_*` sont figées au moment du build : après les avoir changées, il faut rebuilder.
- Vérifier une API dans `node_modules/**/*.d.ts` plutôt que de la supposer.

## Carte du projet

- `src/app/` : pages et routes API. Routes clés : `api/generate` (génération + tri par `.com`),
  `api/check-domain`, `api/name-insight` (« Qu'évoque ce nom ? »), `api/quota`, `api/admin/*`,
  `api/checkout*`, `api/credits/*`, `api/stripe/webhook`. Pages SEO : `generateur/[type]` (adresses
  `/generateur-nom-*` via `next.config.ts`). Pages légales, `admin`, `favoris`, `achat/*`.
- `src/components/` : interface. `SearchForm.tsx` est le cœur (état, génération, favoris, onglets).
- `src/lib/ai/` : `client.ts` (chaîne de modèles de secours `runWithModelChain`, nettoyage des noms,
  filtre des clichés), `prompts.ts`, `schema.ts`, `insight.ts` (recherche Google via Gemini).
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

**Apparence**
- Couleurs uniquement via les variables du thème (`paper`, `ink`, `muted`, `border`, `danger`, `accent`,
  `on-accent`) : jamais de couleur en dur, sinon les thèmes inversé et personnalisé cassent.
- Contraste minimal 4,5:1 pour le texte (déjà vérifié par calcul pour les thèmes existants).

**Sécurité**
- Valider côté serveur tout ce qui vient du navigateur. Un nom transmis à l'IA doit respecter
  `/^[A-Za-z0-9]{2,40}$/` (aucun texte libre non contrôlé dans les prompts).
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

**Robustesse**
- Chaque service optionnel (Upstash, Stripe, Resend, Turnstile) ne s'active que si ses clés sont présentes ;
  sans elles, le site doit fonctionner normalement. Ne jamais en rendre un obligatoire.
- Tout appel à l'IA passe par `runWithModelChain` (modèles de secours en cas de surcharge ou de quota).
- Une nouvelle variable d'environnement se documente dans `.env.example`.

**Code**
- Commentaires en français, qui expliquent le « pourquoi ». Garder les en-têtes de fichiers à jour.
- Toute modification de logique s'accompagne d'un test dans `tests/` (ou de la mise à jour d'un test).
- Ne pas ajouter de dépendance npm sans l'accord d'Hugo.

## Façon de travailler avec Hugo

1. Avant une modification importante, présente ton plan en quelques phrases et attends son accord.
2. Travaille par petites étapes ; lance `npx tsc --noEmit` et `npm test` avant de dire que c'est terminé.
3. Termine par un résumé en français : ce qui a changé, ce qu'il doit vérifier lui-même dans le navigateur.
4. Rappelle-lui d'enregistrer son travail : `git add .`, `git commit -m "…"`, `git push`
   (le push redéploie le site sur Vercel). Ne fais jamais de `git push` à sa place sans le lui demander.
5. Ne touche jamais à `.env.local` sans qu'il le demande, et ne lui demande jamais d'y coller une clé
   dans la conversation.
