# Selfware

Selfware is a personal operating system that turns your inner world into something you can see, shape, and improve.

It is currently being built as both a personal system and a portfolio-grade product: a working command center for quests, notes, reflections, inventory, loadouts, habits, status tracking, and adjacent experiments.

## Current Stack

- Next.js
- React
- Supabase for auth, database, and storage-backed workflows
- Tailwind CSS and project CSS layers for layout, surfaces, motion, and theme styling
- Vercel-ready Next.js deployment model

## Local Setup

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Fill in the Supabase values in `.env.local`, then run:

```bash
npm run dev
npm run build
npm run lint
```

The dev server defaults to `http://localhost:3000` unless Next chooses another port.

## Environment Variables

Use `.env.example` as the source of truth. Do not commit real secrets.

Active variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CODEX_DEBUG`
- `DEBUG_DB`
- `KEEP_HISTORY`
- `NEXT_PUBLIC_KEEP_HISTORY`

## Architecture Notes

- Most routes currently use the Pages Router under `pages/`.
- `/habits` currently uses the App Router.
- Pages Router routes use `components/Layout/PageShell.jsx` as the main global shell.
- App Router routes may keep their own router layout wrappers, but must reuse `components/Layout/ShellControls.jsx` instead of creating separate nav/auth/settings systems.
- Browser Supabase usage should go through `lib/supabaseClient.js`.
- API and server-side Supabase usage should go through `lib/supabaseServer.js`.
- Dev/debug/demo pages live under `/dev` and are guarded in production.

## Folder Guide

- `pages/`: Main Pages Router routes and API routes.
- `components/`: Shared UI, layout, form, card, interaction, and feature components.
- `lib/`: Shared helpers for Supabase, interactions, imports, colors, zones, permissions, and other app logic.
- `modules/`: Feature-level modules that sit between shared components and route pages.
- `src/`: App Router routes and App Router-specific TypeScript components/world systems.
- `public/`: Static assets, models, textures, and public JSON data.

## Development Rules

- Do not create duplicate systems.
- Prefer shared components and helpers over one-off implementations.
- Do not move `/src`, `/app`, or route folders without an explicit migration pass.
- New shared components should prefer root `/components` unless they are App Router-specific.
- Keep changes small, build after meaningful refactors, and commit separately.

## Known Warnings

Current non-blocking lint warning areas:

- `pages/waitering/index.js` previously had React Hook dependency warnings; current lint only reports one image optimization warning there.
- `src/components/CardKit/cards/BookCard.tsx` has an image optimization warning.

These are known cleanup items and should not be treated as product-blocking unless they regress behavior or deployment.

## Useful Scripts

From `package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

- `dev`: starts the Next.js development server.
- `build`: creates a production build.
- `start`: starts the production server after a build.
- `lint`: runs Next.js linting.

## Project Status

The codebase has recently gone through stabilization work:

- Unused Notion, Resend, and Paystack integrations were removed.
- Supabase helpers were consolidated.
- Layout and navigation duplication was reduced.
- Development routes were moved under `/dev`.

The next useful work is continued cleanup of legacy routes, old generated artifacts, and remaining non-blocking lint warnings.
