import type { StageResult } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

import type { StageResultEntryInput } from "./types";

export async function createDraftStageResult(args: {
  seasonId: string;
  stageId: string;
  title: string;
  summary?: string | null;
}): Promise<StageResult> {
  return prisma.stageResult.create({
    data: {
      seasonId: args.seasonId,
      stageId: args.stageId,
      title: args.title.trim(),
      summary: args.summary?.trim() ?? null,
      status: "DRAFT",
    },
  });
}

/** Replace all ordered rows (explicit ranking — no inference). */
export async function replaceStageResultEntries(
  stageResultId: string,
  rows: StageResultEntryInput[],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.stageResultEntry.deleteMany({ where: { stageResultId } });

    const ordered = [...rows].sort((a, b) => a.placementOrder - b.placementOrder);
    for (const row of ordered) {
      await tx.stageResultEntry.create({
        data: {
          stageResultId,
          performanceId: row.performanceId,
          contestantId: row.contestantId,
          placementOrder: row.placementOrder,
          highlightLabel: row.highlightLabel?.trim() || null,
        },
      });
    }
  });
}

export async function lockStageResult(stageResultId: string): Promise<StageResult> {
  const row = await prisma.stageResult.findUniqueOrThrow({
    where: { id: stageResultId },
  });
  if (row.status !== "DRAFT") {
    throw new Error("Only a DRAFT stage result can be locked.");
  }
  return prisma.stageResult.update({
    where: { id: stageResultId },
    data: { status: "LOCKED" },
  });
}

/**
 * Public boundary: only `PUBLISHED` records are consumer truth.
 * Allowed from DRAFT or LOCKED for manual-first ops.
 */
export async function publishStageResult(stageResultId: string): Promise<StageResult> {
  const row = await prisma.stageResult.findUniqueOrThrow({
    where: { id: stageResultId },
    include: { entries: true },
  });

  if (row.status === "ARCHIVED" || row.status === "PUBLISHED") {
    throw new Error("This stage result cannot be published in its current status.");
  }

  if (row.entries.length === 0) {
    throw new Error("Add at least one result entry before publishing.");
  }

  const now = new Date();
  return prisma.stageResult.update({
    where: { id: stageResultId },
    data: {
      status: "PUBLISHED",
      publishedAt: now,
    },
  });
}

export async function getStageResultById(id: string) {
  return prisma.stageResult.findUnique({
    where: { id },
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
