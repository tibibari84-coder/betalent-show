# BeTalent

BeTalent is a mobile-first premium web talent show: structured competition, originals-first (Season 1), show-led — not feed-first or casual posting.

This repository is a **clean rebuild** from scratch. It does not carry over legacy routes, feeds, or BeTalent product concepts from prior codebases.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Prisma** (`6.19.x`) + **PostgreSQL** for minimal auth persistence (User + Session). Pinned to v6 so `DATABASE_URL` lives in `schema.prisma` as in standard docs; upgrade to Prisma 7+ later if you adopt `prisma.config.ts`.
- **bcryptjs** for password hashing (server-side only)

## Install

```bash
npm install
```

Copy environment scaffolding and adjust values when you connect services:

```bash
cp .env.example .env.local
```

Set a working `DATABASE_URL` before exercising auth (register/login).

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication (email + password)

- **Register** at `/register` — creates a user, starts a **DB-backed session**, sets an **HTTP-only** cookie (`bt_session`), then redirects to `/app` (or a safe `?redirect=` path).
- **Login** at `/login` — same session + cookie behavior; wrong credentials return a **generic** error (no user enumeration message).
- **Logout** — server action clears the session row and cookie (used from `/app` and `/internal` placeholders).
- **Protected routes** — `/app` and `/internal` require a valid session via group layouts (guests go to `/login?redirect=…`).

No OAuth, password reset, onboarding, or admin roles in this phase.

## Prisma

Schema: `prisma/schema.prisma` (auth models only for now).

```bash
npm run db:generate   # prisma generate — run after cloning or schema changes
```

When `DATABASE_URL` points at a PostgreSQL instance:

```bash
npm run db:push       # prisma db push — sync schema (dev / prototyping)
npm run db:migrate    # prisma migrate dev — once you want versioned migrations
npm run db:studio     # prisma studio
```

## Project layout (high level)

- `src/app/(public)` — public shell; `/login`, `/register`, home
- `src/app/(app)` — member area (protected); placeholder at `/app`
- `src/app/(internal)` — internal / show-runner shell (session-gated, not admin-auth); placeholder at `/internal`
- `src/components/shell` — mobile-first layout primitives
- `src/components/auth` — minimal auth UI
- `src/server/auth` — sessions, actions, guards
- `src/server/db` — Prisma client singleton

## Intentionally not built yet

Onboarding, audition flows, scoring/results, uploads/video, payments (e.g. Stripe), AI features, full admin/show-runner tooling, profile editing beyond auth, OAuth/social login, password reset, and production marketing UI are **out of scope** for the current phase.
