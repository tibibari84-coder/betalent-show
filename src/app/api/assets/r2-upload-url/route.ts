import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createR2UploadUrl, r2Enabled } from '@/lib/r2';

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
  if (!r2Enabled) {
    return NextResponse.json({ error: 'R2 storage is not configured.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { fileName, contentType, purpose } = createUploadUrlSchema.parse(body);
    const safeName = sanitizeFileName(fileName);
    const key = `${purpose}/public-foundation/${Date.now()}-${safeName}`;

    const { uploadUrl, assetUrl } = await createR2UploadUrl({
      key,
      contentType,
      expiresInSeconds: 3600,
    });

    return NextResponse.json({ uploadUrl, assetUrl, key });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Unable to create upload URL' }, { status: 500 });
  }
}
