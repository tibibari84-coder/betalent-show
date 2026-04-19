import type {
  AdvancementDecisionKind,
  PerformanceKind,
  PerformanceStatus,
  SeasonStatus,
  StageStatus,
} from "@prisma/client";

export type ArchivedSeasonSummary = {
  id: string;
  slug: string;
  title: string;
  status: SeasonStatus;
};

export type ArchivedStageSummary = {
  id: string;
  slug: string;
  title: string;
  status: StageStatus;
  orderIndex: number;
};

export type ArchivedPerformanceSummary = {
  id: string;
  title: string;
  performanceType: PerformanceKind;
  status: PerformanceStatus;
  seasonTitle: string;
  stageTitle: string | null;
};

export type ContestantHistorySummary = {
  officialPerformanceTotal: number;
  historicalPerformanceCount: number;
  seasonsParticipatedCount: number;
  seasonTitlesSample: string[];
  publishedAdvancementOutcomeCount: number;
};

export type PublishedResultHistoryRow = {
  stageResultId: string;
  title: string;
  stageTitle: string;
  publishedAt: Date;
};

export type PublishedAdvancementHistoryRow = {
  decision: AdvancementDecisionKind;
  decidedAt: Date;
  stageTitle: string;
  seasonTitle: string;
};
