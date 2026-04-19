import type {
  EditorialPlacement,
  EditorialTargetType,
} from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export type DraftPlacementInput = {
  editorialSlotId: string;
  targetType: EditorialTargetType;
  seasonId?: string | null;
  stageId?: string | null;
  episodeId?: string | null;
  performanceId?: string | null;
  contestantId?: string | null;
  stageResultId?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  ctaLabel?: string | null;
  sortOrder?: number | null;
};

function validateTargetPayload(
  targetType: EditorialTargetType,
  args: DraftPlacementInput,
): void {
  const has = {
    seasonId: !!args.seasonId?.trim(),
    stageId: !!args.stageId?.trim(),
    episodeId: !!args.episodeId?.trim(),
    performanceId: !!args.performanceId?.trim(),
    contestantId: !!args.contestantId?.trim(),
    stageResultId: !!args.stageResultId?.trim(),
  };

  const ok =
    (targetType === "SEASON" && has.seasonId) ||
    (targetType === "STAGE" && has.stageId) ||
    (targetType === "EPISODE" && has.episodeId) ||
    (targetType === "PERFORMANCE" && has.performanceId) ||
    (targetType === "CONTESTANT" && has.contestantId) ||
    (targetType === "STAGE_RESULT" && has.stageResultId);

  if (!ok) {
    throw new Error(
      `targetType ${targetType} requires the matching entity id to be set.`,
    );
  }
}

export async function createDraftPlacement(
  args: DraftPlacementInput,
): Promise<EditorialPlacement> {
  validateTargetPayload(args.targetType, args);

  return prisma.editorialPlacement.create({
    data: {
      editorialSlotId: args.editorialSlotId,
      targetType: args.targetType,
      seasonId: args.seasonId?.trim() || null,
      stageId: args.stageId?.trim() || null,
      episodeId: args.episodeId?.trim() || null,
      performanceId: args.performanceId?.trim() || null,
      contestantId: args.contestantId?.trim() || null,
      stageResultId: args.stageResultId?.trim() || null,
      headline: args.headline?.trim() || null,
      subheadline: args.subheadline?.trim() || null,
      ctaLabel: args.ctaLabel?.trim() || null,
      sortOrder: args.sortOrder ?? null,
      status: "DRAFT",
    },
  });
}

/** Publish one placement; prior published rows for this slot become ARCHIVED. */
export async function publishEditorialPlacement(
  placementId: string,
): Promise<EditorialPlacement> {
  const row = await prisma.editorialPlacement.findUniqueOrThrow({
    where: { id: placementId },
    include: { editorialSlot: true },
  });

  if (row.status === "ARCHIVED") {
    throw new Error("Cannot publish an archived placement.");
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    await tx.editorialPlacement.updateMany({
      where: {
        editorialSlotId: row.editorialSlotId,
        status: "PUBLISHED",
        id: { not: placementId },
      },
      data: { status: "ARCHIVED" },
    });

    return tx.editorialPlacement.update({
      where: { id: placementId },
      data: {
        status: "PUBLISHED",
        publishedAt: now,
      },
    });
  });
}
