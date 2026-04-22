import Link from 'next/link';
import type { ReactNode } from 'react';
import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

import {
  AppPage,
  FeatureSurface,
  PremiumArtworkPanel,
  SupportPanel,
} from '@/components/premium';
import { getAssetTheme, getSubmissionTheme } from '@/lib/content-presentation';
import { SubmissionService } from '@/lib/services/submission.service';
import { VideoAssetService } from '@/lib/services/video-asset.service';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';
import { prisma } from '@/server/db/prisma';

type HomeState =
  | 'profile-setup'
  | 'first-upload'
  | 'upload-processing'
  | 'draft-active'
  | 'review-active'
  | 'success'
  | 'returning-ready';

export default async function AppDashboardPage() {
  const session = await requireAuthenticatedOnboarded('/app');
  const [user, submissions, assets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { creatorProfile: true },
    }),
    SubmissionService.getSubmissionsByUser(session.user.id),
    VideoAssetService.getVideoAssetsByUser(session.user.id),
  ]);

  if (!user) {
    throw new Error('Authenticated BETALENT user could not be loaded.');
  }

  const creatorName = session.user.displayName || session.user.email;
  const latestSubmission = submissions[0] ?? null;
  const draftSubmission = submissions.find((submission) => submission.status === SubmissionStatus.DRAFT) ?? null;
  const reviewSubmission =
    submissions.find((submission) => submission.status === SubmissionStatus.SUBMITTED || submission.status === SubmissionStatus.UNDER_REVIEW) ?? null;
  const acceptedSubmission = submissions.find((submission) => submission.status === SubmissionStatus.ACCEPTED) ?? null;
  const readyAssets = assets.filter((asset) => asset.status === VideoAssetStatus.READY);
  const processingAssets = assets.filter(
    (asset) => asset.status === VideoAssetStatus.UPLOADING || asset.status === VideoAssetStatus.PROCESSING,
  );
  const profileReady = Boolean(user.displayName && user.username && user.city && user.country && user.creatorProfile?.bio);

  const homeState: HomeState = !profileReady
    ? 'profile-setup'
    : assets.length === 0
      ? 'first-upload'
      : processingAssets.length > 0 && readyAssets.length === 0
        ? 'upload-processing'
        : draftSubmission
          ? 'draft-active'
          : reviewSubmission
            ? 'review-active'
            : acceptedSubmission
              ? 'success'
              : 'returning-ready';

  const heroByState: Record<
    HomeState,
    {
      eyebrow: string;
      title: string;
      subtitle: string;
      primaryHref: string;
      primaryLabel: string;
      secondaryHref: string;
      secondaryLabel: string;
      tone: 'violet' | 'cobalt' | 'gold' | 'emerald';
      media: ReactNode;
    }
  > = {
    'profile-setup': {
      eyebrow: 'Creator Home',
      title: 'Set your public identity',
      subtitle: 'Finish profile essentials so every surface feels complete.',
      primaryHref: '/app/profile',
      primaryLabel: 'Complete profile',
      secondaryHref: '/app/creator',
      secondaryLabel: 'Open creator',
      tone: 'violet',
      media: (
        <PremiumArtworkPanel
          theme="violet"
          eyebrow="Featured"
          title="Creator profile"
          detail="Identity, portrait, and bio become your cover treatment across the product."
          monogram={user.username ? `@${user.username}` : creatorName.slice(0, 2).toUpperCase()}
          className="min-h-[15rem]"
        />
      ),
    },
    'first-upload': {
      eyebrow: 'Creator Home',
      title: 'Upload your first performance',
      subtitle: 'One strong short video unlocks the full creator workflow.',
      primaryHref: '/app/uploads',
      primaryLabel: 'Upload media',
      secondaryHref: '/app/submissions',
      secondaryLabel: 'Open entries',
      tone: 'cobalt',
      media: (
        <PremiumArtworkPanel
          theme="cobalt"
          eyebrow="Media"
          title="First upload"
          detail="Bring in one piece of performance media, then build from there."
          monogram="01"
          className="min-h-[15rem]"
        />
      ),
    },
    'upload-processing': {
      eyebrow: 'Creator Home',
      title: 'Your upload is processing',
      subtitle: `${processingAssets.length} upload${processingAssets.length === 1 ? '' : 's'} are moving through processing.`,
      primaryHref: '/app/uploads',
      primaryLabel: 'Track uploads',
      secondaryHref: '/app/submissions',
      secondaryLabel: 'See entries',
      tone: 'gold',
      media: (
        <PremiumArtworkPanel
          theme="gold"
          eyebrow="In motion"
          title={processingAssets[0]?.originalName || 'Processing now'}
          detail="BETALENT will bring it forward the moment it becomes ready."
          imageUrl={processingAssets[0]?.thumbnailUrl}
          className="min-h-[15rem]"
        />
      ),
    },
    'draft-active': {
      eyebrow: 'Creator Home',
      title: 'Your draft is active',
      subtitle: `Continue ${draftSubmission?.title || 'your draft'} while momentum is high.`,
      primaryHref: '/app/submissions',
      primaryLabel: 'Continue draft',
      secondaryHref: '/app/uploads',
      secondaryLabel: 'Open library',
      tone: 'violet',
      media: (
        <PremiumArtworkPanel
          theme={getSubmissionTheme(draftSubmission?.status ?? SubmissionStatus.DRAFT)}
          eyebrow="Draft"
          title={draftSubmission?.title || 'Current draft'}
          detail="Refine the idea before you send it forward."
          imageUrl={draftSubmission?.videoAsset.thumbnailUrl}
          className="min-h-[15rem]"
        />
      ),
    },
    'review-active': {
      eyebrow: 'Creator Home',
      title: 'Your entry is in review',
      subtitle: `${reviewSubmission?.title || 'Your submission'} is already in the official decision flow.`,
      primaryHref: '/app/submissions',
      primaryLabel: 'View entry',
      secondaryHref: '/app/uploads',
      secondaryLabel: 'Open uploads',
      tone: 'cobalt',
      media: (
        <PremiumArtworkPanel
          theme={getSubmissionTheme(reviewSubmission?.status ?? SubmissionStatus.SUBMITTED)}
          eyebrow="Under review"
          title={reviewSubmission?.title || 'Featured entry'}
          detail="Stay close to the piece that is active right now."
          imageUrl={reviewSubmission?.videoAsset.thumbnailUrl}
          className="min-h-[15rem]"
        />
      ),
    },
    success: {
      eyebrow: 'Creator Home',
      title: 'You have accepted work',
      subtitle: `${acceptedSubmission?.title || 'Your accepted piece'} is the strongest signal in your current cycle.`,
      primaryHref: '/app/submissions',
      primaryLabel: 'See accepted work',
      secondaryHref: '/app/uploads',
      secondaryLabel: 'Open uploads',
      tone: 'emerald',
      media: (
        <PremiumArtworkPanel
          theme="emerald"
          eyebrow="Accepted"
          title={acceptedSubmission?.title || 'Accepted entry'}
          detail="This is the piece BETALENT can confidently build around."
          imageUrl={acceptedSubmission?.videoAsset.thumbnailUrl}
          className="min-h-[15rem]"
        />
      ),
    },
    'returning-ready': {
      eyebrow: 'Creator Home',
      title: 'You are ready for the next submission',
      subtitle: `${readyAssets.length} ready ${readyAssets.length === 1 ? 'piece is' : 'pieces are'} waiting in your library.`,
      primaryHref: '/app/uploads',
      primaryLabel: 'Review library',
      secondaryHref: '/app/submissions',
      secondaryLabel: 'Open entries',
      tone: 'emerald',
      media: (
        <PremiumArtworkPanel
          theme={getAssetTheme(readyAssets[0]?.status ?? VideoAssetStatus.READY)}
          eyebrow="Ready now"
          title={readyAssets[0]?.originalName || 'Featured media'}
          detail="Choose your strongest ready piece and move on it."
          imageUrl={readyAssets[0]?.thumbnailUrl}
          className="min-h-[15rem]"
        />
      ),
    },
  };

  const hero = heroByState[homeState];

  return (
    <AppPage
      hero={
        <FeatureSurface
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.subtitle}
          tone={hero.tone}
          primaryAction={<Link href={hero.primaryHref} className="foundation-hero-cta-primary">{hero.primaryLabel}</Link>}
          secondaryAction={<Link href={hero.secondaryHref} className="foundation-hero-cta-secondary">{hero.secondaryLabel}</Link>}
          meta={
            <>
              <span>{creatorName}</span>
              <span>On-demand creator workflow</span>
            </>
          }
          media={hero.media}
        />
      }
    >
      <div className="foundation-page-stack">
        <div className="foundation-support-grid">
          <SupportPanel
            eyebrow="Now showing"
            title={latestSubmission ? latestSubmission.title : 'Your next submission starts here'}
            description={
              latestSubmission
                ? latestSubmission.description || 'Keep your current entry in focus.'
                : 'Complete identity, upload media, then open submissions.'
            }
            tone="cobalt"
            action={
              <Link href={latestSubmission ? '/app/submissions' : '/app/profile'} className="foundation-quiet-link">
                {latestSubmission ? 'Open submissions' : 'Open profile identity'}
              </Link>
            }
          />

          <SupportPanel
            eyebrow="Your library"
            title={
              readyAssets.length > 0
                ? `${readyAssets.length} ready ${readyAssets.length === 1 ? 'piece' : 'pieces'} waiting`
                : processingAssets.length > 0
                  ? 'Processing in progress'
                  : 'Ready for first upload'
            }
            description={
              readyAssets.length > 0
                ? 'Pick the strongest asset and attach it to a submission.'
                : processingAssets.length > 0
                  ? 'Processing runs in the background; READY assets appear automatically.'
                : 'Upload your first short performance to activate the workspace.'
            }
            tone={readyAssets.length > 0 ? 'emerald' : processingAssets.length > 0 ? 'gold' : 'violet'}
            action={<Link href="/app/uploads" className="foundation-quiet-link">Open uploads</Link>}
          />
        </div>

        {latestSubmission ? (
          <SupportPanel
            eyebrow="Featured entry"
            title={latestSubmission.title}
            description={latestSubmission.description || 'Your latest entry remains the cleanest reflection of where you are right now.'}
            tone={latestSubmission.status === SubmissionStatus.ACCEPTED ? 'emerald' : latestSubmission.status === SubmissionStatus.REJECTED ? 'ember' : 'violet'}
            aside={<span className="text-sm text-white/52">{latestSubmission.videoAsset.status}</span>}
            action={<Link href="/app/submissions" className="foundation-quiet-link">Open entry details</Link>}
          />
        ) : null}
      </div>
    </AppPage>
  );
}
