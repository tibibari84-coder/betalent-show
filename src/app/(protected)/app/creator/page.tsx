import Link from 'next/link';
import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

import {
  AppPage,
  ContentRail,
  PremiumAvatar,
  PremiumCtaModule,
  PremiumHero,
  PremiumMetricCard,
  PremiumStageCard,
  PremiumStatusChip,
  StatusCard,
} from '@/components/premium';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';
import { prisma } from '@/server/db/prisma';
import { SubmissionService } from '@/lib/services/submission.service';
import { VideoAssetService } from '@/lib/services/video-asset.service';

type CreatorState = 'legacy-role' | 'setup' | 'active' | 'returning';

export const dynamic = 'force-dynamic';

export default async function CreatorPage() {
  const session = await requireAuthenticatedOnboarded('/app/creator');
  const [user, submissions, assets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { creatorProfile: true },
    }),
    SubmissionService.getSubmissionsByUser(session.user.id),
    VideoAssetService.getVideoAssetsByUser(session.user.id),
  ]);

  if (!user) {
    throw new Error('Authenticated BETALENT creator could not be loaded.');
  }

  const readyAssets = assets.filter((asset) => asset.status === VideoAssetStatus.READY).length;
  const drafts = submissions.filter((submission) => submission.status === SubmissionStatus.DRAFT).length;
  const profileReady = Boolean(user.displayName && user.username && user.creatorProfile?.bio);
  const roleNeedsClarification = Boolean(user.onboardingCompletedAt && user.role === 'USER');
  const creatorState: CreatorState = roleNeedsClarification
    ? 'legacy-role'
    : !profileReady
      ? 'setup'
      : readyAssets > 0 || drafts > 0
        ? 'active'
        : 'returning';

  return (
    <AppPage
      hero={
        <PremiumHero
          eyebrow="Creator"
          tone="profile"
          title={
            creatorState === 'legacy-role'
              ? 'Creator access needs alignment'
              : creatorState === 'setup'
                ? 'Set your creator identity'
                : creatorState === 'active'
                  ? 'Creator control is active'
                  : 'Creator profile is ready'
          }
          subtitle={
            creatorState === 'legacy-role'
              ? 'Onboarding is complete, but the stored role still reads USER.'
              : creatorState === 'setup'
                ? 'Finish the profile details that define how BETALENT presents you.'
                : creatorState === 'active'
                  ? 'Your creator workspace now has real media or submission activity.'
                  : 'Your creator profile is stable and ready for the next cycle.'
          }
          artwork={
            <div className="flex items-end justify-end">
              <PremiumAvatar
                name={user.displayName || user.email}
                imageUrl={user.avatarUrl}
                className="h-36 w-36 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.9)]"
              />
            </div>
          }
          meta={
            <>
              <PremiumStatusChip label="Role" value={user.role} />
              <PremiumStatusChip label="Drafts" value={drafts} />
              <PremiumStatusChip label="READY media" value={readyAssets} />
            </>
          }
        />
      }
    >
      <section className="foundation-panel rounded-[1.55rem] p-4 sm:rounded-[1.95rem] sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <PremiumMetricCard label="State" value={creatorState} />
          <PremiumMetricCard label="Role" value={user.role} />
          <PremiumMetricCard label="Current focus" value={drafts > 0 ? `${drafts} draft${drafts === 1 ? '' : 's'}` : `${readyAssets} ready asset${readyAssets === 1 ? '' : 's'}`} />
        </div>
        {roleNeedsClarification ? (
          <p className="mt-4 text-sm text-white/62">
            This account has completed creator onboarding, but the stored role still reads `USER`. Access is being treated as creator-ready in the UI until the account record is aligned.
          </p>
        ) : null}
      </section>

      <ContentRail
        eyebrow="Controls"
        title="Quick settings"
        subtitle="Profile, media, and account are now content-led creator controls."
      >
        <PremiumStageCard
          href="/app/profile"
          theme="violet"
          eyebrow="Identity"
          title={profileReady ? 'Profile is live' : 'Finish creator profile'}
          subtitle={profileReady ? 'Name, handle, bio, and avatar are in place.' : 'Display name, handle, bio, and avatar still need work.'}
          meta={<span className="foundation-inline-action">Edit profile</span>}
        />
        <PremiumStageCard
          href="/app/uploads"
          theme="cobalt"
          eyebrow="Media"
          title="Manage upload pipeline"
          subtitle={`${readyAssets} READY assets are on file.`}
          meta={<span className="foundation-inline-action">Open uploads</span>}
        />
        <PremiumStageCard
          href="/app/submissions"
          theme="gold"
          eyebrow="Competition"
          title={drafts > 0 ? 'Continue draft entries' : 'Review submissions'}
          subtitle="Creator control should always point back to active work."
          meta={<span className="foundation-inline-action">Open submissions</span>}
        />
      </ContentRail>

      <div className="foundation-page-cluster" data-columns="split">
        <StatusCard
          eyebrow="Creator status"
          title={
            <>
              {user.displayName || 'Creator profile'} {user.username ? <span className="text-white/48">@{user.username}</span> : null}
            </>
          }
        >
          <dl className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="foundation-metric-card">
              <dt className="text-xs uppercase tracking-[0.18em] text-white/42">Location</dt>
              <dd className="mt-2 text-sm text-white">{[user.city, user.country].filter(Boolean).join(', ') || 'Not set'}</dd>
            </div>
            <div className="foundation-metric-card">
              <dt className="text-xs uppercase tracking-[0.18em] text-white/42">Audition intent</dt>
              <dd className="mt-2 text-sm text-white">{user.wantsToAudition ? 'Interested' : 'Not marked yet'}</dd>
            </div>
          </dl>
        </StatusCard>

        <PremiumCtaModule
          eyebrow="Bio"
          title={user.creatorProfile?.bio ? 'Creator introduction on file' : 'No creator introduction yet'}
          description={user.creatorProfile?.bio || 'Use the profile editor to add a short creator introduction.'}
          action={<Link href="/app/profile" className="foundation-chip text-[0.7rem]">Edit profile</Link>}
          secondaryAction={<Link href="/app/settings" className="foundation-chip text-[0.7rem]">Account settings</Link>}
        />
      </div>
    </AppPage>
  );
}
