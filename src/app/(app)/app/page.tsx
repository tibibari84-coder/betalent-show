import type { Metadata } from "next";

import { AiInsightBlock } from "@/components/ai/AiInsightBlock";
import { EditorialCallout } from "@/components/editorial/EditorialCallout";
import { getSession } from "@/server/auth/session";
import { getPublishedPlacementForSlotKey } from "@/server/editorial/public-editorial.service";
import {
  getPublicHostForStage,
  getPublicProducerForEditorialPlacement,
} from "@/server/ai/public-ai.service";
import { EmptyState } from "@/components/shared/EmptyState";
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

  const stageId = showState.stage?.id;
  const [producerHero, producerSpotlight, hostStage] = await Promise.all([
    homeHero
      ? getPublicProducerForEditorialPlacement(homeHero.placementId)
      : Promise.resolve(null),
    homeSpotlight
      ? getPublicProducerForEditorialPlacement(homeSpotlight.placementId)
      : Promise.resolve(null),
    stageId ? getPublicHostForStage(stageId) : Promise.resolve(null),
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
        BETALENT orchestration is centered on season, stage, and episode state —
        not a feed or recommendation surface.
      </p>

      {!showState.season ? (
        <EmptyState title="Season focus">
          No active BETALENT season is in focus yet. When production assigns live
          season data, this lobby will reflect it. Curated or AI-assisted blocks
          only appear when published — they never replace official records.
        </EmptyState>
      ) : null}

      <EditorialCallout placement={homeHero} variant="hero" />
      <AiInsightBlock variant="producer" output={producerHero} />
      <EditorialCallout placement={homeSpotlight} variant="spotlight" />
      <AiInsightBlock variant="producer" output={producerSpotlight} />
      <AiInsightBlock variant="host" output={hostStage} />

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
