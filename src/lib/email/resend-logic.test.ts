import test from 'node:test';
import assert from 'node:assert/strict';

import { sendEmailWithDeps } from './resend-logic';

test('Resend wrapper skips explicitly when provider config is missing', async () => {
  const result = await sendEmailWithDeps(
    {
      providerEnabled: false,
      defaultFrom: null,
      async send() {
        throw new Error('should not send');
      },
      onError() {},
    },
    {
      to: 'creator@example.com',
      subject: 'Hello',
      html: '<p>Hello</p>',
      tag: 'welcome',
    },
  );

  assert.deepEqual(result, {
    ok: false,
    skipped: true,
    reason: 'Resend is not configured for this environment.',
  });
});

test('Resend wrapper returns a real upstream id on success and explicit failure on error', async () => {
  const sent = await sendEmailWithDeps(
    {
      providerEnabled: true,
      defaultFrom: 'BETALENT <no-reply@example.com>',
      async send() {
        return { data: { id: 'email_123' } };
      },
      onError() {},
    },
    {
      to: 'creator@example.com',
      subject: 'Hello',
      html: '<p>Hello</p>',
      tag: 'welcome',
    },
  );

  let capturedError: string | null = null;
  const failed = await sendEmailWithDeps(
    {
      providerEnabled: true,
      defaultFrom: 'BETALENT <no-reply@example.com>',
      async send() {
        throw new Error('Resend API unavailable');
      },
      onError(error) {
        capturedError = error instanceof Error ? error.message : 'unknown';
      },
    },
    {
      to: 'creator@example.com',
      subject: 'Hello',
      html: '<p>Hello</p>',
      tag: 'welcome',
    },
  );

  assert.deepEqual(sent, {
    ok: true,
    skipped: false,
    id: 'email_123',
  });
  assert.equal(capturedError, 'Resend API unavailable');
  assert.deepEqual(failed, {
    ok: false,
    skipped: false,
    reason: 'Resend API unavailable',
  });
});
