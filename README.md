# BETALENT

BETALENT is a mobile-first premium web talent show: structured competition, originals-first (Season 1), show-led — not feed-first or casual posting.

This repository is a **clean rebuild** from scratch. It does not carry over legacy routes, feeds, or product concepts from prior codebases.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Prisma** (`6.19.x`) + **PostgreSQL** (User, Session, minimal onboarding fields on User). Pinned to v6 so `DATABASE_URL` lives in `schema.prisma` as in standard docs; upgrade to Prisma 7+ later if you adopt `prisma.config.ts`.
- **bcryptjs** for password hashing (server-side only)

## Install

```bash
npm install
```

```bash
cp .env.example .env.local
```

Set a working `DATABASE_URL` before running auth and onboarding.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication (email + password)

- **Register** at `/register` — creates a user, session, and **HTTP-only** cookie (`bt_session`). If onboarding is not complete, the post-auth destination is **`/welcome`**, not `/app` (see below). A safe `?redirect=` is honored only after onboarding is complete.
- **Login** at `/login` — same rules. Generic error on bad credentials.
- **Logout** — server action used from `/app` and `/internal`.
- **Guests** — cannot access `/welcome`, `/app`, or `/internal` (redirected to login with a return path).

## Onboarding (post-login)

- **Route:** `/welcome` (authenticated only; guests are sent to login).
- **Fields:** display name, unique username, city, country, optional “interested in auditioning” boolean (storage only — not a submission or contestant system).
- **Completion:** `onboardingCompletedAt` is set; user is redirected to `/app`.
- **Gates:** Users without a completed onboarding **cannot** open `/app` or `/internal` (they are redirected to `/welcome`). Users who already completed onboarding are redirected **away** from `/welcome` to `/app`.
- **Post-auth destination** is centralized in `resolvePostAuthRedirect()` (`src/lib/auth/redirect.ts`).

## Prisma

Schema: `prisma/schema.prisma`.

```bash
npm run db:generate
```

When `DATABASE_URL` points at PostgreSQL:

```bash
npm run db:push       # dev sync
npm run db:migrate    # versioned migrations when you choose
npm run db:studio
```

## Project layout (high level)

- `src/app/(public)` — `/`, `/login`, `/register`
- `src/app/(app)` — `/welcome` (onboarding), `/app` (member placeholder after onboarding)
- `src/app/(internal)` — `/internal` (session + onboarding-complete gate)
- `src/components/shell`, `src/components/auth`, `src/components/onboarding`
- `src/server/auth`, `src/server/onboarding`, `src/server/db`

## Intentionally not built yet

Audition flows, scoring/results, uploads/video, payments (e.g. Stripe), AI features, full admin/show-runner RBAC, profile/settings beyond onboarding, OAuth/social login, password reset, and full product UI beyond placeholders.
