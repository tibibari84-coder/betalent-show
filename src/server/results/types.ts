import type {
  AdvancementDecisionKind,
  StageResultStatus,
} from "@prisma/client";

export type StageResultEntryInput = {
  performanceId: string;
  contestantId: string;
  placementOrder: number;
  highlightLabel?: string | null;
};

/** Safe, read-only payload for current creator-facing show surfaces — only `PUBLISHED` packages. */
export type PublicStageResultPayload = {
  stageResultId: string;
  title: string;
  summary: string | null;
  publishedAt: Date;
  status: StageResultStatus;
  seasonTitle: string;
  stageTitle: string;
  entries: PublicStageResultEntryRow[];
};

export type PublicStageResultEntryRow = {
  placementOrder: number;
  highlightLabel: string | null;
  performanceTitle: string;
  contestantDisplayName: string;
  contestantHandle: string;
};

export type PublicAdvancementSummary = {
  decision: AdvancementDecisionKind;
  decidedAt: Date;
  stageTitle: string;
  note: string | null;
};
