import { Prisma, StageStatus, type Episode, type Season, type Stage } from "@prisma/client";

import { getCurrentEpisode } from "./episode.service";
import { getCurrentSeason, getUpcomingSeason } from "./season.service";
import { getCurrentStage } from "./stage.service";

export type ShowDisplayState =
  | "NO_ACTIVE_SEASON"
  | "SEASON_UPCOMING"
  | "SEASON_LIVE_IDLE"
  | "STAGE_SUBMISSIONS_OPEN"
  | "STAGE_JUDGING"
  | "STAGE_VOTING"
  | "STAGE_RESULTS";

export type ShowModes = {
  canSubmit: boolean;
  canVote: boolean;
  canViewResults: boolean;
  isJudgingWindow: boolean;
};

export type ShowState = {
  season: Season | null;
  stage: Stage | null;
  episode: Episode | null;
  modes: ShowModes;
  displayState: ShowDisplayState;
};

function emptyShowState(displayState: ShowDisplayState = "NO_ACTIVE_SEASON"): ShowState {
  return {
    season: null,
    stage: null,
    episode: null,
    modes: {
      canSubmit: false,
      canVote: false,
      canViewResults: false,
      isJudgingWindow: false,
    },
    displayState,
  };
}

function deriveModes(stage: Stage | null, now: Date): ShowModes {
  if (!stage) {
    return {
      canSubmit: false,
      canVote: false,
      canViewResults: false,
      isJudgingWindow: false,
    };
  }

  const inSubmitWindow =
    (!!stage.submissionsOpenAt && stage.submissionsOpenAt.getTime() <= now.getTime()) &&
    (!stage.submissionsCloseAt || now.getTime() <= stage.submissionsCloseAt.getTime());
  const inJudgingWindow =
    (!!stage.judgingOpenAt && stage.judgingOpenAt.getTime() <= now.getTime()) &&
    (!stage.judgingCloseAt || now.getTime() <= stage.judgingCloseAt.getTime());
  const inVotingWindow =
    (!!stage.votingOpenAt && stage.votingOpenAt.getTime() <= now.getTime()) &&
    (!stage.votingCloseAt || now.getTime() <= stage.votingCloseAt.getTime());

  return {
    canSubmit: stage.status === StageStatus.OPEN || inSubmitWindow,
    canVote: stage.status === StageStatus.VOTING || inVotingWindow,
    canViewResults:
      stage.status === StageStatus.RESULTS ||
      stage.status === StageStatus.COMPLETED ||
      (!!stage.resultsAt && now.getTime() >= stage.resultsAt.getTime()),
    isJudgingWindow: stage.status === StageStatus.JUDGING || inJudgingWindow,
  };
}

function deriveDisplayState(season: Season | null, stage: Stage | null, modes: ShowModes): ShowDisplayState {
  if (!season) {
    return "NO_ACTIVE_SEASON";
  }

  if (!stage) {
    return "SEASON_LIVE_IDLE";
  }

  if (modes.canSubmit) {
    return "STAGE_SUBMISSIONS_OPEN";
  }
  if (modes.isJudgingWindow) {
    return "STAGE_JUDGING";
  }
  if (modes.canVote) {
    return "STAGE_VOTING";
  }
  if (modes.canViewResults) {
    return "STAGE_RESULTS";
  }

  return "SEASON_LIVE_IDLE";
}

export async function resolveShowState(now: Date = new Date()): Promise<ShowState> {
  let liveSeason: Season | null = null;
  try {
    liveSeason = await getCurrentSeason(now);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return emptyShowState("NO_ACTIVE_SEASON");
    }
    throw error;
  }

  if (!liveSeason) {
    try {
      const upcoming = await getUpcomingSeason(now);
      if (!upcoming) {
        return emptyShowState("NO_ACTIVE_SEASON");
      }
      return {
        ...emptyShowState("SEASON_UPCOMING"),
        season: upcoming,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
        return emptyShowState("NO_ACTIVE_SEASON");
      }
      throw error;
    }
  }

  let stage: Stage | null = null;
  let episode: Episode | null = null;
  try {
    stage = await getCurrentStage(liveSeason.id, now);
    episode = await getCurrentEpisode(liveSeason.id, stage?.id ?? null, now);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return {
        ...emptyShowState("SEASON_LIVE_IDLE"),
        season: liveSeason,
      };
    }
    throw error;
  }
  const modes = deriveModes(stage, now);

  return {
    season: liveSeason,
    stage,
    episode,
    modes,
    displayState: deriveDisplayState(liveSeason, stage, modes),
  };
}
