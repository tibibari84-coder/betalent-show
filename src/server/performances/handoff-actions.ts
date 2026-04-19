"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/server/auth/session";

import { isAuditionReviewerEmail } from "@/server/auditions/reviewer.guard";

import { mapAcceptedAuditionSubmissionToShow } from "./mapping.service";

export type ShowHandoffActionState = {
  error?: string;
  ok?: boolean;
  performanceId?: string;
};

export async function mapAuditionToShowAction(
  _prev: ShowHandoffActionState | undefined,
  formData: FormData,
): Promise<ShowHandoffActionState> {
  const session = await getSession();
  if (!session?.user.onboardingCompletedAt) {
    return { error: "Sign in to continue." };
  }
  if (!isAuditionReviewerEmail(session.user.email)) {
    return { error: "You are not authorized to run show handoff." };
  }

  const auditionSubmissionId = String(
    formData.get("auditionSubmissionId") ?? "",
  ).trim();
  const seasonIdOverride = String(
    formData.get("seasonIdOverride") ?? "",
  ).trim();

  if (!auditionSubmissionId) {
    return { error: "Audition submission id is required." };
  }

  try {
    const result = await mapAcceptedAuditionSubmissionToShow({
      auditionSubmissionId,
      seasonIdOverride: seasonIdOverride || null,
    });

    revalidatePath("/internal/show/audition-handoff");
    revalidatePath("/app/auditions");
    revalidatePath("/app/show");
    revalidatePath("/app/profile");

    return { ok: true, performanceId: result.performanceId };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Could not complete show mapping.";
    return { error: msg };
  }
}
