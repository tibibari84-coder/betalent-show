import type { PerformanceStatus, SeasonStatus, StageStatus } from "@prisma/client";

/** Seasons treated as historical / archive context for public selectors. */
export const ARCHIVED_SEASON_STATUSES: SeasonStatus[] = ["COMPLETED", "ARCHIVED"];

/** Stages treated as historical / archive context. */
export const ARCHIVED_STAGE_STATUSES: StageStatus[] = ["COMPLETED", "ARCHIVED"];

/** Performances considered “closed” as show objects. */
export const ARCHIVED_PERFORMANCE_STATUSES: PerformanceStatus[] = [
  "COMPLETED",
  "ARCHIVED",
];

export function isArchivedSeasonStatus(status: SeasonStatus): boolean {
  return ARCHIVED_SEASON_STATUSES.includes(status);
}

export function isArchivedStageStatus(status: StageStatus): boolean {
  return ARCHIVED_STAGE_STATUSES.includes(status);
}

/** Current/live season surface — not historical archive. */
export function isLiveSeasonSurfaceStatus(status: SeasonStatus): boolean {
  return !isArchivedSeasonStatus(status);
}
