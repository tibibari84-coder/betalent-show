import 'server-only';

import { env } from '@/lib/env';

import { CloudflareStreamAdapter } from './cloudflare-stream.adapter';

export function getStreamConfigState() {
  const missing: string[] = [];

  if (!env.CLOUDFLARE_STREAM_ACCOUNT_ID) {
    missing.push('CLOUDFLARE_STREAM_ACCOUNT_ID');
  }
  if (!env.CLOUDFLARE_STREAM_API_TOKEN) {
    missing.push('CLOUDFLARE_STREAM_API_TOKEN');
  }
  if (!env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN) {
    missing.push('NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN');
  }

  return {
    enabled: missing.length === 0,
    missing,
  };
}

export const streamEnabled = getStreamConfigState().enabled;

export const streamWebhookVerificationEnabled = Boolean(
  env.CLOUDFLARE_STREAM_WEBHOOK_SECRET,
);

export const streamAdapter = new CloudflareStreamAdapter();

export * from './types';
