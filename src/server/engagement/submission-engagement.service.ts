import 'server-only';

import { Prisma, SubmissionStatus } from '@prisma/client';

import { prisma } from '@/server/db/prisma';

const eligibleSubmissionStatuses = new Set<SubmissionStatus>([
  SubmissionStatus.SUBMITTED,
  SubmissionStatus.UNDER_REVIEW,
  SubmissionStatus.ACCEPTED,
  SubmissionStatus.REJECTED,
]);

type SubmissionStateRow = {
  id: string;
  userId: string;
  status: SubmissionStatus;
};

export type SubmissionEngagementSnapshot = {
  submissionId: string;
  likeCount: number;
  viewCount: number;
  likedByCurrentUser: boolean;
  canLike: boolean;
  canView: boolean;
};

function utcDayBucket(input: Date) {
  return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
}

async function getSubmissionStateOrThrow(submissionId: string): Promise<SubmissionStateRow> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      userId: true,
      status: true,
    },
  });

  if (!submission) {
    throw new Error('Submission not found.');
  }

  return submission;
}

function assertSubmissionEngagementEligible(submission: SubmissionStateRow) {
  if (!eligibleSubmissionStatuses.has(submission.status)) {
    throw new Error('This submission is not eligible for engagement.');
  }
}

async function ensureSubmissionStatRow(tx: Prisma.TransactionClient, submissionId: string) {
  await tx.submissionEngagementStat.upsert({
    where: { submissionId },
    create: { submissionId },
    update: {},
  });
}

export class SubmissionEngagementService {
  static isEligibleStatus(status: SubmissionStatus) {
    return eligibleSubmissionStatuses.has(status);
  }

  static async likeSubmission(userId: string, submissionId: string) {
    const submission = await getSubmissionStateOrThrow(submissionId);
    assertSubmissionEngagementEligible(submission);

    await prisma.$transaction(async (tx) => {
      await ensureSubmissionStatRow(tx, submissionId);

      const created = await tx.submissionLike.createMany({
        data: [{ submissionId, userId }],
        skipDuplicates: true,
      });

      if (created.count > 0) {
        await tx.submissionEngagementStat.update({
          where: { submissionId },
          data: { likeCount: { increment: 1 } },
        });
      }
    });
  }

  static async unlikeSubmission(userId: string, submissionId: string) {
    await prisma.$transaction(async (tx) => {
      await ensureSubmissionStatRow(tx, submissionId);

      const deleted = await tx.submissionLike.deleteMany({
        where: { submissionId, userId },
      });

      if (deleted.count > 0) {
        await tx.submissionEngagementStat.updateMany({
          where: { submissionId, likeCount: { gt: 0 } },
          data: { likeCount: { decrement: 1 } },
        });
      }
    });
  }

  static async recordSubmissionView(input: { userId: string; submissionId: string; now?: Date }) {
    const submission = await getSubmissionStateOrThrow(input.submissionId);
    assertSubmissionEngagementEligible(submission);

    const now = input.now ?? new Date();
    const dayBucket = utcDayBucket(now);
    const viewerKey = `user:${input.userId}`;

    await prisma.$transaction(async (tx) => {
      await ensureSubmissionStatRow(tx, input.submissionId);

      const created = await tx.submissionViewEvent.createMany({
        data: [
          {
            submissionId: input.submissionId,
            viewerUserId: input.userId,
            viewerKey,
            dayBucket,
            viewedAt: now,
          },
        ],
        skipDuplicates: true,
      });

      if (created.count > 0) {
        await tx.submissionEngagementStat.update({
          where: { submissionId: input.submissionId },
          data: { viewCount: { increment: 1 } },
        });
      }
    });
  }

  static async getSubmissionSnapshots(input: {
    submissionRows: Array<{ id: string; status: SubmissionStatus }>;
    currentUserId?: string | null;
  }): Promise<Record<string, SubmissionEngagementSnapshot>> {
    const submissionIds = input.submissionRows.map((row) => row.id);
    if (submissionIds.length === 0) {
      return {};
    }

    const [stats, likes] = await Promise.all([
      prisma.submissionEngagementStat.findMany({
        where: { submissionId: { in: submissionIds } },
        select: {
          submissionId: true,
          likeCount: true,
          viewCount: true,
        },
      }),
      input.currentUserId
        ? prisma.submissionLike.findMany({
            where: {
              userId: input.currentUserId,
              submissionId: { in: submissionIds },
            },
            select: { submissionId: true },
          })
        : Promise.resolve([]),
    ]);

    const statMap = new Map(stats.map((row) => [row.submissionId, row]));
    const likedSet = new Set(likes.map((row) => row.submissionId));

    return Object.fromEntries(
      input.submissionRows.map((row) => {
        const stat = statMap.get(row.id);
        const eligible = SubmissionEngagementService.isEligibleStatus(row.status);

        return [
          row.id,
          {
            submissionId: row.id,
            likeCount: stat?.likeCount ?? 0,
            viewCount: stat?.viewCount ?? 0,
            likedByCurrentUser: likedSet.has(row.id),
            canLike: eligible,
            canView: eligible,
          },
        ];
      }),
    );
  }
}
