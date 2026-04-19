import type { Prisma } from "@prisma/client";

import {
  ARCHIVED_PERFORMANCE_STATUSES,
  ARCHIVED_SEASON_STATUSES,
  ARCHIVED_STAGE_STATUSES,
} from "@/lib/archive/archive-rules";
import { prisma } from "@/server/db/prisma";

import type {
  ArchivedPerformanceSummary,
  ArchivedSeasonSummary,
  ArchivedStageSummary,
} from "./types";

export async function listArchivedSeasons(): Promise<ArchivedSeasonSummary[]> {
  const rows = await prisma.season.findMany({
    where: { status: { in: ARCHIVED_SEASON_STATUSES } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
    },
  });
  return rows;
}

export async function listArchivedStagesForSeason(
  seasonId: string,
): Promise<ArchivedStageSummary[]> {
  return prisma.stage.findMany({
    where: {
      seasonId,
      status: { in: ARCHIVED_STAGE_STATUSES },
    },
    orderBy: { orderIndex: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      orderIndex: true,
    },
  });
}

/**
 * Historical performances: explicit COMPLETED/ARCHIVED **or** tied to an archived season/stage.
 */
function archivedPerformanceWhere(
  contestantId: string,
): Prisma.PerformanceWhereInput {
  return {
    contestantId,
    OR: [
      { status: { in: ARCHIVED_PERFORMANCE_STATUSES } },
      { season: { status: { in: ARCHIVED_SEASON_STATUSES } } },
      {
        stage: {
          status: { in: ARCHIVED_STAGE_STATUSES },
        },
      },
    ],
  };
}

export async function listArchivedPerformancesForContestant(args: {
  contestantId: string;
  take?: number;
}): Promise<ArchivedPerformanceSummary[]> {
  const take = args.take ?? 40;
  const rows = await prisma.performance.findMany({
    where: archivedPerformanceWhere(args.contestantId),
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      title: true,
      performanceType: true,
      status: true,
      season: { select: { title: true } },
      stage: { select: { title: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    performanceType: r.performanceType,
    status: r.status,
    seasonTitle: r.season.title,
    stageTitle: r.stage?.title ?? null,
  }));
}

export async function listArchivedPerformancesForSeason(args: {
  seasonId: string;
  take?: number;
}): Promise<ArchivedPerformanceSummary[]> {
  const take = args.take ?? 40;
  const rows = await prisma.performance.findMany({
    where: {
      seasonId: args.seasonId,
      OR: [
        { status: { in: ARCHIVED_PERFORMANCE_STATUSES } },
        { season: { status: { in: ARCHIVED_SEASON_STATUSES } } },
        {
          stage: {
            status: { in: ARCHIVED_STAGE_STATUSES },
          },
        },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      title: true,
      performanceType: true,
      status: true,
      season: { select: { title: true } },
      stage: { select: { title: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    performanceType: r.performanceType,
    status: r.status,
    seasonTitle: r.season.title,
    stageTitle: r.stage?.title ?? null,
  }));
}

export async function countHistoricalPerformancesForContestant(
  contestantId: string,
): Promise<number> {
  return prisma.performance.count({
    where: archivedPerformanceWhere(contestantId),
  });
}
