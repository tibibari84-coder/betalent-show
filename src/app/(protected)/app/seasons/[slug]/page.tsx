import { SeasonService } from '@/lib/services/season.service';
import { StageService } from '@/lib/services/stage.service';
import { EpisodeService } from '@/lib/services/episode.service';
import { PremiumHero } from '@/components/premium/PremiumHero';
import { PremiumEmptyState } from '@/components/premium/PremiumEmptyState';
import { SpotlightCard } from '@/components/premium/SpotlightCard';
import { PremiumMetaGrid } from '@/components/premium/PremiumMetaGrid';
import { SectionHeader } from '@/components/premium/SectionHeader';
import { notFound } from 'next/navigation';

interface SeasonDetailPageProps {
  params: Promise<{ slug: string }>;
}

const seasonStatusLabel: Record<string, string> = {
  LIVE: 'ACTIVE',
  UPCOMING: 'UPCOMING',
  DRAFT: 'DRAFT',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
};

export default async function SeasonDetailPage({ params }: SeasonDetailPageProps) {
  const { slug } = await params;
  const season = await SeasonService.getSeasonBySlug(slug);

  if (!season) {
    notFound();
  }

  const stages = await StageService.getStagesBySeason(season.id);
  const episodes = await EpisodeService.getEpisodesBySeason(season.id);

  return (
    <div className="space-y-8">
      <PremiumHero
        eyebrow="Season detail"
        tone="show"
        title={<>{season.title}</>}
        subtitle={season.description || 'A BETALENT season configured for structured public presentation.'}
      />

      <SpotlightCard className="rounded-[1.7rem]">
        <PremiumMetaGrid
          rows={[
            { label: 'Status', value: seasonStatusLabel[season.status] || season.status },
            { label: 'Start', value: season.startAt ? season.startAt.toLocaleDateString() : 'TBC' },
            { label: 'End', value: season.endAt ? season.endAt.toLocaleDateString() : 'TBC' },
            { label: 'Program shape', value: `${stages.length} stages • ${episodes.length} episodes` },
          ]}
        />
      </SpotlightCard>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Stages"
          title="Competition structure"
          subtitle="Each stage is held as an explicit show object, keeping the competition readable before stage-specific public pages ship."
        />
        {stages.length === 0 ? (
          <PremiumEmptyState title="No stages configured">
            This season has not been given public competition stages yet.
          </PremiumEmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="foundation-panel rounded-[1.5rem] p-5"
              >
                <p className="foundation-kicker">{stage.stageType}</p>
                <h3 className="mt-3 text-lg font-semibold text-white">{stage.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/64">
                  {stage.description || 'This stage is configured in the season architecture and awaits its dedicated public view.'}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-white/52">{stage.status}</span>
                  <span className="text-sm font-semibold text-white/46">Dedicated stage page later</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Episodes"
          title="Editorial cadence"
          subtitle="Episodes frame how the season is consumed publicly, even before full episode destination pages arrive."
        />
        {episodes.length === 0 ? (
          <PremiumEmptyState title="No episodes configured">
            Episodes can be added later without changing the public route structure.
          </PremiumEmptyState>
        ) : (
          <div className="space-y-4">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className="foundation-panel block rounded-[1.5rem] p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{episode.title}</h3>
                    <p className="mt-2 text-sm text-white/64">{episode.description}</p>
                  </div>
                  <div className="text-right">
                    {episode.premiereAt && (
                      <p className="text-sm text-white/54">
                        {episode.premiereAt.toLocaleDateString()}
                      </p>
                    )}
                    <span className="text-sm font-semibold text-white/42">Episode destination later</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
