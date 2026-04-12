# Dreamledge Creators

Dreamledge Creators is a polished prototype for a premium creator competition platform.

It blends serious ranking and creator-vs-creator competition with social discovery, creator profiles, battles, contests, leaderboards, messages, crews, and admin moderation scaffolding.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Lucide React
- Firebase Auth scaffold
- Firestore scaffold
- Firebase Storage scaffold

## Prototype Scope

This version is a prototype-first MVP:

- routing is real
- UI architecture is real
- Firebase structure is scaffolded
- Firestore models are defined
- battles include watch-to-judge logic
- non-critical areas use polished sample data first

## Key Features

- landing page with featured creators, battles, contests, and leaderboard preview
- login, signup, forgot password, and onboarding prototype flows
- creator profiles with stats, badges, and content grid
- URL-based content import flow for TikTok, YouTube, X, and Facebook links
- creator battles with 10-second watch requirement before judging
- judge panel based on:
  - originality
  - quality
  - creativity
- contests and leaderboard views
- messages, notifications, and crews
- lightweight admin pages

## Battle Rule

In battles, creators judge each other directly.

- Each creator must watch at least 10 seconds of the opponent's content.
- The judge panel stays locked until the 10-second requirement is met.
- The opponent is scored from 1-10 on:
  - Originality
  - Quality
  - Creativity
- The battle result is based on creator judging, not community voting.

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Vite runs with `--host`, so you can open the prototype on your phone if both devices are on the same Wi-Fi.

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Firebase Setup Later

When you are ready to wire Firebase live, create a `.env` file with:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firebase scaffolding lives in:

- `src/lib/firebase/config.ts`
- `src/lib/firebase/index.ts`

## Structure

```text
src/
  app/
  components/
  features/
  lib/
  pages/
  types/
```

## Notes

- Messages, crews, notifications, and admin are scaffolded with sample data first.
- The architecture is set up so these sections can become fully live later without large rewrites.
