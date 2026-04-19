import { prisma } from "@/server/db/prisma";
import type { ShowState } from "@/server/show/show-state.service";

import type { PublicStageResultPayload } from "./types";

/**
 * Latest **published** result package for the current show focus (stage if present, else season).
 * Never returns DRAFT / LOCKED / internal-only packages.
 */
export async function getPublicResultsPayloadForShowState(
  showState: ShowState,
): Promise<PublicStageResultPayload | null> {
  if (!showState.season) {
    return null;
  }

  const seasonId = showState.season.id;

  const baseWhere = {
    status: "PUBLISHED" as const,
    seasonId,
  };

  let row = null as Awaited<
    ReturnType<typeof prisma.stageResult.findFirst>
  > extends infer R
    ? R
    : never;

  if (showState.stage) {
    row = await prisma.stageResult.findFirst({
      where: {
        ...baseWhere,
        stageId: showState.stage.id,
      },
      orderBy: { publishedAt: "desc" },
      include: {
        entries: {
          orderBy: { placementOrder: "asc" },
          include: {
            performance: { select: { title: true } },
            contestant: { select: { displayName: true, username: true } },
          },
        },
        season: { select: { title: true } },
        stage: { select: { title: true } },
      },
    });
  }

  if (!row) {
    row = await prisma.stageResult.findFirst({
      where: baseWhere,
      orderBy: { publishedAt: "desc" },
      include: {
        entries: {
          orderBy: { placementOrder: "asc" },
          include: {
            performance: { select: { title: true } },
            contestant: { select: { displayName: true, username: true } },
          },
        },
        season: { select: { title: true } },
        stage: { select: { title: true } },
      },
    });
  }

  if (!row || !row.publishedAt) {
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

export async function hasPublishedStageResultForCurrentFocus(
  showState: ShowState,
): Promise<boolean> {
  const payload = await getPublicResultsPayloadForShowState(showState);
  return payload !== null;
}
