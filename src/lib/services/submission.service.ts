import { prisma } from '@/lib/prisma';
import { Submission, SubmissionStatus } from '@prisma/client';
import { VideoAssetService } from './video-asset.service';

export class SubmissionService {
  static async createSubmission(data: {
    userId: string;
    videoAssetId: string;
    title: string;
    description?: string;
  }): Promise<Submission> {
    await VideoAssetService.getReadyVideoAssetForSubmission(data.videoAssetId, data.userId);

    return prisma.submission.create({
      data: {
        ...data,
        status: SubmissionStatus.DRAFT,
      },
    });
  }

  static async updateSubmissionStatus(
    id: string,
    status: SubmissionStatus
  ): Promise<Submission> {
    return prisma.submission.update({
      where: { id },
      data: { status },
    });
  }

  static async getSubmissionsByUser(userId: string): Promise<Submission[]> {
    return prisma.submission.findMany({
      where: { userId },
      include: {
        videoAsset: true,
        judgeResults: {
          include: {
            judge: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getSubmissionById(id: string): Promise<Submission | null> {
    return prisma.submission.findUnique({
      where: { id },
      include: {
        user: true,
        videoAsset: true,
        judgeResults: {
          include: {
            judge: true,
          },
        },
        performances: true,
      },
    });
  }

  static async getAllSubmissionsForAdmin(): Promise<Submission[]> {
    return prisma.submission.findMany({
      include: {
        user: true,
        videoAsset: true,
        judgeResults: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
