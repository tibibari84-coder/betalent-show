import Link from 'next/link';
import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

import {
  AppPage,
  PremiumArtworkPanel,
  PremiumCtaModule,
  PremiumEmptyState,
  PremiumHero,
  PremiumMetricCard,
  PremiumStageCard,
  PremiumStatusChip,
} from '@/components/premium';
import { getSubmissionTheme } from '@/lib/content-presentation';
import { SubmissionService } from '@/lib/services/submission.service';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';
import { VideoAssetService } from '@/lib/services/video-asset.service';

const submissionStatusLabel: Record<SubmissionStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

type SubmissionsState = 'blocked' | 'first-ready' | 'draft' | 'review' | 'success' | 'mixed';

export const dynamic = 'force-dynamic';

export default async function SubmissionsPage() {
  const session = await requireAuthenticatedOnboarded('/app/submissions');
  const [submissions, assets] = await Promise.all([
    SubmissionService.getSubmissionsByUser(session.user.id),
    VideoAssetService.getVideoAssetsByUser(session.user.id),
  ]);
  const draftCount = submissions.filter((submission) => submission.status === SubmissionStatus.DRAFT).length;
  const reviewCount = submissions.filter((submission) => submission.status === SubmissionStatus.SUBMITTED || submission.status === SubmissionStatus.UNDER_REVIEW).length;
  const acceptedCount = submissions.filter((submission) => submission.status === SubmissionStatus.ACCEPTED).length;
  const rejectedCount = submissions.filter((submission) => submission.status === SubmissionStatus.REJECTED).length;
  const readyAssetCount = assets.filter((asset) => asset.status === VideoAssetStatus.READY).length;
  const latestSubmission = submissions[0] ?? null;

  const submissionsState: SubmissionsState = submissions.length === 0
    ? readyAssetCount > 0
      ? 'first-ready'
      : 'blocked'
    : draftCount > 0
      ? 'draft'
      : reviewCount > 0
        ? 'review'
        : acceptedCount > 0 && rejectedCount === 0
          ? 'success'
          : 'mixed';

  return (
    <AppPage
      hero={
        <PremiumHero
          eyebrow="Submissions"
          tone="results"
          title={
            submissionsState === 'blocked'
              ? 'Submission workspace is waiting on media'
              : submissionsState === 'first-ready'
                ? 'READY media can become your first entry'
                : submissionsState === 'draft'
                  ? 'Draft submissions in motion'
                  : submissionsState === 'review'
                    ? 'Entries under review'
                    : submissionsState === 'success'
                      ? 'Accepted work on record'
                      : 'Submission history active'
          }
          subtitle={
            latestSubmission
              ? `${latestSubmission.title} • ${latestSubmission.status.replace('_', ' ').toLowerCase()}`
              : readyAssetCount > 0
                ? 'You already have media that can support your first real submission.'
                : 'Track drafts, review states, and accepted work.'
          }
          artwork={
            <PremiumArtworkPanel
              theme={getSubmissionTheme(latestSubmission?.status ?? SubmissionStatus.DRAFT)}
              eyebrow="Preview"
              title={latestSubmission?.title || 'Submission preview'}
              detail={latestSubmission?.description || 'Thumbnails from linked media become your submission cover treatment.'}
              imageUrl={latestSubmission?.videoAsset.thumbnailUrl}
              monogram={latestSubmission ? undefined : 'SB'}
            />
          }
          meta={
            <>
              <PremiumStatusChip label="Drafts" value={draftCount} />
              <PremiumStatusChip label="Review" value={reviewCount} />
              <PremiumStatusChip label="Accepted" value={acceptedCount} />
            </>
          }
        />
      }
    >
      <section className="foundation-panel rounded-[1.55rem] p-4 sm:rounded-[1.95rem] sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <PremiumMetricCard label="State" value={submissionsState} />
          <PremiumMetricCard label="READY media" value={readyAssetCount} />
          <PremiumMetricCard label="Accepted" value={acceptedCount} />
        </div>
      </section>

      <PremiumCtaModule
        eyebrow="Next move"
        title={
          submissionsState === 'blocked'
            ? 'Start with uploads'
            : submissionsState === 'first-ready'
              ? 'READY media is waiting'
              : submissionsState === 'draft'
                ? 'Continue your draft entries'
                : submissionsState === 'review'
                  ? 'Track official review'
                  : submissionsState === 'success'
                    ? 'Review accepted work'
                    : 'Check the latest entry mix'
        }
        description={
          submissionsState === 'blocked'
            ? 'Upload a video first so this workspace has real material to work with.'
            : submissionsState === 'first-ready'
              ? 'Your first actual submission should be created from READY media, not placeholder flow.'
              : submissionsState === 'draft'
                ? 'Your draft entries are the fastest path forward.'
                : submissionsState === 'review'
                  ? 'Review states should stay visible and concrete.'
                  : submissionsState === 'success'
                    ? 'Accepted work is now part of your returning creator state.'
                    : 'Some entries succeeded while others still need attention.'
        }
        action={
          <Link
            href={submissionsState === 'blocked' || submissionsState === 'first-ready' ? '/app/uploads' : '/app/submissions'}
            className="foundation-chip w-fit text-[0.7rem]"
          >
            {submissionsState === 'blocked' || submissionsState === 'first-ready' ? 'Go to uploads' : 'Review entries'}
          </Link>
        }
      />

      {submissions.length === 0 ? (
        <PremiumEmptyState title="No submissions yet">
          {readyAssetCount > 0 ? 'READY media is already available. Use it for your first real submission.' : 'Upload a video, wait for READY, then return here when the first entry can begin.'}
        </PremiumEmptyState>
      ) : (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="foundation-kicker">Entries</p>
              <h2 className="mt-2 text-[1.4rem] font-semibold text-white sm:text-2xl">Your submissions</h2>
            </div>
            <Link href="/app/uploads" className="foundation-inline-action">
              Open uploads
            </Link>
          </div>
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <PremiumStageCard
                key={submission.id}
                imageUrl={submission.videoAsset.thumbnailUrl}
                theme={getSubmissionTheme(submission.status)}
                eyebrow={submissionStatusLabel[submission.status]}
                title={submission.title}
                subtitle={
                  submission.status === SubmissionStatus.ACCEPTED
                    ? 'Accepted entry.'
                    : submission.status === SubmissionStatus.REJECTED
                      ? 'This entry was not accepted.'
                      : submission.description || 'Submission preview driven by linked media.'
                }
                meta={
                  <>
                    <span>Asset {submission.videoAsset.status}</span>
                    <span>{submission.judgeResults.length} judge update{submission.judgeResults.length === 1 ? '' : 's'}</span>
                  </>
                }
                className="min-h-[13rem]"
              />
            ))}
          </div>
        </section>
      )}
    </AppPage>
  );
}
