"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { creatorCoreRevalidatePaths } from "@/lib/app-routes";
import { POSTHOG_EVENTS, trackEvent } from "@/lib/analytics/posthog";
import { SubmissionService } from "@/lib/services/submission.service";
import { requireAuthenticatedOnboarded } from "@/server/auth/guard";

export type SubmissionActionState = {
  ok?: boolean;
  error?: string;
  detail?: string;
};

const draftSchema = z.object({
  id: z.string().trim().optional(),
  videoAssetId: z.string().trim().min(1, "Choose a ready asset."),
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().max(1000, "Description is too long.").optional(),
});

function parseDraftInput(formData: FormData) {
  return draftSchema.parse({
    id: formData.get("id") ?? undefined,
    videoAssetId: formData.get("videoAssetId"),
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
  });
}

function revalidateCreatorCore() {
  for (const path of creatorCoreRevalidatePaths) {
    revalidatePath(path);
  }
}

function mapSubmissionError(error: unknown, fallback: string) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export async function createSubmissionDraftAction(
  _prev: SubmissionActionState | undefined,
  formData: FormData,
): Promise<SubmissionActionState> {
  try {
    const session = await requireAuthenticatedOnboarded("/app/submissions");
    const input = parseDraftInput(formData);
    const row = await SubmissionService.createSubmissionDraft({
      userId: session.user.id,
      videoAssetId: input.videoAssetId,
      title: input.title,
      description: input.description,
    });
    await trackEvent(POSTHOG_EVENTS.submission_started, {
      distinctId: session.user.id,
      submissionId: row.id,
      videoAssetId: row.videoAssetId,
    });
    revalidateCreatorCore();
    return { ok: true, detail: `Draft created: ${row.title}` };
  } catch (error) {
    return { error: mapSubmissionError(error, "Could not create draft.") };
  }
}

export async function updateSubmissionDraftAction(
  _prev: SubmissionActionState | undefined,
  formData: FormData,
): Promise<SubmissionActionState> {
  try {
    const session = await requireAuthenticatedOnboarded("/app/submissions");
    const input = parseDraftInput(formData);

    if (!input.id) {
      return { error: "Draft id is required." };
    }

    const row = await SubmissionService.updateSubmissionDraft({
      id: input.id,
      userId: session.user.id,
      videoAssetId: input.videoAssetId,
      title: input.title,
      description: input.description,
    });
    revalidateCreatorCore();
    return { ok: true, detail: `Draft saved: ${row.title}` };
  } catch (error) {
    return { error: mapSubmissionError(error, "Could not update draft.") };
  }
}

export async function submitSubmissionDraftAction(
  _prev: SubmissionActionState | undefined,
  formData: FormData,
): Promise<SubmissionActionState> {
  try {
    const session = await requireAuthenticatedOnboarded("/app/submissions");
    const id = String(formData.get("id") ?? "").trim();

    if (!id) {
      return { error: "Draft id is required." };
    }

    const row = await SubmissionService.submitSubmissionDraft({
      id,
      userId: session.user.id,
    });
    await trackEvent(POSTHOG_EVENTS.submission_submitted, {
      distinctId: session.user.id,
      submissionId: row.id,
      videoAssetId: row.videoAssetId,
      submittedAt: row.submittedAt?.toISOString() || null,
    });
    revalidateCreatorCore();
    return { ok: true, detail: `Submission sent: ${row.title}` };
  } catch (error) {
    return { error: mapSubmissionError(error, "Could not submit entry.") };
  }
}
