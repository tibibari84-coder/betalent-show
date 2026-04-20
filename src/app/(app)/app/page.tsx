import type { Metadata } from "next";

import { AiInsightBlock } from "@/components/ai/AiInsightBlock";
import { EditorialCallout } from "@/components/editorial/EditorialCallout";
import { MemberHero } from "@/components/member/MemberHero";
import {
  ContentRail,
  FocusStrip,
  PremiumEmptyState,
} from "@/components/premium";
import { getSession } from "@/server/auth/session";
import { getPublishedPlacementForSlotKey } from "@/server/editorial/public-editorial.service";
import {
  getPublicHostForStage,
  getPublicProducerForEditorialPlacement,
} from "@/server/ai/public-ai.service";
import { resolveShowState } from "@/server/show/show-state.service";

export const metadata: Metadata = {
  title: "Home · BETALENT",
  description:
    "BETALENT show lobby — current season focus, originals, asynchronous premium moments.",
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

  const hasSpotlightRail =
    Boolean(homeHero) ||
    Boolean(producerHero) ||
    Boolean(homeSpotlight) ||
    Boolean(producerSpotlight) ||
    Boolean(hostStage);

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <MemberHero
        tone="lobby"
        eyebrow="Lobby"
        title={`Welcome, ${name}`}
        subtitle="Asynchronous show home — curated plates when published, never a live channel."
      />

      {!showState.season ? (
        <PremiumEmptyState title="Season focus">
          No season is in focus yet. When production publishes the current
          configuration, this lobby updates — editorial layers never replace
          official records.
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

          {hasSpotlightRail ? (
            <ContentRail
              eyebrow="Presentation"
              title="Spotlight"
              subtitle="Curated frames — interpretive only."
            >
              {homeHero ? (
                <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start [&_aside]:mt-0">
                  <EditorialCallout
                    placement={homeHero}
                    variant="hero"
                    className="mt-0"
                  />
                </div>
              ) : null}
              {producerHero ? (
                <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start">
                  <AiInsightBlock
                    variant="producer"
                    output={producerHero}
                    className="mt-0"
                  />
                </div>
              ) : null}
              {homeSpotlight ? (
                <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start [&_aside]:mt-0">
                  <EditorialCallout
                    placement={homeSpotlight}
                    variant="spotlight"
                    className="mt-0"
                  />
                </div>
              ) : null}
              {producerSpotlight ? (
                <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start">
                  <AiInsightBlock
                    variant="producer"
                    output={producerSpotlight}
                    className="mt-0"
                  />
                </div>
              ) : null}
              {hostStage ? (
                <div className="min-w-[min(88vw,24rem)] shrink-0 snap-start">
                  <AiInsightBlock
                    variant="host"
                    output={hostStage}
                    className="mt-0"
                  />
                </div>
              ) : null}
            </ContentRail>
          ) : null}
        </>
      )}
    </div>
  );
}
