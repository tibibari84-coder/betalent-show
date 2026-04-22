import 'server-only';

import { env } from '@/lib/env';

import { CloudflareStreamAdapter } from './cloudflare-stream.adapter';

export function getStreamConfigState() {
  const missingDirectUpload: string[] = [];

  if (!env.CLOUDFLARE_STREAM_ACCOUNT_ID) {
    missingDirectUpload.push('CLOUDFLARE_STREAM_ACCOUNT_ID');
  }
  if (!env.CLOUDFLARE_STREAM_API_TOKEN) {
    missingDirectUpload.push('CLOUDFLARE_STREAM_API_TOKEN');
  }
  if (!env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN) {
    missingDirectUpload.push('NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN');
  }

  const missingWebhookVerification = env.CLOUDFLARE_STREAM_WEBHOOK_SECRET
    ? []
    : ['CLOUDFLARE_STREAM_WEBHOOK_SECRET'];

  return {
    provider: 'cloudflare-stream' as const,
    enabled: missingDirectUpload.length === 0,
    directUploadEnabled: missingDirectUpload.length === 0,
    webhookVerificationEnabled: missingWebhookVerification.length === 0,
    missing: missingDirectUpload,
    missingDirectUpload,
    missingWebhookVerification,
  };
}

export const streamEnabled = getStreamConfigState().enabled;

export const streamWebhookVerificationEnabled = getStreamConfigState().webhookVerificationEnabled;

export const streamAdapter = new CloudflareStreamAdapter();

export * from './types';
