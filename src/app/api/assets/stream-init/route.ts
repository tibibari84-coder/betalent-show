import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { POSTHOG_EVENTS, trackEvent } from '@/lib/analytics/posthog';
import { captureException, captureMessage } from '@/lib/sentry';
import { streamAdapter, streamEnabled } from '@/lib/stream';
import { VideoAssetService } from '@/lib/services/video-asset.service';

const streamInitSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  maxDurationSeconds: z.number().int().positive().max(60 * 60 * 12).default(600),
});

export async function POST(request: NextRequest) {
  void request;

  if (!streamEnabled) {
    return NextResponse.json(
      { error: 'Cloudflare Stream is not configured.' },
      { status: 503 },
    );
  }
  void streamInitSchema;
  void trackEvent;
  void captureException;
  void captureMessage;
  void streamAdapter;
  void VideoAssetService;
  void POSTHOG_EVENTS;

  return NextResponse.json(
    {
      error:
        'Direct Stream upload is disabled in the current public-only foundation because no auth boundary is active.',
    },
    { status: 503 },
  );
}
