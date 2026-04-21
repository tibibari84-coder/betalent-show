import 'server-only';

import { env } from '@/lib/env';

import { CloudflareStreamAdapter } from './cloudflare-stream.adapter';

export const streamEnabled = Boolean(
  env.CLOUDFLARE_STREAM_ACCOUNT_ID &&
    env.CLOUDFLARE_STREAM_API_TOKEN &&
    env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN,
);

export const streamWebhookVerificationEnabled = Boolean(
  env.CLOUDFLARE_STREAM_WEBHOOK_SECRET,
);

export const streamAdapter = new CloudflareStreamAdapter();

export * from './types';
