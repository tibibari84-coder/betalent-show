import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

import { classifyStreamWebhookState, verifyStreamWebhookSignature } from './webhook';

test('Cloudflare Stream webhook verification accepts a valid signature', () => {
  const secret = 'stream-secret';
  const timestamp = '1713657600';
  const body = JSON.stringify({ uid: 'video_1' });
  const sig = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');

  const valid = verifyStreamWebhookSignature({
    secret,
    signatureHeader: `time=${timestamp},sig1=${sig}`,
    body,
    now: 1713657600 * 1000,
  });

  assert.equal(valid, true);
});

test('Cloudflare Stream webhook verification rejects stale or malformed signatures', () => {
  const body = JSON.stringify({ uid: 'video_1' });

  assert.equal(
    verifyStreamWebhookSignature({
      secret: 'stream-secret',
      signatureHeader: 'time=1713657600,sig1=deadbeef',
      body,
      now: 1713657600 * 1000,
    }),
    false,
  );

  assert.equal(
    verifyStreamWebhookSignature({
      secret: 'stream-secret',
      signatureHeader: null,
      body,
      now: 1713657600 * 1000,
    }),
    false,
  );
});

test('Cloudflare Stream webhook classification keeps READY / FAILED / PROCESSING explicit', () => {
  assert.equal(classifyStreamWebhookState({ readyToStream: true, statusState: 'ready' }), 'READY');
  assert.equal(classifyStreamWebhookState({ statusState: 'error' }), 'FAILED');
  assert.equal(classifyStreamWebhookState({ statusState: 'inprogress' }), 'PROCESSING');
});
