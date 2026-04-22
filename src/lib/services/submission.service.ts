import { prisma } from '@/lib/prisma';
import { Prisma, Submission, SubmissionStatus, VideoAssetStatus } from '@prisma/client';
import { captureMessage } from '@/lib/sentry';
import { VideoAssetService } from './video-asset.service';
import {
  allowedSubmissionTransitions,
  prepareSubmissionStatusChange,
} from '@/server/submissions/lifecycle';
import {
  createSubmissionDraftWithDeps,
  submitSubmissionDraftWithDeps,
  updateSubmissionDraftWithDeps,
} from '@/server/submissions/draft-logic';

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
  static readonly allowedStatusTransitions = allowedSubmissionTransitions;

  static async createSubmissionDraft(data: {
    userId: string;
    videoAssetId: string;
    title: string;
    description?: string;
  }): Promise<Submission> {
    return createSubmissionDraftWithDeps({
      getReadyVideoAssetForSubmission: VideoAssetService.getReadyVideoAssetForSubmission,
      createSubmission: (submission) =>
        prisma.submission.create({
          data: submission,
        }),
      findSubmissionForEdit: async () => null,
      updateSubmission: async () => {
        throw new Error('Not implemented in create submission path.');
      },
    }, {
      userId: data.userId,
      videoAssetId: data.videoAssetId,
      title: data.title,
      description: data.description,
    });
  }

  static async createSubmission(data: {
    userId: string;
    videoAssetId: string;
    title: string;
    description?: string;
  }): Promise<Submission> {
    return SubmissionService.createSubmissionDraft(data);
  }

  static async updateSubmissionDraft(data: {
    id: string;
    userId: string;
    videoAssetId: string;
    title: string;
    description?: string;
  }): Promise<Submission> {
    return updateSubmissionDraftWithDeps({
      getReadyVideoAssetForSubmission: VideoAssetService.getReadyVideoAssetForSubmission,
      createSubmission: async () => {
        throw new Error('Not implemented in update submission path.');
      },
      findSubmissionForEdit: (id) =>
        prisma.submission.findUnique({
          where: { id },
          include: {
            videoAsset: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        }),
      updateSubmission: (id, submission) =>
        prisma.submission.update({
          where: { id },
          data: submission,
        }),
    }, {
      id: data.id,
      userId: data.userId,
      videoAssetId: data.videoAssetId,
      title: data.title,
      description: data.description,
    });
  }

  static async submitSubmissionDraft(data: {
    id: string;
    userId: string;
  }): Promise<Submission> {
    return submitSubmissionDraftWithDeps({
      getReadyVideoAssetForSubmission: VideoAssetService.getReadyVideoAssetForSubmission,
      createSubmission: async () => {
        throw new Error('Not implemented in submit submission path.');
      },
      findSubmissionForEdit: (id) =>
        prisma.submission.findUnique({
          where: { id },
          include: {
            videoAsset: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        }),
      updateSubmission: (id, submission) =>
        prisma.submission.update({
          where: { id },
          data: submission,
        }),
    }, {
      id: data.id,
      userId: data.userId,
    });
  }

  static async updateSubmissionStatus(
    id: string,
    status: SubmissionStatus,
  ): Promise<Submission> {
    const current = await prisma.submission.findUnique({
      where: { id },
      include: {
        videoAsset: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!current) {
      throw new Error('Submission not found.');
    }

    if (current.status === status) {
      return prisma.submission.findUniqueOrThrow({ where: { id } });
    }

    const transition = prepareSubmissionStatusChange({
      currentStatus: current.status,
      nextStatus: status,
      currentSubmittedAt: current.submittedAt,
      assetStatus: current.videoAsset.status as VideoAssetStatus,
    });

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status,
        submittedAt: transition.submittedAt,
      },
    });

    captureMessage('Submission status updated.', 'info', {
      submissionId: current.id,
      userId: current.userId,
      title: current.title,
      previousStatus: current.status,
      nextStatus: status,
      lifecycleNote: transition.lifecycleNote,
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
