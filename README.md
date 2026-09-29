# NameYourProject

> 🇫🇷 [Version française](README.fr.md)

**An AI-powered name generator for any project — app, startup, brand, store, YouTube channel… — that only suggests names worth keeping: it checks real domain availability, filters out clichés, and tells you what each name already evokes on the web.**

No account, no sign-up: describe your project, pick a vibe, and get 10 original names ranked by `.com` availability.

<!-- Add a screenshot: create a "docs" folder, save a capture as docs/preview.png, then remove this comment line and the one below.
![NameYourProject preview](docs/preview.png)
-->

## Features

**Name generation**
- AI-generated names (Google Gemini) based on a project description, a category, a vibe, a length and a style
- 20 candidates per round, **ranked by real `.com` availability**; a second round is triggered automatically when too few `.com` domains are free
- Never suggests the same name twice during a visit; clichés (`-ify`, `-ly`, `Smart…`, `Pro…`) are filtered **server-side**, even if the AI ignores the instruction
- **"More like this"**: 10 variations around a name you like

**Checking a name**
- **Real-time domain availability** through the official registries (RDAP protocol, free, no third-party API)
- Extensions picked per visitor and project: `.com`, the visitor's country TLD, plus two TLDs matching the category (`.app`, `.shop`, `.studio`…) — only those that can actually be verified
- **"What does this name evoke?"**: Gemini searches Google (Search grounding) and summarises existing uses, dominant associations and sources
- One-click links to Google, Google Images and the WIPO trademark database
- **Logo preview**: the name in 4 typographic styles, as an app icon and on a business card

**Experience**
- **6 languages** (English, French, Spanish, Chinese, Hindi, Arabic with right-to-left layout), chosen automatically from the visitor's country
- **4 themes**: light, dark, mathematically exact inversion, and custom colours — with an animated background tinted by the selected vibe; contrast ratios checked against WCAG AA
- **Favourites** saved in the browser, with a comparison table, CSV export and **share-by-link** (the whole selection lives in the URL fragment: nothing is stored server-side)
- 8 SEO landing pages (`/generateur-nom-application`, `/generateur-nom-restaurant`…), sitemap, robots.txt and breadcrumb structured data

**Business & safety** — built in, disabled by default
- Free quota of 3 generations per day, with an admin mode for the site owner
- Purchase of generation packs with **Stripe Checkout** (local payment methods and currency conversion), credits linked to an e-mail address **without any account**, recovered on any device with a 6-digit code sent by e-mail
- Cloudflare Turnstile anti-bot check, legal pages (legal notice, terms, privacy policy)

## Tech stack

| Area | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| AI | [Vercel AI SDK](https://ai-sdk.dev) + Google Gemini (structured output with Zod, Google Search grounding) |
| Domains | RDAP with the IANA bootstrap registry |
| Storage *(optional)* | Upstash Redis — in-memory fallback for local development |
| Payments / e-mails / anti-bot *(optional)* | Stripe, Resend, Cloudflare Turnstile |
| Tests | Vitest (30 unit tests) |

## Technical choices

- **RDAP instead of a paid domain API**: availability comes straight from each registry (Verisign for `.com`, AFNIC for `.fr`…), with a cache, a concurrency limit and a global time budget.
- **Resilient AI**: a chain of fallback models — if a model is overloaded, rate-limited or unavailable, the next one answers, and failing models are paused for a while.
- **Privacy by design**: IP addresses and e-mails are only stored as HMAC fingerprints, favourites never leave the browser, and a shared list lives in the URL fragment (never sent to the server).
- **Nothing trusted from the browser**: prices are always read server-side, every input sent to the AI is validated (prompt-injection attempts are discarded), Stripe webhooks are signature-checked, and credits can never be granted twice.
- **No flash on load**: language, theme and colours are read from cookies server-side, so the first render is already correct.
- **Degrades gracefully**: every optional service (Redis, Stripe, Resend, Turnstile) activates only when its keys are present — the site runs fully locally with a single Gemini API key.

## Getting started

Requirements: **Node.js 20.9 or later** and a free [Gemini API key](https://aistudio.google.com).

```bash
git clone https://github.com/hugorako947/NameYourProject.git
cd NameYourProject
npm install
cp .env.example .env.local   # on Windows: copy .env.example .env.local
```

Add your key to `.env.local`:

```
GOOGLE_GENERATIVE_AI_API_KEY=your-key
```

Then:

```bash
npm run dev    # http://localhost:3000
npm test       # run the unit tests
```

Every other variable is optional and documented in [`.env.example`](.env.example).

## Project structure

```
src/
├── app/              Pages and API routes (App Router)
│   ├── api/          generate, check-domain, name-insight, quota, checkout, credits…
│   └── generateur/   SEO landing pages (/generateur-nom-*)
├── components/       UI: SearchForm, ResultCard, NameCheck, dialogs…
├── lib/
│   ├── ai/           Gemini client, prompts, schema, name insight
│   ├── domains/      RDAP checker, TLD selection, ranking
│   ├── seo/          SEO page definitions
│   └── …             i18n, themes, quota, credits, payments, e-mails
└── types/
tests/                Vitest unit tests
```

## Status

Personal project, currently run locally. The payment, e-mail and storage services are fully implemented and tested with simulated services, and switch on once their keys are configured.

## Author

Built by [@hugorako947](https://github.com/hugorako947).

© All rights reserved. The code is public for portfolio purposes; reuse requires the author's permission.
