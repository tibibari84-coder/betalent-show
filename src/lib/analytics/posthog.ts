import 'server-only';

import { env } from '@/lib/env';
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

export async function trackEvent(
  event: PostHogEventName,
  properties?: Record<string, unknown>,
) {
  try {
    const client = await getServerClient();
    if (!client) {
      return;
    }

    await client.capture({
      event,
      distinctId:
        typeof properties?.distinctId === 'string' ? properties.distinctId : 'server',
      properties: properties || {},
    });
  } catch (error) {
    console.error('PostHog capture failed.', error);
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

    await client.identify({ distinctId, properties: properties || {} });
  } catch (error) {
    console.error('PostHog identify failed.', error);
  }
}

export { POSTHOG_EVENTS };
