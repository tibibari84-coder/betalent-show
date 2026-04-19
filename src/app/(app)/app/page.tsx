import type { Metadata } from "next";

import { EditorialCallout } from "@/components/editorial/EditorialCallout";
import { getSession } from "@/server/auth/session";
import { getPublishedPlacementForSlotKey } from "@/server/editorial/public-editorial.service";
import { resolveShowState } from "@/server/show/show-state.service";

export const metadata: Metadata = {
  title: "Home · BETALENT",
  description: "BETALENT show lobby — Season 1 originals.",
};

export default async function AppHomePage() {
  const [session, showState, homeHero, homeSpotlight] = await Promise.all([
    getSession(),
    resolveShowState(),
    getPublishedPlacementForSlotKey("HOME_HERO"),
    getPublishedPlacementForSlotKey("HOME_SPOTLIGHT"),
  ]);

  if (!session) {
    return null;
  }

  const name =
    session.user.displayName?.trim() ||
    session.user.username ||
    session.user.email.split("@")[0];

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        Show lobby
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-balance">
        Welcome, {name}
      </h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        BETALENT orchestration is now centered on season, stage, and episode
        state.
      </p>

      <EditorialCallout placement={homeHero} variant="hero" />
      <EditorialCallout placement={homeSpotlight} variant="spotlight" />

      <dl className="grid gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Season
          </dt>
          <dd className="font-medium text-foreground">
            {showState.season?.title ?? "No active season"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Stage
          </dt>
          <dd className="font-medium text-foreground">
            {showState.stage?.title ?? "Not active"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Display state
          </dt>
          <dd className="font-medium text-foreground">{showState.displayState}</dd>
        </div>
      </dl>
    </div>
  );
}
