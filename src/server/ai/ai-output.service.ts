import type {
  AIOutputKind,
  AIOutputStatus,
  AIOutputTargetType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/server/db/prisma";

const PUBLIC_STATUSES: AIOutputStatus[] = ["REVIEWED", "PUBLISHED"];

export type TargetIds = {
  performanceId?: string | null;
  stageId?: string | null;
  episodeId?: string | null;
  stageResultId?: string | null;
  editorialPlacementId?: string | null;
};

export function assertConsistentTarget(
  targetType: AIOutputTargetType,
  ids: TargetIds,
): void {
  const entries = [
    ["PERFORMANCE", ids.performanceId] as const,
    ["STAGE", ids.stageId] as const,
    ["EPISODE", ids.episodeId] as const,
    ["STAGE_RESULT", ids.stageResultId] as const,
    ["EDITORIAL_PLACEMENT", ids.editorialPlacementId] as const,
  ];

  const primary = entries.find(([t]) => t === targetType)?.[1];
  if (!primary || typeof primary !== "string" || primary.trim() === "") {
    throw new Error(`Missing primary id for target ${targetType}.`);
  }

  for (const [t, v] of entries) {
    if (t !== targetType && v != null && String(v).trim() !== "") {
      throw new Error(`Conflicting target field set for ${targetType}.`);
    }
  }
}

export function targetWhereClause(
  kind: AIOutputKind,
  targetType: AIOutputTargetType,
  ids: TargetIds,
): Prisma.AIOutputWhereInput {
  assertConsistentTarget(targetType, ids);
  const base: Prisma.AIOutputWhereInput = { kind, targetType };

  switch (targetType) {
    case "PERFORMANCE":
      return { ...base, performanceId: ids.performanceId! };
    case "STAGE":
      return { ...base, stageId: ids.stageId! };
    case "EPISODE":
      return { ...base, episodeId: ids.episodeId! };
    case "STAGE_RESULT":
      return { ...base, stageResultId: ids.stageResultId! };
    case "EDITORIAL_PLACEMENT":
      return { ...base, editorialPlacementId: ids.editorialPlacementId! };
    default:
      return base;
  }
}

export async function createAiOutput(input: {
  kind: AIOutputKind;
  targetType: AIOutputTargetType;
  ids: TargetIds;
  status: AIOutputStatus;
  promptVersion: string | null;
  title: string | null;
  body: string;
  metaJson?: Prisma.JsonValue | null;
  generatedAt?: Date | null;
}): Promise<{ id: string }> {
  assertConsistentTarget(input.targetType, input.ids);

  const row = await prisma.aIOutput.create({
    data: {
      kind: input.kind,
      targetType: input.targetType,
      performanceId: input.ids.performanceId ?? null,
      stageId: input.ids.stageId ?? null,
      episodeId: input.ids.episodeId ?? null,
      stageResultId: input.ids.stageResultId ?? null,
      editorialPlacementId: input.ids.editorialPlacementId ?? null,
      status: input.status,
      promptVersion: input.promptVersion,
      title: input.title,
      body: input.body,
      metaJson: input.metaJson ?? undefined,
      generatedAt: input.generatedAt ?? null,
    },
    select: { id: true },
  });
  return row;
}

export async function getLatestPublicOutput(input: {
  kind: AIOutputKind;
  targetType: AIOutputTargetType;
  ids: TargetIds;
}): Promise<Prisma.AIOutputGetPayload<Record<string, never>> | null> {
  const where: Prisma.AIOutputWhereInput = {
    ...targetWhereClause(input.kind, input.targetType, input.ids),
    status: { in: PUBLIC_STATUSES },
  };

  return prisma.aIOutput.findFirst({
    where,
    orderBy: [{ updatedAt: "desc" }, { publishedAt: "desc" }],
  });
}

export async function updateAiOutputStatus(input: {
  id: string;
  status: AIOutputStatus;
  publishedAt?: Date | null;
}): Promise<void> {
  await prisma.aIOutput.update({
    where: { id: input.id },
    data: {
      status: input.status,
      ...(input.publishedAt !== undefined
        ? { publishedAt: input.publishedAt }
        : {}),
    },
  });
}

/** When publishing, archive prior PUBLISHED rows for the same kind + anchor. */
export async function publishAndArchiveSiblings(input: {
  id: string;
  kind: AIOutputKind;
  targetType: AIOutputTargetType;
  ids: TargetIds;
}): Promise<void> {
  const whereSibling = targetWhereClause(
    input.kind,
    input.targetType,
    input.ids,
  );

  await prisma.$transaction([
    prisma.aIOutput.updateMany({
      where: {
        ...whereSibling,
        status: "PUBLISHED",
        NOT: { id: input.id },
      },
      data: { status: "ARCHIVED" },
    }),
    prisma.aIOutput.update({
      where: { id: input.id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    }),
  ]);
}

export async function listRecentAiOutputs(take: number) {
  return prisma.aIOutput.findMany({
    take,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      kind: true,
      targetType: true,
      status: true,
      title: true,
      body: true,
      promptVersion: true,
      performanceId: true,
      stageId: true,
      episodeId: true,
      stageResultId: true,
      editorialPlacementId: true,
      updatedAt: true,
    },
  });
}
