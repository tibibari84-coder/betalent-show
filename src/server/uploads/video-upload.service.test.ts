import test from 'node:test';
import assert from 'node:assert/strict';

import { initializeVideoUploadWithDeps } from './video-upload.service';

test('video upload init creates an R2-backed draft and multipart upload', async () => {
  const calls: string[] = [];

  const result = await initializeVideoUploadWithDeps(
    {
      async createDraftVideoAsset(input) {
        calls.push(`draft:${input.userId}:${input.provider}:${input.filename}`);
        return {
          id: 'asset_1',
          originalName: input.originalName,
          status: 'UPLOADING',
        };
      },
      async createObjectUpload(input) {
        calls.push(`object:${input.purpose}:${input.key}:${input.contentType}`);
        return {
          uploadId: 'multipart_1',
          assetUrl: 'https://cdn.example/video/user_1/asset_1/demo.mp4',
          key: input.key,
        };
      },
      async attachStoredUpload(id, input) {
        calls.push(`attach:${id}:${input.providerAssetId}:${input.assetUrl}`);
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
    'draft:user_1:R2_OBJECT:demo.mp4',
    'object:video:video/user_1/asset_1/demo.mp4:video/mp4',
    'attach:asset_1:video/user_1/asset_1/demo.mp4:https://cdn.example/video/user_1/asset_1/demo.mp4',
  ]);
  assert.equal(result.videoAsset.id, 'asset_1');
  assert.equal(result.upload.uploadId, 'multipart_1');
  assert.equal(result.upload.partSize, 8 * 1024 * 1024);
  assert.equal(result.storage.key, 'video/user_1/asset_1/demo.mp4');
});

test('video upload init rejects durations above short-form limit', async () => {
  await assert.rejects(
    initializeVideoUploadWithDeps(
      {
        async createDraftVideoAsset() {
          throw new Error('should not create draft');
        },
        async createObjectUpload() {
          throw new Error('should not create upload URL');
        },
        async attachStoredUpload() {
          throw new Error('should not attach upload');
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

test('video upload init rejects uploads without originality confirmation', async () => {
  await assert.rejects(
    initializeVideoUploadWithDeps(
      {
        async createDraftVideoAsset() {
          throw new Error('should not create draft');
        },
        async createObjectUpload() {
          throw new Error('should not create upload URL');
        },
        async attachStoredUpload() {
          throw new Error('should not attach upload');
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
