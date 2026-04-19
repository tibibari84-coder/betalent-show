import type { Metadata } from "next";
import Link from "next/link";

import { AiInsightBlock } from "@/components/ai/AiInsightBlock";
import { EditorialCallout } from "@/components/editorial/EditorialCallout";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  countPublishedStageResultsForSeason,
  getPublishedStageResultsHistoryForSeason,
} from "@/server/archive/result-history.service";
import { getPublishedPlacementForSlotKey } from "@/server/editorial/public-editorial.service";
import {
  getPublicHostForStageResult,
  getPublicProducerForEditorialPlacement,
} from "@/server/ai/public-ai.service";
import { getPublicResultsPayloadForShowState } from "@/server/results/public-results.service";
import { resolveShowState } from "@/server/show/show-state.service";

export const metadata: Metadata = {
  title: "Results · BETALENT",
  description: "Advancement and results for BETALENT.",
};

export default async function AppResultsPage() {
  const showState = await resolveShowState();
  const [published, resultsHero, resultsSpotlight] = await Promise.all([
    getPublicResultsPayloadForShowState(showState),
    getPublishedPlacementForSlotKey("RESULTS_HERO"),
    getPublishedPlacementForSlotKey("RESULTS_SPOTLIGHT"),
  ]);

  const seasonId = showState.season?.id;

  const [producerResultsHero, producerResultsSpotlight, hostResultsPackage] =
    await Promise.all([
      resultsHero
        ? getPublicProducerForEditorialPlacement(resultsHero.placementId)
        : Promise.resolve(null),
      resultsSpotlight
        ? getPublicProducerForEditorialPlacement(resultsSpotlight.placementId)
        : Promise.resolve(null),
      published?.stageResultId != null
        ? getPublicHostForStageResult(published.stageResultId)
        : Promise.resolve(null),
    ]);

  const publishedHistoryCount =
    seasonId != null
      ? await countPublishedStageResultsForSeason(seasonId)
      : 0;
  const recentPublishedHistory =
    seasonId != null
      ? await getPublishedStageResultsHistoryForSeason({
          seasonId,
          take: 5,
        })
      : [];

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        BETALENT · Results
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        Official outcomes come from published result records — not inferred from
        pages or feeds.
      </p>

      <EditorialCallout placement={resultsHero} variant="hero" />
      <AiInsightBlock variant="producer" output={producerResultsHero} />
      <EditorialCallout placement={resultsSpotlight} variant="spotlight" />
      <AiInsightBlock variant="producer" output={producerResultsSpotlight} />
      <AiInsightBlock variant="host" output={hostResultsPackage} />

      <dl className="grid gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Show display state
          </dt>
          <dd className="font-medium text-foreground">{showState.displayState}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Published result package
          </dt>
          <dd className="font-medium text-foreground">
            {published ? "Available" : "None published"}
          </dd>
        </div>
      </dl>

      {!published ? (
        <EmptyState title="Official published results">
          There is no published BETALENT result package for the current season /
          stage focus yet. When production publishes a StageResult package, it
          appears here as authoritative — draft or locked packages are never
          shown as public truth. Curated or AI blocks above (if any) do not
          replace this record.
        </EmptyState>
      ) : (
        <article className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
          <header className="flex flex-col gap-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/45">
              Official published package
            </p>
            <p className="text-xs uppercase tracking-wide text-foreground/50">
              {published.seasonTitle} · {published.stageTitle}
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {published.title}
            </h2>
            {published.summary ? (
              <p className="text-sm text-foreground/75">{published.summary}</p>
            ) : null}
            <p className="text-xs text-foreground/55">
              Published{" "}
              {published.publishedAt.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </header>
          <ol className="flex flex-col gap-3">
            {published.entries.map((e) => (
              <li
                key={`${published.stageResultId}-${e.placementOrder}`}
                className="flex flex-col gap-0.5 rounded-xl border border-foreground/10 px-3 py-2"
              >
                <span className="text-xs font-medium text-foreground/55">
                  #{e.placementOrder}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {e.contestantDisplayName}{" "}
                  <span className="font-normal text-foreground/55">
                    @{e.contestantHandle}
                  </span>
                </span>
                <span className="text-xs text-foreground/65">
                  {e.performanceTitle}
                </span>
                {e.highlightLabel ? (
                  <span className="text-xs text-foreground/55">
                    {e.highlightLabel}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="text-[11px] leading-relaxed text-foreground/45">
            Profile shows official advancement only when linked to published
            outcomes — not guesses from this list order alone.
          </p>
        </article>
      )}

      {seasonId != null ? (
        <section className="flex flex-col gap-2 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
          <h2 className="text-sm font-semibold tracking-tight">
            Published result history (this season)
          </h2>
          <p className="text-xs text-foreground/65">
            Stored{" "}
            <code className="rounded bg-foreground/5 px-1 font-mono text-[11px]">
              PUBLISHED
            </code>{" "}
            packages only — drafts never appear here.
          </p>
          <p className="text-sm text-foreground">
            Total published packages:{" "}
            <span className="font-medium">{publishedHistoryCount}</span>
          </p>
          {recentPublishedHistory.length === 0 ? (
            <p className="text-xs text-foreground/55">
              No prior published results in this season yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2 text-xs text-foreground/75">
              {recentPublishedHistory.map((h) => (
                <li key={h.stageResultId}>
                  <span className="font-medium text-foreground">{h.title}</span>{" "}
                  · {h.stageTitle} ·{" "}
                  {h.publishedAt.toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/app/archive"
            className="text-sm font-medium text-foreground underline underline-offset-4"
          >
            BETALENT archive (completed seasons)
          </Link>
        </section>
      ) : null}
    </div>
  );
}
