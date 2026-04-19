import type { AIOutput } from "@prisma/client";

import { getLatestPublicOutput } from "./ai-output.service";
import type { JudgeMeta, PublicAiOutput } from "./types";

function pickMeta(row: AIOutput): JudgeMeta | null {
  if (row.kind !== "JUDGE" || row.metaJson == null) {
    return null;
  }
  const v = row.metaJson;
  if (typeof v !== "object" || v === null || Array.isArray(v)) {
    return null;
  }
  const o = v as Record<string, unknown>;
  const strengths = Array.isArray(o.strengths)
    ? o.strengths.filter((x): x is string => typeof x === "string")
    : [];
  const weaknesses = Array.isArray(o.weaknesses)
    ? o.weaknesses.filter((x): x is string => typeof x === "string")
    : [];
  const takeaway = typeof o.takeaway === "string" ? o.takeaway : "";
  return { strengths, weaknesses, takeaway };
}

export function toPublicAiOutput(row: AIOutput): PublicAiOutput {
  return {
    id: row.id,
    kind: row.kind,
    targetType: row.targetType,
    title: row.title,
    body: row.body,
    metaJson: pickMeta(row),
    status: row.status,
  };
}

export async function getPublicJudgeForPerformance(
  performanceId: string,
): Promise<PublicAiOutput | null> {
  const row = await getLatestPublicOutput({
    kind: "JUDGE",
    targetType: "PERFORMANCE",
    ids: { performanceId },
  });
  return row ? toPublicAiOutput(row) : null;
}

export async function getPublicHostForStage(
  stageId: string,
): Promise<PublicAiOutput | null> {
  const row = await getLatestPublicOutput({
    kind: "HOST",
    targetType: "STAGE",
    ids: { stageId },
  });
  return row ? toPublicAiOutput(row) : null;
}

export async function getPublicHostForStageResult(
  stageResultId: string,
): Promise<PublicAiOutput | null> {
  const row = await getLatestPublicOutput({
    kind: "HOST",
    targetType: "STAGE_RESULT",
    ids: { stageResultId },
  });
  return row ? toPublicAiOutput(row) : null;
}

export async function getPublicProducerForEditorialPlacement(
  editorialPlacementId: string,
): Promise<PublicAiOutput | null> {
  const row = await getLatestPublicOutput({
    kind: "PRODUCER",
    targetType: "EDITORIAL_PLACEMENT",
    ids: { editorialPlacementId },
  });
  return row ? toPublicAiOutput(row) : null;
}
