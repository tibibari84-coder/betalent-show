import { prisma } from "@/server/db/prisma";

import { getOrCreateContestantForUser } from "@/server/contestants/contestant.service";

import { createPerformanceFromAcceptedAudition } from "./performance.service";

export type AuditionShowMappingResult = {
  contestantId: string;
  performanceId: string;
};

/**
 * Explicit, traceable promotion: accepted audition → contestant + official Performance.
 * Does not compute results or advancement — handoff only.
 */
export async function mapAcceptedAuditionSubmissionToShow(args: {
  auditionSubmissionId: string;
  /** Use when `AuditionWindow.seasonId` is unset. */
  seasonIdOverride?: string | null;
}): Promise<AuditionShowMappingResult> {
  const submission = await prisma.auditionSubmission.findUnique({
    where: { id: args.auditionSubmissionId },
    include: { auditionWindow: true },
  });

  if (!submission) {
    throw new Error("Audition submission not found.");
  }

  if (submission.status !== "ACCEPTED") {
    throw new Error(
      "Only an ACCEPTED audition submission can be mapped into the show core.",
    );
  }

  const existingPerformance = await prisma.performance.findUnique({
    where: { sourceAuditionSubmissionId: submission.id },
  });
  if (existingPerformance) {
    throw new Error(
      "This audition submission is already mapped to an official Performance.",
    );
  }

  const seasonId =
    (args.seasonIdOverride?.trim() || submission.auditionWindow?.seasonId) ??
    null;

  if (!seasonId) {
    throw new Error(
      "A Season is required: link the audition window to a season, or provide seasonIdOverride.",
    );
  }

  const contestant = await getOrCreateContestantForUser(submission.userId);

  const performance = await createPerformanceFromAcceptedAudition({
    contestantId: contestant.id,
    seasonId,
    sourceSubmission: submission,
  });

  return {
    contestantId: contestant.id,
    performanceId: performance.id,
  };
}
