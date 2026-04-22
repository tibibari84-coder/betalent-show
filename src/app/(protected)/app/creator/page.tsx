import Link from 'next/link';
import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

import { EngagementCountChip } from '@/components/engagement/EngagementCountChip';
import {
  AppPage,
  ContentRail,
  FeatureSurface,
  PremiumArtworkPanel,
  PremiumStatusChip,
  PremiumStageCard,
  SupportPanel,
} from '@/components/premium';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';
import { prisma } from '@/server/db/prisma';
import { FollowService } from '@/server/engagement/follow.service';
import { SubmissionService } from '@/lib/services/submission.service';
import { VideoAssetService } from '@/lib/services/video-asset.service';

export const dynamic = 'force-dynamic';

export default async function CreatorPage() {
  const session = await requireAuthenticatedOnboarded('/app/creator');
  const [user, submissions, assets, followCounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { creatorProfile: true },
    }),
    SubmissionService.getSubmissionsByUser(session.user.id),
    VideoAssetService.getVideoAssetsByUser(session.user.id),
    FollowService.getUserEngagementCounts(session.user.id),
  ]);

  if (!user) {
    throw new Error('Authenticated BETALENT creator could not be loaded.');
  }

  const readyAssets = assets.filter((asset) => asset.status === VideoAssetStatus.READY).length;
  const movingAssets = assets.filter(
    (asset) => asset.status === VideoAssetStatus.UPLOADING || asset.status === VideoAssetStatus.PROCESSING,
  ).length;
  const drafts = submissions.filter((submission) => submission.status === SubmissionStatus.DRAFT).length;
  const review = submissions.filter(
    (submission) =>
      submission.status === SubmissionStatus.SUBMITTED || submission.status === SubmissionStatus.UNDER_REVIEW,
  ).length;
  const profileReady = Boolean(user.displayName && user.username && user.creatorProfile?.bio);
  const needsAccountAlignment = Boolean(user.onboardingCompletedAt && user.role === 'USER');

  return (
    <AppPage
      hero={
        <FeatureSurface
          eyebrow="Creator"
          tone="violet"
          title="Creator workspace"
          description={'Track readiness, move drafts forward, and keep momentum across uploads and submissions.'}
          primaryAction={<Link href="/app/uploads" className="foundation-hero-cta-primary">Open media workspace</Link>}
          secondaryAction={<Link href="/app/submissions" className="foundation-hero-cta-secondary">Open submissions</Link>}
          meta={
            <>
              <EngagementCountChip icon="followers" label="Followers" value={followCounts.followerCount} />
              <PremiumStatusChip label="In review" value={review} />
              <PremiumStatusChip label="Drafts" value={drafts} />
              <PremiumStatusChip label="Ready media" value={readyAssets} />
            </>
          }
          media={
            <PremiumArtworkPanel
              theme={drafts > 0 ? 'gold' : readyAssets > 0 ? 'emerald' : 'cobalt'}
              eyebrow="Workspace state"
              title={
                drafts > 0
                  ? `${drafts} draft${drafts === 1 ? '' : 's'} active`
                  : readyAssets > 0
                    ? 'Library is ready for entries'
                    : 'Bring in your first media piece'
              }
              detail={
                drafts > 0
                  ? 'Draft momentum is active.'
                  : readyAssets > 0
                    ? 'READY assets are available for submissions.'
                    : 'Upload first media to activate workflow.'
              }
              monogram="CR"
              className="min-h-[15rem]"
            />
          }
        />
      }
    >
      <div className="foundation-page-stack">
        <div className="foundation-support-grid">
          <SupportPanel
            eyebrow="Profile handoff"
            title={
              profileReady
                ? 'Public identity is in place'
                : 'Profile still needs a final pass'
            }
            description={
              profileReady
                ? 'Identity is ready across product surfaces.'
                : 'Finish Profile identity, then return here to run workflow.'
            }
            tone="violet"
            action={<Link href="/app/profile" className="foundation-quiet-link">Go to Profile identity</Link>}
          />

          <SupportPanel
            eyebrow="Workflow pulse"
            title={
              drafts > 0
                ? `${drafts} draft${drafts === 1 ? '' : 's'} already in progress`
                : movingAssets > 0
                  ? `${movingAssets} upload${movingAssets === 1 ? '' : 's'} still processing`
                  : readyAssets > 0
                    ? `${readyAssets} ready ${readyAssets === 1 ? 'asset' : 'assets'} available`
                    : 'Creator workspace is ready for first media'
            }
            description={
              drafts > 0
                ? 'Your next submission already has shape.'
                : movingAssets > 0
                  ? 'Processing continues in the background until assets become READY.'
                  : readyAssets > 0
                    ? 'You have enough media to create or revise submissions.'
                    : 'Upload one short performance to begin.'
            }
            tone={drafts > 0 ? 'gold' : movingAssets > 0 ? 'cobalt' : readyAssets > 0 ? 'emerald' : 'cobalt'}
            action={<Link href={drafts > 0 ? '/app/submissions' : '/app/uploads'} className="foundation-quiet-link">{drafts > 0 ? 'Continue entries' : 'Open media workspace'}</Link>}
          />
        </div>

        <ContentRail
          eyebrow="Keep close"
          title="Core surfaces"
          subtitle="Profile handles identity. Creator handles workflow."
        >
          <PremiumStageCard
            href="/app/profile"
            theme="violet"
            eyebrow="Profile"
            title={profileReady ? 'Identity is presentation-ready' : 'Complete identity surface'}
            subtitle="Avatar, name, handle, location, and bio."
            meta={<span>Open Profile</span>}
          />
          <PremiumStageCard
            href="/app/uploads"
            theme="cobalt"
            eyebrow="Uploads"
            title={readyAssets > 0 ? 'Media library is active' : 'Start the media library'}
            subtitle={readyAssets > 0 ? `${readyAssets} ready ${readyAssets === 1 ? 'asset' : 'assets'} for submissions.` : 'Upload one short performance.'}
            meta={<span>Open Uploads</span>}
          />
          <PremiumStageCard
            href="/app/submissions"
            theme="gold"
            eyebrow="Submissions"
            title={drafts > 0 ? 'Continue active drafts' : 'Open submission workspace'}
            subtitle="Build from READY media and submit with intent."
            meta={<span>Open Submissions</span>}
          />
        </ContentRail>

        <SupportPanel
          eyebrow="Creator account state"
          title={needsAccountAlignment ? 'Operator sync still required' : 'Workspace status is aligned'}
          description={
            needsAccountAlignment
              ? 'Your workflow is usable, but account role alignment still requires an operator pass in this environment.'
              : user.wantsToAudition
                ? 'Audition intent is on file. Keep identity and workflow aligned.'
                : 'Creator tools are ready for upload, submission, and review cycles.'
          }
          tone={needsAccountAlignment ? 'ember' : 'cobalt'}
          action={<Link href="/app/settings" className="foundation-quiet-link">Open account settings</Link>}
          aside={
            <PremiumArtworkPanel
              theme={needsAccountAlignment ? 'ember' : 'violet'}
              title={user.username ? `@${user.username}` : 'Creator workspace'}
              detail={
                profileReady
                  ? 'Identity surface complete'
                  : 'Identity edits remain in Profile'
              }
              monogram="CW"
              className="min-h-[11rem] w-full sm:w-[13rem]"
            />
          }
        />
      </div>
    </AppPage>
  );
}
