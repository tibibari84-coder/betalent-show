import 'server-only';

import { prisma } from '@/server/db/prisma';
import { isDiscoveryEligibleSubmission } from './eligibility';

type DiscoveryRankSignals = {
  recencyScore: number;
  engagementScore: number;
  creatorQualityScore: number;
  editorialPriorityScore: number;
};

export type DiscoveryFeedItem = {
  submissionId: string;
  title: string;
  description: string | null;
  createdAt: Date;
  creator: {
    id: string;
    name: string;
    username: string | null;
    avatarUrl: string | null;
    followerCount: number;
    isFollowedByCurrentUser: boolean;
  };
  media: {
    playbackUrl: string | null;
    previewUrl: string | null;
    thumbnailUrl: string | null;
    mimeType: string;
  };
  engagement: {
    likeCount: number;
    viewCount: number;
    likedByCurrentUser: boolean;
  };
  ranking: DiscoveryRankSignals;
};

export type PublicContentDestination = {
  submissionId: string;
  title: string;
  description: string | null;
  createdAt: Date;
  creator: {
    id: string;
    name: string;
    username: string | null;
    avatarUrl: string | null;
    bio: string | null;
    city: string | null;
    country: string | null;
    followerCount: number;
    isFollowedByCurrentUser: boolean;
  };
  media: {
    playbackUrl: string | null;
    previewUrl: string | null;
    thumbnailUrl: string | null;
    mimeType: string;
  };
  engagement: {
    likeCount: number;
    viewCount: number;
    likedByCurrentUser: boolean;
  };
};

export type PublicCreatorDestination = {
  creator: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    city: string | null;
    country: string | null;
    followerCount: number;
    followingCount: number;
    isFollowedByCurrentUser: boolean;
  };
  items: PublicContentDestination[];
};

function ageInDays(createdAt: Date) {
  const now = Date.now();
  return Math.max(0, (now - createdAt.getTime()) / (1000 * 60 * 60 * 24));
}

function recencyScore(createdAt: Date) {
  const days = ageInDays(createdAt);
  return 1 / (1 + days);
}

function engagementScore(likeCount: number, viewCount: number) {
  return likeCount * 3 + viewCount;
}

function creatorQualityScore(input: { hasAvatar: boolean; hasBio: boolean; hasDisplayName: boolean }) {
  let score = 0;
  if (input.hasAvatar) score += 1;
  if (input.hasBio) score += 1;
  if (input.hasDisplayName) score += 1;
  return score;
}

function totalRank(input: DiscoveryRankSignals) {
  return input.recencyScore * 0.45 + input.engagementScore * 0.35 + input.creatorQualityScore * 0.2 + input.editorialPriorityScore;
}

export class DiscoveryService {
  static async getDiscoveryFeed(currentUserId: string): Promise<DiscoveryFeedItem[]> {
    const rows = await prisma.submission.findMany({
      where: {
        status: 'ACCEPTED',
        videoAsset: { status: 'READY' },
        user: {
          username: { not: null },
          onboardingCompletedAt: { not: null },
          creatorProfile: { isNot: null },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        status: true,
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            onboardingCompletedAt: true,
            creatorProfile: {
              select: { id: true, bio: true },
            },
          },
        },
        videoAsset: {
          select: {
            status: true,
            playbackUrl: true,
            previewUrl: true,
            thumbnailUrl: true,
            mimeType: true,
          },
        },
      },
      take: 48,
      orderBy: [{ createdAt: 'desc' }],
    });

    const filtered = rows.filter((row) =>
      isDiscoveryEligibleSubmission({
        submissionStatus: row.status,
        videoAssetStatus: row.videoAsset.status,
        creatorOnboarded: Boolean(row.user.onboardingCompletedAt),
        hasCreatorProfile: Boolean(row.user.creatorProfile),
      }),
    );

    const submissionIds = filtered.map((row) => row.id);
    const creatorIds = Array.from(new Set(filtered.map((row) => row.user.id)));

    const [submissionStats, likedRows, creatorStats, followRows] = await Promise.all([
      prisma.submissionEngagementStat.findMany({
        where: { submissionId: { in: submissionIds } },
        select: { submissionId: true, likeCount: true, viewCount: true },
      }),
      prisma.submissionLike.findMany({
        where: { userId: currentUserId, submissionId: { in: submissionIds } },
        select: { submissionId: true },
      }),
      prisma.userEngagementStat.findMany({
        where: { userId: { in: creatorIds } },
        select: { userId: true, followerCount: true },
      }),
      prisma.creatorFollow.findMany({
        where: { followerId: currentUserId, creatorId: { in: creatorIds } },
        select: { creatorId: true },
      }),
    ]);

    const submissionStatMap = new Map(submissionStats.map((row) => [row.submissionId, row]));
    const likedSet = new Set(likedRows.map((row) => row.submissionId));
    const creatorFollowerMap = new Map(creatorStats.map((row) => [row.userId, row.followerCount]));
    const followedSet = new Set(followRows.map((row) => row.creatorId));

    const items = filtered.map<DiscoveryFeedItem>((row) => {
      const submissionStat = submissionStatMap.get(row.id);
      const likeCount = submissionStat?.likeCount ?? 0;
      const viewCount = submissionStat?.viewCount ?? 0;

      const ranking: DiscoveryRankSignals = {
        recencyScore: recencyScore(row.createdAt),
        engagementScore: engagementScore(likeCount, viewCount),
        creatorQualityScore: creatorQualityScore({
          hasAvatar: Boolean(row.user.avatarUrl),
          hasBio: Boolean(row.user.creatorProfile?.bio),
          hasDisplayName: Boolean(row.user.displayName),
        }),
        editorialPriorityScore: 0,
      };

      return {
        submissionId: row.id,
        title: row.title,
        description: row.description,
        createdAt: row.createdAt,
        creator: {
          id: row.user.id,
          name: row.user.displayName || row.user.username || 'Creator',
          username: row.user.username,
          avatarUrl: row.user.avatarUrl,
          followerCount: creatorFollowerMap.get(row.user.id) ?? 0,
          isFollowedByCurrentUser: followedSet.has(row.user.id),
        },
        media: {
          playbackUrl: row.videoAsset.playbackUrl,
          previewUrl: row.videoAsset.previewUrl,
          thumbnailUrl: row.videoAsset.thumbnailUrl,
          mimeType: row.videoAsset.mimeType,
        },
        engagement: {
          likeCount,
          viewCount,
          likedByCurrentUser: likedSet.has(row.id),
        },
        ranking,
      };
    });

    return items.sort((a, b) => totalRank(b.ranking) - totalRank(a.ranking));
  }

  static async getPublicContentBySubmissionId(
    submissionId: string,
    currentUserId?: string | null,
  ): Promise<PublicContentDestination | null> {
    const row = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        status: 'ACCEPTED',
        videoAsset: { status: 'READY' },
        user: {
          onboardingCompletedAt: { not: null },
          creatorProfile: { isNot: null },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            city: true,
            country: true,
            creatorProfile: { select: { bio: true } },
          },
        },
        videoAsset: {
          select: {
            playbackUrl: true,
            previewUrl: true,
            thumbnailUrl: true,
            mimeType: true,
          },
        },
      },
    });

    if (!row || !row.user.username) {
      return null;
    }

    const [submissionStat, creatorStat, likedRow, followRow] = await Promise.all([
      prisma.submissionEngagementStat.findUnique({
        where: { submissionId: row.id },
        select: { likeCount: true, viewCount: true },
      }),
      prisma.userEngagementStat.findUnique({
        where: { userId: row.user.id },
        select: { followerCount: true },
      }),
      currentUserId
        ? prisma.submissionLike.findUnique({
            where: { submissionId_userId: { submissionId: row.id, userId: currentUserId } },
            select: { id: true },
          })
        : Promise.resolve(null),
      currentUserId
        ? prisma.creatorFollow.findUnique({
            where: { followerId_creatorId: { followerId: currentUserId, creatorId: row.user.id } },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    return {
      submissionId: row.id,
      title: row.title,
      description: row.description,
      createdAt: row.createdAt,
      creator: {
        id: row.user.id,
        name: row.user.displayName || row.user.username || 'Creator',
        username: row.user.username,
        avatarUrl: row.user.avatarUrl,
        bio: row.user.creatorProfile?.bio || null,
        city: row.user.city,
        country: row.user.country,
        followerCount: creatorStat?.followerCount ?? 0,
        isFollowedByCurrentUser: Boolean(followRow),
      },
      media: {
        playbackUrl: row.videoAsset.playbackUrl,
        previewUrl: row.videoAsset.previewUrl,
        thumbnailUrl: row.videoAsset.thumbnailUrl,
        mimeType: row.videoAsset.mimeType,
      },
      engagement: {
        likeCount: submissionStat?.likeCount ?? 0,
        viewCount: submissionStat?.viewCount ?? 0,
        likedByCurrentUser: Boolean(likedRow),
      },
    };
  }

  static async getPublicCreatorByUsername(
    username: string,
    currentUserId?: string | null,
  ): Promise<PublicCreatorDestination | null> {
    const creator = await prisma.user.findFirst({
      where: {
        username,
        onboardingCompletedAt: { not: null },
        creatorProfile: { isNot: null },
      },
      select: {
        id: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        city: true,
        country: true,
        creatorProfile: { select: { bio: true } },
      },
    });

    if (!creator || !creator.username) {
      return null;
    }

    const submissions = await prisma.submission.findMany({
      where: {
        userId: creator.id,
        status: 'ACCEPTED',
        videoAsset: { status: 'READY' },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        videoAsset: {
          select: {
            playbackUrl: true,
            previewUrl: true,
            thumbnailUrl: true,
            mimeType: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 24,
    });

    const submissionIds = submissions.map((row) => row.id);
    const [creatorStat, followRow, submissionStats, likedRows] = await Promise.all([
      prisma.userEngagementStat.findUnique({
        where: { userId: creator.id },
        select: { followerCount: true, followingCount: true },
      }),
      currentUserId
        ? prisma.creatorFollow.findUnique({
            where: { followerId_creatorId: { followerId: currentUserId, creatorId: creator.id } },
            select: { id: true },
          })
        : Promise.resolve(null),
      prisma.submissionEngagementStat.findMany({
        where: { submissionId: { in: submissionIds } },
        select: { submissionId: true, likeCount: true, viewCount: true },
      }),
      currentUserId
        ? prisma.submissionLike.findMany({
            where: { submissionId: { in: submissionIds }, userId: currentUserId },
            select: { submissionId: true },
          })
        : Promise.resolve([]),
    ]);

    const statMap = new Map(submissionStats.map((row) => [row.submissionId, row]));
    const likedSet = new Set(likedRows.map((row) => row.submissionId));

    return {
      creator: {
        id: creator.id,
        name: creator.displayName || creator.username || 'Creator',
        username: creator.username,
        avatarUrl: creator.avatarUrl,
        bio: creator.creatorProfile?.bio || null,
        city: creator.city,
        country: creator.country,
        followerCount: creatorStat?.followerCount ?? 0,
        followingCount: creatorStat?.followingCount ?? 0,
        isFollowedByCurrentUser: Boolean(followRow),
      },
      items: submissions.map((row) => ({
        submissionId: row.id,
        title: row.title,
        description: row.description,
        createdAt: row.createdAt,
        creator: {
          id: creator.id,
          name: creator.displayName || creator.username || 'Creator',
          username: creator.username,
          avatarUrl: creator.avatarUrl,
          bio: creator.creatorProfile?.bio || null,
          city: creator.city,
          country: creator.country,
          followerCount: creatorStat?.followerCount ?? 0,
          isFollowedByCurrentUser: Boolean(followRow),
        },
        media: {
          playbackUrl: row.videoAsset.playbackUrl,
          previewUrl: row.videoAsset.previewUrl,
          thumbnailUrl: row.videoAsset.thumbnailUrl,
          mimeType: row.videoAsset.mimeType,
        },
        engagement: {
          likeCount: statMap.get(row.id)?.likeCount ?? 0,
          viewCount: statMap.get(row.id)?.viewCount ?? 0,
          likedByCurrentUser: likedSet.has(row.id),
        },
      })),
    };
  }
}
