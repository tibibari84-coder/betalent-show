"use server";

import { revalidatePath } from "next/cache";

import type { AdvancementDecisionKind } from "@prisma/client";

import { getSession } from "@/server/auth/session";
import { isAuditionReviewerEmail } from "@/server/auditions/reviewer.guard";

import { recordAdvancementDecision } from "./advancement.service";
import {
  createDraftStageResult,
  publishStageResult,
  replaceStageResultEntries,
} from "./stage-result.service";
import type { StageResultEntryInput } from "./types";

export type ResultsActionState = {
  error?: string;
  ok?: boolean;
  id?: string;
};

async function gateOperator(): Promise<
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof getSession>>> }
  | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session?.user.onboardingCompletedAt) {
    return { ok: false, error: "Sign in to continue." };
  }
  if (!isAuditionReviewerEmail(session.user.email)) {
    return {
      ok: false,
      error: "Not authorized for internal results tools.",
    };
  }
  return { ok: true, session };
}

export async function createDraftStageResultAction(
  _prev: ResultsActionState | undefined,
  formData: FormData,
): Promise<ResultsActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const seasonId = String(formData.get("seasonId") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  if (!seasonId || !stageId || !title) {
    return { error: "Season id, stage id, and title are required." };
  }

  try {
    const sr = await createDraftStageResult({
      seasonId,
      stageId,
      title,
      summary: summary || null,
    });
    revalidatePath("/internal/results/publish");
    return { ok: true, id: sr.id };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not create draft.",
    };
  }
}

export async function replaceStageResultEntriesAction(
  _prev: ResultsActionState | undefined,
  formData: FormData,
): Promise<ResultsActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const stageResultId = String(formData.get("stageResultId") ?? "").trim();
  const rawJson = String(formData.get("entriesJson") ?? "").trim();

  if (!stageResultId || !rawJson) {
    return { error: "Stage result id and entries JSON are required." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { error: "Entries must be valid JSON." };
  }

  if (!Array.isArray(parsed)) {
    return { error: "Entries JSON must be an array." };
  }

  const rows: StageResultEntryInput[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") {
      return { error: "Each entry must be an object." };
    }
    const o = item as Record<string, unknown>;
    const performanceId = String(o.performanceId ?? "").trim();
    const contestantId = String(o.contestantId ?? "").trim();
    const placementOrder = Number(o.placementOrder);
    const highlightLabel =
      o.highlightLabel === null || o.highlightLabel === undefined
        ? null
        : String(o.highlightLabel);

    if (!performanceId || !contestantId || !Number.isFinite(placementOrder)) {
      return {
        error:
          "Each entry needs performanceId, contestantId, and numeric placementOrder.",
      };
    }

    rows.push({
      performanceId,
      contestantId,
      placementOrder,
      highlightLabel,
    });
  }

  try {
    await replaceStageResultEntries(stageResultId, rows);
    revalidatePath("/internal/results/publish");
    revalidatePath("/app/results");
    return { ok: true, id: stageResultId };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not save entries.",
    };
  }
}

export async function publishStageResultAction(
  _prev: ResultsActionState | undefined,
  formData: FormData,
): Promise<ResultsActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const stageResultId = String(formData.get("stageResultId") ?? "").trim();
  if (!stageResultId) {
    return { error: "Stage result id is required." };
  }

  try {
    await publishStageResult(stageResultId);
    revalidatePath("/internal/results/publish");
    revalidatePath("/app/results");
    revalidatePath("/app/show");
    revalidatePath("/app/profile");
    return { ok: true, id: stageResultId };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not publish.",
    };
  }
}

const DECISION_VALUES: AdvancementDecisionKind[] = [
  "ADVANCED",
  "ELIMINATED",
  "HOLD",
  "PENDING",
  "WINNER",
  "RUNNER_UP",
  "WILDCARD",
];

function parseDecision(raw: string): AdvancementDecisionKind | null {
  return DECISION_VALUES.includes(raw as AdvancementDecisionKind)
    ? (raw as AdvancementDecisionKind)
    : null;
}

export async function recordAdvancementDecisionAction(
  _prev: ResultsActionState | undefined,
  formData: FormData,
): Promise<ResultsActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const seasonId = String(formData.get("seasonId") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "").trim();
  const contestantId = String(formData.get("contestantId") ?? "").trim();
  const performanceId = String(formData.get("performanceId") ?? "").trim();
  const decisionRaw = String(formData.get("decision") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const stageResultId = String(formData.get("stageResultId") ?? "").trim();

  const decision = parseDecision(decisionRaw);
  if (!seasonId || !stageId || !contestantId || !decision) {
    return { error: "Missing required fields or invalid decision." };
  }

  try {
    const row = await recordAdvancementDecision({
      seasonId,
      stageId,
      contestantId,
      performanceId: performanceId || null,
      decision,
      note: note || null,
      stageResultId: stageResultId || null,
    });
    revalidatePath("/internal/results/publish");
    revalidatePath("/app/profile");
    return { ok: true, id: row.id };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not save decision.",
    };
  }
}
