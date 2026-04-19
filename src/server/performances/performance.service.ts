import type { AuditionSubmission, Performance } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export type PerformanceSummary = {
  id: string;
  title: string;
  performanceType: Performance["performanceType"];
  status: Performance["status"];
  mediaRef: string | null;
  publishedAt: Date | null;
  contestantDisplayName: string;
};

function toSummary(
  row: Performance & {
    contestant: { displayName: string };
  },
): PerformanceSummary {
  return {
    id: row.id,
    title: row.title,
    performanceType: row.performanceType,
    status: row.status,
    mediaRef: row.mediaRef,
    publishedAt: row.publishedAt,
    contestantDisplayName: row.contestant.displayName,
  };
}

export async function getPerformanceById(
  id: string,
): Promise<(Performance & { contestant: { displayName: string; username: string } }) | null> {
  return prisma.performance.findUnique({
    where: { id },
    include: {
      contestant: { select: { displayName: true, username: true } },
    },
  });
}

export async function listContestantPerformances(contestantId: string) {
  return prisma.performance.findMany({
    where: { contestantId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      performanceType: true,
      status: true,
      mediaRef: true,
      publishedAt: true,
      seasonId: true,
      createdAt: true,
    },
  });
}

/**
 * Minimal season/stage scoped read for show surfaces — no results or judging data.
 */
export async function listPerformancesForSeasonAndOptionalStage(args: {
  seasonId: string;
  stageId?: string | null;
  take?: number;
}): Promise<PerformanceSummary[]> {
  const take = args.take ?? 25;
  const rows = await prisma.performance.findMany({
    where: {
      seasonId: args.seasonId,
      ...(args.stageId ? { stageId: args.stageId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      contestant: { select: { displayName: true } },
    },
  });
  return rows.map(toSummary);
}

/**
 * Creates the official show `Performance` from an already-accepted audition submission.
 * Idempotent callers must verify no existing row for `sourceAuditionSubmissionId`.
 *
 * Temporary media: copies `externalMediaRef` → `mediaRef` when present (non-final pipeline).
 */
export async function createPerformanceFromAcceptedAudition(args: {
  contestantId: string;
  seasonId: string;
  sourceSubmission: AuditionSubmission;
}): Promise<Performance> {
  const { sourceSubmission } = args;

  return prisma.performance.create({
    data: {
      contestantId: args.contestantId,
      seasonId: args.seasonId,
      stageId: null,
      episodeId: null,
      sourceAuditionSubmissionId: sourceSubmission.id,
      title: sourceSubmission.title.trim(),
      description: sourceSubmission.description?.trim() ?? null,
      performanceType: "AUDITION",
      status: "ACCEPTED",
      mediaRef: sourceSubmission.externalMediaRef?.trim() || null,
    },
  });
}
