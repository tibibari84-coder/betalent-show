import { SeasonStatus, type Season } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export async function getCurrentSeason(now: Date = new Date()): Promise<Season | null> {
  const liveSeason = await prisma.season.findFirst({
    where: {
      status: SeasonStatus.LIVE,
      OR: [{ startAt: null }, { startAt: { lte: now } }],
      AND: [{ OR: [{ endAt: null }, { endAt: { gte: now } }] }],
    },
    orderBy: [{ startAt: "desc" }, { createdAt: "desc" }],
  });

  if (liveSeason) {
    return liveSeason;
  }

  return null;
}

export async function getUpcomingSeason(now: Date = new Date()): Promise<Season | null> {
  return prisma.season.findFirst({
    where: {
      AND: [
        { OR: [{ status: SeasonStatus.UPCOMING }, { status: SeasonStatus.DRAFT }] },
        { OR: [{ startAt: null }, { startAt: { gte: now } }] },
      ],
    },
    orderBy: [{ startAt: "asc" }, { createdAt: "asc" }],
  });
}
