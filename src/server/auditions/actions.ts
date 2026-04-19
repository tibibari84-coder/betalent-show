"use server";

import { revalidatePath } from "next/cache";

import type { AuditionSubmissionType } from "@prisma/client";

import { getSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

import {
  evaluateNewSubmissionEligibility,
} from "./eligibility.service";
import {
  recordAuditionReviewDecision,
} from "./review.service";
import {
  createDraftSubmission,
  listUserSubmissionsForWindow,
  submitDraftSubmission,
  withdrawSubmission,
} from "./submission.service";
import type { UserSubmissionListItem } from "./types";
import { getPrimaryOpenAuditionWindow, toAuditionWindowPublicView } from "./window.service";
import { isAuditionReviewerEmail } from "./reviewer.guard";

export type AuditionActionState = {
  error?: string;
  ok?: boolean;
};

function parseSubmissionType(raw: string): AuditionSubmissionType | null {
  if (
    raw === "ORIGINAL_SONG" ||
    raw === "ORIGINAL_TOPLINE" ||
    raw === "ORIGINAL_INSTRUMENTAL"
  ) {
    return raw;
  }
  return null;
}

export async function createAuditionDraftAction(
  _prev: AuditionActionState | undefined,
  formData: FormData,
): Promise<AuditionActionState> {
  const session = await getSession();
  if (!session?.user.onboardingCompletedAt) {
    return { error: "Sign in to create a submission." };
  }

  const windowRow = await getPrimaryOpenAuditionWindow();
  if (!windowRow) {
    return {
      error:
        "There is no open BETALENT audition window right now. Check back when submissions are scheduled.",
    };
  }

  const elig = await evaluateNewSubmissionEligibility({
    userId: session.user.id,
    window: windowRow,
  });
  if (!elig.ok) {
    return { error: elig.reason };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const externalMediaRef = String(formData.get("externalMediaRef") ?? "").trim();
  const typeRaw = String(formData.get("submissionType") ?? "");
  const submissionType = parseSubmissionType(typeRaw);
  if (!title) {
    return { error: "Title is required." };
  }
  if (!submissionType) {
    return { error: "Choose a valid submission type." };
  }

  try {
    await createDraftSubmission({
      userId: session.user.id,
      auditionWindowId: windowRow.id,
      title,
      description: description || null,
      submissionType,
      externalMediaRef: externalMediaRef || null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not save draft.";
    return { error: msg };
  }

  revalidatePath("/app/auditions");
  return { ok: true };
}

export async function submitAuditionDraftAction(
  _prev: AuditionActionState | undefined,
  formData: FormData,
): Promise<AuditionActionState> {
  const session = await getSession();
  if (!session?.user.onboardingCompletedAt) {
    return { error: "Sign in to submit." };
  }

  const submissionId = String(formData.get("submissionId") ?? "").trim();
  if (!submissionId) {
    return { error: "Missing submission." };
  }

  const submission = await prisma.auditionSubmission.findUnique({
    where: { id: submissionId },
    include: { auditionWindow: true },
  });

  if (!submission || submission.userId !== session.user.id) {
    return { error: "Submission not found." };
  }

  try {
    await submitDraftSubmission({
      submissionId,
      userId: session.user.id,
      window: submission.auditionWindow,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not submit.";
    return { error: msg };
  }

  revalidatePath("/app/auditions");
  return { ok: true };
}

export async function withdrawAuditionSubmissionAction(
  _prev: AuditionActionState | undefined,
  formData: FormData,
): Promise<AuditionActionState> {
  const session = await getSession();
  if (!session?.user.onboardingCompletedAt) {
    return { error: "Sign in to continue." };
  }

  const submissionId = String(formData.get("submissionId") ?? "").trim();
  if (!submissionId) {
    return { error: "Missing submission." };
  }

  try {
    await withdrawSubmission({
      submissionId,
      userId: session.user.id,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not withdraw.";
    return { error: msg };
  }

  revalidatePath("/app/auditions");
  return { ok: true };
}

export type AuditionReviewActionState = AuditionActionState;

function parseReviewDecision(
  raw: string,
): "ACCEPTED" | "REJECTED" | "NEEDS_REVIEW" | null {
  if (raw === "ACCEPTED" || raw === "REJECTED" || raw === "NEEDS_REVIEW") {
    return raw;
  }
  return null;
}

export async function auditionReviewDecisionAction(
  _prev: AuditionReviewActionState | undefined,
  formData: FormData,
): Promise<AuditionReviewActionState> {
  const session = await getSession();
  if (!session?.user.onboardingCompletedAt) {
    return { error: "Sign in to continue." };
  }
  if (!isAuditionReviewerEmail(session.user.email)) {
    return { error: "You are not authorized to review auditions." };
  }

  const submissionId = String(formData.get("submissionId") ?? "").trim();
  const decisionRaw = String(formData.get("decision") ?? "");
  const decision = parseReviewDecision(decisionRaw);
  const decisionNote = String(formData.get("decisionNote") ?? "").trim();

  if (!submissionId) {
    return { error: "Missing submission." };
  }
  if (!decision) {
    return { error: "Choose a valid decision." };
  }

  try {
    await recordAuditionReviewDecision({
      auditionSubmissionId: submissionId,
      reviewerUserId: session.user.id,
      decision,
      decisionNote: decisionNote || null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not record review.";
    return { error: msg };
  }

  revalidatePath("/internal/auditions/review");
  return { ok: true };
}

/** Server helper for RSC pages (window + submissions). */
export async function loadAuditionsPageData(): Promise<{
  sessionUserId: string | null;
  window: ReturnType<typeof toAuditionWindowPublicView> | null;
  submissions: UserSubmissionListItem[];
  eligibilityMessage: string | null;
}> {
  const now = new Date();
  const windowRow = await getPrimaryOpenAuditionWindow(now);
  const session = await getSession();
  const windowView = windowRow
    ? toAuditionWindowPublicView(windowRow, now)
    : null;

  if (!session?.user.onboardingCompletedAt || !windowRow) {
    return {
      sessionUserId: session?.user.id ?? null,
      window: windowView,
      submissions: [],
      eligibilityMessage: null,
    };
  }

  const submissions = await listUserSubmissionsForWindow({
    userId: session.user.id,
    auditionWindowId: windowRow.id,
  });

  const elig = await evaluateNewSubmissionEligibility({
    userId: session.user.id,
    window: windowRow,
    now,
  });

  return {
    sessionUserId: session.user.id,
    window: windowView,
    submissions,
    eligibilityMessage: elig.ok ? null : elig.reason,
  };
}
