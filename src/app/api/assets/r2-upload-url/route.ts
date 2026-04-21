import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { captureException, captureMessage } from '@/lib/sentry';
import { AccessError, requireApiOnboarded } from '@/server/auth/guard';
import { createR2UploadUrl, getR2ConfigState } from '@/lib/r2';

const createUploadUrlSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  purpose: z.enum(['avatar', 'profile', 'static', 'document', 'export']).default('avatar'),
});

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiOnboarded();
    const body = await request.json();
    const { fileName, contentType, purpose } = createUploadUrlSchema.parse(body);
    const config = getR2ConfigState(purpose);

    if (!config.enabled) {
      return NextResponse.json(
        {
          error:
            config.publicDeliveryConfigured || !['avatar', 'profile', 'static'].includes(purpose)
              ? 'R2 storage is not configured.'
              : 'R2 public delivery is not configured for this asset type.',
        },
        { status: 503 },
      );
    }

    const safeName = sanitizeFileName(fileName);
    const key = `${purpose}/${session.user.id}/${Date.now()}-${safeName}`;

    const { uploadUrl, assetUrl } = await createR2UploadUrl({
      key,
      contentType,
      purpose,
      expiresInSeconds: 3600,
    });

    return NextResponse.json({ uploadUrl, assetUrl, key });
  } catch (error) {
    if (error instanceof AccessError) {
      const status = error.code === 'UNAUTHENTICATED' ? 401 : 403;
      return NextResponse.json({ error: error.message }, { status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    captureException(error, { route: 'api/assets/r2-upload-url' });
    captureMessage('Cloudflare R2 signed upload URL generation failed.', 'error', {
      route: 'api/assets/r2-upload-url',
    });

    return NextResponse.json({ error: 'Unable to create upload URL' }, { status: 500 });
  }
}
