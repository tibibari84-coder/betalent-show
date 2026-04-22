import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { POSTHOG_EVENTS, trackEvent } from '@/lib/analytics/posthog';
import { env } from '@/lib/env';
import { captureException, captureMessage } from '@/lib/sentry';
import { streamWebhookVerificationEnabled } from '@/lib/stream';
import { classifyStreamWebhookState, verifyStreamWebhookSignature } from '@/lib/stream/webhook';
import { VideoAssetService } from '@/lib/services/video-asset.service';

const cloudflareStreamWebhookSchema = z.object({
  uid: z.string().min(1),
  creator: z.string().nullable().optional(),
  readyToStream: z.boolean().nullable().optional(),
  preview: z.string().url().nullable().optional(),
  thumbnail: z.string().url().nullable().optional(),
  status: z
    .object({
      state: z.string().nullable().optional(),
      pctComplete: z.string().nullable().optional(),
      errorReasonCode: z.string().nullable().optional(),
      errorReasonText: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  meta: z.record(z.string(), z.unknown()).nullable().optional(),
});

export async function POST(request: NextRequest) {
  if (!streamWebhookVerificationEnabled) {
    return NextResponse.json(
      { error: 'Cloudflare Stream webhook secret is not configured.' },
      { status: 503 },
    );
  }

  const signatureHeader = request.headers.get('Webhook-Signature');
  if (!signatureHeader) {
    return NextResponse.json({ error: 'Missing Stream signature header.' }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!verifyStreamWebhookSignature({
    secret: env.CLOUDFLARE_STREAM_WEBHOOK_SECRET,
    signatureHeader,
    body: rawBody,
  })) {
    return NextResponse.json({ error: 'Invalid Stream webhook signature.' }, { status: 401 });
  }

  try {
    const payload = cloudflareStreamWebhookSchema.parse(JSON.parse(rawBody));
    const state = payload.status?.state?.toLowerCase() || null;
    const classifiedState = classifyStreamWebhookState({
      readyToStream: payload.readyToStream,
      statusState: payload.status?.state,
    });

    if (classifiedState === 'READY') {
      const asset = await VideoAssetService.markUploadReadyFromWebhook(payload);
      if (asset) {
        await trackEvent(POSTHOG_EVENTS.upload_completed, {
          distinctId: asset.userId,
          videoAssetId: asset.id,
          providerAssetId: asset.providerAssetId,
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (classifiedState === 'FAILED') {
      const asset = await VideoAssetService.markUploadFailedFromWebhook(payload);
      if (asset) {
        await trackEvent(POSTHOG_EVENTS.upload_failed, {
          distinctId: asset.userId,
          videoAssetId: asset.id,
          providerAssetId: asset.providerAssetId,
          errorCode: asset.errorCode,
        });
      }
      return NextResponse.json({ ok: true });
    }

    const providerAssetId = payload.uid;
    const asset = await VideoAssetService.markUploadProcessingByProviderAssetId(
      providerAssetId,
    ).catch(() => null);

    captureMessage('Cloudflare Stream webhook received non-terminal state.', 'info', {
      providerAssetId,
      state,
      classifiedState,
      videoAssetId: asset?.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    captureException(error, {
      route: 'api/webhooks/cloudflare-stream',
    });

    return NextResponse.json({ error: 'Unable to process Stream webhook.' }, { status: 500 });
  }
}
