# BeTalent

BeTalent is a mobile-first premium web talent show: structured competition, originals-first (Season 1), show-led — not feed-first or casual posting.

This repository is a **clean rebuild** from scratch. It does not carry over legacy routes, feeds, or BeTalent product concepts from prior codebases.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Prisma** (`6.19.x`) initialized for **PostgreSQL** (no domain models yet). Pinned to v6 so `DATABASE_URL` lives in `schema.prisma` as in standard docs; upgrade to Prisma 7+ later if you adopt `prisma.config.ts`.

## Install

```bash
npm install
```

Copy environment scaffolding and adjust values when you connect services:

```bash
cp .env.example .env.local
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Prisma

Schema lives in `prisma/schema.prisma`. There are **no tables/models** yet — only datasource + generator.

```bash
npm run db:generate   # prisma generate — run after cloning or schema changes
```

When `DATABASE_URL` points at a PostgreSQL instance you can use:

```bash
npm run db:push       # prisma db push — prototyping without migrations
npm run db:migrate    # prisma migrate dev — once you start evolving schema intentionally
npm run db:studio     # prisma studio
```

## Project layout (high level)

- `src/app/(public)` — future marketing and public/auth-facing routes
- `src/app/(app)` — future logged-in member experience (placeholder at `/app`)
- `src/app/(internal)` — future show-runner / internal tools (placeholder at `/internal`)
- `src/components/shell` — minimal mobile-first shell primitives
- `src/server/db` — Prisma client singleton

## Intentionally not built yet

Authentication, onboarding, audition flows, scoring/results, uploads/video, payments (e.g. Stripe), AI features, admin tooling, database domain models, and production UI/visual design are **out of scope** for this skeleton phase.
