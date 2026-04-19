import { prisma } from "@/server/db/prisma";
import type { ShowState } from "@/server/show/show-state.service";

import type { PublicStageResultPayload } from "./types";

const publishedInclude = {
  entries: {
    orderBy: { placementOrder: "asc" as const },
    include: {
      performance: { select: { title: true } },
      contestant: { select: { displayName: true, username: true } },
    },
  },
  season: { select: { title: true } },
  stage: { select: { title: true } },
};

/**
 * Latest **published** result package for the current show focus (stage if present, else season-wide).
 * Never returns DRAFT / LOCKED packages.
 */
export async function getPublicResultsPayloadForShowState(
  showState: ShowState,
): Promise<PublicStageResultPayload | null> {
  if (!showState.season) {
    return null;
  }

  const seasonId = showState.season.id;
  const publishedWhere = {
    status: "PUBLISHED" as const,
    seasonId,
  };

  let row =
    showState.stage != null
      ? await prisma.stageResult.findFirst({
          where: {
            ...publishedWhere,
            stageId: showState.stage.id,
          },
          orderBy: { publishedAt: "desc" },
          include: publishedInclude,
        })
      : null;

  if (!row) {
    row = await prisma.stageResult.findFirst({
      where: publishedWhere,
      orderBy: { publishedAt: "desc" },
      include: publishedInclude,
    });
  }

  if (!row?.publishedAt) {
    return null;
  }

  return {
    stageResultId: row.id,
    title: row.title,
    summary: row.summary,
    publishedAt: row.publishedAt,
    status: row.status,
    seasonTitle: row.season.title,
    stageTitle: row.stage.title,
    entries: row.entries.map((e) => ({
      placementOrder: e.placementOrder,
      highlightLabel: e.highlightLabel,
      performanceTitle: e.performance.title,
      contestantDisplayName: e.contestant.displayName,
      contestantHandle: e.contestant.username,
    })),
  };
}
