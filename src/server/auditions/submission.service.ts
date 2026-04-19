import type { AuditionWindow } from "@prisma/client";
import {
  AuditionReviewDecisionStatus,
  AuditionSubmission,
} from "@prisma/client";

import { prisma } from "@/server/db/prisma";

import {
  evaluateSubmitDraftEligibility,
  canWithdrawSubmission,
} from "./eligibility.service";
import type { UserSubmissionListItem } from "./types";

function mapSubmissionToListItem(
  row: AuditionSubmission & {
    reviews: {
      status: AuditionReviewDecisionStatus;
      createdAt: Date;
      decisionNote: string | null;
    }[];
    officialPerformance?: { id: string } | null;
  },
): UserSubmissionListItem {
  const sorted = [...row.reviews].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const latest = sorted[0] ?? null;
  const hasTerminalReview = row.reviews.some(
    (r) => r.status === "ACCEPTED" || r.status === "REJECTED",
  );
  return {
    id: row.id,
    title: row.title,
    submissionType: row.submissionType,
    rightsStatus: row.rightsStatus,
    status: row.status,
    externalMediaRef: row.externalMediaRef,
    submittedAt: row.submittedAt,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    hasTerminalReview,
    latestReview: latest
      ? {
          status: latest.status,
          createdAt: latest.createdAt,
          decisionNote: latest.decisionNote,
        }
      : null,
    mappedPerformanceId: row.officialPerformance?.id ?? null,
  };
}

export async function listUserSubmissionsForWindow(args: {
  userId: string;
  auditionWindowId: string;
}): Promise<UserSubmissionListItem[]> {
  const rows = await prisma.auditionSubmission.findMany({
    where: {
      userId: args.userId,
      auditionWindowId: args.auditionWindowId,
    },
    include: {
      reviews: {
        select: {
          status: true,
          createdAt: true,
          decisionNote: true,
        },
      },
      officialPerformance: { select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapSubmissionToListItem);
}

export async function createDraftSubmission(args: {
  userId: string;
  auditionWindowId: string;
  title: string;
  description?: string | null;
  submissionType: AuditionSubmission["submissionType"];
  externalMediaRef?: string | null;
}): Promise<AuditionSubmission> {
  return prisma.auditionSubmission.create({
    data: {
      auditionWindowId: args.auditionWindowId,
      userId: args.userId,
      title: args.title.trim(),
      description: args.description?.trim() ?? null,
      submissionType: args.submissionType,
      externalMediaRef: args.externalMediaRef?.trim() || null,
      rightsStatus: "UNKNOWN",
      status: "DRAFT",
    },
  });
}

function assertEditableDraft(row: AuditionSubmission): void {
  if (row.status !== "DRAFT") {
    throw new Error("Only draft submissions can be edited.");
  }
}

export async function updateDraftSubmission(args: {
  submissionId: string;
  userId: string;
  title?: string;
  description?: string | null;
  submissionType?: AuditionSubmission["submissionType"];
  externalMediaRef?: string | null;
}): Promise<AuditionSubmission> {
  const row = await prisma.auditionSubmission.findUniqueOrThrow({
    where: { id: args.submissionId },
  });
  if (row.userId !== args.userId) {
    throw new Error("Forbidden.");
  }
  assertEditableDraft(row);
  return prisma.auditionSubmission.update({
    where: { id: args.submissionId },
    data: {
      ...(args.title !== undefined ? { title: args.title.trim() } : {}),
      ...(args.description !== undefined
        ? { description: args.description?.trim() ?? null }
        : {}),
      ...(args.submissionType !== undefined
        ? { submissionType: args.submissionType }
        : {}),
      ...(args.externalMediaRef !== undefined
        ? { externalMediaRef: args.externalMediaRef?.trim() || null }
        : {}),
    },
  });
}

/**
 * Formal submit: DRAFT → SUBMITTED (timestamp) → UNDER_REVIEW + pending AuditionReview.
 * Never reaches ACCEPTED without an explicit review decision (see review.service).
 */
export async function submitDraftSubmission(args: {
  submissionId: string;
  userId: string;
  window: AuditionWindow;
  now?: Date;
}): Promise<AuditionSubmission> {
  const now = args.now ?? new Date();
  const row = await prisma.auditionSubmission.findUniqueOrThrow({
    where: { id: args.submissionId },
  });
  if (row.userId !== args.userId) {
    throw new Error("Forbidden.");
  }
  if (row.status !== "DRAFT") {
    throw new Error("Only drafts can be submitted.");
  }

  const elig = await evaluateSubmitDraftEligibility({
    userId: args.userId,
    window: args.window,
    submissionUserId: row.userId,
    submissionWindowId: row.auditionWindowId,
    now,
  });
  if (!elig.ok) {
    throw new Error(elig.reason);
  }

  if (!row.title.trim()) {
    throw new Error("Title is required.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.auditionSubmission.update({
      where: { id: row.id },
      data: {
        status: "SUBMITTED",
        submittedAt: now,
      },
    });

    await tx.auditionReview.create({
      data: {
        auditionSubmissionId: row.id,
        reviewerUserId: null,
        status: "PENDING",
        decisionNote: null,
      },
    });

    return tx.auditionSubmission.update({
      where: { id: row.id },
      data: {
        status: "UNDER_REVIEW",
      },
    });
  });
}

export async function withdrawSubmission(args: {
  submissionId: string;
  userId: string;
}): Promise<AuditionSubmission> {
  const row = await prisma.auditionSubmission.findUniqueOrThrow({
    where: { id: args.submissionId },
    include: {
      reviews: { select: { status: true } },
    },
  });

  if (row.userId !== args.userId) {
    throw new Error("Forbidden.");
  }

  const hasTerminalDecision = row.reviews.some(
    (r) => r.status === "ACCEPTED" || r.status === "REJECTED",
  );

  const w = canWithdrawSubmission({
    submissionStatus: row.status,
    hasTerminalDecision,
  });
  if (!w.ok) {
    throw new Error(w.reason);
  }

  return prisma.auditionSubmission.update({
    where: { id: row.id },
    data: { status: "WITHDRAWN" },
  });
}

export async function getSubmissionForUser(
  submissionId: string,
  userId: string,
): Promise<AuditionSubmission | null> {
  const row = await prisma.auditionSubmission.findUnique({
    where: { id: submissionId },
  });
  if (!row || row.userId !== userId) return null;
  return row;
}
