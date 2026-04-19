import type { Metadata } from "next";

import { AiInsightBlock } from "@/components/ai/AiInsightBlock";
import { EditorialCallout } from "@/components/editorial/EditorialCallout";
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
import { EmptyState } from "@/components/shared/EmptyState";
import { resolveShowState } from "@/server/show/show-state.service";

export const metadata: Metadata = {
  title: "Show · BETALENT",
  description: "Watch performances and season moments on BETALENT.",
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
        ? "Archive season (completed or archived)"
        : "Live season context"
      : "No season";

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        BETALENT · Show
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">The show</h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        This is where performances, episodes, and spotlight moments will live —
        a single, intentional viewing space for the competition.
      </p>
      <p className="text-sm leading-relaxed text-foreground/65">
        Playback is not built yet. This page reads show state and official
        Performance rows already in the season (structured show objects — not raw
        uploads or external URLs as finished media).
      </p>

      {!showState.season ? (
        <EmptyState title="Season focus">
          No active season is wired into show state yet. Official performances
          and results always come from published BETALENT records — not from this
          page alone.
        </EmptyState>
      ) : null}

      <EditorialCallout placement={showHero} variant="hero" />
      <AiInsightBlock variant="producer" output={producerShowHero} />
      <EditorialCallout placement={showSpotlight} variant="spotlight" />
      <AiInsightBlock variant="producer" output={producerShowSpotlight} />
      <AiInsightBlock variant="host" output={hostStageAi} />

      <dl className="grid gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Current season
          </dt>
          <dd className="font-medium text-foreground">
            {showState.season?.title ?? "No active season"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Current stage
          </dt>
          <dd className="font-medium text-foreground">
            {showState.stage?.title ?? "Not active"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Current episode
          </dt>
          <dd className="font-medium text-foreground">
            {showState.episode?.title ?? "Not published"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Published stage results
          </dt>
          <dd className="font-medium text-foreground">
            {publishedResults ? publishedResults.title : "None"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Season context
          </dt>
          <dd className="font-medium text-foreground">{seasonArchiveContext}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold tracking-tight">
          Official performances (season)
        </h2>
        {performanceSummaries.length === 0 ? (
          <EmptyState title="Official performances">
            No Performance records for this season yet. They appear when an
            accepted audition is promoted into the BETALENT show core — not from
            informal uploads.
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {performanceSummaries.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-sm"
              >
                <p className="font-medium text-foreground">{p.title}</p>
                <p className="mt-1 text-xs text-foreground/60">
                  {p.contestantDisplayName} ·{" "}
                  {PERFORMANCE_KIND_LABEL[p.performanceType]} ·{" "}
                  {PERFORMANCE_STATUS_LABEL[p.status]}
                </p>
                {p.mediaRef ? (
                  <p className="mt-1 truncate text-[11px] text-foreground/45">
                    Temporary reference (not finished BETALENT media):{" "}
                    {p.mediaRef}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
