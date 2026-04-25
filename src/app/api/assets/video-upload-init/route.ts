import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { POSTHOG_EVENTS, trackEvent } from '@/lib/analytics/posthog';
import { createR2MultipartUpload, getR2ConfigState } from '@/lib/r2';
import { captureException, captureMessage } from '@/lib/sentry';
import { VideoAssetService } from '@/lib/services/video-asset.service';
import { AccessError, requireApiOnboarded } from '@/server/auth/guard';
import { initializeVideoUploadWithDeps, MAX_SHORT_VIDEO_DURATION_SECONDS } from '@/server/uploads/video-upload.service';

const videoUploadInitSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  maxDurationSeconds: z.number().int().positive().max(MAX_SHORT_VIDEO_DURATION_SECONDS).default(MAX_SHORT_VIDEO_DURATION_SECONDS),
  originalityConfirmed: z.boolean().refine((value) => value, 'Originality confirmation is required before upload.'),
});

export async function POST(request: NextRequest) {
  const storageConfig = getR2ConfigState('video');

  if (!storageConfig.enabled) {
    return NextResponse.json(
      {
        provider: storageConfig.provider,
        error: 'Video upload storage is not configured.',
        missing: storageConfig.missing,
      },
      { status: 503 },
    );
  }

  let videoAssetId: string | null = null;
  let sessionUserId: string | null = null;

  try {
    const session = await requireApiOnboarded();
    sessionUserId = session.user.id;

    const body = videoUploadInitSchema.parse(await request.json());
    const initialized = await initializeVideoUploadWithDeps(
      {
        createDraftVideoAsset: VideoAssetService.createDraftVideoAsset,
        createObjectUpload: createR2MultipartUpload,
        attachStoredUpload: VideoAssetService.attachStoredUpload,
      },
      session.user.id,
      body,
    );

    videoAssetId = initialized.videoAsset.id;

    await trackEvent(POSTHOG_EVENTS.upload_started, {
      distinctId: session.user.id,
      videoAssetId: initialized.videoAsset.id,
      storageKey: initialized.storage.key,
      filename: initialized.originalName,
      provider: storageConfig.provider,
    });

    return NextResponse.json({
      ok: true,
      videoAsset: initialized.videoAsset,
      upload: initialized.upload,
      storage: initialized.storage,
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
        message: error instanceof Error ? error.message : 'Unable to initialize upload.',
      }).catch(() => undefined);
    }

    if (sessionUserId) {
      await trackEvent(POSTHOG_EVENTS.upload_failed, {
        distinctId: sessionUserId,
        videoAssetId,
      }).catch(() => undefined);
    }

    captureException(error, {
      route: 'api/assets/video-upload-init',
      videoAssetId,
      userId: sessionUserId,
    });
    captureMessage('Video upload initialization failed.', 'error', {
      videoAssetId,
      userId: sessionUserId,
      provider: storageConfig.provider,
    });

    return NextResponse.json({ error: 'Unable to initialize video upload.' }, { status: 500 });
  }
}
