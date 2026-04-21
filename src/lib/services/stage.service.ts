import { prisma } from '@/lib/prisma';
import { Stage, StageStatus, StageType } from '@prisma/client';

export class StageService {
  static async getAllStages(): Promise<Stage[]> {
    return prisma.stage.findMany({
      include: {
        season: true,
        episodes: true,
        _count: {
          select: { episodes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getStagesBySeason(seasonId: string): Promise<Stage[]> {
    return prisma.stage.findMany({
      where: { seasonId },
      orderBy: { orderIndex: 'asc' },
      include: {
        episodes: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  static async getStageById(id: string): Promise<Stage | null> {
    return prisma.stage.findUnique({
      where: { id },
      include: {
        season: true,
        episodes: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  static async createStage(data: {
    seasonId: string;
    title: string;
    description?: string;
    stageType: StageType;
    orderIndex: number;
  }): Promise<Stage> {
    return prisma.stage.create({
      data: {
        ...data,
        slug: data.title.toLowerCase().replace(/\s+/g, '-'),
        status: StageStatus.DRAFT,
      },
    });
  }
}