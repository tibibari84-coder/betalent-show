export type StreamDirectUploadRequest = {
  creatorId: string;
  maxDurationSeconds: number;
  metadata: Record<string, string>;
};

export type StreamDirectUploadResult = {
  uid: string;
  uploadURL: string;
};

export type StreamVideoStatus = {
  state?: string | null;
  pctComplete?: string | null;
  errorReasonCode?: string | null;
  errorReasonText?: string | null;
};

export type StreamVideoWebhookPayload = {
  uid: string;
  creator?: string | null;
  readyToStream?: boolean | null;
  preview?: string | null;
  thumbnail?: string | null;
  status?: StreamVideoStatus | null;
  meta?: Record<string, unknown> | null;
};
