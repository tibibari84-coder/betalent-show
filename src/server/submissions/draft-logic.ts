import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

import {
  isCreatorEditableSubmission,
  prepareSubmissionStatusChange,
} from './lifecycle';

type ReadyAsset = {
  id: string;
  status: VideoAssetStatus;
};

type SubmissionRecord = {
  id: string;
  userId: string;
  status: SubmissionStatus;
  title: string;
  description: string | null;
  submittedAt: Date | null;
  videoAssetId: string;
  createdAt: Date;
  updatedAt: Date;
  videoAsset?: {
    id: string;
    status: VideoAssetStatus;
  };
};

type SubmissionDraftDeps = {
  getReadyVideoAssetForSubmission: (assetId: string, userId: string) => Promise<ReadyAsset>;
  createSubmission: (data: {
    userId: string;
    videoAssetId: string;
    title: string;
    description: string | null;
    status: SubmissionStatus;
  }) => Promise<SubmissionRecord>;
  findSubmissionForEdit: (id: string) => Promise<SubmissionRecord | null>;
  updateSubmission: (id: string, data: {
    title?: string;
    description?: string | null;
    videoAssetId?: string;
    status?: SubmissionStatus;
    submittedAt?: Date | null;
  }) => Promise<SubmissionRecord>;
};

export async function createSubmissionDraftWithDeps(
  deps: SubmissionDraftDeps,
  data: {
    userId: string;
    videoAssetId: string;
    title: string;
    description?: string;
  },
) {
  const asset = await deps.getReadyVideoAssetForSubmission(data.videoAssetId, data.userId);

  return deps.createSubmission({
    userId: data.userId,
    videoAssetId: asset.id,
    title: data.title.trim(),
    description: data.description?.trim() || null,
    status: SubmissionStatus.DRAFT,
  });
}

export async function updateSubmissionDraftWithDeps(
  deps: SubmissionDraftDeps,
  data: {
    id: string;
    userId: string;
    videoAssetId: string;
    title: string;
    description?: string;
  },
) {
  const current = await deps.findSubmissionForEdit(data.id);

  if (!current || current.userId !== data.userId) {
    throw new Error('Submission not found.');
  }

  if (!isCreatorEditableSubmission(current.status)) {
    throw new Error('Only draft submissions can be edited.');
  }

  const asset = await deps.getReadyVideoAssetForSubmission(data.videoAssetId, data.userId);

  return deps.updateSubmission(data.id, {
    title: data.title.trim(),
    description: data.description?.trim() || null,
    videoAssetId: asset.id,
  });
}

export async function submitSubmissionDraftWithDeps(
  deps: SubmissionDraftDeps,
  data: {
    id: string;
    userId: string;
  },
) {
  const current = await deps.findSubmissionForEdit(data.id);

  if (!current || current.userId !== data.userId) {
    throw new Error('Submission not found.');
  }

  if (!isCreatorEditableSubmission(current.status)) {
    throw new Error('Only draft submissions can be submitted.');
  }

  if (!current.title.trim()) {
    throw new Error('Submission title is required before submitting.');
  }

  if (!current.videoAsset) {
    throw new Error('Submission asset context is missing.');
  }

  const transition = prepareSubmissionStatusChange({
    currentStatus: current.status,
    nextStatus: SubmissionStatus.SUBMITTED,
    currentSubmittedAt: current.submittedAt,
    assetStatus: current.videoAsset.status,
  });

  return deps.updateSubmission(data.id, {
    status: SubmissionStatus.SUBMITTED,
    submittedAt: transition.submittedAt,
  });
}
