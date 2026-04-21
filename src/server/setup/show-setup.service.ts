import type {
  AuditionWindowStatus,
  EpisodeStatus,
  SeasonStatus,
  StageStatus,
  StageType,
} from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export type CreateSeasonInput = {
  slug: string;
  title: string;
  description: string | null;
  status: SeasonStatus;
  startAt: Date | null;
  endAt: Date | null;
};

export type CreateStageInput = {
  seasonId: string;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  stageType: StageType;
  status: StageStatus;
  submissionsOpenAt: Date | null;
  submissionsCloseAt: Date | null;
  judgingOpenAt: Date | null;
  judgingCloseAt: Date | null;
  votingOpenAt: Date | null;
  votingCloseAt: Date | null;
  resultsAt: Date | null;
};

export type CreateAuditionWindowInput = {
  seasonId: string | null;
  stageId: string | null;
  slug: string;
  title: string;
  description: string | null;
  status: AuditionWindowStatus;
  opensAt: Date;
  closesAt: Date;
  reviewStartsAt: Date | null;
  reviewEndsAt: Date | null;
  maxSubmissionsPerUser: number | null;
};

export type CreateEpisodeInput = {
  seasonId: string;
  stageId: string | null;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  status: EpisodeStatus;
  premiereAt: Date | null;
  publishedAt: Date | null;
};

export async function createSeasonRecord(input: CreateSeasonInput) {
  return prisma.season.create({
    data: {
      slug: input.slug,
      title: input.title,
      description: input.description,
      status: input.status,
      startAt: input.startAt,
      endAt: input.endAt,
    },
    select: { id: true, slug: true, title: true },
  });
}

export async function createStageRecord(input: CreateStageInput) {
  const season = await prisma.season.findUnique({
    where: { id: input.seasonId },
    select: { id: true },
  });
  if (!season) {
    throw new Error("Season not found.");
  }

  return prisma.stage.create({
    data: {
      seasonId: input.seasonId,
      slug: input.slug,
      title: input.title,
      description: input.description,
      orderIndex: input.orderIndex,
      stageType: input.stageType,
      status: input.status,
      submissionsOpenAt: input.submissionsOpenAt,
      submissionsCloseAt: input.submissionsCloseAt,
      judgingOpenAt: input.judgingOpenAt,
      judgingCloseAt: input.judgingCloseAt,
      votingOpenAt: input.votingOpenAt,
      votingCloseAt: input.votingCloseAt,
      resultsAt: input.resultsAt,
    },
    select: { id: true, slug: true, title: true },
  });
}

export async function createEpisodeRecord(input: CreateEpisodeInput) {
  const season = await prisma.season.findUnique({
    where: { id: input.seasonId },
    select: { id: true },
  });
  if (!season) {
    throw new Error("Season not found.");
  }

  if (input.stageId) {
    const stage = await prisma.stage.findFirst({
      where: { id: input.stageId, seasonId: input.seasonId },
      select: { id: true },
    });
    if (!stage) {
      throw new Error("Stage must belong to the selected season.");
    }
  }

  return prisma.episode.create({
    data: {
      seasonId: input.seasonId,
      stageId: input.stageId,
      slug: input.slug,
      title: input.title,
      description: input.description,
      orderIndex: input.orderIndex,
      status: input.status,
      premiereAt: input.premiereAt,
      publishedAt: input.publishedAt,
    },
    select: { id: true, slug: true, title: true },
  });
}

export async function createAuditionWindowRecord(input: CreateAuditionWindowInput) {
  if (input.opensAt.getTime() >= input.closesAt.getTime()) {
    throw new Error("opensAt must be before closesAt.");
  }

  if (input.seasonId && input.stageId) {
    const ok = await prisma.stage.findFirst({
      where: { id: input.stageId, seasonId: input.seasonId },
      select: { id: true },
    });
    if (!ok) {
      throw new Error("Stage must belong to the selected season.");
    }
  }

  return prisma.auditionWindow.create({
    data: {
      seasonId: input.seasonId,
      stageId: input.stageId,
      slug: input.slug,
      title: input.title,
      description: input.description,
      status: input.status,
      opensAt: input.opensAt,
      closesAt: input.closesAt,
      reviewStartsAt: input.reviewStartsAt,
      reviewEndsAt: input.reviewEndsAt,
      maxSubmissionsPerUser: input.maxSubmissionsPerUser,
    },
    select: { id: true, slug: true, title: true },
  });
}

/** Lists seasons for setup form dropdowns (newest first). */
export async function listSeasonsForSetup() {
  return prisma.season.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: { id: true, slug: true, title: true, status: true },
  });
}

export async function listStagesForSetup(seasonId: string) {
  return prisma.stage.findMany({
    where: { seasonId },
    orderBy: { orderIndex: "asc" },
    select: { id: true, slug: true, title: true, status: true },
  });
}

/** All stages for audition window dropdown (includes season label). */
export async function listAllStagesForSetup() {
  return prisma.stage.findMany({
    orderBy: [{ seasonId: "asc" }, { orderIndex: "asc" }],
    select: {
      id: true,
      seasonId: true,
      slug: true,
      title: true,
      season: { select: { title: true, slug: true } },
    },
  });
}
