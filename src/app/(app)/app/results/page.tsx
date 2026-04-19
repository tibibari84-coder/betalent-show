import type { Metadata } from "next";

import { getPublicResultsPayloadForShowState } from "@/server/results/public-results.service";
import { resolveShowState } from "@/server/show/show-state.service";

export const metadata: Metadata = {
  title: "Results · BETALENT",
  description: "Advancement and results for BETALENT.",
};

export default async function AppResultsPage() {
  const showState = await resolveShowState();
  const published = await getPublicResultsPayloadForShowState(showState);

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
        <div className="rounded-2xl border border-dashed border-foreground/15 p-4 text-sm text-foreground/70">
          There is no published BETALENT result package for the current season /
          stage yet. When production publishes a stage result, it will appear
          here — draft or locked packages are never shown as public truth.
        </div>
      ) : (
        <article className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
          <header className="flex flex-col gap-1">
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
    </div>
  );
}
