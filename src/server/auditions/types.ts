import type {
  AuditionReviewDecisionStatus,
  AuditionRightsStatus,
  AuditionSubmissionStatus,
  AuditionSubmissionType,
  AuditionWindowStatus,
} from "@prisma/client";

export type AuditionWindowPublicView = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: AuditionWindowStatus;
  opensAt: Date;
  closesAt: Date;
  reviewStartsAt: Date | null;
  reviewEndsAt: Date | null;
  maxSubmissionsPerUser: number | null;
  /** True when status is OPEN and now is within [opensAt, closesAt]. */
  scheduleOpen: boolean;
  /** True when in configured review window or window status is REVIEW. */
  reviewPeriod: boolean;
};

export type UserSubmissionListItem = {
  id: string;
  title: string;
  submissionType: AuditionSubmissionType;
  rightsStatus: AuditionRightsStatus;
  status: AuditionSubmissionStatus;
  externalMediaRef: string | null;
  mediaUrl: string | null;
  mediaOriginalName: string | null;
  mediaSize: number | null;
  mediaMimeType: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  /** True if any review row is ACCEPTED or REJECTED (final outcomes). */
  hasTerminalReview: boolean;
  latestReview: {
    status: AuditionReviewDecisionStatus;
    createdAt: Date;
    decisionNote: string | null;
  } | null;
  /** Set when this audition was promoted to an official `Performance`. */
  mappedPerformanceId: string | null;
};

export type EligibilityResult =
  | { ok: true }
  | { ok: false; reason: string };
