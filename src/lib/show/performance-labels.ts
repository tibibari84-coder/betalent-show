import type { PerformanceKind, PerformanceStatus } from "@prisma/client";

export const PERFORMANCE_KIND_LABEL: Record<PerformanceKind, string> = {
  AUDITION: "Audition",
  CALLBACK: "Callback",
  SEMIFINAL: "Semifinal",
  FINAL: "Final",
  SPECIAL: "Special",
};

export const PERFORMANCE_STATUS_LABEL: Record<PerformanceStatus, string> = {
  DRAFT: "Draft",
  ACCEPTED: "Accepted (show core)",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  JUDGED: "Judged",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};
