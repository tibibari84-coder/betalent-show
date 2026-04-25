import 'server-only';

import { env } from '@/lib/env';

import { CloudflareStreamAdapter } from './cloudflare-stream.adapter';

export function getStreamConfigState() {
  const missingWebhookVerification = env.CLOUDFLARE_STREAM_WEBHOOK_SECRET
    ? []
    : ['CLOUDFLARE_STREAM_WEBHOOK_SECRET'];

  return {
    provider: 'cloudflare-stream' as const,
    enabled: missingWebhookVerification.length === 0,
    webhookVerificationEnabled: missingWebhookVerification.length === 0,
    missing: missingWebhookVerification,
    missingWebhookVerification,
  };
}

export const streamEnabled = getStreamConfigState().enabled;

export const streamWebhookVerificationEnabled = getStreamConfigState().webhookVerificationEnabled;

export const streamAdapter = new CloudflareStreamAdapter();

export * from './types';
