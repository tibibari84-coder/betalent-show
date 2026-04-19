import { prisma } from "@/server/db/prisma";

import type { PublishedAdvancementHistoryRow, PublishedResultHistoryRow } from "./types";

/** Only `PUBLISHED` stage packages — never draft/locked internal prep. */
export async function getPublishedStageResultsHistoryForSeason(args: {
  seasonId: string;
  take?: number;
}): Promise<PublishedResultHistoryRow[]> {
  const take = args.take ?? 15;
  const rows = await prisma.stageResult.findMany({
    where: {
      seasonId: args.seasonId,
      status: "PUBLISHED",
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: {
      id: true,
      title: true,
      publishedAt: true,
      stage: { select: { title: true } },
    },
  });

  return rows
    .filter((r): r is typeof r & { publishedAt: Date } => r.publishedAt != null)
    .map((r) => ({
      stageResultId: r.id,
      title: r.title,
      stageTitle: r.stage.title,
      publishedAt: r.publishedAt,
    }));
}

export async function countPublishedStageResultsForSeason(
  seasonId: string,
): Promise<number> {
  return prisma.stageResult.count({
    where: { seasonId, status: "PUBLISHED" },
  });
}

/**
 * Published-truth advancements: decision rows linked to a **published** `StageResult`.
 */
export async function getPublishedAdvancementHistoryForContestant(args: {
  contestantId: string;
  take?: number;
}): Promise<PublishedAdvancementHistoryRow[]> {
  const take = args.take ?? 10;
  const rows = await prisma.advancementDecision.findMany({
    where: {
      contestantId: args.contestantId,
      stageResultId: { not: null },
      stageResult: { status: "PUBLISHED" },
    },
    orderBy: { decidedAt: "desc" },
    take,
    include: {
      stage: { select: { title: true } },
      season: { select: { title: true } },
    },
  });

  return rows.map((r) => ({
    decision: r.decision,
    decidedAt: r.decidedAt,
    stageTitle: r.stage.title,
    seasonTitle: r.season.title,
  }));
}

export async function countPublishedAdvancementOutcomesForContestant(
  contestantId: string,
): Promise<number> {
  return prisma.advancementDecision.count({
    where: {
      contestantId,
      stageResultId: { not: null },
      stageResult: { status: "PUBLISHED" },
    },
  });
}

/**
 * Composes published result rows (season) and published-truth advancements (contestant).
 * Unpublished internal state is never included.
 */
export async function getPublishedResultHistoryForSeasonOrContestant(args: {
  seasonId?: string | null;
  contestantId?: string | null;
  takeSeason?: number;
  takeContestant?: number;
}): Promise<{
  seasonPackages: PublishedResultHistoryRow[];
  contestantAdvancements: PublishedAdvancementHistoryRow[];
}> {
  const [seasonPackages, contestantAdvancements] = await Promise.all([
    args.seasonId
      ? getPublishedStageResultsHistoryForSeason({
          seasonId: args.seasonId,
          take: args.takeSeason ?? 15,
        })
      : Promise.resolve([]),
    args.contestantId
      ? getPublishedAdvancementHistoryForContestant({
          contestantId: args.contestantId,
          take: args.takeContestant ?? 10,
        })
      : Promise.resolve([]),
  ]);

  return { seasonPackages, contestantAdvancements };
}
