import { EpisodeStatus, type Episode } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export async function getCurrentEpisode(
  seasonId: string,
  stageId?: string | null,
  now: Date = new Date(),
): Promise<Episode | null> {
  const published = await prisma.episode.findFirst({
    where: {
      seasonId,
      ...(stageId ? { stageId } : {}),
      status: EpisodeStatus.PUBLISHED,
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
    },
    orderBy: [{ publishedAt: "desc" }, { orderIndex: "desc" }],
  });

  if (published) {
    return published;
  }

  const scheduled = await prisma.episode.findFirst({
    where: {
      seasonId,
      ...(stageId ? { stageId } : {}),
      status: EpisodeStatus.SCHEDULED,
      premiereAt: { gte: now },
    },
    orderBy: [{ premiereAt: "asc" }, { orderIndex: "asc" }],
  });

  return scheduled ?? null;
}
