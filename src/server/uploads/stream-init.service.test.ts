import test from 'node:test';
import assert from 'node:assert/strict';

import { initializeStreamUploadWithDeps } from './stream-init.service';

test('upload init route baseline: creates draft asset, direct upload, and provider attachment in order', async () => {
  const calls: string[] = [];

  const result = await initializeStreamUploadWithDeps(
    {
      async createDraftVideoAsset(input) {
        calls.push(`draft:${input.userId}:${input.filename}`);
        return {
          id: 'asset_1',
          originalName: input.originalName,
          status: 'UPLOADING',
        };
      },
      async createDirectUpload(input) {
        calls.push(`direct:${input.creatorId}:${input.metadata.videoAssetId}`);
        return {
          uid: 'provider_1',
          uploadURL: 'https://stream.example/upload',
        };
      },
      async attachDirectUpload(id, input) {
        calls.push(`attach:${id}:${input.providerAssetId}`);
      },
    },
    'user_1',
    {
      filename: 'demo.mp4',
      mimeType: 'video/mp4',
      size: 1024,
      maxDurationSeconds: 120,
      originalityConfirmed: true,
    },
  );

  assert.deepEqual(calls, [
    'draft:user_1:demo.mp4',
    'direct:user_1:asset_1',
    'attach:asset_1:provider_1',
  ]);
  assert.equal(result.videoAsset.id, 'asset_1');
  assert.equal(result.upload.url, 'https://stream.example/upload');
  assert.equal(result.providerAssetId, 'provider_1');
});

test('upload init route baseline: rejects durations above short-form limit', async () => {
  await assert.rejects(
    initializeStreamUploadWithDeps(
      {
        async createDraftVideoAsset() {
          throw new Error('should not create draft');
        },
        async createDirectUpload() {
          throw new Error('should not create direct upload');
        },
        async attachDirectUpload() {
          throw new Error('should not attach direct upload');
        },
      },
      'user_1',
      {
        filename: 'demo.mp4',
        mimeType: 'video/mp4',
        size: 1024,
        maxDurationSeconds: 121,
        originalityConfirmed: true,
      },
    ),
    /up to 120 seconds/,
  );
});

test('upload init route baseline: rejects uploads without originality confirmation', async () => {
  await assert.rejects(
    initializeStreamUploadWithDeps(
      {
        async createDraftVideoAsset() {
          throw new Error('should not create draft');
        },
        async createDirectUpload() {
          throw new Error('should not create direct upload');
        },
        async attachDirectUpload() {
          throw new Error('should not attach direct upload');
        },
      },
      'user_1',
      {
        filename: 'demo.mp4',
        mimeType: 'video/mp4',
        size: 1024,
        maxDurationSeconds: 60,
        originalityConfirmed: false,
      },
    ),
    /Confirm originality rights/,
  );
});
