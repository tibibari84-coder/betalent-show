import {
  AuditionSubmissionStatus,
  AuditionWindow,
} from "@prisma/client";

import { prisma } from "@/server/db/prisma";

import { isAuditionWindowScheduleOpen } from "./window.service";
import type { EligibilityResult } from "./types";

const COUNTED_STATUSES: AuditionSubmissionStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "REJECTED",
];

export async function countUserSubmissionsForWindow(
  userId: string,
  auditionWindowId: string,
): Promise<number> {
  return prisma.auditionSubmission.count({
    where: {
      userId,
      auditionWindowId,
      status: { in: COUNTED_STATUSES },
    },
  });
}

/** New formal entry allowed when schedule is open, cap not reached, rights not blocked on prior attempt. */
export async function evaluateNewSubmissionEligibility(args: {
  userId: string;
  window: AuditionWindow;
  now?: Date;
}): Promise<EligibilityResult> {
  const now = args.now ?? new Date();
  if (!isAuditionWindowScheduleOpen(args.window, now)) {
    return {
      ok: false,
      reason:
        args.window.status !== "OPEN"
          ? "This audition window is not open for submissions."
          : "Submissions are not open at this time (check open and close dates).",
    };
  }

  const max = args.window.maxSubmissionsPerUser;
  if (max != null) {
    const n = await countUserSubmissionsForWindow(
      args.userId,
      args.window.id,
    );
    if (n >= max) {
      return {
        ok: false,
        reason: `You have reached the maximum of ${max} submission(s) for this window.`,
      };
    }
  }

  return { ok: true };
}

/**
 * Submitting a formal entry only requires an open schedule and ownership.
 * (Creating a new draft still uses {@link evaluateNewSubmissionEligibility} / max cap.)
 */
export async function evaluateSubmitDraftEligibility(args: {
  userId: string;
  window: AuditionWindow;
  submissionUserId: string;
  submissionWindowId: string;
  now?: Date;
}): Promise<EligibilityResult> {
  if (args.userId !== args.submissionUserId) {
    return { ok: false, reason: "You cannot submit this entry." };
  }
  if (args.submissionWindowId !== args.window.id) {
    return { ok: false, reason: "Submission does not belong to this window." };
  }
  const now = args.now ?? new Date();
  if (!isAuditionWindowScheduleOpen(args.window, now)) {
    return {
      ok: false,
      reason:
        args.window.status !== "OPEN"
          ? "This audition window is not open for submissions."
          : "Submissions are not open at this time (check open and close dates).",
    };
  }
  return { ok: true };
}

/** Withdraw from DRAFT anytime; after submit only before a final accept/reject decision. */
export function canWithdrawSubmission(args: {
  submissionStatus: AuditionSubmissionStatus;
  hasTerminalDecision: boolean;
}): EligibilityResult {
  if (args.submissionStatus === "DRAFT") {
    return { ok: true };
  }
  if (
    args.submissionStatus === "SUBMITTED" ||
    args.submissionStatus === "UNDER_REVIEW"
  ) {
    if (args.hasTerminalDecision) {
      return {
        ok: false,
        reason: "This entry has already been decided and cannot be withdrawn.",
      };
    }
    return { ok: true };
  }
  return {
    ok: false,
    reason: "This submission cannot be withdrawn in its current state.",
  };
}
