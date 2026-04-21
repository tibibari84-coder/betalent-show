import 'server-only';

import { z } from 'zod';

const optionalString = () =>
  z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }
    return value;
  }, z.string().min(1).optional());

const optionalUrl = () =>
  z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }
    return value;
  }, z.string().url().optional());

const optionalEmail = () =>
  z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }
    return value;
  }, z.string().email().optional());

const envSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: optionalUrl(),
  R2_PROVIDER: z.enum(['cloudflare']).optional(),
  R2_BUCKET_NAME: optionalString(),
  R2_ACCOUNT_ID: optionalString(),
  R2_ACCESS_KEY_ID: optionalString(),
  R2_SECRET_ACCESS_KEY: optionalString(),
  CLOUDFLARE_STREAM_ACCOUNT_ID: optionalString(),
  CLOUDFLARE_STREAM_API_TOKEN: optionalString(),
  NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN: optionalString(),
  CLOUDFLARE_STREAM_WEBHOOK_SECRET: optionalString(),
  SENTRY_DSN: optionalUrl(),
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl(),
  SENTRY_ORG: optionalString(),
  SENTRY_PROJECT: optionalString(),
  SENTRY_AUTH_TOKEN: optionalString(),
  NEXT_PUBLIC_POSTHOG_KEY: optionalString(),
  NEXT_PUBLIC_POSTHOG_HOST: optionalUrl(),
  POSTHOG_API_KEY: optionalString(),
  POSTHOG_HOST: optionalUrl(),
  RESEND_API_KEY: optionalString(),
  RESEND_FROM_EMAIL: optionalEmail(),
  OPENAI_API_KEY: optionalString(),
  BETALENT_AI_MODEL: optionalString(),
});

type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

export const publicEnv = {
  APP_ENV: env.NEXT_PUBLIC_APP_ENV,
  APP_URL: env.NEXT_PUBLIC_APP_URL,
  SENTRY_DSN: env.NEXT_PUBLIC_SENTRY_DSN,
  POSTHOG_KEY: env.NEXT_PUBLIC_POSTHOG_KEY,
  POSTHOG_HOST: env.NEXT_PUBLIC_POSTHOG_HOST,
  CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN:
    env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN,
};
