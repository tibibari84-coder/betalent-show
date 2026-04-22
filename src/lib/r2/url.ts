import { env } from '@/lib/env';

import { buildR2AssetUrlFromConfig, getR2KeyFromAssetUrlWithConfig } from './url-logic';

export function buildR2AssetUrl(key: string) {
  return buildR2AssetUrlFromConfig({
    key,
    publicBaseUrl: env.R2_PUBLIC_BASE_URL,
    accountId: env.R2_ACCOUNT_ID,
    bucketName: env.R2_BUCKET_NAME,
  });
}

export function getR2KeyFromAssetUrl(assetUrl: string): string | null {
  return getR2KeyFromAssetUrlWithConfig({
    assetUrl,
    publicBaseUrl: env.R2_PUBLIC_BASE_URL,
    accountId: env.R2_ACCOUNT_ID,
    bucketName: env.R2_BUCKET_NAME,
  });
}
