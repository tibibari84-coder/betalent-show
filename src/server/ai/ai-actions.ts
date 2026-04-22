"use server";

import { revalidatePath } from "next/cache";

import { showSurfaceRevalidatePaths } from "@/lib/app-routes";
import { getSession } from "@/server/auth/session";
import { isAuditionReviewerEmail } from "@/server/auditions/reviewer.guard";
import { prisma } from "@/server/db/prisma";

import {
  publishAndArchiveSiblings,
  TargetIds,
  updateAiOutputStatus,
} from "./ai-output.service";
import { generateJudgeForPerformance } from "./judge.service";
import {
  generateHostForStage,
  generateHostForStageResult,
} from "./host.service";
import { generateProducerForEditorialPlacement } from "./producer.service";

export type AiActionState = {
  error?: string;
  ok?: boolean;
  detail?: string;
};

async function gateOperator(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session?.user.onboardingCompletedAt) {
    return { ok: false, error: "Sign in to continue." };
  }
  if (!isAuditionReviewerEmail(session.user.email)) {
    return { ok: false, error: "Not authorized for BETALENT internal AI tools." };
  }
  return { ok: true };
}

function revalidateAppSurfaces(): void {
  for (const path of showSurfaceRevalidatePaths) {
    revalidatePath(path);
  }
}

export async function generateJudgeAction(
  _prev: AiActionState | undefined,
  formData: FormData,
): Promise<AiActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const performanceId = String(formData.get("performanceId") ?? "").trim();
  if (!performanceId) {
    return { error: "performanceId required." };
  }

  try {
    const { id } = await generateJudgeForPerformance(performanceId);
    revalidateAppSurfaces();
    return { ok: true, detail: `Generated judge output ${id}` };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Judge generation failed.",
    };
  }
}

export async function generateHostStageAction(
  _prev: AiActionState | undefined,
  formData: FormData,
): Promise<AiActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const stageId = String(formData.get("stageId") ?? "").trim();
  if (!stageId) {
    return { error: "stageId required." };
  }

  try {
    const { id } = await generateHostForStage({ stageId });
    revalidateAppSurfaces();
    return { ok: true, detail: `Generated host output ${id}` };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Host generation failed.",
    };
  }
}

export async function generateHostStageResultAction(
  _prev: AiActionState | undefined,
  formData: FormData,
): Promise<AiActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const stageResultId = String(formData.get("stageResultId") ?? "").trim();
  if (!stageResultId) {
    return { error: "stageResultId required." };
  }

  try {
    const { id } = await generateHostForStageResult(stageResultId);
    revalidateAppSurfaces();
    return { ok: true, detail: `Generated host output ${id}` };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Host generation failed.",
    };
  }
}

export async function generateProducerPlacementAction(
  _prev: AiActionState | undefined,
  formData: FormData,
): Promise<AiActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const editorialPlacementId = String(
    formData.get("editorialPlacementId") ?? "",
  ).trim();
  if (!editorialPlacementId) {
    return { error: "editorialPlacementId required." };
  }

  try {
    const { id } =
      await generateProducerForEditorialPlacement(editorialPlacementId);
    revalidateAppSurfaces();
    return { ok: true, detail: `Generated producer output ${id}` };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Producer generation failed.",
    };
  }
}

function idsFromRow(row: {
  kind: string;
  targetType: string;
  performanceId: string | null;
  stageId: string | null;
  episodeId: string | null;
  stageResultId: string | null;
  editorialPlacementId: string | null;
}): TargetIds | null {
  switch (row.targetType) {
    case "PERFORMANCE":
      return row.performanceId ? { performanceId: row.performanceId } : null;
    case "STAGE":
      return row.stageId ? { stageId: row.stageId } : null;
    case "EPISODE":
      return row.episodeId ? { episodeId: row.episodeId } : null;
    case "STAGE_RESULT":
      return row.stageResultId ? { stageResultId: row.stageResultId } : null;
    case "EDITORIAL_PLACEMENT":
      return row.editorialPlacementId
        ? { editorialPlacementId: row.editorialPlacementId }
        : null;
    default:
      return null;
  }
}

export async function reviewAiOutputAction(
  _prev: AiActionState | undefined,
  formData: FormData,
): Promise<AiActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const id = String(formData.get("outputId") ?? "").trim();
  if (!id) {
    return { error: "outputId required." };
  }

  try {
    await updateAiOutputStatus({ id, status: "REVIEWED" });
    revalidateAppSurfaces();
    return { ok: true, detail: "Marked REVIEWED." };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Review failed.",
    };
  }
}

export async function publishAiOutputAction(
  _prev: AiActionState | undefined,
  formData: FormData,
): Promise<AiActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const id = String(formData.get("outputId") ?? "").trim();
  if (!id) {
    return { error: "outputId required." };
  }

  try {
    const row = await prisma.aIOutput.findUnique({ where: { id } });
    if (!row) {
      return { error: "Output not found." };
    }

    const ids = idsFromRow(row);
    if (!ids) {
      return { error: "Cannot resolve output target." };
    }

    await publishAndArchiveSiblings({
      id,
      kind: row.kind,
      targetType: row.targetType,
      ids,
    });

    revalidateAppSurfaces();
    return { ok: true, detail: "Published." };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Publish failed.",
    };
  }
}

export async function archiveAiOutputAction(
  _prev: AiActionState | undefined,
  formData: FormData,
): Promise<AiActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const id = String(formData.get("outputId") ?? "").trim();
  if (!id) {
    return { error: "outputId required." };
  }

  try {
    await updateAiOutputStatus({
      id,
      status: "ARCHIVED",
    });
    revalidateAppSurfaces();
    return { ok: true, detail: "Archived." };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Archive failed.",
    };
  }
}
