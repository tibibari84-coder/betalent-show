import 'server-only';

import { env, publicEnv } from '@/lib/env';

import type {
  StreamDirectUploadRequest,
  StreamDirectUploadResult,
  StreamVideoWebhookPayload,
} from './types';

type CloudflareApiEnvelope<T> = {
  result?: T;
  success?: boolean;
  errors?: Array<{ message?: string }>;
};

function requireStreamConfig() {
  if (!env.CLOUDFLARE_STREAM_ACCOUNT_ID || !env.CLOUDFLARE_STREAM_API_TOKEN) {
    throw new Error('Cloudflare Stream is not configured.');
  }

  return {
    accountId: env.CLOUDFLARE_STREAM_ACCOUNT_ID,
    apiToken: env.CLOUDFLARE_STREAM_API_TOKEN,
  };
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as CloudflareApiEnvelope<T> | null;
  if (!response.ok || !body?.success || !body.result) {
    const apiMessage = body?.errors?.map((entry) => entry.message).filter(Boolean).join('; ');
    throw new Error(apiMessage || `Cloudflare Stream request failed (${response.status}).`);
  }

  return body.result;
}

export class CloudflareStreamAdapter {
  async createDirectUpload(
    input: StreamDirectUploadRequest,
  ): Promise<StreamDirectUploadResult> {
    const { accountId, apiToken } = requireStreamConfig();
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          'Upload-Creator': input.creatorId,
        },
        body: JSON.stringify({
          maxDurationSeconds: input.maxDurationSeconds,
          meta: input.metadata,
        }),
      },
    );

    return parseApiResponse<StreamDirectUploadResult>(response);
  }

  resolvePlaybackUrl(uid: string): string | null {
    const subdomain = publicEnv.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;
    if (!subdomain) {
      return null;
    }

    return `https://${subdomain}/${uid}/manifest/video.m3u8`;
  }

  mapWebhookPayload(payload: StreamVideoWebhookPayload) {
    return {
      providerAssetId: payload.uid,
      previewUrl: payload.preview || null,
      thumbnailUrl: payload.thumbnail || null,
      playbackUrl: this.resolvePlaybackUrl(payload.uid),
      statusState: payload.status?.state || null,
      errorCode: payload.status?.errorReasonCode || null,
      errorMessage: payload.status?.errorReasonText || null,
      readyToStream: Boolean(payload.readyToStream),
    };
  }
}
