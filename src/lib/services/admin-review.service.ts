import { prisma } from '@/lib/prisma';
import { JudgeResult, JudgeResultStatus, Submission, SubmissionStatus } from '@prisma/client';

export class AdminReviewService {
  static async submitJudgeResult(data: {
    submissionId: string;
    judgeUserId: string;
    score?: number;
    feedback?: string;
  }): Promise<JudgeResult> {
    return prisma.judgeResult.create({
      data: {
        ...data,
        status: JudgeResultStatus.SUBMITTED,
      },
    });
  }

  static async approveJudgeResult(id: string): Promise<JudgeResult> {
    return prisma.judgeResult.update({
      where: { id },
      data: { status: JudgeResultStatus.APPROVED },
    });
  }

  static async rejectJudgeResult(id: string): Promise<JudgeResult> {
    return prisma.judgeResult.update({
      where: { id },
      data: { status: JudgeResultStatus.REJECTED },
    });
  }

  static async approveSubmission(submissionId: string): Promise<void> {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.ACCEPTED },
    });
  }

  static async rejectSubmission(submissionId: string): Promise<void> {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.REJECTED },
    });
  }

  static async getPendingSubmissions(): Promise<Submission[]> {
    return prisma.submission.findMany({
      where: { status: SubmissionStatus.SUBMITTED },
      include: {
        user: true,
        videoAsset: true,
        judgeResults: {
          include: {
            judge: true,
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }
}