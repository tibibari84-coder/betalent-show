# BETALENT

BETALENT is a premium, show-first talent platform built around seasons, stages, episodes, creator profiles, submissions, and official results. The foundation in this repository is intentionally not a feed app and intentionally does not fake unfinished workflows.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL
- Cloudflare R2 signed uploads
- Sentry
- PostHog
- Resend

## Current Foundation

Implemented:

- marketing landing page
- public-only app and admin placeholder shells
- admin read-only operational console
- Prisma schema, migration, and seed flow
- public-safe provider routes
- Cloudflare R2 signed upload URL API
- Cloudflare Stream direct upload architecture
- provider wrappers for R2, Resend, Sentry, and PostHog

Intentionally not presented as finished product UI:

- formal Cloudflare Stream ingestion workflow
- moderation action UI for admin
- stage detail pages and episode detail pages
- public archive browsing beyond persisted archive state

## Project Structure

```text
.
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── sentry.client.config.ts
├── sentry.server.config.ts
├── src/
│   ├── app/
│   │   ├── (auth)/sign-in
│   │   ├── (auth)/sign-up
│   │   ├── (marketing)/
│   │   ├── (protected)/app/
│   │   ├── admin/
│   │   └── api/
│   ├── components/
│   ├── lib/
│   │   ├── analytics/
│   │   ├── email/
│   │   ├── env/
│   │   ├── prisma.ts
│   │   ├── r2/
│   │   ├── stream/
│   │   └── services/
│   └── server/
│       ├── ai/
│       ├── auditions/
│       ├── db/
│       ├── editorial/
│       ├── performances/
│       ├── results/
│       ├── setup/
│       └── show/
└── package.json
```

## Environment Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the required values for:
   - `DATABASE_URL`
3. Add optional provider values only when you enable those services.

Notes:

- `NEXT_PUBLIC_APP_URL` should match your local or deployed base URL.
- R2, Sentry, PostHog, Resend, and OpenAI are optional at boot. Missing values disable their wrappers instead of returning fake success.
- missing provider env must produce explicit disabled/skipped behavior
- provider wrappers must never report success without a real upstream response

Provider release checklist:

- [docs/provider-production-finalization.md](docs/provider-production-finalization.md)

## Neon Setup

1. Create a Neon project and database.
2. Copy the pooled or direct connection string into `DATABASE_URL`.
3. Keep `sslmode=require` in the URL.
4. Run:

```bash
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

## Prisma Commands

```bash
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:seed
npm run db:studio
```

Recommended local flow:

1. `npm install`
2. `npm run db:generate`
3. `npm run db:migrate`
4. `npm run db:seed`

## Cloudflare Stream Setup

1. Create a Cloudflare Stream-enabled account.
2. Create an API token with Stream permissions.
3. Fill:
   - `CLOUDFLARE_STREAM_ACCOUNT_ID`
   - `CLOUDFLARE_STREAM_API_TOKEN`
   - `NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`
   - `CLOUDFLARE_STREAM_WEBHOOK_SECRET`

Production notes:

- `POST /api/assets/stream-init` is disabled unless all direct-upload env values are present.
- upload initialization creates a `VideoAsset`, but submission attachment still requires a separate READY asset flow.
- READY and FAILED states are only finalized by the verified webhook handler.
- Cloudflare must be configured to send the webhook to `/api/webhooks/cloudflare-stream`.

## Cloudflare R2 Setup

1. Create an R2 bucket.
2. Create an R2 API token/key pair with write access to that bucket.
3. Fill:
   - `R2_PROVIDER=cloudflare`
   - `R2_ACCOUNT_ID`
   - `R2_BUCKET_NAME`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_PUBLIC_BASE_URL`

Current usage:

- `POST /api/assets/r2-upload-url` is authenticated and returns a signed PUT URL.
- avatar/profile/static uploads also require `R2_PUBLIC_BASE_URL`, otherwise the route stays explicitly disabled for those asset types.
- never expose `R2_ACCESS_KEY_ID` or `R2_SECRET_ACCESS_KEY` to the client.

## Sentry Setup

1. Create a Sentry project for the Next.js app.
2. Fill:
   - `SENTRY_DSN`
   - `NEXT_PUBLIC_SENTRY_DSN`
3. For source map upload on CI or Vercel, also fill:
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `SENTRY_AUTH_TOKEN`

Current coverage:

- provider route failures
- upload lifecycle failures
- profile and creator mutation routes
- admin review/status mutations
- onboarding and submission email outcome reporting

## PostHog Setup

1. Create a PostHog project.
2. Fill:
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`
   - `POSTHOG_API_KEY`
   - `POSTHOG_HOST`

Current status:

- the active server wrapper is wired
- disabled when keys are absent
- event payloads are sanitized before capture
- current funnel coverage includes profile completion, avatar upload intent, upload lifecycle, creator submission start/submit, and admin submission review

## Resend Setup

1. Create a Resend account.
2. Verify a sending domain.
3. Fill:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`

Current status:

- the email wrapper is wired to onboarding welcome and submission lifecycle notifications
- sends are skipped explicitly when the provider is not configured
- failed sends remain explicit and observable instead of being reported as success
- release safety details live in `docs/provider-production-finalization.md`

## Local Development

```bash
npm install
cp .env.example .env.local
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Useful routes:

- `/`
- `/app`
- `/app/profile`
- `/app/submissions`
- `/app/uploads`
- `/admin`

## Vercel Deployment

1. Create a Vercel project from this repo.
2. Add all required environment variables.
3. Add optional provider keys only for enabled integrations.
4. Ensure the production domain is reflected in:
   - `NEXT_PUBLIC_APP_URL`
5. Run Prisma migrations against production before or during deployment.

Recommended production setup:

- build command: `next build`
- install command: `npm install`
- Prisma migration command in deploy flow: `npx prisma migrate deploy`
- set `NEXT_PUBLIC_APP_URL` to the final production domain
- enable only the provider env groups you actually intend to run in production
- verify the Stream webhook secret in Cloudflare matches `CLOUDFLARE_STREAM_WEBHOOK_SECRET`
- verify `R2_PUBLIC_BASE_URL` resolves publicly before enabling avatar uploads

## Verification Commands

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run lint
npm run typecheck
npm test
npm run build
```

## Known Next Steps

- add real Cloudflare Stream ingestion and playback abstraction
- connect submission creation to uploaded media assets
- add audited admin mutation workflows through server actions
- add public stage and episode detail routes
- expand observability events and error capture coverage
- remove or archive legacy exploratory modules after product scope settles
