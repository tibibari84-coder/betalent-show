import { UserRole } from '@prisma/client';

import {
  normalizeUsername,
  validateCity,
  validateCountry,
  validateDisplayName,
  validateUsername,
} from '@/server/onboarding/validators';

export type SaveCreatorProfileInput = {
  displayName: string;
  username: string;
  city: string;
  country: string;
  bio?: string;
  website?: string;
  avatarUrl?: string | null;
  avatarUploadKey?: string | null;
};

export type SaveCreatorProfileFieldErrors = {
  displayName?: string;
  username?: string;
  city?: string;
  country?: string;
};

export type ProfileTransactionClient = {
  user: {
    findUnique(args: unknown): Promise<{
      id: string;
      email: string;
      role: UserRole;
      onboardingCompletedAt: Date | null;
      avatarUrl: string | null;
    } | null>;
    update(args: {
      where: { id: string };
      data: {
        displayName: string;
        username: string;
        city: string;
        country: string;
        avatarUrl: string | null;
        role: UserRole;
        creatorProfile?: {
          upsert: {
            create: Record<string, never>;
            update: Record<string, never>;
          };
        };
      };
      select: unknown;
    }): Promise<{
      id: string;
      email: string;
      username: string | null;
      displayName: string | null;
      role: UserRole;
      city: string | null;
      country: string | null;
      avatarUrl: string | null;
      creatorProfile: unknown;
    }>;
  };
  creatorProfile: {
    upsert(args: {
      where: { userId: string };
      update: {
        bio: string | null;
        website: string | null;
      };
      create: {
        userId: string;
        bio: string | null;
        website: string | null;
      };
    }): Promise<{
      id: string;
      bio: string | null;
      website: string | null;
    }>;
  };
};

type SaveProfileDeps = {
  db: {
    $transaction: <T>(callback: (tx: ProfileTransactionClient) => Promise<T>) => Promise<T>;
  };
  identifyUser: (distinctId: string, properties?: Record<string, unknown>) => Promise<void>;
  trackEvent: (event: unknown, properties?: Record<string, unknown>) => Promise<void>;
  deleteR2ObjectForUser: (input: {
    userId: string;
    purpose: 'avatar';
    assetUrl: string;
  }) => Promise<boolean>;
  captureMessage: (message: string, level: unknown, payload?: Record<string, unknown>) => void;
  getR2ConfigState: (purpose: 'avatar') => {
    enabled: boolean;
  };
  buildR2AssetUrl: (key: string) => string;
  creatorProfileCompletedEvent: string;
};

export class ProfileValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors?: SaveCreatorProfileFieldErrors,
  ) {
    super(message);
    this.name = 'ProfileValidationError';
  }
}

export function validateProfileInput(input: SaveCreatorProfileInput): SaveCreatorProfileFieldErrors {
  return {
    displayName: validateDisplayName(input.displayName),
    username: validateUsername(input.username),
    city: validateCity(input.city),
    country: validateCountry(input.country),
  };
}

function nextRoleForProfile(currentRole: UserRole, onboardingCompletedAt: Date | null) {
  return onboardingCompletedAt && currentRole === UserRole.USER ? UserRole.CREATOR : currentRole;
}

function resolveAvatarPersistence(
  deps: Pick<SaveProfileDeps, 'buildR2AssetUrl' | 'getR2ConfigState'>,
  input: {
    userId: string;
    currentAvatarUrl: string | null;
    avatarUrl?: string | null;
    avatarUploadKey?: string | null;
  },
) {
  const nextAvatarUrl = input.avatarUrl?.trim() || null;

  if (!nextAvatarUrl) {
    return null;
  }

  if (nextAvatarUrl === input.currentAvatarUrl) {
    return nextAvatarUrl;
  }

  if (!input.avatarUploadKey) {
    throw new ProfileValidationError('Save the uploaded BETALENT avatar through a valid upload key.');
  }

  if (!input.avatarUploadKey.startsWith(`avatar/${input.userId}/`)) {
    throw new ProfileValidationError('Avatar upload ownership could not be verified.');
  }

  const config = deps.getR2ConfigState('avatar');
  if (!config.enabled) {
    throw new ProfileValidationError('Avatar storage is not configured in this environment.');
  }

  const expectedAvatarUrl = deps.buildR2AssetUrl(input.avatarUploadKey);
  if (expectedAvatarUrl !== nextAvatarUrl) {
    throw new ProfileValidationError('Avatar upload URL does not match the signed BETALENT upload key.');
  }

  return nextAvatarUrl;
}

export async function saveCreatorProfileWithDeps(
  deps: SaveProfileDeps,
  userId: string,
  input: SaveCreatorProfileInput,
) {
  const fieldErrors = validateProfileInput(input);
  if (fieldErrors.displayName || fieldErrors.username || fieldErrors.city || fieldErrors.country) {
    throw new ProfileValidationError('Invalid profile payload.', fieldErrors);
  }

  const displayName = input.displayName.trim();
  const username = normalizeUsername(input.username);
  const city = input.city.trim();
  const country = input.country.trim();
  const bio = input.bio?.trim() || null;
  const website = input.website?.trim() || null;

  const result = await deps.db.$transaction(async (tx) => {
    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        onboardingCompletedAt: true,
        avatarUrl: true,
      },
    });

    if (!currentUser) {
      throw new Error('User not found.');
    }

    const avatarUrl = resolveAvatarPersistence(deps, {
      userId,
      currentAvatarUrl: currentUser.avatarUrl,
      avatarUrl: input.avatarUrl,
      avatarUploadKey: input.avatarUploadKey,
    });
    const nextRole = nextRoleForProfile(currentUser.role, currentUser.onboardingCompletedAt);

    const user = await tx.user.update({
      where: { id: userId },
      data: {
        displayName,
        username,
        city,
        country,
        avatarUrl,
        role: nextRole,
        creatorProfile: currentUser.onboardingCompletedAt
          ? {
              upsert: {
                create: {},
                update: {},
              },
            }
          : undefined,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        city: true,
        country: true,
        avatarUrl: true,
        creatorProfile: true,
      },
    });

    const creatorProfile = await tx.creatorProfile.upsert({
      where: { userId },
      update: {
        bio,
        website,
      },
      create: {
        userId,
        bio,
        website,
      },
    });

    return {
      user,
      creatorProfile,
      previousAvatarUrl: currentUser.avatarUrl,
    };
  });

  if (result.previousAvatarUrl && result.previousAvatarUrl !== result.user.avatarUrl) {
    await deps.deleteR2ObjectForUser({
      userId,
      purpose: 'avatar',
      assetUrl: result.previousAvatarUrl,
    });
  }

  await deps.identifyUser(result.user.id, {
    email: result.user.email,
    username: result.user.username,
    displayName: result.user.displayName,
    role: result.user.role,
    city: result.user.city,
    country: result.user.country,
  });
  await deps.trackEvent(deps.creatorProfileCompletedEvent, {
    distinctId: result.user.id,
    creatorProfileId: result.creatorProfile.id,
    hasAvatar: Boolean(result.user.avatarUrl),
  });

  deps.captureMessage('Creator profile transaction saved.', 'info', {
    userId: result.user.id,
    creatorProfileId: result.creatorProfile.id,
    hasAvatar: Boolean(result.user.avatarUrl),
    hasBio: Boolean(result.creatorProfile.bio),
  });

  return result;
}
