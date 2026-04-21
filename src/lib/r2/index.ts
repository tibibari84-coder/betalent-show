import 'server-only';

import { env } from '@/lib/env';
import { CloudflareR2Adapter } from './cloudflare-r2.adapter';
import { R2SignedUploadUrlOptions, R2SignedUploadUrlResult } from './types';

const isConfigured = Boolean(
  env.R2_PROVIDER === 'cloudflare' &&
    env.R2_BUCKET_NAME &&
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY
);

const adapter = isConfigured ? new CloudflareR2Adapter() : null;

export const r2Enabled = isConfigured;

export async function createR2UploadUrl(options: R2SignedUploadUrlOptions): Promise<R2SignedUploadUrlResult> {
  if (!adapter) {
    throw new Error('Cloudflare R2 storage is not configured.');
  }

  return adapter.getSignedUploadUrl(options);
}
