import type { ContestantStatus } from "@prisma/client";

export const CONTESTANT_STATUS_LABEL: Record<ContestantStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  ELIMINATED: "Eliminated",
  WINNER: "Winner",
  ARCHIVED: "Archived",
};
