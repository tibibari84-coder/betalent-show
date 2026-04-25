import 'server-only';

import type { StreamVideoWebhookPayload } from './types';

export class CloudflareStreamAdapter {
  mapWebhookPayload(payload: StreamVideoWebhookPayload) {
    return {
      providerAssetId: payload.uid,
      previewUrl: payload.preview || null,
      thumbnailUrl: payload.thumbnail || null,
      playbackUrl: null,
      statusState: payload.status?.state || null,
      errorCode: payload.status?.errorReasonCode || null,
      errorMessage: payload.status?.errorReasonText || null,
      readyToStream: Boolean(payload.readyToStream),
    };
  }
}
