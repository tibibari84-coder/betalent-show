import Link from 'next/link';
import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

import {
  AppPage,
  ContentRail,
  FeatureSurface,
  PremiumArtworkPanel,
  PremiumEmptyState,
  PremiumStageCard,
  SupportPanel,
} from '@/components/premium';
import { EngagementCountChip } from '@/components/engagement/EngagementCountChip';
import { SubmissionEngagementBar } from '@/components/engagement/SubmissionEngagementBar';
import { SubmissionDraftCreateForm, SubmissionDraftEditor } from '@/components/submissions/CreatorSubmissionForms';
import { getSubmissionTheme } from '@/lib/content-presentation';
import { SubmissionService } from '@/lib/services/submission.service';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';
import { SubmissionEngagementService } from '@/server/engagement/submission-engagement.service';
import { VideoAssetService } from '@/lib/services/video-asset.service';

const submissionStatusLabel: Record<SubmissionStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Not selected',
  WITHDRAWN: 'Withdrawn',
};

export const dynamic = 'force-dynamic';

export default async function SubmissionsPage() {
  const session = await requireAuthenticatedOnboarded('/app/submissions');
  const [submissions, assets] = await Promise.all([
    SubmissionService.getSubmissionsByUser(session.user.id),
    VideoAssetService.getVideoAssetsByUser(session.user.id),
  ]);

  const readyAssets = assets.filter((asset) => asset.status === VideoAssetStatus.READY && asset.originalityConfirmed);
  const readyAssetOptions = readyAssets.map((asset) => ({
    id: asset.id,
    label: `${asset.originalName} • ${(asset.size / (1024 * 1024)).toFixed(1)} MB`,
  }));
  const nonCompliantReadyAssetCount = assets.filter((asset) => asset.status === VideoAssetStatus.READY && !asset.originalityConfirmed).length;
  const draftSubmissions = submissions.filter((submission) => submission.status === SubmissionStatus.DRAFT);
  const reviewSubmissions = submissions.filter(
    (submission) =>
      submission.status === SubmissionStatus.SUBMITTED || submission.status === SubmissionStatus.UNDER_REVIEW,
  );
  const outcomeSubmissions = submissions.filter(
    (submission) =>
      submission.status === SubmissionStatus.ACCEPTED ||
      submission.status === SubmissionStatus.REJECTED ||
      submission.status === SubmissionStatus.WITHDRAWN,
  );
  const draftCount = submissions.filter((submission) => submission.status === SubmissionStatus.DRAFT).length;
  const reviewCount = submissions.filter((submission) => submission.status === SubmissionStatus.SUBMITTED || submission.status === SubmissionStatus.UNDER_REVIEW).length;
  const acceptedCount = submissions.filter((submission) => submission.status === SubmissionStatus.ACCEPTED).length;
  const readyAssetCount = readyAssets.length;
  const latestSubmission = submissions[0] ?? null;
  const engagementBySubmissionId = await SubmissionEngagementService.getSubmissionSnapshots({
    submissionRows: submissions.map((submission) => ({
      id: submission.id,
      status: submission.status,
    })),
    currentUserId: session.user.id,
  });

  return (
    <AppPage
      hero={
        <FeatureSurface
          eyebrow="Submissions"
          tone={
            latestSubmission?.status === SubmissionStatus.ACCEPTED
              ? 'emerald'
              : latestSubmission?.status === SubmissionStatus.REJECTED
                ? 'ember'
                : latestSubmission?.status === SubmissionStatus.SUBMITTED || latestSubmission?.status === SubmissionStatus.UNDER_REVIEW
                  ? 'cobalt'
                  : 'violet'
          }
          title={
            latestSubmission
              ? latestSubmission.status === SubmissionStatus.ACCEPTED
                ? 'Lead with accepted work'
                : latestSubmission.status === SubmissionStatus.SUBMITTED || latestSubmission.status === SubmissionStatus.UNDER_REVIEW
                  ? 'Your entry is in review'
                  : 'Your draft is active'
              : readyAssetCount > 0
                ? 'Submission workspace is ready to open'
                : 'Entries activate once your media library is ready'
          }
          description={
            latestSubmission
              ? latestSubmission.description || 'Submission is the core creator action.'
              : readyAssetCount > 0
                ? 'Select READY media, shape a draft, then submit with intent.'
                : 'Uploads prepares media. Submissions begins at READY.'
          }
          primaryAction={
            readyAssetCount > 0
              ? <a href="#submission-workspace" className="foundation-hero-cta-primary">Open workspace</a>
              : <Link href="/app/uploads" className="foundation-hero-cta-primary">Add media first</Link>
          }
          secondaryAction={
            <Link href="/app/uploads" className="foundation-hero-cta-secondary">See uploads</Link>
          }
          meta={
            <>
              <span>{draftCount} drafts</span>
              <span>{reviewCount} in review</span>
              <span>{acceptedCount} accepted</span>
            </>
          }
          media={
            <PremiumArtworkPanel
              theme={getSubmissionTheme(latestSubmission?.status ?? SubmissionStatus.DRAFT)}
              eyebrow="Featured entry"
              title={latestSubmission?.title || 'Next submission'}
              detail={latestSubmission?.description || 'Your linked media becomes the visual spine of the entry.'}
              imageUrl={latestSubmission?.videoAsset.thumbnailUrl}
              monogram={latestSubmission ? undefined : 'SB'}
              className="min-h-[15rem]"
            />
          }
        />
      }
    >
      <div className="foundation-page-stack">
        <section className="foundation-panel foundation-tint-gold rounded-[1.55rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="foundation-kicker">Ready to submit</p>
              <h2 className="mt-2 text-[1.35rem] font-semibold text-white sm:text-[1.6rem]">
                {readyAssetCount > 0
                  ? 'Turn READY media into official entries'
                  : 'Upload first, then make your move'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/62">
                {readyAssetCount > 0
                  ? 'Submission is the commitment point: shape a draft, then send it to review.'
                  : 'Submissions unlock when at least one owned upload reaches READY.'}
              </p>
            </div>
            <Link
              href={readyAssetCount > 0 ? '#submission-workspace' : '/app/uploads'}
              className="foundation-primary-button min-h-[3rem] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em]"
            >
              {readyAssetCount > 0 ? 'Start from READY assets' : 'Open uploads'}
            </Link>
          </div>
        </section>

        <section id="submission-workspace" className="foundation-panel rounded-[1.55rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="foundation-kicker">Creator workspace</p>
              <h2 className="mt-2 text-[1.35rem] font-semibold text-white sm:text-[1.6rem]">
                Submission workspace
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/62">
                Build from READY media, keep drafts editable, and submit only when the entry is final.
              </p>
              {nonCompliantReadyAssetCount > 0 ? (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-amber-100/82">
                  {nonCompliantReadyAssetCount} ready {nonCompliantReadyAssetCount === 1 ? 'asset is' : 'assets are'} excluded because originality confirmation is missing.
                </p>
              ) : null}
            </div>
            <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/58 sm:min-w-[15.5rem]">
              {readyAssetCount > 0
                ? `${readyAssetCount} ready ${readyAssetCount === 1 ? 'asset is' : 'assets are'} available for new drafts.`
                : 'No READY assets yet. Upload first.'}
            </div>
          </div>

          <div className="mt-6">
            {readyAssetOptions.length > 0 ? (
              <SubmissionDraftCreateForm assets={readyAssetOptions} />
            ) : (
              <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/62">
                Submission authoring unlocks when at least one owned upload reaches READY.
              </div>
            )}
          </div>
        </section>

        <div className="foundation-support-grid">
          <SupportPanel
            eyebrow="What to do next"
            title={
              latestSubmission
                ? latestSubmission.status === SubmissionStatus.DRAFT
                  ? 'Finish your draft'
                  : latestSubmission.status === SubmissionStatus.SUBMITTED || latestSubmission.status === SubmissionStatus.UNDER_REVIEW
                    ? 'Track current review'
                    : 'Build from accepted momentum'
                : 'First entry starts after first READY asset'
            }
            description={
              latestSubmission
                ? latestSubmission.status === SubmissionStatus.DRAFT
                  ? 'Refine now, submit when final.'
                  : latestSubmission.status === SubmissionStatus.SUBMITTED || latestSubmission.status === SubmissionStatus.UNDER_REVIEW
                    ? 'Keep focus on the active review cycle.'
                    : 'Use accepted work as the quality benchmark.'
                : 'Do not force submissions before media is READY.'
            }
            tone="violet"
            action={
              <Link
                href={latestSubmission?.status === SubmissionStatus.DRAFT ? '#submission-workspace' : '/app/uploads'}
                className="foundation-quiet-link"
              >
                {latestSubmission?.status === SubmissionStatus.DRAFT ? 'Return to draft workspace' : 'Open uploads'}
              </Link>
            }
          />

          <SupportPanel
            eyebrow="Your balance"
            title={
              acceptedCount > 0
                ? `${acceptedCount} accepted ${acceptedCount === 1 ? 'entry' : 'entries'} on file`
                : reviewCount > 0
                  ? `${reviewCount} ${reviewCount === 1 ? 'entry is' : 'entries are'} still moving`
                  : `${draftCount} ${draftCount === 1 ? 'draft' : 'drafts'} in progress`
            }
            description="BETALENT keeps the focus on the small set of entries that matter right now."
            tone={acceptedCount > 0 ? 'emerald' : reviewCount > 0 ? 'cobalt' : 'gold'}
          />
        </div>

        {draftSubmissions.length > 0 ? (
          <ContentRail
            eyebrow="Drafts"
            title="Editable submissions"
            subtitle="Refine each draft here, then submit when final."
          >
            {draftSubmissions.map((submission) => (
              <section key={submission.id} className="foundation-panel foundation-tint-violet rounded-[1.4rem] p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="foundation-kicker">Draft</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{submission.title}</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.08em] text-white/56">
                    Linked asset: {submission.videoAsset.originalName}
                  </div>
                </div>
                {readyAssetOptions.length > 0 ? (
                  <SubmissionDraftEditor
                    draft={{
                      id: submission.id,
                      title: submission.title,
                      description: submission.description,
                      videoAssetId: submission.videoAssetId,
                    }}
                    assets={readyAssetOptions}
                  />
                ) : (
                  <div className="rounded-[1rem] border border-amber-500/20 bg-amber-500/[0.08] px-4 py-4 text-sm text-amber-100">
                    No READY asset is currently available for this draft, so editing and submission stay blocked until your library is ready again.
                  </div>
                )}
                {engagementBySubmissionId[submission.id] ? (
                  <SubmissionEngagementBar
                    submissionId={submission.id}
                    initialLikeCount={engagementBySubmissionId[submission.id].likeCount}
                    initialViewCount={engagementBySubmissionId[submission.id].viewCount}
                    initialLiked={engagementBySubmissionId[submission.id].likedByCurrentUser}
                    canLike={engagementBySubmissionId[submission.id].canLike}
                    canView={engagementBySubmissionId[submission.id].canView}
                  />
                ) : null}
              </section>
            ))}
          </ContentRail>
        ) : null}

        {submissions.length === 0 ? (
          <PremiumEmptyState title="Submission workspace">
            <div className="space-y-3">
              <p>This is where media becomes official entries, not where media is uploaded.</p>
              <p>As soon as one asset reaches READY, your first draft can be created here.</p>
              <Link href="/app/uploads" className="foundation-inline-action">Open uploads library</Link>
            </div>
          </PremiumEmptyState>
        ) : reviewSubmissions.length > 0 ? (
          <ContentRail
            eyebrow="In review"
            title="Read-only review queue"
            subtitle="These entries are now in formal review and locked on the creator side."
          >
            {reviewSubmissions.slice(0, 6).map((submission) => (
              <PremiumStageCard
                key={submission.id}
                imageUrl={submission.videoAsset.thumbnailUrl}
                theme={getSubmissionTheme(submission.status)}
                eyebrow={submissionStatusLabel[submission.status]}
                title={submission.title}
                subtitle={
                  submission.status === SubmissionStatus.SUBMITTED
                    ? 'Submitted successfully. Review is pending.'
                    : submission.description || 'Under review. Updates will appear here.'
                }
                meta={
                  <>
                    <span>{submission.videoAsset.status === VideoAssetStatus.READY ? 'Ready media' : submission.videoAsset.status}</span>
                    <span>{submission.judgeResults.length} updates</span>
                    <EngagementCountChip
                      icon="like"
                      label="Likes"
                      value={engagementBySubmissionId[submission.id]?.likeCount ?? 0}
                      className="min-h-0 bg-white/[0.03] py-1"
                    />
                    <EngagementCountChip
                      icon="view"
                      label="Views"
                      value={engagementBySubmissionId[submission.id]?.viewCount ?? 0}
                      className="min-h-0 bg-white/[0.03] py-1"
                    />
                  </>
                }
              />
            ))}
          </ContentRail>
        ) : (
          <SupportPanel
            eyebrow="Queue state"
            title="Draft workspace is active"
            description="Everything is editable. Refine drafts, then submit with intent."
            tone="gold"
          />
        )}

        {outcomeSubmissions.length > 0 ? (
          <ContentRail
            eyebrow="Outcomes"
            title="Completed decisions"
            subtitle="Review outcomes are recorded here for calm follow-through."
          >
            {outcomeSubmissions.slice(0, 6).map((submission) => (
              <PremiumStageCard
                key={submission.id}
                imageUrl={submission.videoAsset.thumbnailUrl}
                theme={getSubmissionTheme(submission.status)}
                eyebrow={submissionStatusLabel[submission.status]}
                title={submission.title}
                subtitle={
                  submission.status === SubmissionStatus.ACCEPTED
                    ? 'Accepted. Use this quality level as your benchmark.'
                    : submission.status === SubmissionStatus.REJECTED
                      ? 'Not selected. Refine and move forward with the next entry.'
                      : 'Withdrawn from the current cycle.'
                }
                meta={
                  <>
                    <span>{submission.videoAsset.status === VideoAssetStatus.READY ? 'Ready media' : submission.videoAsset.status}</span>
                    <span>{submission.judgeResults.length} updates</span>
                    <EngagementCountChip
                      icon="like"
                      label="Likes"
                      value={engagementBySubmissionId[submission.id]?.likeCount ?? 0}
                      className="min-h-0 bg-white/[0.03] py-1"
                    />
                    <EngagementCountChip
                      icon="view"
                      label="Views"
                      value={engagementBySubmissionId[submission.id]?.viewCount ?? 0}
                      className="min-h-0 bg-white/[0.03] py-1"
                    />
                  </>
                }
              />
            ))}
          </ContentRail>
        ) : null}

        <SupportPanel
          eyebrow="Use your library well"
          title={readyAssetCount > 0 ? `${readyAssetCount} ready ${readyAssetCount === 1 ? 'asset' : 'assets'} can support the next entry` : 'Your next entry starts in uploads'}
          description="Uploads and submissions stay separate to keep workflow clear."
          tone={readyAssetCount > 0 ? 'cobalt' : 'ember'}
          action={<Link href="/app/uploads" className="foundation-quiet-link">Go to uploads</Link>}
        />
      </div>
    </AppPage>
  );
}
