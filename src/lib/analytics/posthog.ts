import 'server-only';

import { env } from '@/lib/env';
import { captureMessage } from '@/lib/sentry';
import { POSTHOG_EVENTS, type PostHogEventName } from './events';

import type { PostHog as PostHogNodeClient } from 'posthog-node';

const serverClientCache: { client: PostHogNodeClient | null } = {
  client: null,
};

const posthogServerEnabled = Boolean(env.POSTHOG_API_KEY);

async function getServerClient(): Promise<PostHogNodeClient | null> {
  if (!posthogServerEnabled) {
    return null;
  }

  if (!serverClientCache.client) {
    const { PostHog } = await import('posthog-node');
    serverClientCache.client = new PostHog(env.POSTHOG_API_KEY as string, {
      host: env.POSTHOG_HOST || 'https://app.posthog.com',
    });
  }

  return serverClientCache.client;
}

export const posthogEnabled = posthogServerEnabled;

function sanitizeProperties(properties?: Record<string, unknown>) {
  if (!properties) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}

export async function trackEvent(
  event: PostHogEventName,
  properties?: Record<string, unknown>,
) {
  try {
    const client = await getServerClient();
    if (!client) {
      return;
    }

    const safeProperties = sanitizeProperties(properties);
    const distinctId =
      typeof safeProperties.distinctId === 'string' ? safeProperties.distinctId : 'server';
    const eventProperties = { ...safeProperties };
    delete eventProperties.distinctId;

    await client.capture({
      event,
      distinctId,
      properties: eventProperties,
    });
  } catch (error) {
    console.error('PostHog capture failed.', error);
    captureMessage('PostHog capture failed.', 'warning', {
      event,
      error: error instanceof Error ? error.message : 'unknown',
    });
  }
}

export async function identifyUser(
  distinctId: string,
  properties?: Record<string, unknown>,
) {
  try {
    const client = await getServerClient();
    if (!client) {
      return;
    }

    await client.identify({ distinctId, properties: sanitizeProperties(properties) });
  } catch (error) {
    console.error('PostHog identify failed.', error);
    captureMessage('PostHog identify failed.', 'warning', {
      distinctId,
      error: error instanceof Error ? error.message : 'unknown',
    });
  }
}

export { POSTHOG_EVENTS };
