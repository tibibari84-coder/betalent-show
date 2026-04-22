# Provider Production Finalization

This document is the release-safety checklist for BETALENT's external providers.

## Shipping surface now

The real shipping provider-backed surface in this repository is:

- `POST /api/assets/stream-init`
- `POST /api/webhooks/cloudflare-stream`
- `POST /api/assets/r2-upload-url`
- `PUT /api/profile`
- `PUT /api/user/profile`
- `PUT /api/creator/profile`
- onboarding welcome email
- submission lifecycle email notifications
- provider telemetry through Sentry and PostHog

Provider-backed capabilities outside those paths may exist deeper in the platform, but they are not treated as the current public creator-core release surface.

## Environment matrix

### Required for every deployed environment

- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`

### Cloudflare Stream

Direct upload initialization requires:

- `CLOUDFLARE_STREAM_ACCOUNT_ID`
- `CLOUDFLARE_STREAM_API_TOKEN`
- `NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`

Verified READY / FAILED webhook processing additionally requires:

- `CLOUDFLARE_STREAM_WEBHOOK_SECRET`

### Cloudflare R2

Signed upload URL generation requires:

- `R2_PROVIDER=cloudflare`
- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

Public avatar/profile/static delivery additionally requires:

- `R2_PUBLIC_BASE_URL`

### Sentry

Runtime error capture requires:

- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`

Source map upload on CI / Vercel requires:

- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`

### PostHog

Server-side funnel events require:

- `POSTHOG_API_KEY`
- `POSTHOG_HOST`

Client-side browser analytics require:

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

### Resend

Real email sending requires:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Cloudflare Stream verification checklist

- `POST /api/assets/stream-init` returns `503` with explicit missing keys when direct-upload config is incomplete.
- upload initialization creates a `VideoAsset` only, not a `Submission`.
- submission attachment still requires a separate owned `READY` asset.
- webhook verification rejects missing or invalid signatures.
- READY and FAILED transitions are only finalized after verified webhook input.
- non-terminal webhook states move the asset into `PROCESSING` and are logged explicitly.

Dashboard setup:

1. Enable Stream on the Cloudflare account.
2. Create an API token scoped for Stream direct upload.
3. Configure the customer subdomain used for playback URLs.
4. Configure the webhook destination to:
   - `https://<your-domain>/api/webhooks/cloudflare-stream`
5. Use the same secret in Cloudflare and `CLOUDFLARE_STREAM_WEBHOOK_SECRET`.

## Cloudflare R2 verification checklist

- signed upload URL generation is server-only
- no R2 secret reaches the client
- avatar/profile/static delivery requires `R2_PUBLIC_BASE_URL`
- profile save validates avatar URLs against BETALENT-issued upload keys before persisting
- replacing a saved avatar attempts cleanup of the previous saved object

Dashboard setup:

1. Create the R2 bucket.
2. Create scoped access credentials for that bucket.
3. Configure the public asset base URL before enabling avatar/profile/static uploads.
4. Verify the public base URL resolves from the deployed app origin.

## Sentry verification checklist

- runtime capture is env-gated
- provider routes and critical mutations call `captureException` and `captureMessage`
- success-path spam was intentionally avoided in provider wrappers
- onboarding and submission email flows report useful completion outcomes

## PostHog verification checklist

The active server-side contract in this phase is:

- `creator_profile_completed`
- `creator_profile_avatar_upload_requested`
- `upload_started`
- `upload_completed`
- `upload_failed`
- `submission_started`
- `submission_submitted`
- `admin_submission_reviewed`

Notes:

- event properties are sanitized before capture
- server analytics disable cleanly when `POSTHOG_API_KEY` is missing
- unused/noisy contract entries were removed from the source event map

## Resend verification checklist

- the email wrapper returns explicit `sent` / `skipped` / `failed` outcomes
- no fake success state is returned when Resend is missing
- welcome and submission lifecycle emails remain real callable flows
- provider failure is explicit and observable

## Vercel / release flow

Recommended release order:

1. `npm install`
2. `npx prisma generate`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`
6. `npm run build`
7. `npx prisma migrate deploy`
8. deploy on Vercel with the final production env set

Vercel expectations:

- `NEXT_PUBLIC_APP_URL` must match the final production domain
- production env groups must be complete per provider, not partially filled
- Stream webhook must point to the deployed production domain
- Sentry source map envs belong in the build environment, not only runtime

## Real external blockers

If provider verification still fails after code-side checks, the remaining blockers should only be:

- missing or invalid Cloudflare Stream account/token/subdomain/webhook secret
- missing or invalid Cloudflare R2 bucket credentials or public base URL
- missing Sentry DSN or source map auth env
- missing PostHog API/project keys
- missing Resend API key or unverified sender domain
