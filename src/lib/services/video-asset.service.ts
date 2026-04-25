import 'server-only';

import { prisma } from '@/lib/prisma';
import { captureMessage } from '@/lib/sentry';
import { streamAdapter } from '@/lib/stream';
import {
  VideoAsset,
  VideoAssetProvider,
  VideoAssetStatus,
  type Prisma,
} from '@prisma/client';

import type { StreamVideoWebhookPayload } from '@/lib/stream';

export type CreateDraftVideoAssetInput = {
  userId: string;
  provider?: VideoAssetProvider;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  originalityConfirmed: boolean;
  originalityConfirmedAt: Date;
  originalityDeclarationText: string;
};

export type ReadyVideoAsset = Prisma.VideoAssetGetPayload<{
  select: {
    id: true;
    userId: true;
    providerAssetId: true;
    status: true;
    playbackUrl: true;
    previewUrl: true;
    thumbnailUrl: true;
    originalName: true;
    filename: true;
    size: true;
    mimeType: true;
    updatedAt: true;
  };
}>;

function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
}

export class VideoAssetService {
  static async createDraftVideoAsset(
    data: CreateDraftVideoAssetInput,
  ): Promise<VideoAsset> {
    const safeFilename = sanitizeFilename(data.filename || data.originalName);

    return prisma.videoAsset.create({
      data: {
        userId: data.userId,
        provider: data.provider ?? VideoAssetProvider.R2_OBJECT,
        filename: safeFilename,
        originalName: data.originalName,
        size: data.size,
        mimeType: data.mimeType,
        originalityConfirmed: data.originalityConfirmed,
        originalityConfirmedAt: data.originalityConfirmedAt,
        originalityDeclarationText: data.originalityDeclarationText,
        status: VideoAssetStatus.UPLOADING,
      },
    });
  }

  static async attachStoredUpload(
    id: string,
    upload: {
      providerAssetId: string;
      uploadUrl: string;
      assetUrl: string;
    },
  ): Promise<VideoAsset> {
    return prisma.videoAsset.update({
      where: { id },
      data: {
        provider: VideoAssetProvider.R2_OBJECT,
        providerAssetId: upload.providerAssetId,
        uploadUrl: upload.uploadUrl,
        url: upload.assetUrl,
        playbackUrl: upload.assetUrl,
        previewUrl: upload.assetUrl,
        errorCode: null,
        errorMessage: null,
        status: VideoAssetStatus.UPLOADING,
      },
    });
  }

  static async markUploadProcessing(id: string): Promise<VideoAsset> {
    return prisma.videoAsset.update({
      where: { id },
      data: {
        status: VideoAssetStatus.PROCESSING,
      },
    });
  }

  static async markStoredUploadProcessing(input: {
    id: string;
    userId: string;
    providerAssetId: string;
  }): Promise<VideoAsset> {
    return prisma.videoAsset.update({
      where: {
        id: input.id,
        userId: input.userId,
        providerAssetId: input.providerAssetId,
      },
      data: {
        status: VideoAssetStatus.PROCESSING,
      },
    });
  }

  static async markStoredUploadReady(input: {
    id: string;
    userId: string;
    providerAssetId: string;
    assetUrl: string;
  }): Promise<VideoAsset> {
    return prisma.videoAsset.update({
      where: {
        id: input.id,
        userId: input.userId,
        providerAssetId: input.providerAssetId,
      },
      data: {
        status: VideoAssetStatus.READY,
        url: input.assetUrl,
        playbackUrl: input.assetUrl,
        previewUrl: input.assetUrl,
        errorCode: null,
        errorMessage: null,
        uploadUrl: null,
        readyAt: new Date(),
      },
    });
  }

  static async markUploadFailed(
    id: string,
    error: { code?: string | null; message: string },
  ): Promise<VideoAsset> {
    const updated = await prisma.videoAsset.update({
      where: { id },
      data: {
        status: VideoAssetStatus.FAILED,
        errorCode: error.code || null,
        errorMessage: error.message,
        uploadUrl: null,
      },
    });

    captureMessage('Video asset marked failed.', 'warning', {
      videoAssetId: id,
      errorCode: error.code || null,
      message: error.message,
    });

    return updated;
  }

  static async markUploadProcessingByProviderAssetId(
    providerAssetId: string,
  ): Promise<VideoAsset | null> {
    const asset = await prisma.videoAsset.findUnique({
      where: { providerAssetId },
    });
    if (!asset) {
      return null;
    }

    return prisma.videoAsset.update({
      where: { providerAssetId },
      data: {
        status: VideoAssetStatus.PROCESSING,
      },
    });
  }

  static async markUploadReadyFromWebhook(
    payload: StreamVideoWebhookPayload,
  ): Promise<VideoAsset | null> {
    const mapped = streamAdapter.mapWebhookPayload(payload);
    if (!mapped.readyToStream) {
      return null;
    }

    const asset = await prisma.videoAsset.findUnique({
      where: { providerAssetId: mapped.providerAssetId },
    });
    if (!asset) {
      return null;
    }

    const updated = await prisma.videoAsset.update({
      where: { providerAssetId: mapped.providerAssetId },
      data: {
        status: VideoAssetStatus.READY,
        url: mapped.playbackUrl || mapped.previewUrl,
        playbackUrl: mapped.playbackUrl,
        previewUrl: mapped.previewUrl,
        thumbnailUrl: mapped.thumbnailUrl,
        errorCode: null,
        errorMessage: null,
        readyAt: new Date(),
        uploadUrl: null,
      },
    });

    captureMessage('Video asset marked ready from webhook.', 'info', {
      videoAssetId: updated.id,
      providerAssetId: mapped.providerAssetId,
      userId: updated.userId,
    });

    return updated;
  }

  static async markUploadFailedFromWebhook(
    payload: StreamVideoWebhookPayload,
  ): Promise<VideoAsset | null> {
    const mapped = streamAdapter.mapWebhookPayload(payload);
    const asset = await prisma.videoAsset.findUnique({
      where: { providerAssetId: mapped.providerAssetId },
    });
    if (!asset) {
      return null;
    }

    const updated = await prisma.videoAsset.update({
      where: { providerAssetId: mapped.providerAssetId },
      data: {
        status: VideoAssetStatus.FAILED,
        errorCode: mapped.errorCode,
        errorMessage: mapped.errorMessage || 'Cloudflare Stream processing failed.',
        previewUrl: mapped.previewUrl,
        thumbnailUrl: mapped.thumbnailUrl,
        uploadUrl: null,
      },
    });

    captureMessage('Video asset failed from webhook.', 'warning', {
      videoAssetId: updated.id,
      providerAssetId: mapped.providerAssetId,
      errorCode: mapped.errorCode,
      errorMessage: mapped.errorMessage || 'Cloudflare Stream processing failed.',
    });

    return updated;
  }

  static async getVideoAssetsByUser(userId: string): Promise<VideoAsset[]> {
    return prisma.videoAsset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getVideoAssetById(id: string): Promise<VideoAsset | null> {
    return prisma.videoAsset.findUnique({
      where: { id },
    });
  }

  static async getOwnedStoredUpload(input: {
    id: string;
    userId: string;
    providerAssetId: string;
  }): Promise<VideoAsset | null> {
    return prisma.videoAsset.findFirst({
      where: {
        id: input.id,
        userId: input.userId,
        provider: VideoAssetProvider.R2_OBJECT,
        providerAssetId: input.providerAssetId,
      },
    });
  }

  static async getReadyVideoAssetForSubmission(
    id: string,
    userId: string,
  ): Promise<ReadyVideoAsset> {
    const asset = await prisma.videoAsset.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        providerAssetId: true,
        status: true,
        playbackUrl: true,
        previewUrl: true,
        thumbnailUrl: true,
        originalName: true,
        filename: true,
        size: true,
        mimeType: true,
        originalityConfirmed: true,
        updatedAt: true,
      },
    });

    if (!asset || asset.userId !== userId) {
      throw new Error('Video asset not found.');
    }

    if (asset.status !== VideoAssetStatus.READY) {
      throw new Error('Only READY video assets can be attached to a submission.');
    }

    if (!asset.originalityConfirmed) {
      throw new Error('Only originality-confirmed video assets can be attached to a submission.');
    }

    return asset;
  }
}
