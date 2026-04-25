import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { abortR2MultipartUpload } from '@/lib/r2';
import { captureException, captureMessage } from '@/lib/sentry';
import { VideoAssetService } from '@/lib/services/video-asset.service';
import { AccessError, requireApiOnboarded } from '@/server/auth/guard';

const videoUploadAbortSchema = z.object({
  videoAssetId: z.string().min(1),
  storageKey: z.string().min(1),
  uploadId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let videoAssetId: string | null = null;

  try {
    const session = await requireApiOnboarded();
    const body = videoUploadAbortSchema.parse(await request.json());
    videoAssetId = body.videoAssetId;

    const asset = await VideoAssetService.getOwnedStoredUpload({
      id: body.videoAssetId,
      userId: session.user.id,
      providerAssetId: body.storageKey,
    });

    if (!asset || asset.uploadUrl !== body.uploadId) {
      return NextResponse.json({ error: 'Video upload not found.' }, { status: 404 });
    }

    await abortR2MultipartUpload({
      key: body.storageKey,
      uploadId: body.uploadId,
    });

    await VideoAssetService.markUploadFailed(body.videoAssetId, {
      code: 'UPLOAD_ABORTED',
      message: 'Multipart upload was aborted before completion.',
    });

    return NextResponse.json({ ok: true });
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

    captureException(error, {
      route: 'api/assets/video-upload-abort',
      videoAssetId,
    });
    captureMessage('Video multipart upload abort failed.', 'warning', {
      videoAssetId,
      provider: 'cloudflare-r2',
    });

    return NextResponse.json({ error: 'Unable to abort video upload.' }, { status: 500 });
  }
}
