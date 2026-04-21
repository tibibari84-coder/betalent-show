import 'server-only';

import * as Sentry from '@sentry/nextjs';

import { env } from '@/lib/env';

export const sentryEnabled = Boolean(env.SENTRY_DSN || env.NEXT_PUBLIC_SENTRY_DSN);

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!sentryEnabled) {
    console.error(error, context);
    return;
  }

  Sentry.captureException(error, { extra: context });
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>,
) {
  if (!sentryEnabled) {
    console.log(message, level, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

export function setUserContext(user: { id: string; email?: string; username?: string }) {
  if (!sentryEnabled) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}
