import 'server-only';

import { env } from '@/lib/env';

import { CloudflareR2Adapter } from './cloudflare-r2.adapter';
import {
  R2AssetPurpose,
  R2SignedUploadUrlOptions,
  R2SignedUploadUrlResult,
} from './types';

const storageConfigured = Boolean(
  env.R2_PROVIDER === 'cloudflare' &&
    env.R2_BUCKET_NAME &&
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY,
);

const publicDeliveryConfigured = Boolean(env.R2_PUBLIC_BASE_URL);
const publicAssetPurposes = new Set<R2AssetPurpose>(['avatar', 'profile', 'static']);

const adapter = storageConfigured ? new CloudflareR2Adapter() : null;

export const r2Enabled = storageConfigured;
export const r2PublicDeliveryEnabled = publicDeliveryConfigured;

export function getR2ConfigState(purpose?: R2AssetPurpose) {
  const missing: string[] = [];

  if (env.R2_PROVIDER !== 'cloudflare') {
    missing.push('R2_PROVIDER');
  }
  if (!env.R2_BUCKET_NAME) {
    missing.push('R2_BUCKET_NAME');
  }
  if (!env.R2_ACCOUNT_ID) {
    missing.push('R2_ACCOUNT_ID');
  }
  if (!env.R2_ACCESS_KEY_ID) {
    missing.push('R2_ACCESS_KEY_ID');
  }
  if (!env.R2_SECRET_ACCESS_KEY) {
    missing.push('R2_SECRET_ACCESS_KEY');
  }
  if (purpose && publicAssetPurposes.has(purpose) && !env.R2_PUBLIC_BASE_URL) {
    missing.push('R2_PUBLIC_BASE_URL');
  }

  return {
    enabled: missing.length === 0,
    storageConfigured,
    publicDeliveryConfigured,
    missing,
  };
}

export async function createR2UploadUrl(
  options: R2SignedUploadUrlOptions,
): Promise<R2SignedUploadUrlResult> {
  const config = getR2ConfigState(options.purpose);

  if (!config.enabled) {
    const needsPublicDelivery =
      publicAssetPurposes.has(options.purpose) && !config.publicDeliveryConfigured;

    throw new Error(
      needsPublicDelivery
        ? 'Cloudflare R2 public delivery is not configured for this asset type.'
        : 'Cloudflare R2 storage is not configured.',
    );
  }

  if (!adapter) {
    throw new Error('Cloudflare R2 storage is not configured.');
  }

  return adapter.getSignedUploadUrl(options);
}
