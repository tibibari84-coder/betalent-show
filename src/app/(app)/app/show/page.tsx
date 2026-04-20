import type { Metadata } from "next";

import { AiInsightBlock } from "@/components/ai/AiInsightBlock";
import { EditorialCallout } from "@/components/editorial/EditorialCallout";
import { MemberHero } from "@/components/member/MemberHero";
import {
  ContentRail,
  FocusStrip,
  PerformancePosterCard,
  PremiumEmptyState,
  PremiumMetaGrid,
  PremiumScrollRow,
  SectionHeader,
  SpotlightCard,
} from "@/components/premium";
import { isArchivedSeasonStatus } from "@/lib/archive/archive-rules";
import {
  PERFORMANCE_KIND_LABEL,
  PERFORMANCE_STATUS_LABEL,
} from "@/lib/show/performance-labels";
import { listPerformancesForSeasonAndOptionalStage } from "@/server/performances/performance.service";
import { getPublishedPlacementForSlotKey } from "@/server/editorial/public-editorial.service";
import {
  getPublicHostForStage,
  getPublicProducerForEditorialPlacement,
} from "@/server/ai/public-ai.service";
import { getPublicResultsPayloadForShowState } from "@/server/results/public-results.service";
import { resolveShowState } from "@/server/show/show-state.service";

export const metadata: Metadata = {
  title: "Show · BETALENT",
  description:
    "Season performances and moments — cinematic, asynchronous BETALENT viewing context.",
};

export default async function AppShowPage() {
  const showState = await resolveShowState();

  const performanceSummaries =
    showState.season != null
      ? await listPerformancesForSeasonAndOptionalStage({
          seasonId: showState.season.id,
          take: 8,
        })
      : [];

  const [publishedResults, showHero, showSpotlight] = await Promise.all([
    getPublicResultsPayloadForShowState(showState),
    getPublishedPlacementForSlotKey("SHOW_HERO"),
    getPublishedPlacementForSlotKey("SHOW_SPOTLIGHT"),
  ]);

  const stageIdForAi = showState.stage?.id;
  const [producerShowHero, producerShowSpotlight, hostStageAi] =
    await Promise.all([
      showHero
        ? getPublicProducerForEditorialPlacement(showHero.placementId)
        : Promise.resolve(null),
      showSpotlight
        ? getPublicProducerForEditorialPlacement(showSpotlight.placementId)
        : Promise.resolve(null),
      stageIdForAi
        ? getPublicHostForStage(stageIdForAi)
        : Promise.resolve(null),
    ]);

  const seasonArchiveContext =
    showState.season != null
      ? isArchivedSeasonStatus(showState.season.status)
        ? "Recorded season"
        : "Active season"
      : "—";

  const hasPresentationRail =
    Boolean(showHero) ||
    Boolean(producerShowHero) ||
    Boolean(showSpotlight) ||
    Boolean(producerShowSpotlight) ||
    Boolean(hostStageAi);

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <MemberHero
        tone="show"
        eyebrow="The show"
        title="Performances & moments"
        subtitle="On-demand season storytelling — official records only when published."
      />

      {!showState.season ? (
        <PremiumEmptyState title="Show context">
          No season in focus. Performances appear here from published BETALENT
          records — not from this page alone.
        </PremiumEmptyState>
      ) : (
        <>
          <FocusStrip
            items={[
              { label: "Season", value: showState.season.title },
              {
                label: "Stage",
                value: showState.stage?.title ?? "Not active",
              },
              { label: "Phase", value: showState.displayState },
            ]}
          />

          <SpotlightCard emphasis="medium">
            <SectionHeader
              eyebrow="Official context"
              title="Season detail"
              subtitle="Structured record — not editorial voice."
            />
            <div className="mt-8">
              <PremiumMetaGrid
                rows={[
                  {
                    label: "Episode",
                    value: showState.episode?.title ?? "Not published",
                  },
                  {
                    label: "Published results",
                    value: publishedResults ? publishedResults.title : "None",
                  },
                  {
                    label: "Archive note",
                    value: seasonArchiveContext,
                  },
                ]}
              />
            </div>
          </SpotlightCard>

          {hasPresentationRail ? (
            <ContentRail
              eyebrow="Presentation"
              title="In focus"
              subtitle="Curated layers — asynchronous interpretation."
            >
              {showHero ? (
                <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start [&_aside]:mt-0">
                  <EditorialCallout
                    placement={showHero}
                    variant="hero"
                    className="mt-0"
                  />
                </div>
              ) : null}
              {producerShowHero ? (
                <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start">
                  <AiInsightBlock
                    variant="producer"
                    output={producerShowHero}
                    className="mt-0"
                  />
                </div>
              ) : null}
              {showSpotlight ? (
                <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start [&_aside]:mt-0">
                  <EditorialCallout
                    placement={showSpotlight}
                    variant="spotlight"
                    className="mt-0"
                  />
                </div>
              ) : null}
              {producerShowSpotlight ? (
                <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start">
                  <AiInsightBlock
                    variant="producer"
                    output={producerShowSpotlight}
                    className="mt-0"
                  />
                </div>
              ) : null}
              {hostStageAi ? (
                <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start">
                  <AiInsightBlock
                    variant="host"
                    output={hostStageAi}
                    className="mt-0"
                  />
                </div>
              ) : null}
            </ContentRail>
          ) : null}

          <section className="flex flex-col gap-4">
            <SectionHeader
              eyebrow="Catalog"
              title="Official performances"
              subtitle="Published Performance records for this season."
            />
            {performanceSummaries.length === 0 ? (
              <PremiumEmptyState title="Performances">
                None yet. Appear when an accepted audition becomes an official
                Performance — not from informal uploads.
              </PremiumEmptyState>
            ) : (
              <PremiumScrollRow>
                {performanceSummaries.map((p) => (
                  <PerformancePosterCard
                    key={p.id}
                    title={p.title}
                    meta={`${p.contestantDisplayName} · ${PERFORMANCE_KIND_LABEL[p.performanceType]} · ${PERFORMANCE_STATUS_LABEL[p.status]}`}
                    footnote={
                      p.mediaRef ? `Reference: ${p.mediaRef}` : undefined
                    }
                    accentSeed={p.id}
                  />
                ))}
              </PremiumScrollRow>
            )}
          </section>
        </>
      )}
    </div>
  );
}
