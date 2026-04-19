import type {
  AuditionReviewDecisionStatus,
  AuditionSubmissionStatus,
} from "@prisma/client";

import { prisma } from "@/server/db/prisma";

/** Terminal review outcomes that resolve the submission (not pending / needs-another-pass). */
const TERMINAL_DECISIONS: AuditionReviewDecisionStatus[] = [
  "ACCEPTED",
  "REJECTED",
];

function submissionStatusForDecision(
  decision: AuditionReviewDecisionStatus,
): AuditionSubmissionStatus {
  switch (decision) {
    case "ACCEPTED":
      return "ACCEPTED";
    case "REJECTED":
      return "REJECTED";
    case "NEEDS_REVIEW":
      return "UNDER_REVIEW";
    case "PENDING":
      return "UNDER_REVIEW";
    default: {
      const _exhaustive: never = decision;
      return _exhaustive;
    }
  }
}

/**
 * Append a review row and advance submission + rights flags.
 * ACCEPTED/REJECTED set `reviewedAt`; NEEDS_REVIEW keeps the item in UNDER_REVIEW and flags rights.
 */
export async function recordAuditionReviewDecision(args: {
  auditionSubmissionId: string;
  reviewerUserId: string | null;
  decision: Exclude<AuditionReviewDecisionStatus, "PENDING">;
  decisionNote?: string | null;
  now?: Date;
}) {
  const now = args.now ?? new Date();
  const submission = await prisma.auditionSubmission.findUniqueOrThrow({
    where: { id: args.auditionSubmissionId },
  });

  if (
    submission.status !== "SUBMITTED" &&
    submission.status !== "UNDER_REVIEW"
  ) {
    throw new Error(
      "Submission is not in a state that can receive a review decision.",
    );
  }

  const nextSubmissionStatus = submissionStatusForDecision(args.decision);

  const rightsUpdate =
    args.decision === "ACCEPTED"
      ? ({ rightsStatus: "ELIGIBLE" as const })
      : args.decision === "NEEDS_REVIEW"
        ? ({ rightsStatus: "REVIEW_REQUIRED" as const })
        : {};

  const shouldSetReviewedAt = TERMINAL_DECISIONS.includes(args.decision);

  return prisma.$transaction(async (tx) => {
    await tx.auditionReview.create({
      data: {
        auditionSubmissionId: args.auditionSubmissionId,
        reviewerUserId: args.reviewerUserId,
        status: args.decision,
        decisionNote: args.decisionNote?.trim() || null,
      },
    });

    return tx.auditionSubmission.update({
      where: { id: args.auditionSubmissionId },
      data: {
        status: nextSubmissionStatus,
        reviewedAt: shouldSetReviewedAt ? now : submission.reviewedAt,
        ...rightsUpdate,
      },
    });
  });
}

export async function listSubmissionsAwaitingReview(args: {
  take?: number;
}) {
  const take = args.take ?? 50;
  return prisma.auditionSubmission.findMany({
    where: {
      status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
        },
      },
      auditionWindow: {
        select: {
          id: true,
          slug: true,
          title: true,
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: { submittedAt: "asc" },
    take,
  });
}
