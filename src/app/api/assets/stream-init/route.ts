import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { POSTHOG_EVENTS, trackEvent } from '@/lib/analytics/posthog';
import { captureException, captureMessage } from '@/lib/sentry';
import { getStreamConfigState, streamAdapter } from '@/lib/stream';
import { VideoAssetService } from '@/lib/services/video-asset.service';
import { AccessError, requireApiOnboarded } from '@/server/auth/guard';

const streamInitSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  maxDurationSeconds: z.number().int().positive().max(60 * 60 * 12).default(600),
});

export async function POST(request: NextRequest) {
  const streamConfig = getStreamConfigState();

  if (!streamConfig.enabled) {
    return NextResponse.json(
      { error: 'Cloudflare Stream is not configured.', missing: streamConfig.missing },
      { status: 503 },
    );
  }

  let videoAssetId: string | null = null;
  let sessionUserId: string | null = null;

  try {
    const session = await requireApiOnboarded();
    sessionUserId = session.user.id;

    const body = streamInitSchema.parse(await request.json());
    const draftAsset = await VideoAssetService.createDraftVideoAsset({
      userId: session.user.id,
      filename: body.filename,
      originalName: body.filename,
      size: body.size,
      mimeType: body.mimeType,
    });

    videoAssetId = draftAsset.id;

    const directUpload = await streamAdapter.createDirectUpload({
      creatorId: session.user.id,
      maxDurationSeconds: body.maxDurationSeconds,
      metadata: {
        videoAssetId: draftAsset.id,
        userId: session.user.id,
        filename: draftAsset.originalName,
      },
    });

    await VideoAssetService.attachDirectUpload(draftAsset.id, {
      providerAssetId: directUpload.uid,
      uploadUrl: directUpload.uploadURL,
    });

    await trackEvent(POSTHOG_EVENTS.upload_started, {
      distinctId: session.user.id,
      videoAssetId: draftAsset.id,
      providerAssetId: directUpload.uid,
      filename: draftAsset.originalName,
    });

    return NextResponse.json({
      ok: true,
      videoAsset: {
        id: draftAsset.id,
        status: draftAsset.status,
      },
      upload: {
        url: directUpload.uploadURL,
        formField: 'file',
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
      route: 'api/assets/stream-init',
      videoAssetId,
      userId: sessionUserId,
    });
    captureMessage('Cloudflare Stream direct upload initialization failed.', 'error', {
      videoAssetId,
      userId: sessionUserId,
      provider: 'cloudflare-stream',
    });

    return NextResponse.json(
      { error: 'Unable to initialize direct upload.' },
      { status: 500 },
    );
  }
}
