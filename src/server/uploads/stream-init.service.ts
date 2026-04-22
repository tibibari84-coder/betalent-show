import { type VideoAssetStatus } from '@prisma/client';

type StreamInitInput = {
  filename: string;
  mimeType: string;
  size: number;
  maxDurationSeconds: number;
};

export const MAX_SHORT_VIDEO_DURATION_SECONDS = 120;

type StreamInitDeps = {
  createDraftVideoAsset: (input: {
    userId: string;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
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

  const draftAsset = await deps.createDraftVideoAsset({
    userId,
    filename: input.filename,
    originalName: input.filename,
    size: input.size,
    mimeType: input.mimeType,
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
