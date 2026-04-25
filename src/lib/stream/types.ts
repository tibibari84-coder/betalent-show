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
