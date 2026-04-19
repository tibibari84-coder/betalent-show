import type { Metadata } from "next";

import { resolveShowState } from "@/server/show/show-state.service";

export const metadata: Metadata = {
  title: "Show · BETALENT",
  description: "Watch performances and season moments on BETALENT.",
};

export default async function AppShowPage() {
  const showState = await resolveShowState();

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
        Playback and programming are not built yet. This page now reads from a
        centralized show-state resolver.
      </p>
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
      </dl>
    </div>
  );
}
