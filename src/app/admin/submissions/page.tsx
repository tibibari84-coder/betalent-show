import { AdminReviewService } from '@/lib/services/admin-review.service';
import { Badge } from '@/components/ui/Badge';
import { SubmissionStatus } from '@prisma/client';

type SubmissionWithRelations = {
  id: string;
  title: string;
  description: string | null;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  submittedAt: Date | null;
  videoAssetId: string;
  user: {
    id: string;
    displayName: string | null;
    username: string | null;
  };
  judgeResults: Array<{
    id: string;
    score: number | null;
    feedback: string | null;
    judge: {
      id: string;
      displayName: string | null;
      username: string | null;
    };
  }>;
};

const statusColors = {
  [SubmissionStatus.DRAFT]: 'secondary',
  [SubmissionStatus.SUBMITTED]: 'default',
  [SubmissionStatus.UNDER_REVIEW]: 'outline',
  [SubmissionStatus.ACCEPTED]: 'default',
  [SubmissionStatus.REJECTED]: 'destructive',
  [SubmissionStatus.WITHDRAWN]: 'secondary',
} as const;

export default async function AdminSubmissionsPage() {
  const submissions = await AdminReviewService.getPendingSubmissions() as SubmissionWithRelations[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Submission Queue</h1>
        <p className="text-gray-400 mt-2">Review and manage creator submissions.</p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/70 p-4 text-sm text-gray-300">
        Review actions are intentionally withheld until moderation workflows are wired to
        audited server actions. This screen is operational as a queue, not a fake control panel.
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No pending submissions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{submission.title}</h3>
                  {submission.description && (
                    <p className="text-gray-400 mb-4">{submission.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By: {submission.user.displayName || submission.user.username}</span>
                    <span>Submitted: {submission.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge variant={statusColors[submission.status]}>
                  {submission.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
