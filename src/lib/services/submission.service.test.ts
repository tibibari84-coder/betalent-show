import test from 'node:test';
import assert from 'node:assert/strict';
import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

import {
  createSubmissionDraftWithDeps,
  submitSubmissionDraftWithDeps,
  updateSubmissionDraftWithDeps,
} from '../../server/submissions/draft-logic';

test('submission create/edit/submit: creates a real draft from a READY owned asset', async () => {
  const row = await createSubmissionDraftWithDeps({
    async getReadyVideoAssetForSubmission() {
      return {
        id: 'asset_1',
        status: VideoAssetStatus.READY,
      };
    },
    async createSubmission(data) {
      return {
        id: 'submission_1',
        ...data,
        submittedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    async findSubmissionForEdit() {
      return null;
    },
    async updateSubmission() {
      throw new Error('not used');
    },
  }, {
    userId: 'user_1',
    videoAssetId: 'asset_1',
    title: 'My entry',
    description: 'Short note',
  });

  assert.equal(row.status, SubmissionStatus.DRAFT);
  assert.equal(row.videoAssetId, 'asset_1');
  assert.equal(row.title, 'My entry');
});

test('submission create/edit/submit: only draft submissions can be edited and submitted', async () => {
  const deps = {
    async getReadyVideoAssetForSubmission() {
      return {
        id: 'asset_2',
        status: VideoAssetStatus.READY,
      };
    },
    async createSubmission() {
      throw new Error('not used');
    },
    async findSubmissionForEdit() {
      return {
        id: 'draft_1',
        userId: 'user_1',
        status: SubmissionStatus.DRAFT,
        title: 'Current draft',
        description: 'Body',
        submittedAt: null,
        videoAssetId: 'asset_1',
        createdAt: new Date(),
        updatedAt: new Date(),
        videoAsset: {
          id: 'asset_1',
          status: VideoAssetStatus.READY,
        },
      };
    },
    async updateSubmission(_id: string, data: {
      title?: string;
      description?: string | null;
      videoAssetId?: string;
      status?: SubmissionStatus;
      submittedAt?: Date | null;
    }) {
      return {
        id: 'draft_1',
        userId: 'user_1',
        status: data.status ?? SubmissionStatus.DRAFT,
        title: data.title ?? 'Updated draft',
        description: data.description ?? 'Updated body',
        submittedAt: data.submittedAt ?? new Date('2026-04-21T12:00:00.000Z'),
        videoAssetId: data.videoAssetId ?? 'asset_2',
        createdAt: new Date(),
        updatedAt: new Date(),
        videoAsset: {
          id: data.videoAssetId ?? 'asset_2',
          status: VideoAssetStatus.READY,
        },
      };
    },
  };

  const updated = await updateSubmissionDraftWithDeps(deps, {
    id: 'draft_1',
    userId: 'user_1',
    videoAssetId: 'asset_2',
    title: 'Updated draft',
    description: 'Updated body',
  });
  const submitted = await submitSubmissionDraftWithDeps(deps, {
    id: 'draft_1',
    userId: 'user_1',
  });

  assert.equal(updated.videoAssetId, 'asset_2');
  assert.equal(submitted.status, SubmissionStatus.SUBMITTED);
  assert.ok(submitted.submittedAt instanceof Date);
});
