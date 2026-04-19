"use server";

import { revalidatePath } from "next/cache";

import type { EditorialTargetType } from "@prisma/client";

import { getSession } from "@/server/auth/session";
import { isAuditionReviewerEmail } from "@/server/auditions/reviewer.guard";

import { createDraftPlacement, publishEditorialPlacement } from "./editorial-placement.service";
import { ensureDefaultEditorialSlots } from "./editorial-slot.service";

export type EditorialActionState = {
  error?: string;
  ok?: boolean;
  detail?: string;
};

async function gateOperator(): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session?.user.onboardingCompletedAt) {
    return { ok: false, error: "Sign in to continue." };
  }
  if (!isAuditionReviewerEmail(session.user.email)) {
    return { ok: false, error: "Not authorized for editorial tools." };
  }
  return { ok: true };
}

export async function ensureDefaultEditorialSlotsAction(): Promise<EditorialActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  try {
    const n = await ensureDefaultEditorialSlots();
    revalidatePath("/internal/editorial");
    return { ok: true, detail: `Created ${n} new default slot(s).` };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not ensure slots.",
    };
  }
}

const TARGET_TYPES: EditorialTargetType[] = [
  "SEASON",
  "STAGE",
  "EPISODE",
  "PERFORMANCE",
  "CONTESTANT",
  "STAGE_RESULT",
];

function parseTarget(raw: string): EditorialTargetType | null {
  return TARGET_TYPES.includes(raw as EditorialTargetType)
    ? (raw as EditorialTargetType)
    : null;
}

export async function createDraftPlacementAction(
  _prev: EditorialActionState | undefined,
  formData: FormData,
): Promise<EditorialActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const editorialSlotId = String(formData.get("editorialSlotId") ?? "").trim();
  const targetType = parseTarget(String(formData.get("targetType") ?? ""));
  if (!editorialSlotId || !targetType) {
    return { error: "Slot and target type are required." };
  }

  try {
    await createDraftPlacement({
      editorialSlotId,
      targetType,
      seasonId: String(formData.get("seasonId") ?? "").trim() || null,
      stageId: String(formData.get("stageId") ?? "").trim() || null,
      episodeId: String(formData.get("episodeId") ?? "").trim() || null,
      performanceId: String(formData.get("performanceId") ?? "").trim() || null,
      contestantId: String(formData.get("contestantId") ?? "").trim() || null,
      stageResultId: String(formData.get("stageResultId") ?? "").trim() || null,
      headline: String(formData.get("headline") ?? "").trim() || null,
      subheadline: String(formData.get("subheadline") ?? "").trim() || null,
      ctaLabel: String(formData.get("ctaLabel") ?? "").trim() || null,
      sortOrder: (() => {
        const n = Number(formData.get("sortOrder"));
        return Number.isFinite(n) ? n : null;
      })(),
    });
    revalidatePath("/internal/editorial");
    revalidatePath("/app");
    revalidatePath("/app/show");
    revalidatePath("/app/results");
    return { ok: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not create draft.",
    };
  }
}

export async function publishPlacementAction(
  _prev: EditorialActionState | undefined,
  formData: FormData,
): Promise<EditorialActionState> {
  const gate = await gateOperator();
  if (!gate.ok) {
    return { error: gate.error };
  }

  const placementId = String(formData.get("placementId") ?? "").trim();
  if (!placementId) {
    return { error: "Placement id is required." };
  }

  try {
    await publishEditorialPlacement(placementId);
    revalidatePath("/internal/editorial");
    revalidatePath("/app");
    revalidatePath("/app/show");
    revalidatePath("/app/results");
    return { ok: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not publish.",
    };
  }
}
