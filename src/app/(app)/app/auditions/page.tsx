import type { Metadata } from "next";

import { resolveShowState } from "@/server/show/show-state.service";

export const metadata: Metadata = {
  title: "Auditions · BETALENT",
  description: "Formal competition entry path for BETALENT.",
};

export default async function AppAuditionsPage() {
  const showState = await resolveShowState();

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        BETALENT · Auditions
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Auditions</h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        This page consumes orchestration mode only. Submission features are
        intentionally deferred.
      </p>
      <p className="text-sm leading-relaxed text-foreground/65">
        When submissions open, the CTA state is resolved centrally from stage
        timing + status.
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
            Submissions open
          </dt>
          <dd className="font-medium text-foreground">
            {showState.modes.canSubmit ? "Yes" : "No"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
