import type { Metadata } from "next";
import Link from "next/link";

import { AiInsightBlock } from "@/components/ai/AiInsightBlock";
import { EditorialCallout } from "@/components/editorial/EditorialCallout";
import { MemberHero } from "@/components/member/MemberHero";
import {
  ContentRail,
  FocusStrip,
  PremiumEmptyState,
  SectionHeader,
  SpotlightCard,
} from "@/components/premium";
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
  description:
    "Official BETALENT outcomes — published result packages and advancement truth.",
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

  const hasPresentationRail =
    Boolean(resultsHero) ||
    Boolean(producerResultsHero) ||
    Boolean(resultsSpotlight) ||
    Boolean(producerResultsSpotlight) ||
    Boolean(hostResultsPackage);

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <MemberHero
        tone="results"
        eyebrow="Official outcomes"
        title="Results"
        subtitle="Advancement truth ships only in published BETALENT packages."
      />

      <FocusStrip
        items={[
          { label: "Phase", value: showState.displayState },
          {
            label: "Published package",
            value: published ? "Available" : "None yet",
          },
        ]}
      />

      {hasPresentationRail ? (
        <ContentRail
          eyebrow="Presentation"
          title="Authority layer"
          subtitle="Interpretive — never a substitute for the official package."
        >
          {resultsHero ? (
            <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start [&_aside]:mt-0">
              <EditorialCallout
                placement={resultsHero}
                variant="hero"
                className="mt-0"
              />
            </div>
          ) : null}
          {producerResultsHero ? (
            <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start">
              <AiInsightBlock
                variant="producer"
                output={producerResultsHero}
                className="mt-0"
              />
            </div>
          ) : null}
          {resultsSpotlight ? (
            <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start [&_aside]:mt-0">
              <EditorialCallout
                placement={resultsSpotlight}
                variant="spotlight"
                className="mt-0"
              />
            </div>
          ) : null}
          {producerResultsSpotlight ? (
            <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start">
              <AiInsightBlock
                variant="producer"
                output={producerResultsSpotlight}
                className="mt-0"
              />
            </div>
          ) : null}
          {hostResultsPackage ? (
            <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start">
              <AiInsightBlock
                variant="host"
                output={hostResultsPackage}
                className="mt-0"
              />
            </div>
          ) : null}
        </ContentRail>
      ) : null}

      {!published ? (
        <PremiumEmptyState title="Official package">
          Nothing published for this focus yet. When production ships a
          StageResult package, it lands here as the sole public truth.
        </PremiumEmptyState>
      ) : (
        <article className="relative overflow-hidden rounded-[1.75rem] border border-amber-200/15 bg-gradient-to-b from-amber-50/[0.06] via-foreground/[0.04] to-transparent p-7 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.08)] sm:rounded-[2rem] sm:p-9 dark:from-amber-100/[0.05]">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-200/80 via-amber-100/40 to-transparent opacity-70 dark:from-amber-300/70" />
          <header className="relative flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground/48">
              Official · published package
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-foreground/52">
              {published.seasonTitle} · {published.stageTitle}
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {published.title}
            </h2>
            {published.summary ? (
              <p className="max-w-prose text-sm leading-relaxed text-foreground/78">
                {published.summary}
              </p>
            ) : null}
            <p className="text-xs text-foreground/52">
              Published{" "}
              {published.publishedAt.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </header>
          <ol className="relative mt-8 flex flex-col gap-3">
            {published.entries.map((e) => (
              <li
                key={`${published.stageResultId}-${e.placementOrder}`}
                className="rounded-xl border border-white/[0.07] bg-black/25 px-4 py-3.5 backdrop-blur-sm"
              >
                <span className="text-xs font-medium text-foreground/52">
                  #{e.placementOrder}
                </span>
                <span className="mt-1 block text-sm font-medium text-foreground">
                  {e.contestantDisplayName}{" "}
                  <span className="font-normal text-foreground/52">
                    @{e.contestantHandle}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-foreground/68">
                  {e.performanceTitle}
                </span>
                {e.highlightLabel ? (
                  <span className="mt-1 block text-xs text-foreground/48">
                    {e.highlightLabel}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="relative mt-6 text-[11px] leading-relaxed text-foreground/48">
            Profiles reflect advancement only when tied to published outcomes.
          </p>
        </article>
      )}

      {seasonId != null ? (
        <SpotlightCard emphasis="medium">
          <SectionHeader
            eyebrow="Ledger"
            title="Published history · this season"
            subtitle="Archived packages only — drafts never surface."
          />
          <p className="mt-6 text-sm tabular-nums text-foreground">
            Total published:{" "}
            <span className="font-semibold">{publishedHistoryCount}</span>
          </p>
          {recentPublishedHistory.length === 0 ? (
            <p className="mt-3 text-xs text-foreground/55">
              No prior packages in this season yet.
            </p>
          ) : (
            <ul className="mt-5 flex flex-col gap-3 text-sm text-foreground/78">
              {recentPublishedHistory.map((h) => (
                <li
                  key={h.stageResultId}
                  className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                >
                  <span className="font-medium text-foreground">{h.title}</span>
                  <span className="text-xs text-foreground/58">
                    {h.stageTitle} ·{" "}
                    {h.publishedAt.toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/app/archive"
            className="mt-8 inline-flex text-sm font-medium text-foreground underline decoration-white/25 underline-offset-[6px] transition hover:decoration-white/50"
          >
            BETALENT archive — completed seasons
          </Link>
        </SpotlightCard>
      ) : null}
    </div>
  );
}
