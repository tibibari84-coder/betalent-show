import { Prisma } from '@prisma/client';

import { POSTHOG_EVENTS, identifyUser, trackEvent } from '@/lib/analytics/posthog';
import { buildR2AssetUrl, deleteR2ObjectForUser, getR2ConfigState } from '@/lib/r2';
import { captureMessage } from '@/lib/sentry';
import { prisma } from '@/server/db/prisma';

import {
  ProfileValidationError,
  saveCreatorProfileWithDeps,
  type SaveCreatorProfileInput,
} from './profile-logic';

export { ProfileValidationError } from './profile-logic';
export type { SaveCreatorProfileInput } from './profile-logic';

export async function saveCreatorProfileTransaction(userId: string, input: SaveCreatorProfileInput) {
  try {
    return await saveCreatorProfileWithDeps(
      {
        db: prisma as unknown as {
          $transaction: <T>(callback: (tx: import('./profile-logic').ProfileTransactionClient) => Promise<T>) => Promise<T>;
        },
        identifyUser,
        trackEvent: trackEvent as (event: unknown, properties?: Record<string, unknown>) => Promise<void>,
        deleteR2ObjectForUser,
        captureMessage: captureMessage as (message: string, level: unknown, payload?: Record<string, unknown>) => void,
        getR2ConfigState,
        buildR2AssetUrl,
        creatorProfileCompletedEvent: POSTHOG_EVENTS.creator_profile_completed,
      },
      userId,
      input,
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ProfileValidationError('That username is already taken.', {
        username: 'That username is already taken.',
      });
    }

    throw error;
  }
}
