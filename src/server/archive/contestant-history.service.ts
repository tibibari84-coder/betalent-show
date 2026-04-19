import { prisma } from "@/server/db/prisma";

import { countHistoricalPerformancesForContestant } from "./archive.service";
import { countPublishedAdvancementOutcomesForContestant } from "./result-history.service";
import type { ContestantHistorySummary } from "./types";

/**
 * Summary derived from official `Performance`, `Season`, and published-truth `AdvancementDecision` only.
 */
export async function getContestantHistorySummary(args: {
  contestantId: string;
}): Promise<ContestantHistorySummary | null> {
  const exists = await prisma.contestant.findUnique({
    where: { id: args.contestantId },
    select: { id: true },
  });

  if (!exists) {
    return null;
  }

  const officialPerformanceTotal = await prisma.performance.count({
    where: { contestantId: args.contestantId },
  });

  const historicalPerformanceCount =
    await countHistoricalPerformancesForContestant(args.contestantId);

  const performances = await prisma.performance.findMany({
    where: { contestantId: args.contestantId },
    distinct: ["seasonId"],
    select: {
      season: { select: { title: true } },
    },
  });

  const seasonsParticipatedCount = performances.length;
  const seasonTitlesSample = performances
    .map((p) => p.season.title)
    .slice(0, 5);

  const publishedAdvancementOutcomeCount =
    await countPublishedAdvancementOutcomesForContestant(args.contestantId);

  return {
    officialPerformanceTotal,
    historicalPerformanceCount,
    seasonsParticipatedCount,
    seasonTitlesSample,
    publishedAdvancementOutcomeCount,
  };
}
