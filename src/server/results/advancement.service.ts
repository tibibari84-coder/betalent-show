import type { AdvancementDecision, AdvancementDecisionKind } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

import type { PublicAdvancementSummary } from "./types";

export async function recordAdvancementDecision(args: {
  seasonId: string;
  stageId: string;
  contestantId: string;
  performanceId?: string | null;
  decision: AdvancementDecisionKind;
  decidedAt?: Date;
  note?: string | null;
  stageResultId?: string | null;
}): Promise<AdvancementDecision> {
  return prisma.advancementDecision.create({
    data: {
      seasonId: args.seasonId,
      stageId: args.stageId,
      contestantId: args.contestantId,
      performanceId: args.performanceId ?? null,
      decision: args.decision,
      decidedAt: args.decidedAt ?? new Date(),
      note: args.note?.trim() || null,
      stageResultId: args.stageResultId ?? null,
    },
  });
}

/**
 * Consumer-safe: only decisions tied to a **published** `StageResult` are returned.
 */
export async function getLatestPublishedAdvancementSummaryForContestant(
  contestantId: string,
): Promise<PublicAdvancementSummary | null> {
  const row = await prisma.advancementDecision.findFirst({
    where: {
      contestantId,
      stageResultId: { not: null },
      stageResult: { status: "PUBLISHED" },
    },
    orderBy: { decidedAt: "desc" },
    include: {
      stage: { select: { title: true } },
    },
  });

  if (!row) {
    return null;
  }

  return {
    decision: row.decision,
    decidedAt: row.decidedAt,
    stageTitle: row.stage.title,
    note: row.note,
  };
}
