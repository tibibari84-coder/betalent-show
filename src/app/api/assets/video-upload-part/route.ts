import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createR2MultipartUploadPartUrl } from '@/lib/r2';
import { captureException } from '@/lib/sentry';
import { VideoAssetService } from '@/lib/services/video-asset.service';
import { AccessError, requireApiOnboarded } from '@/server/auth/guard';

const videoUploadPartSchema = z.object({
  videoAssetId: z.string().min(1),
  storageKey: z.string().min(1),
  uploadId: z.string().min(1),
  partNumber: z.number().int().min(1).max(10_000),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiOnboarded();
    const body = videoUploadPartSchema.parse(await request.json());

    const asset = await VideoAssetService.getOwnedStoredUpload({
      id: body.videoAssetId,
      userId: session.user.id,
      providerAssetId: body.storageKey,
    });

    if (!asset || asset.uploadUrl !== body.uploadId) {
      return NextResponse.json({ error: 'Video upload not found.' }, { status: 404 });
    }

    const signedPart = await createR2MultipartUploadPartUrl({
      key: body.storageKey,
      uploadId: body.uploadId,
      partNumber: body.partNumber,
      expiresInSeconds: 3600,
    });

    return NextResponse.json({
      ok: true,
      uploadPart: signedPart,
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

    captureException(error, { route: 'api/assets/video-upload-part' });
    return NextResponse.json({ error: 'Unable to sign upload part.' }, { status: 500 });
  }
}
