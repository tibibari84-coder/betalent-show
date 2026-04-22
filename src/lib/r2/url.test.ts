import test from 'node:test';
import assert from 'node:assert/strict';

import { buildR2AssetUrlFromConfig, getR2KeyFromAssetUrlWithConfig } from './url-logic';

test('Cloudflare R2 URL helpers preserve public key mapping', () => {
  const key = 'avatar/user_1/1234-photo.png';
  const assetUrl = buildR2AssetUrlFromConfig({
    key,
    publicBaseUrl: 'https://cdn.betalent.test',
    accountId: 'account_1',
    bucketName: 'bucket_1',
  });

  assert.equal(
    getR2KeyFromAssetUrlWithConfig({
      assetUrl,
      publicBaseUrl: 'https://cdn.betalent.test',
      accountId: 'account_1',
      bucketName: 'bucket_1',
    }),
    key,
  );
});
