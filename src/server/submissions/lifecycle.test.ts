import test from 'node:test';
import assert from 'node:assert/strict';
import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

import {
  allowedSubmissionTransitions,
  isSubmissionReadOnlyForCreator,
  prepareSubmissionStatusChange,
} from './lifecycle';

test('submission lifecycle source of truth blocks direct submitted-to-accepted jumps', () => {
  assert.deepEqual(allowedSubmissionTransitions[SubmissionStatus.SUBMITTED], [
    SubmissionStatus.UNDER_REVIEW,
    SubmissionStatus.WITHDRAWN,
  ]);

  assert.throws(() =>
    prepareSubmissionStatusChange({
      currentStatus: SubmissionStatus.SUBMITTED,
      nextStatus: SubmissionStatus.ACCEPTED,
      currentSubmittedAt: new Date('2026-04-21T10:00:00.000Z'),
      assetStatus: VideoAssetStatus.READY,
    }),
  );
});

test('admin submission review transition keeps submittedAt and lifecycle note aligned', () => {
  const existingSubmittedAt = new Date('2026-04-21T10:00:00.000Z');
  const prepared = prepareSubmissionStatusChange({
    currentStatus: SubmissionStatus.SUBMITTED,
    nextStatus: SubmissionStatus.UNDER_REVIEW,
    currentSubmittedAt: existingSubmittedAt,
    assetStatus: VideoAssetStatus.READY,
  });

  assert.equal(prepared.submittedAt, existingSubmittedAt);
  assert.equal(prepared.lifecycleNote, 'Submission entered active review.');
  assert.equal(isSubmissionReadOnlyForCreator(SubmissionStatus.SUBMITTED), true);
});
