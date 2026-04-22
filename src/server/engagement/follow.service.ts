import 'server-only';

import { prisma } from '@/server/db/prisma';

export type CreatorFollowState = {
  creatorId: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
};

async function ensureUserStatRow(userId: string) {
  await prisma.userEngagementStat.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

async function assertCreatorFollowTarget(creatorId: string) {
  const creator = await prisma.user.findUnique({
    where: { id: creatorId },
    select: {
      id: true,
      creatorProfile: { select: { id: true } },
      onboardingCompletedAt: true,
    },
  });

  if (!creator || !creator.creatorProfile || !creator.onboardingCompletedAt) {
    throw new Error('Creator follow target is not available.');
  }
}

export class FollowService {
  static async getUserEngagementCounts(userId: string) {
    await ensureUserStatRow(userId);
    const stat = await prisma.userEngagementStat.findUnique({
      where: { userId },
      select: { followerCount: true, followingCount: true },
    });

    return {
      followerCount: stat?.followerCount ?? 0,
      followingCount: stat?.followingCount ?? 0,
    };
  }

  static async followCreator(input: { followerUserId: string; creatorId: string }) {
    if (input.followerUserId === input.creatorId) {
      throw new Error('You cannot follow yourself.');
    }

    await assertCreatorFollowTarget(input.creatorId);

    await prisma.$transaction(async (tx) => {
      await tx.userEngagementStat.upsert({
        where: { userId: input.followerUserId },
        create: { userId: input.followerUserId },
        update: {},
      });
      await tx.userEngagementStat.upsert({
        where: { userId: input.creatorId },
        create: { userId: input.creatorId },
        update: {},
      });

      const created = await tx.creatorFollow.createMany({
        data: [{ followerId: input.followerUserId, creatorId: input.creatorId }],
        skipDuplicates: true,
      });

      if (created.count > 0) {
        await tx.userEngagementStat.update({
          where: { userId: input.creatorId },
          data: { followerCount: { increment: 1 } },
        });
        await tx.userEngagementStat.update({
          where: { userId: input.followerUserId },
          data: { followingCount: { increment: 1 } },
        });
      }
    });
  }

  static async unfollowCreator(input: { followerUserId: string; creatorId: string }) {
    await prisma.$transaction(async (tx) => {
      await tx.userEngagementStat.upsert({
        where: { userId: input.followerUserId },
        create: { userId: input.followerUserId },
        update: {},
      });
      await tx.userEngagementStat.upsert({
        where: { userId: input.creatorId },
        create: { userId: input.creatorId },
        update: {},
      });

      const deleted = await tx.creatorFollow.deleteMany({
        where: { followerId: input.followerUserId, creatorId: input.creatorId },
      });

      if (deleted.count > 0) {
        await tx.userEngagementStat.updateMany({
          where: { userId: input.creatorId, followerCount: { gt: 0 } },
          data: { followerCount: { decrement: 1 } },
        });
        await tx.userEngagementStat.updateMany({
          where: { userId: input.followerUserId, followingCount: { gt: 0 } },
          data: { followingCount: { decrement: 1 } },
        });
      }
    });
  }

  static async getCreatorFollowState(input: {
    creatorId: string;
    currentUserId?: string | null;
  }): Promise<CreatorFollowState> {
    await ensureUserStatRow(input.creatorId);

    const [creatorStat, currentStat, followRow] = await Promise.all([
      prisma.userEngagementStat.findUnique({
        where: { userId: input.creatorId },
        select: { followerCount: true },
      }),
      input.currentUserId
        ? prisma.userEngagementStat.findUnique({
            where: { userId: input.currentUserId },
            select: { followingCount: true },
          })
        : Promise.resolve(null),
      input.currentUserId
        ? prisma.creatorFollow.findUnique({
            where: {
              followerId_creatorId: {
                followerId: input.currentUserId,
                creatorId: input.creatorId,
              },
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    return {
      creatorId: input.creatorId,
      followerCount: creatorStat?.followerCount ?? 0,
      followingCount: currentStat?.followingCount ?? 0,
      isFollowing: Boolean(followRow),
    };
  }
}
