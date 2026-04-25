import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { POSTHOG_EVENTS, trackEvent } from '@/lib/analytics/posthog';
import { completeR2MultipartUpload } from '@/lib/r2';
import { captureException, captureMessage } from '@/lib/sentry';
import { VideoAssetService } from '@/lib/services/video-asset.service';
import { AccessError, requireApiOnboarded } from '@/server/auth/guard';

const videoUploadCompleteSchema = z.object({
  videoAssetId: z.string().min(1),
  storageKey: z.string().min(1),
  uploadId: z.string().min(1),
  parts: z
    .array(
      z.object({
        partNumber: z.number().int().min(1).max(10_000),
        etag: z.string().min(1),
      }),
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  let videoAssetId: string | null = null;
  let sessionUserId: string | null = null;

  try {
    const session = await requireApiOnboarded();
    sessionUserId = session.user.id;

    const body = videoUploadCompleteSchema.parse(await request.json());
    videoAssetId = body.videoAssetId;

    const asset = await VideoAssetService.getOwnedStoredUpload({
      id: body.videoAssetId,
      userId: session.user.id,
      providerAssetId: body.storageKey,
    });

    if (!asset || asset.uploadUrl !== body.uploadId || !asset.url) {
      return NextResponse.json({ error: 'Video upload not found.' }, { status: 404 });
    }

    await VideoAssetService.markStoredUploadProcessing({
      id: body.videoAssetId,
      userId: session.user.id,
      providerAssetId: body.storageKey,
    });

    await completeR2MultipartUpload({
      key: body.storageKey,
      uploadId: body.uploadId,
      parts: body.parts,
    });

    const videoAsset = await VideoAssetService.markStoredUploadReady({
      id: body.videoAssetId,
      userId: session.user.id,
      providerAssetId: body.storageKey,
      assetUrl: asset.url,
    });

    await trackEvent(POSTHOG_EVENTS.upload_completed, {
      distinctId: session.user.id,
      videoAssetId: videoAsset.id,
      storageKey: body.storageKey,
      provider: 'cloudflare-r2',
    });

    captureMessage('Video asset marked ready after storage upload.', 'info', {
      videoAssetId: videoAsset.id,
      userId: session.user.id,
      provider: 'cloudflare-r2',
    });

    return NextResponse.json({
      ok: true,
      videoAsset: {
        id: videoAsset.id,
        status: videoAsset.status,
        playbackUrl: videoAsset.playbackUrl,
      },
    });
  } catch (error) {
    if (error instanceof AccessError) {
      const status =
        error.code === 'UNAUTHENTICATED'
          ? 401
          : error.code === 'FORBIDDEN'
            ? 403
            : 409;

      return NextResponse.json({ error: error.message }, { status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    if (videoAssetId) {
      await VideoAssetService.markUploadFailed(videoAssetId, {
        message: error instanceof Error ? error.message : 'Unable to complete upload.',
      }).catch(() => undefined);
    }

    if (sessionUserId) {
      await trackEvent(POSTHOG_EVENTS.upload_failed, {
        distinctId: sessionUserId,
        videoAssetId,
      }).catch(() => undefined);
    }

    captureException(error, {
      route: 'api/assets/video-upload-complete',
      videoAssetId,
      userId: sessionUserId,
    });
    captureMessage('Video upload completion failed.', 'error', {
      videoAssetId,
      userId: sessionUserId,
      provider: 'cloudflare-r2',
    });

    return NextResponse.json({ error: 'Unable to complete video upload.' }, { status: 500 });
  }
}
