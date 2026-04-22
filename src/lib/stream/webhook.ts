import { createHmac, timingSafeEqual } from 'node:crypto';

export type StreamWebhookTerminalState = 'READY' | 'FAILED' | 'PROCESSING';

export function verifyStreamWebhookSignature(input: {
  secret: string | null | undefined;
  signatureHeader: string | null;
  body: string;
  now?: number;
}) {
  if (!input.secret || !input.signatureHeader) {
    return false;
  }

  const parts = Object.fromEntries(
    input.signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=');
      return [key, value];
    }),
  );

  const timestamp = parts.time;
  const receivedSignature = parts.sig1;

  if (!timestamp || !receivedSignature) {
    return false;
  }

  const requestTime = Number(timestamp);
  if (!Number.isFinite(requestTime)) {
    return false;
  }

  const currentEpoch = Math.floor((input.now ?? Date.now()) / 1000);
  if (Math.abs(currentEpoch - requestTime) > 60 * 5) {
    return false;
  }

  const source = `${timestamp}.${input.body}`;
  const expectedSignature = createHmac('sha256', input.secret).update(source).digest('hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(receivedSignature, 'hex');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function classifyStreamWebhookState(input: {
  readyToStream?: boolean | null;
  statusState?: string | null;
}): StreamWebhookTerminalState {
  const normalizedState = input.statusState?.toLowerCase() || null;

  if (input.readyToStream || normalizedState === 'ready') {
    return 'READY';
  }

  if (normalizedState === 'error') {
    return 'FAILED';
  }

  return 'PROCESSING';
}
