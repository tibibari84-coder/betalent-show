import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

export const allowedSubmissionTransitions: Record<SubmissionStatus, SubmissionStatus[]> = {
  DRAFT: [SubmissionStatus.SUBMITTED, SubmissionStatus.WITHDRAWN],
  SUBMITTED: [SubmissionStatus.UNDER_REVIEW, SubmissionStatus.WITHDRAWN],
  UNDER_REVIEW: [SubmissionStatus.ACCEPTED, SubmissionStatus.REJECTED, SubmissionStatus.WITHDRAWN],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

const submittedStatuses = new Set<SubmissionStatus>([
  SubmissionStatus.SUBMITTED,
  SubmissionStatus.UNDER_REVIEW,
  SubmissionStatus.ACCEPTED,
  SubmissionStatus.REJECTED,
]);

export function getAllowedSubmissionTransitions(status: SubmissionStatus): SubmissionStatus[] {
  return allowedSubmissionTransitions[status];
}

export function ensureSubmissionTransition(currentStatus: SubmissionStatus, nextStatus: SubmissionStatus) {
  if (currentStatus === nextStatus) {
    return;
  }

  if (!allowedSubmissionTransitions[currentStatus].includes(nextStatus)) {
    throw new Error(`Submission cannot move from ${currentStatus} to ${nextStatus}.`);
  }
}

export function isCreatorEditableSubmission(status: SubmissionStatus) {
  return status === SubmissionStatus.DRAFT;
}

export function isSubmissionReadOnlyForCreator(status: SubmissionStatus) {
  return !isCreatorEditableSubmission(status);
}

export function requiresReadyAssetForSubmissionStatus(status: SubmissionStatus) {
  return submittedStatuses.has(status);
}

export function ensureSubmissionAssetReady(
  nextStatus: SubmissionStatus,
  assetStatus: VideoAssetStatus,
) {
  if (requiresReadyAssetForSubmissionStatus(nextStatus) && assetStatus !== VideoAssetStatus.READY) {
    throw new Error('Only READY video assets can support submitted or reviewable entries.');
  }
}

export function deriveSubmittedAt(
  currentSubmittedAt: Date | null,
  nextStatus: SubmissionStatus,
  now: Date = new Date(),
) {
  if (currentSubmittedAt) {
    return currentSubmittedAt;
  }

  return submittedStatuses.has(nextStatus) ? now : null;
}

export function getSubmissionLifecycleNote(currentStatus: SubmissionStatus, nextStatus: SubmissionStatus) {
  if (currentStatus === SubmissionStatus.DRAFT && nextStatus === SubmissionStatus.SUBMITTED) {
    return 'Submission entered the review queue.';
  }

  if (currentStatus === SubmissionStatus.SUBMITTED && nextStatus === SubmissionStatus.UNDER_REVIEW) {
    return 'Submission entered active review.';
  }

  if (currentStatus === SubmissionStatus.UNDER_REVIEW && nextStatus === SubmissionStatus.ACCEPTED) {
    return 'Submission accepted after review.';
  }

  if (currentStatus === SubmissionStatus.UNDER_REVIEW && nextStatus === SubmissionStatus.REJECTED) {
    return 'Submission rejected after review.';
  }

  if (nextStatus === SubmissionStatus.WITHDRAWN) {
    return 'Submission withdrawn from the queue.';
  }

  return 'Submission lifecycle changed.';
}

export function prepareSubmissionStatusChange(input: {
  currentStatus: SubmissionStatus;
  nextStatus: SubmissionStatus;
  currentSubmittedAt: Date | null;
  assetStatus: VideoAssetStatus;
  now?: Date;
}) {
  ensureSubmissionTransition(input.currentStatus, input.nextStatus);
  ensureSubmissionAssetReady(input.nextStatus, input.assetStatus);

  return {
    submittedAt: deriveSubmittedAt(input.currentSubmittedAt, input.nextStatus, input.now),
    lifecycleNote: getSubmissionLifecycleNote(input.currentStatus, input.nextStatus),
  };
}
