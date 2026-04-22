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
import { SubmissionDraftCreateForm, SubmissionDraftEditor } from '@/components/submissions/CreatorSubmissionForms';
import { getSubmissionTheme } from '@/lib/content-presentation';
import { SubmissionService } from '@/lib/services/submission.service';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';
import { VideoAssetService } from '@/lib/services/video-asset.service';
import { isSubmissionReadOnlyForCreator } from '@/server/submissions/lifecycle';

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

  const readyAssets = assets.filter((asset) => asset.status === VideoAssetStatus.READY);
  const readyAssetOptions = readyAssets.map((asset) => ({
    id: asset.id,
    label: `${asset.originalName} • ${(asset.size / (1024 * 1024)).toFixed(1)} MB`,
  }));
  const draftSubmissions = submissions.filter((submission) => submission.status === SubmissionStatus.DRAFT);
  const lockedSubmissions = submissions.filter((submission) => isSubmissionReadOnlyForCreator(submission.status));
  const draftCount = submissions.filter((submission) => submission.status === SubmissionStatus.DRAFT).length;
  const reviewCount = submissions.filter((submission) => submission.status === SubmissionStatus.SUBMITTED || submission.status === SubmissionStatus.UNDER_REVIEW).length;
  const acceptedCount = submissions.filter((submission) => submission.status === SubmissionStatus.ACCEPTED).length;
  const readyAssetCount = readyAssets.length;
  const latestSubmission = submissions[0] ?? null;

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
                ? 'Lead with the piece that already landed'
                : latestSubmission.status === SubmissionStatus.SUBMITTED || latestSubmission.status === SubmissionStatus.UNDER_REVIEW
                  ? 'Your latest entry is already in motion'
                  : 'Keep the next entry sharp and intentional'
              : readyAssetCount > 0
                ? 'Ready media is waiting for its first entry'
                : 'Entries begin the moment your library is ready'
          }
          description={
            latestSubmission
              ? latestSubmission.description || 'Every entry should feel like a featured release, not a status checklist.'
              : readyAssetCount > 0
                ? 'You already have media ready to turn into something official.'
                : 'Upload a piece first, then come back when there is something worth sending forward.'
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
        <section id="submission-workspace" className="foundation-panel rounded-[1.55rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="foundation-kicker">Creator workspace</p>
              <h2 className="mt-2 text-[1.35rem] font-semibold text-white sm:text-[1.6rem]">
                Real draft authoring lives here now
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/62">
                Create from READY media only, keep drafts editable, and submit explicitly when the entry is actually ready to leave your hands.
              </p>
            </div>
            <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/58">
              {readyAssetCount > 0
                ? `${readyAssetCount} ready ${readyAssetCount === 1 ? 'asset is' : 'assets are'} available for new drafts.`
                : 'No READY assets yet. Upload media before creating a draft.'}
            </div>
          </div>

          <div className="mt-6">
            {readyAssetOptions.length > 0 ? (
              <SubmissionDraftCreateForm assets={readyAssetOptions} />
            ) : (
              <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/62">
                Submission authoring unlocks as soon as at least one owned upload reaches READY.
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
                  ? 'Finish the draft while the idea is fresh'
                  : latestSubmission.status === SubmissionStatus.SUBMITTED || latestSubmission.status === SubmissionStatus.UNDER_REVIEW
                    ? 'Stay close to the entry that is active now'
                    : 'Use the strongest finished work to guide the next one'
                : 'The first entry comes after the first ready upload'
            }
            description={
              latestSubmission
                ? latestSubmission.status === SubmissionStatus.DRAFT
                  ? 'Drafts should feel light, editable, and easy to return to.'
                  : latestSubmission.status === SubmissionStatus.SUBMITTED || latestSubmission.status === SubmissionStatus.UNDER_REVIEW
                    ? 'Keep the focus on the piece currently in front of reviewers.'
                    : 'Finished work gives the whole profile a stronger center of gravity.'
                : 'Nothing here should be forced before the media is ready.'
            }
            tone="violet"
            action={<Link href="/app/uploads" className="foundation-quiet-link">Open uploads</Link>}
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
            title="Editable entries"
            subtitle="Drafts remain writable until you explicitly submit them."
          >
            {draftSubmissions.map((submission) => (
              <section key={submission.id} className="foundation-panel foundation-tint-violet rounded-[1.4rem] p-5">
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
              </section>
            ))}
          </ContentRail>
        ) : null}

        {submissions.length === 0 ? (
          <PremiumEmptyState title="Submission library">
            Once your media is ready, your first entry will appear here as a proper featured piece.
          </PremiumEmptyState>
        ) : lockedSubmissions.length > 0 ? (
          <ContentRail
            eyebrow="Your entries"
            title="Recent submissions"
            subtitle="Submitted entries become read-only on the creator side and continue through the review lifecycle."
          >
            {lockedSubmissions.slice(0, 6).map((submission) => (
              <PremiumStageCard
                key={submission.id}
                imageUrl={submission.videoAsset.thumbnailUrl}
                theme={getSubmissionTheme(submission.status)}
                eyebrow={submissionStatusLabel[submission.status]}
                title={submission.title}
                subtitle={
                  submission.status === SubmissionStatus.ACCEPTED
                    ? 'This piece already broke through.'
                    : submission.status === SubmissionStatus.REJECTED
                      ? 'Not selected this time.'
                      : submission.description || 'Built from your linked media and ready to revisit.'
                }
                meta={
                  <>
                    <span>{submission.videoAsset.status === VideoAssetStatus.READY ? 'Ready media' : submission.videoAsset.status}</span>
                    <span>{submission.judgeResults.length} updates</span>
                  </>
                }
              />
            ))}
          </ContentRail>
        ) : (
          <SupportPanel
            eyebrow="Queue state"
            title="Everything on this screen is still in draft"
            description="Nothing is locked yet. Save the draft when you need to, then submit explicitly once the entry is ready to move into review."
            tone="gold"
          />
        )}

        <SupportPanel
          eyebrow="Use your library well"
          title={readyAssetCount > 0 ? `${readyAssetCount} ready ${readyAssetCount === 1 ? 'asset' : 'assets'} can support the next entry` : 'Your next entry starts in uploads'}
          description="Uploads and submissions stay separate so each part of the product can stay calm and clear."
          tone={readyAssetCount > 0 ? 'cobalt' : 'ember'}
          action={<Link href="/app/uploads" className="foundation-quiet-link">Go to uploads</Link>}
        />
      </div>
    </AppPage>
  );
}
