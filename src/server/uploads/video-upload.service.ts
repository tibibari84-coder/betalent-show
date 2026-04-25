import { VideoAssetProvider, type VideoAssetStatus } from '@prisma/client';

import { UPLOAD_RIGHTS_CONFIRMATIONS, UPLOAD_RIGHTS_HELPER_COPY } from '@/lib/copy/disclaimers';

export type VideoUploadInitInput = {
  filename: string;
  mimeType: string;
  size: number;
  maxDurationSeconds: number;
  originalityConfirmed: boolean;
};

export const MAX_SHORT_VIDEO_DURATION_SECONDS = 120;

const STORED_UPLOAD_DECLARATION = [
  UPLOAD_RIGHTS_CONFIRMATIONS.performance,
  UPLOAD_RIGHTS_CONFIRMATIONS.rights,
  UPLOAD_RIGHTS_CONFIRMATIONS.platform,
  UPLOAD_RIGHTS_HELPER_COPY,
].join(' ');

type VideoUploadInitDeps = {
  createDraftVideoAsset: (input: {
    userId: string;
    provider: VideoAssetProvider;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    originalityConfirmed: boolean;
    originalityConfirmedAt: Date;
    originalityDeclarationText: string;
  }) => Promise<{
    id: string;
    originalName: string;
    status: VideoAssetStatus;
  }>;
  createObjectUpload: (input: {
    key: string;
    contentType: string;
    purpose: 'video';
  }) => Promise<{
    uploadId: string;
    assetUrl: string;
    key: string;
  }>;
  attachStoredUpload: (
    id: string,
    input: { providerAssetId: string; uploadUrl: string; assetUrl: string },
  ) => Promise<unknown>;
};

function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
}

export function buildVideoObjectKey(input: { userId: string; videoAssetId: string; filename: string }) {
  const safeName = sanitizeFilename(input.filename) || `upload-${Date.now()}`;
  return `video/${input.userId}/${input.videoAssetId}/${safeName}`;
}

export async function initializeVideoUploadWithDeps(
  deps: VideoUploadInitDeps,
  userId: string,
  input: VideoUploadInitInput,
) {
  if (input.maxDurationSeconds > MAX_SHORT_VIDEO_DURATION_SECONDS) {
    throw new Error(`BETALENT supports short uploaded performances up to ${MAX_SHORT_VIDEO_DURATION_SECONDS} seconds.`);
  }

  if (!input.originalityConfirmed) {
    throw new Error('Confirm originality rights before starting an upload.');
  }

  const draftAsset = await deps.createDraftVideoAsset({
    userId,
    provider: VideoAssetProvider.R2_OBJECT,
    filename: input.filename,
    originalName: input.filename,
    size: input.size,
    mimeType: input.mimeType,
    originalityConfirmed: true,
    originalityConfirmedAt: new Date(),
    originalityDeclarationText: STORED_UPLOAD_DECLARATION,
  });

  const multipartUpload = await deps.createObjectUpload({
    key: buildVideoObjectKey({
      userId,
      videoAssetId: draftAsset.id,
      filename: draftAsset.originalName,
    }),
    contentType: input.mimeType,
    purpose: 'video',
  });

  await deps.attachStoredUpload(draftAsset.id, {
    providerAssetId: multipartUpload.key,
    uploadUrl: multipartUpload.uploadId,
    assetUrl: multipartUpload.assetUrl,
  });

  return {
    videoAsset: {
      id: draftAsset.id,
      status: draftAsset.status,
    },
    upload: {
      uploadId: multipartUpload.uploadId,
      partSize: 8 * 1024 * 1024,
    },
    storage: {
      key: multipartUpload.key,
      assetUrl: multipartUpload.assetUrl,
    },
    originalName: draftAsset.originalName,
  };
}
