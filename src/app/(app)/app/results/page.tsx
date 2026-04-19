import type { Metadata } from "next";

import { resolveShowState } from "@/server/show/show-state.service";

export const metadata: Metadata = {
  title: "Results · BETALENT",
  description: "Advancement and results for BETALENT.",
};

export default async function AppResultsPage() {
  const showState = await resolveShowState();

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        BETALENT · Results
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        Outcome presentation will attach to stage state; no advancement domain
        is implemented yet.
      </p>
      <p className="text-sm leading-relaxed text-foreground/65">
        This route currently uses the central resolver to determine whether
        results mode is active.
      </p>
      <dl className="grid gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Display state
          </dt>
          <dd className="font-medium text-foreground">{showState.displayState}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Results mode
          </dt>
          <dd className="font-medium text-foreground">
            {showState.modes.canViewResults ? "Active" : "Inactive"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
