# Provider Production Finalization

This document is the release-safety checklist for BETALENT's external providers.

## Shipping surface now

The real shipping provider-backed surface in this repository is:

- `POST /api/assets/video-upload-init`
- `POST /api/assets/video-upload-part`
- `POST /api/assets/video-upload-complete`
- `POST /api/assets/video-upload-abort`
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

### Cloudflare R2

Signed upload URL generation requires:

- `R2_PROVIDER=cloudflare`
- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

Public avatar/profile/static/video delivery additionally requires:

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

## Cloudflare R2 verification checklist

- signed upload URL generation is server-only
- no R2 secret reaches the client
- avatar/profile/static/video delivery requires `R2_PUBLIC_BASE_URL`
- video upload initialization creates a `VideoAsset` only, not a `Submission`
- video upload part signing uses AWS SDK S3-compatible multipart upload URLs
- video upload completion calls R2 multipart completion before moving the asset to `READY`
- unfinished video uploads can be aborted without creating a submission
- profile save validates avatar URLs against BETALENT-issued upload keys before persisting
- replacing a saved avatar attempts cleanup of the previous saved object

Dashboard setup:

1. Create the R2 bucket.
2. Create scoped access credentials for that bucket.
3. Configure the public asset base URL before enabling avatar/profile/static/video uploads.
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
- Sentry source map envs belong in the build environment, not only runtime

## Real external blockers

If provider verification still fails after code-side checks, the remaining blockers should only be:

- missing or invalid Cloudflare R2 bucket credentials or public base URL
- missing Sentry DSN or source map auth env
- missing PostHog API/project keys
- missing Resend API key or unverified sender domain
