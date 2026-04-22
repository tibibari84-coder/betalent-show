import Link from 'next/link';
import { SubmissionStatus, VideoAssetStatus } from '@prisma/client';

import {
  AppPage,
  ContentRail,
  FeatureSurface,
  PremiumArtworkPanel,
  PremiumAvatar,
  PremiumStageCard,
  SupportPanel,
} from '@/components/premium';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';
import { prisma } from '@/server/db/prisma';
import { SubmissionService } from '@/lib/services/submission.service';
import { VideoAssetService } from '@/lib/services/video-asset.service';

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
  const needsAccountAlignment = Boolean(user.onboardingCompletedAt && user.role === 'USER');

  return (
    <AppPage
      hero={
        <FeatureSurface
          eyebrow="Creator"
          tone="violet"
          title={profileReady ? 'Shape the public version of you' : 'Your creator profile is almost there'}
          description={
            profileReady
              ? 'This is where your portrait, bio, and voice stay sharp before the next release.'
              : 'Finish the essentials once, and BETALENT can present you with confidence across the product.'
          }
          primaryAction={<Link href="/app/profile" className="foundation-hero-cta-primary">Edit profile</Link>}
          secondaryAction={<Link href="/app/settings" className="foundation-hero-cta-secondary">Account settings</Link>}
          meta={
            <>
              <span>{user.displayName || user.email}</span>
              {user.username ? <span>@{user.username}</span> : null}
            </>
          }
          media={
            <div className="flex items-end justify-end">
              <PremiumAvatar
                name={user.displayName || user.email}
                imageUrl={user.avatarUrl}
                className="h-36 w-36 border-white/12 bg-white/[0.06] text-base tracking-[0.08em] text-white shadow-[0_28px_70px_-32px_rgba(0,0,0,0.9)]"
              />
            </div>
          }
        />
      }
    >
      <div className="foundation-page-stack">
        <div className="foundation-support-grid">
          <SupportPanel
            eyebrow="Identity"
            title={
              profileReady
                ? `${user.displayName || 'Your creator profile'} is ready to be seen`
                : 'A few details still unlock the full BETALENT presentation'
            }
            description={
              profileReady
                ? user.creatorProfile?.bio || 'Your identity stack is in place and ready for the next release.'
                : 'Add your name, handle, bio, and location so the product can feel intentional instead of empty.'
            }
            tone="violet"
            action={<Link href="/app/profile" className="foundation-quiet-link">Open profile editor</Link>}
          />

          <SupportPanel
            eyebrow="Momentum"
            title={
              drafts > 0
                ? `${drafts} draft${drafts === 1 ? '' : 's'} already in progress`
                : readyAssets > 0
                  ? `${readyAssets} ready ${readyAssets === 1 ? 'asset' : 'assets'} available`
                  : 'Build your next move from profile first'
            }
            description={
              drafts > 0
                ? 'Your next story is already started. Keep it moving.'
                : readyAssets > 0
                  ? 'Your library is stocked enough to move into submissions when you want.'
                  : 'Once the profile feels right, uploads and entries start to make sense.'
            }
            tone={drafts > 0 ? 'gold' : readyAssets > 0 ? 'emerald' : 'cobalt'}
            action={<Link href={drafts > 0 ? '/app/submissions' : '/app/uploads'} className="foundation-quiet-link">{drafts > 0 ? 'Continue entries' : 'Open uploads'}</Link>}
          />
        </div>

        <ContentRail
          eyebrow="Keep close"
          title="Creator essentials"
          subtitle="A tighter set of surfaces that matter most on mobile."
        >
          <PremiumStageCard
            href="/app/profile"
            theme="violet"
            eyebrow="Profile"
            title={profileReady ? 'Portrait, handle, and bio' : 'Finish the essentials'}
            subtitle={profileReady ? 'Your profile is polished enough to lead with.' : 'These details shape the entire BETALENT presence.'}
            meta={<span>Edit now</span>}
          />
          <PremiumStageCard
            href="/app/uploads"
            theme="cobalt"
            eyebrow="Media"
            title="Your library"
            subtitle={readyAssets > 0 ? `${readyAssets} ready ${readyAssets === 1 ? 'piece' : 'pieces'} waiting.` : 'Bring in the next performance that deserves a spotlight.'}
            meta={<span>Open library</span>}
          />
          <PremiumStageCard
            href="/app/submissions"
            theme="gold"
            eyebrow="Entries"
            title={drafts > 0 ? 'Continue what you started' : 'When it is time, send the work forward'}
            subtitle="Submissions should feel like an editorial move, not a form stack."
            meta={<span>View entries</span>}
          />
        </ContentRail>

        <SupportPanel
          eyebrow="About you"
          title={[user.city, user.country].filter(Boolean).join(', ') || 'Add the city that frames your story'}
          description={
            needsAccountAlignment
              ? 'Your profile is usable today, but the account record still needs an operator sync behind the scenes.'
              : user.wantsToAudition
                ? 'BETALENT knows you want to audition. Keep the profile strong enough to back that intent.'
                : 'A strong creator page starts with simple, believable context and a voice that feels like you.'
          }
          tone={needsAccountAlignment ? 'ember' : 'cobalt'}
          action={<Link href="/app/settings" className="foundation-quiet-link">Review account</Link>}
          aside={
            <PremiumArtworkPanel
              theme={needsAccountAlignment ? 'ember' : 'violet'}
              title={user.username ? `@${user.username}` : 'Creator'}
              detail={user.creatorProfile?.bio ? 'Bio on file' : 'Bio still missing'}
              monogram={user.username ? `@${user.username}` : (user.displayName || user.email).slice(0, 2).toUpperCase()}
              className="min-h-[11rem] w-full sm:w-[13rem]"
            />
          }
        />
      </div>
    </AppPage>
  );
}
