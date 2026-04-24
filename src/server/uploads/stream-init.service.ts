import { type VideoAssetStatus } from '@prisma/client';
import { UPLOAD_RIGHTS_CONFIRMATIONS, UPLOAD_RIGHTS_HELPER_COPY } from '@/lib/copy/disclaimers';

type StreamInitInput = {
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

type StreamInitDeps = {
  createDraftVideoAsset: (input: {
    userId: string;
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
  createDirectUpload: (input: {
    creatorId: string;
    maxDurationSeconds: number;
    metadata: Record<string, string>;
  }) => Promise<{
    uid: string;
    uploadURL: string;
  }>;
  attachDirectUpload: (id: string, input: { providerAssetId: string; uploadUrl: string }) => Promise<unknown>;
};

export async function initializeStreamUploadWithDeps(
  deps: StreamInitDeps,
  userId: string,
  input: StreamInitInput,
) {
  if (input.maxDurationSeconds > MAX_SHORT_VIDEO_DURATION_SECONDS) {
    throw new Error(`BETALENT supports short uploaded performances up to ${MAX_SHORT_VIDEO_DURATION_SECONDS} seconds.`);
  }

  if (!input.originalityConfirmed) {
    throw new Error('Confirm originality rights before starting an upload.');
  }

  const draftAsset = await deps.createDraftVideoAsset({
    userId,
    filename: input.filename,
    originalName: input.filename,
    size: input.size,
    mimeType: input.mimeType,
    originalityConfirmed: true,
    originalityConfirmedAt: new Date(),
    originalityDeclarationText: STORED_UPLOAD_DECLARATION,
  });

  const directUpload = await deps.createDirectUpload({
    creatorId: userId,
    maxDurationSeconds: input.maxDurationSeconds,
    metadata: {
      videoAssetId: draftAsset.id,
      userId,
      filename: draftAsset.originalName,
    },
  });

  await deps.attachDirectUpload(draftAsset.id, {
    providerAssetId: directUpload.uid,
    uploadUrl: directUpload.uploadURL,
  });

  return {
    videoAsset: {
      id: draftAsset.id,
      status: draftAsset.status,
    },
    upload: {
      url: directUpload.uploadURL,
      formField: 'file' as const,
    },
    providerAssetId: directUpload.uid,
    originalName: draftAsset.originalName,
  };
}
