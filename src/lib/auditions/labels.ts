import type {
  AuditionReviewDecisionStatus,
  AuditionRightsStatus,
  AuditionSubmissionStatus,
  AuditionSubmissionType,
} from "@prisma/client";

export const AUDITION_SUBMISSION_TYPE_LABEL: Record<
  AuditionSubmissionType,
  string
> = {
  ORIGINAL_SONG: "Original song",
  ORIGINAL_TOPLINE: "Original topline",
  ORIGINAL_INSTRUMENTAL: "Original instrumental",
};

export const AUDITION_SUBMISSION_STATUS_LABEL: Record<
  AuditionSubmissionStatus,
  string
> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  EXPIRED: "Expired",
  ARCHIVED: "Archived",
};

export const AUDITION_RIGHTS_STATUS_LABEL: Record<
  AuditionRightsStatus,
  string
> = {
  UNKNOWN: "Rights: not yet determined",
  ELIGIBLE: "Rights: eligible (originals)",
  REVIEW_REQUIRED: "Rights: needs follow-up",
  REJECTED_RIGHTS: "Rights: not cleared",
};

export const AUDITION_REVIEW_STATUS_LABEL: Record<
  AuditionReviewDecisionStatus,
  string
> = {
  PENDING: "Review pending",
  ACCEPTED: "Review: accepted",
  REJECTED: "Review: rejected",
  NEEDS_REVIEW: "Review: needs follow-up",
};
