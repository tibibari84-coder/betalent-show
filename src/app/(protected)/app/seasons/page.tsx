import Link from 'next/link';

import {
  AppPage,
  ContentRail,
  PremiumArtworkPanel,
  PremiumEmptyState,
  PremiumHero,
  PremiumMetricCard,
  PremiumStageCard,
  PremiumStatusChip,
  StatusCard,
} from '@/components/premium';
import { getSeasonTheme, getStageTheme } from '@/lib/content-presentation';
import { EpisodeService } from '@/lib/services/episode.service';
import { SeasonService } from '@/lib/services/season.service';
import { StageService } from '@/lib/services/stage.service';

type SeasonsState = 'empty' | 'live' | 'upcoming' | 'library';

export default async function SeasonsPage() {
  const seasons = await SeasonService.getAllSeasons();
  const featuredSeason = seasons.find((season) => season.status === 'LIVE') ?? seasons[0] ?? null;
  const liveCount = seasons.filter((season) => season.status === 'LIVE').length;
  const upcomingCount = seasons.filter((season) => season.status === 'UPCOMING' || season.status === 'DRAFT').length;
  const seasonsState: SeasonsState = seasons.length === 0 ? 'empty' : liveCount > 0 ? 'live' : upcomingCount > 0 ? 'upcoming' : 'library';
  const [stages, episodes] = featuredSeason
    ? await Promise.all([
        StageService.getStagesBySeason(featuredSeason.id),
        EpisodeService.getEpisodesBySeason(featuredSeason.id),
      ])
    : [[], []];

  return (
    <AppPage
      hero={
        <PremiumHero
          eyebrow="Seasons"
          tone="show"
          title={
            seasonsState === 'empty'
              ? 'No season programming yet'
              : seasonsState === 'live'
                ? 'Season navigation is live'
                : seasonsState === 'upcoming'
                  ? 'Upcoming season library'
                  : 'Season archive and library'
          }
          subtitle={featuredSeason ? `Now showing: ${featuredSeason.title}` : 'Browse current and upcoming programming'}
          artwork={
            <PremiumArtworkPanel
              theme={featuredSeason ? getSeasonTheme(featuredSeason.status) : 'violet'}
              eyebrow={featuredSeason?.status || 'Season'}
              title={featuredSeason?.title || 'Season cover'}
              detail={featuredSeason?.description || 'Season cards should feel like real cover treatments, not plain admin rows.'}
              monogram={featuredSeason?.title.slice(0, 2).toUpperCase() || 'SN'}
              meta={featuredSeason ? <span>{stages.length} stages • {episodes.length} episodes</span> : undefined}
            />
          }
          meta={
            <>
              <PremiumStatusChip label="Live" value={liveCount} />
              <PremiumStatusChip label="Upcoming" value={upcomingCount} />
            </>
          }
        />
      }
    >
      {seasons.length === 0 ? (
        <PremiumEmptyState title="No seasons configured">
          Season navigation will appear here once programming is configured.
        </PremiumEmptyState>
      ) : (
        <>
          <section className="foundation-panel rounded-[1.55rem] p-4 sm:rounded-[1.95rem] sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <PremiumMetricCard label="State" value={seasonsState} />
              <PremiumMetricCard label="Live now" value={liveCount} />
              <PremiumMetricCard label="Upcoming" value={upcomingCount} />
            </div>
          </section>

          {featuredSeason ? (
            <StatusCard
              eyebrow="Featured season"
              title={featuredSeason.title}
              action={<Link href={`/app/seasons/${featuredSeason.slug}`} className="foundation-inline-action">Open season</Link>}
            >
              <div className="flex flex-wrap gap-2">
                <PremiumStatusChip label="Status" value={featuredSeason.status} />
                <PremiumStatusChip label="Stages" value={stages.length} />
                <PremiumStatusChip label="Episodes" value={episodes.length} />
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-white/62 sm:text-sm">
                {featuredSeason.description || 'Configured season metadata ready for public presentation.'}
              </p>
            </StatusCard>
          ) : null}

          {stages.length > 0 ? (
            <ContentRail
              eyebrow="Stages"
              title="Stage progression"
              subtitle="Stage cards become the internal cover system for each season."
            >
              {stages.map((stage) => (
                <PremiumStageCard
                  key={stage.id}
                  href={`/app/seasons/${featuredSeason?.slug}`}
                  theme={getStageTheme(stage.stageType, stage.status)}
                  eyebrow={stage.stageType}
                  title={stage.title}
                  subtitle={stage.description || `${stage.status.toLowerCase()} stage in this season.`}
                  meta={<span>{stage.status}</span>}
                />
              ))}
            </ContentRail>
          ) : null}

          {episodes.length > 0 ? (
            <ContentRail
              eyebrow="Episodes"
              title="Episode previews"
              subtitle="Episode treatment now sits alongside seasons and stages as a real content layer."
            >
              {episodes.map((episode) => (
                <PremiumStageCard
                  key={episode.id}
                  href={`/app/seasons/${featuredSeason?.slug}`}
                  theme="cobalt"
                  eyebrow="Episode"
                  title={episode.title}
                  subtitle={episode.description || `${episode.status.toLowerCase()} episode slot.`}
                  meta={<span>{episode.status}</span>}
                />
              ))}
            </ContentRail>
          ) : null}

          <ContentRail
            eyebrow="Library"
            title="Season rail"
            subtitle="Open any season and continue into its show context."
          >
            {seasons.map((season) => (
              <PremiumStageCard
                key={season.id}
                href={`/app/seasons/${season.slug}`}
                theme={getSeasonTheme(season.status)}
                eyebrow={season.status}
                title={season.title}
                subtitle={season.description || 'Configured season metadata ready for public presentation.'}
                meta={<span className="foundation-inline-action">Open season</span>}
              />
            ))}
          </ContentRail>
        </>
      )}
    </AppPage>
  );
}
