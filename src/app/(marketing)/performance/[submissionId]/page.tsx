import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DiscoveryEngagementStrip } from '@/components/discovery/DiscoveryEngagementStrip';
import { PremiumAvatar } from '@/components/premium';
import { getSession } from '@/server/auth/session';
import { DiscoveryService } from '@/server/discovery/discovery.service';

export const dynamic = 'force-dynamic';

export default async function PublicPerformancePage(props: { params: Promise<{ submissionId: string }> }) {
  const [{ submissionId }, session] = await Promise.all([props.params, getSession()]);
  const item = await DiscoveryService.getPublicContentBySubmissionId(submissionId, session?.user.id);

  if (!item || !item.creator.username) {
    notFound();
  }

  const canFollow = session?.user.id ? session.user.id !== item.creator.id : false;
  const canAct = Boolean(session?.user.onboardingCompletedAt);
  const location = [item.creator.city, item.creator.country].filter(Boolean).join(', ');

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-7">
      <section className="foundation-panel rounded-[1.68rem] p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/44">Public performance reel</p>
          <div className="flex items-center gap-3 text-xs text-white/52">
            <Link href="/app/discovery" className="foundation-quiet-link">
              Discovery
            </Link>
            <span className="text-white/30">/</span>
            <Link href={`/creator/${item.creator.username}`} className="foundation-quiet-link">
              @{item.creator.username}
            </Link>
          </div>
        </div>

        <h1 className="text-[1.4rem] font-semibold tracking-[-0.035em] text-white sm:text-[1.65rem]">{item.title}</h1>
        {item.description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/66">{item.description}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/54">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">Accepted short video</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">Creator destination</span>
        </div>

        <div className="mt-4 relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/45">
          {(item.media.playbackUrl || item.media.previewUrl) ? (
            <video
              controls
              preload="metadata"
              poster={item.media.thumbnailUrl || undefined}
              className="aspect-[9/16] w-full bg-black"
              src={item.media.playbackUrl || item.media.previewUrl || undefined}
            />
          ) : (
            <div className="flex aspect-[9/16] w-full items-center justify-center text-sm text-white/42">
              Preview unavailable
            </div>
          )}
        </div>

        <div className="mt-4">
          <DiscoveryEngagementStrip
            submissionId={item.submissionId}
            creatorId={item.creator.id}
            canFollow={canFollow}
            canLike={canAct}
            initialLiked={item.engagement.likedByCurrentUser}
            initialLikeCount={item.engagement.likeCount}
            initialViewCount={item.engagement.viewCount}
            initialFollowed={item.creator.isFollowedByCurrentUser}
            initialFollowerCount={item.creator.followerCount}
          />
        </div>
      </section>

      <section className="foundation-panel rounded-[1.5rem] p-4 sm:p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/44">Creator identity</p>
        <div className="mt-3 flex items-center gap-3">
          <PremiumAvatar
            name={item.creator.name}
            imageUrl={item.creator.avatarUrl}
            className="h-11 w-11 border-white/12 bg-white/[0.06] text-[0.7rem] tracking-[0.08em] text-white/88"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{item.creator.name}</p>
            <p className="truncate text-xs text-white/52">@{item.creator.username}</p>
          </div>
        </div>
        {item.creator.bio ? <p className="mt-3 text-sm leading-relaxed text-white/66">{item.creator.bio}</p> : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-white/48">{location || 'Global creator'}</p>
          <Link href={`/creator/${item.creator.username}`} className="foundation-inline-action">
            Open creator profile
          </Link>
        </div>
      </section>
    </main>
  );
}
