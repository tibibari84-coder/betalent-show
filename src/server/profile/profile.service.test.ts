import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ProfileValidationError,
  saveCreatorProfileWithDeps,
} from './profile-logic';

test('onboarding/profile save baseline: user and creator profile save through one transaction', async () => {
  const calls: string[] = [];

  const result = await saveCreatorProfileWithDeps(
    {
      db: {
        async $transaction(callback) {
          calls.push('transaction:start');
          const value = await callback({
            user: {
              async findUnique() {
                calls.push('user:findUnique');
                return {
                  id: 'user_1',
                  email: 'creator@example.com',
                  role: 'CREATOR',
                  onboardingCompletedAt: new Date('2026-04-20T00:00:00.000Z'),
                  avatarUrl: 'https://cdn.example/avatar/user_1/old.png',
                };
              },
              async update(args: {
                data: {
                  displayName: string;
                  username: string;
                  city: string;
                  country: string;
                  avatarUrl: string | null;
                };
              }) {
                calls.push('user:update');
                return {
                  id: 'user_1',
                  email: 'creator@example.com',
                  username: args.data.username,
                  displayName: args.data.displayName,
                  role: 'CREATOR',
                  city: args.data.city,
                  country: args.data.country,
                  avatarUrl: args.data.avatarUrl,
                  creatorProfile: null,
                };
              },
            },
            creatorProfile: {
              async upsert(args: { update: { bio: string | null; website: string | null } }) {
                calls.push('creatorProfile:upsert');
                return {
                  id: 'cp_1',
                  bio: args.update.bio,
                  website: args.update.website,
                };
              },
            },
          });
          calls.push('transaction:end');
          return value;
        },
      },
      async identifyUser() {
        calls.push('identify');
      },
      async trackEvent() {
        calls.push('track');
      },
      async deleteR2ObjectForUser() {
        calls.push('delete:old-avatar');
        return true;
      },
      captureMessage() {
        calls.push('capture');
      },
      getR2ConfigState() {
        return { enabled: true };
      },
      buildR2AssetUrl(key) {
        return `https://cdn.example/${key}`;
      },
      creatorProfileCompletedEvent: 'creator_profile_completed',
    },
    'user_1',
    {
      displayName: 'Tibor',
      username: 'TiborOfficial',
      city: 'Toronto',
      country: 'Canada',
      bio: 'Creator bio',
      website: 'https://example.com',
      avatarUrl: null,
      avatarUploadKey: null,
    },
  );

  assert.equal(result.user.username, 'tiborofficial');
  assert.equal(result.creatorProfile.bio, 'Creator bio');
  assert.deepEqual(calls, [
    'transaction:start',
    'user:findUnique',
    'user:update',
    'creatorProfile:upsert',
    'transaction:end',
    'delete:old-avatar',
    'identify',
    'track',
    'capture',
  ]);
});

test('onboarding/profile save baseline: invalid avatar upload ownership fails cleanly', async () => {
  await assert.rejects(
    saveCreatorProfileWithDeps(
      {
        db: {
          async $transaction(callback) {
            return callback({
              user: {
                async findUnique() {
                  return {
                    id: 'user_1',
                    email: 'creator@example.com',
                    role: 'CREATOR',
                    onboardingCompletedAt: new Date('2026-04-20T00:00:00.000Z'),
                    avatarUrl: null,
                  };
                },
                async update() {
                  throw new Error('should not reach update');
                },
              },
              creatorProfile: {
                async upsert() {
                  throw new Error('should not reach upsert');
                },
              },
            });
          },
        },
        async identifyUser() {},
        async trackEvent() {},
        async deleteR2ObjectForUser() {
          return false;
        },
        captureMessage() {},
        getR2ConfigState() {
          return { enabled: true };
        },
        buildR2AssetUrl(key) {
          return `https://cdn.example/${key}`;
        },
        creatorProfileCompletedEvent: 'creator_profile_completed',
      },
      'user_1',
      {
        displayName: 'Tibor',
        username: 'TiborOfficial',
        city: 'Toronto',
        country: 'Canada',
        avatarUrl: 'https://cdn.example/avatar/user_2/not-owned.png',
        avatarUploadKey: 'avatar/user_2/not-owned.png',
      },
    ),
    (error) => error instanceof ProfileValidationError,
  );
});
