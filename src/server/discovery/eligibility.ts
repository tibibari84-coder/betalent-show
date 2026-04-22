import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

export const DISCOVERY_ELIGIBLE_SUBMISSION_STATUSES = new Set<SubmissionStatus>([
  SubmissionStatus.ACCEPTED,
]);

export function isDiscoveryEligibleSubmissionStatus(status: SubmissionStatus) {
  return DISCOVERY_ELIGIBLE_SUBMISSION_STATUSES.has(status);
}

export function isDiscoveryEligibleVideoAssetStatus(status: VideoAssetStatus) {
  return status === VideoAssetStatus.READY;
}

export function isDiscoveryEligibleSubmission(input: {
  submissionStatus: SubmissionStatus;
  videoAssetStatus: VideoAssetStatus;
  creatorOnboarded: boolean;
  hasCreatorProfile: boolean;
}) {
  return (
    isDiscoveryEligibleSubmissionStatus(input.submissionStatus) &&
    isDiscoveryEligibleVideoAssetStatus(input.videoAssetStatus) &&
    input.creatorOnboarded &&
    input.hasCreatorProfile
  );
}
