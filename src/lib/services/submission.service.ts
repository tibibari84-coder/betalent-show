import { prisma } from '@/lib/prisma';
import { Prisma, Submission, SubmissionStatus } from '@prisma/client';
import { captureMessage } from '@/lib/sentry';
import { VideoAssetService } from './video-asset.service';

export type SubmissionWithRelations = Prisma.SubmissionGetPayload<{
  include: {
    user: true;
    videoAsset: true;
    judgeResults: {
      include: {
        judge: true;
      };
    };
    performances: true;
  };
}>;

export type SubmissionListItem = Prisma.SubmissionGetPayload<{
  include: {
    videoAsset: true;
    judgeResults: {
      include: {
        judge: true;
      };
    };
  };
}>;

export class SubmissionService {
  static readonly allowedStatusTransitions: Record<SubmissionStatus, SubmissionStatus[]> = {
    DRAFT: [SubmissionStatus.SUBMITTED, SubmissionStatus.WITHDRAWN],
    SUBMITTED: [SubmissionStatus.UNDER_REVIEW, SubmissionStatus.ACCEPTED, SubmissionStatus.REJECTED, SubmissionStatus.WITHDRAWN],
    UNDER_REVIEW: [SubmissionStatus.ACCEPTED, SubmissionStatus.REJECTED, SubmissionStatus.WITHDRAWN],
    ACCEPTED: [],
    REJECTED: [],
    WITHDRAWN: [],
  };

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
    const current = await prisma.submission.findUnique({
      where: { id },
      select: { id: true, status: true, userId: true, title: true },
    });

    if (!current) {
      throw new Error('Submission not found.');
    }

    if (current.status === status) {
      return prisma.submission.findUniqueOrThrow({ where: { id } });
    }

    const allowed = SubmissionService.allowedStatusTransitions[current.status];
    if (!allowed.includes(status)) {
      throw new Error(`Invalid submission status transition: ${current.status} -> ${status}.`);
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: { status },
    });

    captureMessage('Submission status updated.', 'info', {
      submissionId: current.id,
      userId: current.userId,
      title: current.title,
      previousStatus: current.status,
      nextStatus: status,
    });

    return updated;
  }

  static async getSubmissionsByUser(
    userId: string,
  ): Promise<SubmissionListItem[]> {
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

  static async getSubmissionById(
    id: string,
  ): Promise<SubmissionWithRelations | null> {
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

  static async getAllSubmissionsForAdmin(): Promise<SubmissionWithRelations[]> {
    return prisma.submission.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
  }
}
