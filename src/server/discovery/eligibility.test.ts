import test from 'node:test';
import assert from 'node:assert/strict';
import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

import { isDiscoveryEligibleSubmission } from './eligibility';

test('discovery eligibility: only accepted + ready + creator-eligible rows pass', () => {
  assert.equal(
    isDiscoveryEligibleSubmission({
      submissionStatus: SubmissionStatus.ACCEPTED,
      videoAssetStatus: VideoAssetStatus.READY,
      creatorOnboarded: true,
      hasCreatorProfile: true,
    }),
    true,
  );

  assert.equal(
    isDiscoveryEligibleSubmission({
      submissionStatus: SubmissionStatus.DRAFT,
      videoAssetStatus: VideoAssetStatus.READY,
      creatorOnboarded: true,
      hasCreatorProfile: true,
    }),
    false,
  );

  assert.equal(
    isDiscoveryEligibleSubmission({
      submissionStatus: SubmissionStatus.ACCEPTED,
      videoAssetStatus: VideoAssetStatus.PROCESSING,
      creatorOnboarded: true,
      hasCreatorProfile: true,
    }),
    false,
  );

  assert.equal(
    isDiscoveryEligibleSubmission({
      submissionStatus: SubmissionStatus.ACCEPTED,
      videoAssetStatus: VideoAssetStatus.READY,
      creatorOnboarded: false,
      hasCreatorProfile: true,
    }),
    false,
  );
});
