import 'server-only';

import { env } from '@/lib/env';
import { captureMessage } from '@/lib/sentry';

import { CloudflareR2Adapter } from './cloudflare-r2.adapter';
import {
  R2AssetPurpose,
  R2SignedUploadUrlOptions,
  R2SignedUploadUrlResult,
} from './types';
import { buildR2AssetUrl, getR2KeyFromAssetUrl } from './url';

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
export { buildR2AssetUrl, getR2KeyFromAssetUrl };

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

  const missingPublicDelivery =
    purpose && publicAssetPurposes.has(purpose) && !env.R2_PUBLIC_BASE_URL
      ? ['R2_PUBLIC_BASE_URL']
      : [];

  return {
    provider: 'cloudflare-r2' as const,
    enabled: missing.length === 0,
    storageConfigured,
    publicDeliveryConfigured,
    missing,
    missingPublicDelivery,
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

export async function deleteR2ObjectForUser(options: {
  userId: string;
  purpose: R2AssetPurpose;
  assetUrl: string;
}): Promise<boolean> {
  if (!adapter) {
    return false;
  }

  const key = getR2KeyFromAssetUrl(options.assetUrl);
  if (!key || !key.startsWith(`${options.purpose}/${options.userId}/`)) {
    return false;
  }

  try {
    await adapter.deleteObject(key);
    return true;
  } catch (error) {
    captureMessage('Cloudflare R2 object deletion failed.', 'warning', {
      key,
      purpose: options.purpose,
      userId: options.userId,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return false;
  }
}
