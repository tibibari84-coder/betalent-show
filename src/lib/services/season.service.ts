import { prisma } from '@/lib/prisma';
import { Season, SeasonStatus } from '@prisma/client';

export class SeasonService {
  static async getAllSeasons(): Promise<Season[]> {
    return prisma.season.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getSeasonById(id: string): Promise<Season | null> {
    return prisma.season.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' },
        },
        episodes: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  static async getSeasonBySlug(slug: string): Promise<Season | null> {
    return prisma.season.findUnique({
      where: { slug },
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' },
        },
        episodes: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  static async createSeason(data: {
    title: string;
    description?: string;
    startAt?: Date;
    endAt?: Date;
  }): Promise<Season> {
    const slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return prisma.season.create({
      data: {
        ...data,
        slug,
        status: SeasonStatus.DRAFT,
      },
    });
  }

  static async updateSeasonStatus(id: string, status: SeasonStatus): Promise<Season> {
    return prisma.season.update({
      where: { id },
      data: { status },
    });
  }
}