import Link from 'next/link';

import { DiscoveryEngagementStrip } from '@/components/discovery/DiscoveryEngagementStrip';
import { AppPage, FeatureSurface, PremiumAvatar, PremiumEmptyState, SupportPanel } from '@/components/premium';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';
import { DiscoveryService } from '@/server/discovery/discovery.service';

export const dynamic = 'force-dynamic';

export default async function DiscoveryPage() {
  const session = await requireAuthenticatedOnboarded('/app/discovery');
  const feedItems = await DiscoveryService.getDiscoveryFeed(session.user.id);
  const featuredItem = feedItems[0] ?? null;
  const moreItems = feedItems.slice(1);

  return (
    <AppPage
      hero={
        <FeatureSurface
          eyebrow="Discovery"
          tone="cobalt"
          title="Discover short performances"
          description="Accepted short videos only. Creator identity, vertical playback, and engagement stay clear, premium, and reels-first."
          primaryAction={<Link href="/app/submissions" className="foundation-hero-cta-primary">Open submissions</Link>}
          secondaryAction={<Link href="/app/uploads" className="foundation-hero-cta-secondary">Open uploads</Link>}
          meta={
            <>
              <span>{feedItems.length} discoverable entries</span>
              <span>Short-form only</span>
            </>
          }
        />
      }
    >
      {feedItems.length === 0 ? (
        <PremiumEmptyState title="Discovery feed">
          <div className="space-y-3">
            <p>Discovery appears when accepted short performances are available.</p>
            <p>Build from uploads, submit with intent, and accepted work enters discovery.</p>
            <Link href="/app/submissions" className="foundation-inline-action">Open submission workspace</Link>
          </div>
        </PremiumEmptyState>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {featuredItem ? (
            <section className="foundation-panel rounded-[1.65rem] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/46">Featured discovery reel</p>
                <span className="text-xs text-white/44">Accepted short video</span>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                <Link href={`/performance/${featuredItem.submissionId}`} className="block">
                  <div className="relative overflow-hidden rounded-[1.1rem] border border-white/10 bg-black/40">
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
                    <Link href={`/creator/${featuredItem.creator.username!}`} className="flex items-center gap-3">
                      <PremiumAvatar
                        name={featuredItem.creator.name}
                        imageUrl={featuredItem.creator.avatarUrl}
                        className="h-10 w-10 border-white/10 bg-white/[0.06] text-[0.65rem] tracking-[0.08em] text-white/88"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{featuredItem.creator.name}</p>
                        <p className="truncate text-xs text-white/52">
                          {featuredItem.creator.username ? `@${featuredItem.creator.username}` : 'Creator'}
                        </p>
                      </div>
                    </Link>

                    <h2 className="mt-4 text-[1.22rem] font-semibold tracking-[-0.03em] text-white">
                      <Link href={`/performance/${featuredItem.submissionId}`} className="hover:text-white/90">
                        {featuredItem.title}
                      </Link>
                    </h2>
                    {featuredItem.description ? (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/62">{featuredItem.description}</p>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <div className="mb-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/54">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">Discovery live</span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">Creator-first</span>
                    </div>
                    <DiscoveryEngagementStrip
                      submissionId={featuredItem.submissionId}
                      creatorId={featuredItem.creator.id}
                      canFollow={featuredItem.creator.id !== session.user.id}
                      canLike
                      initialLiked={featuredItem.engagement.likedByCurrentUser}
                      initialLikeCount={featuredItem.engagement.likeCount}
                      initialViewCount={featuredItem.engagement.viewCount}
                      initialFollowed={featuredItem.creator.isFollowedByCurrentUser}
                      initialFollowerCount={featuredItem.creator.followerCount}
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
                  <article
                    key={item.submissionId}
                    className="foundation-panel rounded-[1.55rem] p-4 sm:p-5"
                  >
                    <Link href={`/performance/${item.submissionId}`} className="block">
                      <div className="relative overflow-hidden rounded-[1.1rem] border border-white/10 bg-black/40">
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

                    <Link href={`/creator/${item.creator.username!}`} className="mt-4 flex items-center gap-3">
                      <PremiumAvatar
                        name={item.creator.name}
                        imageUrl={item.creator.avatarUrl}
                        className="h-10 w-10 border-white/10 bg-white/[0.06] text-[0.65rem] tracking-[0.08em] text-white/88"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{item.creator.name}</p>
                        <p className="truncate text-xs text-white/52">
                          {item.creator.username ? `@${item.creator.username}` : 'Creator'}
                        </p>
                      </div>
                    </Link>

                    <h3 className="mt-3 text-[1.02rem] font-semibold tracking-[-0.02em] text-white">
                      <Link href={`/performance/${item.submissionId}`} className="hover:text-white/88">
                        {item.title}
                      </Link>
                    </h3>
                    {item.description ? (
                      <p className="mt-1 text-sm leading-relaxed text-white/62">{item.description}</p>
                    ) : null}

                    <div className="mt-4">
                      <div className="mb-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/54">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">Short video</span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">Accepted</span>
                      </div>
                      <DiscoveryEngagementStrip
                        submissionId={item.submissionId}
                        creatorId={item.creator.id}
                        canFollow={item.creator.id !== session.user.id}
                        canLike
                        initialLiked={item.engagement.likedByCurrentUser}
                        initialLikeCount={item.engagement.likeCount}
                        initialViewCount={item.engagement.viewCount}
                        initialFollowed={item.creator.isFollowedByCurrentUser}
                        initialFollowerCount={item.creator.followerCount}
                      />
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <SupportPanel
              eyebrow="Discovery lane"
              title="The featured entry is live"
              description="More accepted entries will appear here as soon as new work reaches discovery eligibility."
              tone="cobalt"
              action={<Link href="/app/submissions" className="foundation-quiet-link">Open submissions</Link>}
            />
          )}
        </div>
      )}
    </AppPage>
  );
}
