import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DiscoveryEngagementStrip } from '@/components/discovery/DiscoveryEngagementStrip';
import { PublicFollowButton } from '@/components/engagement/PublicFollowButton';
import { EngagementCountChip } from '@/components/engagement/EngagementCountChip';
import { PremiumAvatar } from '@/components/premium';
import { getSession } from '@/server/auth/session';
import { DiscoveryService } from '@/server/discovery/discovery.service';

export const dynamic = 'force-dynamic';

export default async function PublicCreatorPage(props: { params: Promise<{ username: string }> }) {
  const [{ username }, session] = await Promise.all([props.params, getSession()]);
  const destination = await DiscoveryService.getPublicCreatorByUsername(username, session?.user.id);

  if (!destination) {
    notFound();
  }

  const location = [destination.creator.city, destination.creator.country].filter(Boolean).join(', ');
  const canFollow = session?.user.id ? session.user.id !== destination.creator.id : false;
  const canAct = Boolean(session?.user.onboardingCompletedAt);
  const featuredItem = destination.items[0] ?? null;
  const moreItems = destination.items.slice(1);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-7">
      <section className="foundation-panel rounded-[1.7rem] p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/46">Public creator reel</p>
          <Link href="/app/discovery" className="foundation-quiet-link">
            Back to discovery
          </Link>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <PremiumAvatar
              name={destination.creator.name}
              imageUrl={destination.creator.avatarUrl}
              className="h-16 w-16 border-white/12 bg-white/[0.06] text-sm tracking-[0.08em] text-white/88 sm:h-20 sm:w-20"
            />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/44">Creator</p>
              <h1 className="truncate text-[1.35rem] font-semibold tracking-[-0.035em] text-white sm:text-[1.55rem]">
                {destination.creator.name}
              </h1>
              <p className="truncate text-sm text-white/56">@{destination.creator.username}</p>
              {destination.creator.bio ? (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/68">{destination.creator.bio}</p>
              ) : null}
              {location ? <p className="mt-2 text-xs text-white/48">{location}</p> : null}
            </div>
          </div>
          <PublicFollowButton
            creatorId={destination.creator.id}
            canFollow={canFollow}
            canAct={canAct}
            initialFollowed={destination.creator.isFollowedByCurrentUser}
            initialFollowerCount={destination.creator.followerCount}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <EngagementCountChip icon="followers" label="Followers" value={destination.creator.followerCount} />
          <EngagementCountChip icon="following" label="Following" value={destination.creator.followingCount} />
          <span className="inline-flex min-h-[2rem] items-center rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[11px] uppercase tracking-[0.09em] text-white/56">
            {destination.items.length} public performances
          </span>
          <span className="inline-flex min-h-[2rem] items-center rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[11px] uppercase tracking-[0.09em] text-white/56">
            Shorts-first surface
          </span>
        </div>
      </section>

      {destination.items.length === 0 ? (
        <section className="foundation-panel rounded-[1.45rem] p-4 sm:p-5">
          <p className="text-sm text-white/68">No public performances yet. Discoverable work appears here after acceptance.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link href="/app/uploads" className="foundation-inline-action">
              Open uploads
            </Link>
            <Link href="/app/submissions" className="foundation-inline-action">
              Open submissions
            </Link>
          </div>
        </section>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {featuredItem ? (
            <section className="foundation-panel rounded-[1.6rem] p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/46">Featured performance</p>
                <span className="text-xs text-white/44">Creator highlight reel</span>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <Link href={`/performance/${featuredItem.submissionId}`} className="block">
                  <div className="relative overflow-hidden rounded-[1.1rem] border border-white/10 bg-black/45">
                    {(featuredItem.media.playbackUrl || featuredItem.media.previewUrl) ? (
                      <video
                        controls
                        preload="metadata"
                        poster={featuredItem.media.thumbnailUrl || undefined}
                        className="aspect-[9/16] w-full bg-black"
                        src={featuredItem.media.playbackUrl || featuredItem.media.previewUrl || undefined}
                      />
                    ) : (
                      <div className="flex aspect-[9/16] w-full items-center justify-center text-sm text-white/42">
                        Preview unavailable
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-[1.2rem] font-semibold tracking-[-0.03em] text-white sm:text-[1.3rem]">
                      <Link href={`/performance/${featuredItem.submissionId}`} className="hover:text-white/88">
                        {featuredItem.title}
                      </Link>
                    </h2>
                    {featuredItem.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-white/64">{featuredItem.description}</p>
                    ) : (
                      <p className="mt-2 text-sm text-white/52">Short-form accepted performance.</p>
                    )}
                    <p className="mt-2 text-xs text-white/46">
                      {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(featuredItem.createdAt)}
                    </p>
                  </div>
                  <div className="mt-4">
                    <DiscoveryEngagementStrip
                      submissionId={featuredItem.submissionId}
                      creatorId={destination.creator.id}
                      canFollow={canFollow}
                      canLike={canAct}
                      showFollow={false}
                      initialLiked={featuredItem.engagement.likedByCurrentUser}
                      initialLikeCount={featuredItem.engagement.likeCount}
                      initialViewCount={featuredItem.engagement.viewCount}
                      initialFollowed={destination.creator.isFollowedByCurrentUser}
                      initialFollowerCount={destination.creator.followerCount}
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {moreItems.length > 0 ? (
            <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
              {moreItems.map((item) => {
                const playbackUrl = item.media.playbackUrl || item.media.previewUrl;
                return (
                  <article key={item.submissionId} className="foundation-panel rounded-[1.45rem] p-4 sm:p-5">
                    <Link href={`/performance/${item.submissionId}`} className="block">
                      <div className="relative overflow-hidden rounded-[1.05rem] border border-white/10 bg-black/40">
                        {playbackUrl ? (
                          <video
                            controls
                            preload="metadata"
                            poster={item.media.thumbnailUrl || undefined}
                            className="aspect-[9/16] w-full bg-black"
                            src={playbackUrl}
                          />
                        ) : (
                          <div className="flex aspect-[9/16] w-full items-center justify-center text-sm text-white/42">
                            Preview unavailable
                          </div>
                        )}
                      </div>
                    </Link>
                    <h2 className="mt-3 text-[1rem] font-semibold tracking-[-0.02em] text-white">
                      <Link href={`/performance/${item.submissionId}`} className="hover:text-white/88">
                        {item.title}
                      </Link>
                    </h2>
                    {item.description ? <p className="mt-1 text-sm text-white/62">{item.description}</p> : null}
                    <p className="mt-1 text-xs text-white/48">
                      {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(item.createdAt)}
                    </p>
                    <div className="mt-4">
                      <DiscoveryEngagementStrip
                        submissionId={item.submissionId}
                        creatorId={destination.creator.id}
                        canFollow={canFollow}
                        canLike={canAct}
                        showFollow={false}
                        initialLiked={item.engagement.likedByCurrentUser}
                        initialLikeCount={item.engagement.likeCount}
                        initialViewCount={item.engagement.viewCount}
                        initialFollowed={destination.creator.isFollowedByCurrentUser}
                        initialFollowerCount={destination.creator.followerCount}
                      />
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <section className="foundation-panel rounded-[1.45rem] p-4 sm:p-5">
              <p className="text-sm text-white/66">This creator has one discoverable performance live right now.</p>
              <p className="mt-1 text-xs text-white/48">Follow to keep this creator in your discovery loop.</p>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
