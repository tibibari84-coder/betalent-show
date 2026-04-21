import Link from 'next/link';
import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

import {
  AppPage,
  ContentRail,
  PremiumAvatar,
  PremiumArtworkPanel,
  PremiumCtaModule,
  PremiumEmptyState,
  PremiumHero,
  PremiumMetricCard,
  PremiumStageCard,
  PremiumStatusChip,
  StatusCard,
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
      title: string;
      subtitle: string;
      primaryHref: string;
      primaryLabel: string;
      secondaryHref: string;
      secondaryLabel: string;
      artwork: React.ReactNode;
    }
  > = {
    'profile-setup': {
      title: 'Build your creator card',
      subtitle: 'Finish identity, bio, and location so BETALENT can present you like a real contender.',
      primaryHref: '/app/profile',
      primaryLabel: 'Complete profile',
      secondaryHref: '/app/creator',
      secondaryLabel: 'Open creator',
      artwork: (
        <PremiumArtworkPanel
          theme="violet"
          eyebrow="Creator setup"
          title="Identity first"
          detail="Name, handle, bio, and avatar become your on-platform cover."
          monogram={user.username ? `@${user.username}` : creatorName.slice(0, 2).toUpperCase()}
        />
      ),
    },
    'first-upload': {
      title: 'Upload your first performance',
      subtitle: 'Your home is ready. Media is the next real product step.',
      primaryHref: '/app/uploads',
      primaryLabel: 'Start upload',
      secondaryHref: '/app/seasons',
      secondaryLabel: 'Browse season',
      artwork: (
        <PremiumArtworkPanel
          theme="cobalt"
          eyebrow="Media queue"
          title="First asset"
          detail="Upload a video to unlock submission previews and media rails."
          monogram="01"
        />
      ),
    },
    'upload-processing': {
      title: 'Your media is moving',
      subtitle: `${processingAssets.length} asset${processingAssets.length === 1 ? '' : 's'} are still processing.`,
      primaryHref: '/app/uploads',
      primaryLabel: 'Track media',
      secondaryHref: '/app/submissions',
      secondaryLabel: 'Open submissions',
      artwork: (
        <PremiumArtworkPanel
          theme="gold"
          eyebrow="Processing"
          title={`${processingAssets.length} in motion`}
          detail="Wait for READY status before using media in submissions."
          imageUrl={processingAssets[0]?.thumbnailUrl}
          monogram={processingAssets[0] ? undefined : 'PR'}
        />
      ),
    },
    'draft-active': {
      title: 'Draft submission in progress',
      subtitle: `Continue "${draftSubmission?.title}" while your current season context is live.`,
      primaryHref: '/app/submissions',
      primaryLabel: 'Continue draft',
      secondaryHref: '/app/uploads',
      secondaryLabel: 'Open uploads',
      artwork: (
        <PremiumArtworkPanel
          theme={getSubmissionTheme(draftSubmission?.status ?? SubmissionStatus.DRAFT)}
          eyebrow="Draft live"
          title={draftSubmission?.title || 'Draft entry'}
          detail="Refine the entry before the official review flow starts."
          imageUrl={draftSubmission?.videoAsset.thumbnailUrl}
        />
      ),
    },
    'review-active': {
      title: 'Submission under review',
      subtitle: `${reviewSubmission?.title} is already in the decision flow.`,
      primaryHref: '/app/submissions',
      primaryLabel: 'View status',
      secondaryHref: '/app/seasons',
      secondaryLabel: 'Open season',
      artwork: (
        <PremiumArtworkPanel
          theme={getSubmissionTheme(reviewSubmission?.status ?? SubmissionStatus.SUBMITTED)}
          eyebrow="In review"
          title={reviewSubmission?.title || 'Active entry'}
          detail="Review states stay visible here so home answers what is active now."
          imageUrl={reviewSubmission?.videoAsset.thumbnailUrl}
        />
      ),
    },
    success: {
      title: 'Accepted work on file',
      subtitle: `${acceptedSubmission?.title} is your strongest current result.`,
      primaryHref: '/app/submissions',
      primaryLabel: 'Review accepted',
      secondaryHref: '/app/seasons',
      secondaryLabel: 'Open season',
      artwork: (
        <PremiumArtworkPanel
          theme="emerald"
          eyebrow="Accepted"
          title={acceptedSubmission?.title || 'Accepted entry'}
          detail="Returning creators should immediately see their best active result."
          imageUrl={acceptedSubmission?.videoAsset.thumbnailUrl}
        />
      ),
    },
    'returning-ready': {
      title: 'Ready for the next move',
      subtitle: `${readyAssets.length} READY asset${readyAssets.length === 1 ? '' : 's'} can support your next submission.`,
      primaryHref: '/app/uploads',
      primaryLabel: 'Review READY media',
      secondaryHref: '/app/submissions',
      secondaryLabel: 'Open submissions',
      artwork: (
        <PremiumArtworkPanel
          theme={getAssetTheme(readyAssets[0]?.status ?? VideoAssetStatus.READY)}
          eyebrow="Ready media"
          title={readyAssets[0]?.originalName || 'READY assets'}
          detail="Use your best thumbnail-backed asset as the next featured move."
          imageUrl={readyAssets[0]?.thumbnailUrl}
        />
      ),
    },
  };

  const hero = heroByState[homeState];

  return (
    <AppPage
      hero={
        <>
          <section className="foundation-home-mobile sm:hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.76rem] font-semibold tracking-[0.08em] text-white/56">
                  {new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date())}
                </p>
                <h1 className="mt-4 text-[3.35rem] font-semibold tracking-[-0.07em] text-white">
                  Home
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="foundation-orb-button" aria-hidden="true">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-6 w-6 text-white/78"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 5 19 19" />
                    <path d="m15.5 8.5 3.5 3.5V8.5Z" />
                    <path d="M8.5 15.5 5 12v3.5Z" />
                  </svg>
                </span>
                <PremiumAvatar
                  name={creatorName}
                  className="h-14 w-14 border-white/12 bg-[#9bc4f5] text-[0.88rem] tracking-[0.08em] text-[#0b1520]"
                />
              </div>
            </div>

            <div className="min-h-[26vh]" />

            <div className="foundation-home-promo">
              <div className="flex flex-col items-center text-center">
                <p className="text-[3.1rem] font-semibold tracking-[-0.08em] text-white">
                  {homeState === 'profile-setup' ? 'Profile' : 'Creator'}
                </p>
                <p className="mt-3 max-w-[19rem] text-[1.02rem] font-semibold leading-tight text-white/78">
                  {hero.subtitle}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Link href={hero.primaryHref} className="foundation-home-primary-cta">
                  {hero.primaryLabel}
                </Link>
                <Link href={hero.secondaryHref} className="foundation-home-info-cta" aria-label={hero.secondaryLabel}>
                  i
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-3">
                <span className="h-2.5 w-10 rounded-full bg-white/82" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/32" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/32" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/32" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
            </div>
          </section>

          <PremiumHero
            className="hidden sm:block"
            eyebrow="Creator Home"
            tone="lobby"
            title={hero.title}
            subtitle={hero.subtitle}
            artwork={hero.artwork}
            actions={
              <>
                <Link href={hero.primaryHref} className="foundation-hero-cta-primary">
                  {hero.primaryLabel}
                </Link>
                <Link href={hero.secondaryHref} className="foundation-hero-cta-secondary">
                  {hero.secondaryLabel}
                </Link>
              </>
            }
            meta={
              <>
                <PremiumStatusChip label="State" value={homeState.replace('-', ' ')} />
                {activeSeason ? <PremiumStatusChip label="Season" value={activeSeason.title} /> : null}
              </>
            }
          />
        </>
      }
    >
      <section className="foundation-panel rounded-[1.6rem] p-4 sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <p className="foundation-kicker">Current state</p>
            <h2 className="text-[1.5rem] font-semibold tracking-tight text-white sm:text-2xl">{creatorName}</h2>
            <p className="max-w-md text-[13px] text-white/62 sm:text-sm">{hero.subtitle}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <PremiumMetricCard label="Where you are" value="Creator home" tone="cobalt" />
            <PremiumMetricCard label="Active now" value={homeState.replace('-', ' ')} tone="violet" />
            <PremiumMetricCard
              label="Next move"
              value={<Link href={hero.primaryHref} className="inline-flex text-lg font-semibold text-white">{hero.primaryLabel}</Link>}
              tone="gold"
            />
          </div>
        </div>
      </section>

      {seasonStages.length > 0 || seasonEpisodes.length > 0 ? (
        <ContentRail
          eyebrow="Current show"
          title={activeSeason ? activeSeason.title : 'Season context'}
          subtitle="Content-led rails now reflect the active season structure."
        >
          {seasonStages.slice(0, 3).map((stage) => (
            <PremiumStageCard
              key={stage.id}
              href={`/app/seasons/${activeSeason?.slug}`}
              theme="gold"
              eyebrow={stage.stageType}
              title={stage.title}
              subtitle={stage.description || `${stage.status.toLowerCase()} stage in the active season.`}
              meta={<span>{stage.status}</span>}
            />
          ))}
          {seasonEpisodes.slice(0, 2).map((episode) => (
            <PremiumStageCard
              key={episode.id}
              href={`/app/seasons/${activeSeason?.slug}`}
              theme="cobalt"
              eyebrow="Episode"
              title={episode.title}
              subtitle={episode.description || `${episode.status.toLowerCase()} episode slot.`}
              meta={<span>{episode.status}</span>}
            />
          ))}
        </ContentRail>
      ) : null}

      {homeState === 'upload-processing' ? (
        <ContentRail eyebrow="Processing" title="Moving through pipeline" subtitle="Media states should feel explicit, not implied.">
          {processingAssets.map((asset) => (
            <PremiumStageCard
              key={asset.id}
              href="/app/uploads"
              imageUrl={asset.thumbnailUrl}
              theme={getAssetTheme(asset.status)}
              eyebrow={asset.status}
              title={asset.originalName}
              subtitle="This asset is still being prepared."
              meta={<span>{asset.mimeType}</span>}
            />
          ))}
        </ContentRail>
      ) : null}

      {(homeState === 'draft-active' || homeState === 'review-active' || homeState === 'success') && latestSubmission ? (
        <div className="foundation-page-cluster" data-columns="split">
          <StatusCard
            eyebrow="Submission focus"
            title={latestSubmission.title}
            action={<Link href="/app/submissions" className="foundation-inline-action">Open workspace</Link>}
            tone="cobalt"
          >
            Latest truth: {latestSubmission.status.replace('_', ' ').toLowerCase()}.
          </StatusCard>
          <PremiumArtworkPanel
            className="min-h-[14rem]"
            theme={getSubmissionTheme(latestSubmission.status)}
            eyebrow="Submission preview"
            title={latestSubmission.title}
            detail={latestSubmission.description || 'Submission preview driven by the linked media asset.'}
            imageUrl={latestSubmission.videoAsset.thumbnailUrl}
            meta={<span>{latestSubmission.videoAsset.status}</span>}
          />
        </div>
      ) : (
        <div className="foundation-page-cluster" data-columns="split">
          <StatusCard
            eyebrow="Submission state"
            title={latestSubmission ? latestSubmission.title : 'No submission history yet'}
            action={
              <Link href={latestSubmission ? '/app/submissions' : '/app/uploads'} className="foundation-inline-action">
                {latestSubmission ? 'Review submissions' : 'Go to uploads'}
              </Link>
            }
            tone="cobalt"
          >
            {latestSubmission
              ? `Latest status: ${latestSubmission.status.replace('_', ' ').toLowerCase()}.`
              : 'Upload media first, then return here when submission tools are in motion.'}
          </StatusCard>

          {activeSeason ? (
            <PremiumCtaModule
              eyebrow="Season"
              title={activeSeason.title}
              description={`${activeSeason.status.toLowerCase()} season is the current programming context.`}
              action={<Link href={`/app/seasons/${activeSeason.slug}`} className="foundation-inline-action">Open season</Link>}
              tone="violet"
            />
          ) : (
            <PremiumEmptyState title="No active season">
              Season navigation will appear here once programming is configured.
            </PremiumEmptyState>
          )}
        </div>
      )}
    </AppPage>
  );
}
