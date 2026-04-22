import Link from 'next/link';
import type { ReactNode } from 'react';
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
import { getAssetTheme, getSubmissionTheme } from '@/lib/content-presentation';
import { EpisodeService } from '@/lib/services/episode.service';
import { SeasonService } from '@/lib/services/season.service';
import { StageService } from '@/lib/services/stage.service';
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
  const [seasons, user, submissions, assets] = await Promise.all([
    SeasonService.getAllSeasons(),
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

  const activeSeason = seasons.find((season) => season.status === 'LIVE') ?? seasons[0] ?? null;
  const [seasonStages, seasonEpisodes] = activeSeason
    ? await Promise.all([
        StageService.getStagesBySeason(activeSeason.id),
        EpisodeService.getEpisodesBySeason(activeSeason.id),
      ])
    : [[], []];

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
      title: 'Build the version of you people remember',
      subtitle: 'Finish your profile, voice, and city so BETALENT feels curated from the first glance.',
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
      title: 'Start with one great performance',
      subtitle: 'Your library only needs one strong piece to make the whole product feel alive.',
      primaryHref: '/app/uploads',
      primaryLabel: 'Upload media',
      secondaryHref: '/app/seasons',
      secondaryLabel: 'Browse the season',
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
      title: 'Your next piece is almost ready',
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
      title: 'One entry is already taking shape',
      subtitle: `Pick up where you left off with ${draftSubmission?.title || 'your draft'} and keep the momentum.`,
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
      title: 'Your latest entry is now under review',
      subtitle: `${reviewSubmission?.title || 'Your submission'} is already in the official decision flow.`,
      primaryHref: '/app/submissions',
      primaryLabel: 'View entry',
      secondaryHref: '/app/seasons',
      secondaryLabel: 'Open season',
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
      title: 'You already have work worth featuring',
      subtitle: `${acceptedSubmission?.title || 'Your accepted piece'} is the strongest signal in your current cycle.`,
      primaryHref: '/app/submissions',
      primaryLabel: 'See accepted work',
      secondaryHref: '/app/seasons',
      secondaryLabel: 'Open season',
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
      title: 'You have everything you need for the next move',
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
              {activeSeason ? <span>{activeSeason.title}</span> : null}
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
            title={latestSubmission ? latestSubmission.title : 'Your next featured entry starts here'}
            description={
              latestSubmission
                ? latestSubmission.description || 'Keep your strongest or most current piece close at hand.'
                : 'Finish your profile, add media, and BETALENT will have something real to showcase.'
            }
            tone="cobalt"
            action={
              <Link href={latestSubmission ? '/app/submissions' : '/app/profile'} className="foundation-quiet-link">
                {latestSubmission ? 'Open submissions' : 'Finish your profile'}
              </Link>
            }
          />

          <SupportPanel
            eyebrow="Your library"
            title={
              readyAssets.length > 0
                ? `${readyAssets.length} ready ${readyAssets.length === 1 ? 'piece' : 'pieces'} waiting`
                : processingAssets.length > 0
                  ? 'Something new is on the way'
                  : 'Your media shelf starts with one upload'
            }
            description={
              readyAssets.length > 0
                ? 'Choose the media that deserves the next spotlight.'
                : processingAssets.length > 0
                  ? 'Processing runs in the background so the library stays calm.'
                  : 'Once media arrives, the rest of the product opens up naturally.'
            }
            tone={readyAssets.length > 0 ? 'emerald' : processingAssets.length > 0 ? 'gold' : 'violet'}
            action={<Link href="/app/uploads" className="foundation-quiet-link">Open uploads</Link>}
          />
        </div>

        {seasonStages.length > 0 || seasonEpisodes.length > 0 ? (
          <ContentRail
            eyebrow="Season picks"
            title={activeSeason ? activeSeason.title : 'Current season'}
            subtitle="A tight look at what matters right now."
          >
            {seasonStages.slice(0, 2).map((stage) => (
              <PremiumStageCard
                key={stage.id}
                href={`/app/seasons/${activeSeason?.slug}`}
                theme="gold"
                eyebrow={stage.stageType}
                title={stage.title}
                subtitle={stage.description || 'A live part of the current season.'}
                meta={<span>Open season</span>}
              />
            ))}
            {seasonEpisodes.slice(0, 2).map((episode) => (
              <PremiumStageCard
                key={episode.id}
                href={`/app/seasons/${activeSeason?.slug}`}
                theme="cobalt"
                eyebrow="Episode"
                title={episode.title}
                subtitle={episode.description || 'A featured moment from the season.'}
                meta={<span>Explore</span>}
              />
            ))}
          </ContentRail>
        ) : (
          <PremiumEmptyState title="Season picks">
            The next big season moment will appear here as soon as BETALENT has one to feature.
          </PremiumEmptyState>
        )}

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
