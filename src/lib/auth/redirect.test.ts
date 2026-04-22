import test from 'node:test';
import assert from 'node:assert/strict';

import { resolvePostAuthRedirect, sanitizeRedirectPath } from './redirect';
import { hashSessionToken } from '../../server/auth/tokens';

test('auth/session smoke: redirect sanitization stays on current product routes', () => {
  assert.equal(sanitizeRedirectPath('https://evil.example'), '/app');
  assert.equal(sanitizeRedirectPath('/login'), '/app');
  assert.equal(sanitizeRedirectPath('/register'), '/app');
  assert.equal(sanitizeRedirectPath('/app/submissions'), '/app/submissions');
});

test('auth/session smoke: unfinished onboarding always returns to welcome', () => {
  assert.equal(resolvePostAuthRedirect({ onboardingCompletedAt: null }, '/app/submissions'), '/welcome');
  assert.equal(
    resolvePostAuthRedirect({ onboardingCompletedAt: new Date('2026-04-21T00:00:00.000Z') }, '/app/submissions'),
    '/app/submissions',
  );
});

test('auth/session smoke: session tokens are hashed deterministically', () => {
  assert.equal(hashSessionToken('token-123'), hashSessionToken('token-123'));
  assert.notEqual(hashSessionToken('token-123'), 'token-123');
});
