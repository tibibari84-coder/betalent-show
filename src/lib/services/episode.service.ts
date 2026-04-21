import { prisma } from '@/lib/prisma';
import { Episode, EpisodeStatus } from '@prisma/client';

export class EpisodeService {
  static async getAllEpisodes(): Promise<Episode[]> {
    return prisma.episode.findMany({
      include: {
        season: true,
        stage: true,
        performances: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getEpisodesBySeason(seasonId: string): Promise<Episode[]> {
    return prisma.episode.findMany({
      where: { seasonId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  static async getEpisodeById(id: string): Promise<Episode | null> {
    return prisma.episode.findUnique({
      where: { id },
      include: {
        season: true,
        stage: true,
        performances: {
          include: {
            contestant: true,
          },
        },
      },
    });
  }

  static async createEpisode(data: {
    seasonId: string;
    stageId?: string;
    title: string;
    description?: string;
    orderIndex: number;
    premiereAt?: Date;
  }): Promise<Episode> {
    return prisma.episode.create({
      data: {
        ...data,
        slug: data.title.toLowerCase().replace(/\s+/g, '-'),
        status: EpisodeStatus.DRAFT,
      },
    });
  }
}