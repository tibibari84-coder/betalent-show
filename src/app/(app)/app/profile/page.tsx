import type { Metadata } from "next";

import { AiInsightBlock } from "@/components/ai/AiInsightBlock";
import { MemberHero } from "@/components/member/MemberHero";
import {
  PerformancePosterCard,
  PremiumEmptyState,
  PremiumMetaGrid,
  PremiumScrollRow,
  SectionHeader,
  SpotlightCard,
} from "@/components/premium";
import { logoutAction } from "@/server/auth/actions";
import { getSession } from "@/server/auth/session";
import { ADVANCEMENT_DECISION_LABEL } from "@/lib/results/decision-labels";
import { CONTESTANT_STATUS_LABEL } from "@/lib/show/contestant-labels";
import {
  PERFORMANCE_KIND_LABEL,
  PERFORMANCE_STATUS_LABEL,
} from "@/lib/show/performance-labels";
import { getContestantHistorySummary } from "@/server/archive/contestant-history.service";
import { getContestantByUserId } from "@/server/contestants/contestant.service";
import { listContestantPerformances } from "@/server/performances/performance.service";
import { getPublicJudgeForPerformance } from "@/server/ai/public-ai.service";
import { getLatestPublishedAdvancementSummaryForContestant } from "@/server/results/advancement.service";

export const metadata: Metadata = {
  title: "Profile · BETALENT",
  description:
    "BETALENT account and competition identity — not a social profile.",
};

export default async function AppProfilePage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const u = session.user;

  const contestant = await getContestantByUserId(u.id);
  const performances = contestant
    ? await listContestantPerformances(contestant.id)
    : [];
  const publishedAdvancement = contestant
    ? await getLatestPublishedAdvancementSummaryForContestant(contestant.id)
    : null;
  const contestantHistory = contestant
    ? await getContestantHistorySummary({ contestantId: contestant.id })
    : null;

  const firstPerformanceId = performances[0]?.id;
  const judgeInsight =
    firstPerformanceId != null
      ? await getPublicJudgeForPerformance(firstPerformanceId)
      : null;

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <MemberHero
        tone="profile"
        eyebrow="Identity"
        title="Profile"
        subtitle="Account credentials and competition presence — separate surfaces."
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-start">
        <SpotlightCard>
          <SectionHeader
            eyebrow="Credentials"
            title="Account"
            subtitle="Login, onboarding, contact."
          />
          <div className="mt-8">
            <PremiumMetaGrid
              rows={[
                {
                  label: "Display name",
                  value: u.displayName?.trim() || "—",
                },
                {
                  label: "Username",
                  value: u.username ? `@${u.username}` : "—",
                },
                { label: "Email", value: <span className="break-all">{u.email}</span> },
                { label: "City", value: u.city?.trim() || "—" },
                { label: "Country", value: u.country?.trim() || "—" },
                {
                  label: "Audition interest",
                  value: u.wantsToAudition
                    ? "Interested when open"
                    : "Not indicated",
                },
              ]}
            />
          </div>
        </SpotlightCard>

        <div className="flex flex-col gap-5">
          <SectionHeader
            eyebrow="Competition"
            title="Competition identity"
            subtitle="Appears after promotion from formal auditions."
          />
          {!contestant ? (
            <PremiumEmptyState title="Contestant record">
              Not in the show core yet. When an accepted audition maps forward,
              your competition identity appears here.
            </PremiumEmptyState>
          ) : (
            <>
              <SpotlightCard>
                <PremiumMetaGrid
                  rows={[
                    { label: "Display", value: contestant.displayName },
                    { label: "Handle", value: `@${contestant.username}` },
                    {
                      label: "Status",
                      value: CONTESTANT_STATUS_LABEL[contestant.status],
                    },
                    {
                      label: "Latest advancement",
                      value: publishedAdvancement ? (
                        <>
                          {
                            ADVANCEMENT_DECISION_LABEL[
                              publishedAdvancement.decision
                            ]
                          }{" "}
                          · {publishedAdvancement.stageTitle}
                          <span className="mt-1 block text-xs font-normal text-foreground/52">
                            {publishedAdvancement.decidedAt.toLocaleDateString(
                              undefined,
                              { dateStyle: "medium" },
                            )}
                          </span>
                        </>
                      ) : (
                        "None published yet"
                      ),
                    },
                  ]}
                />
                {performances.length > 0 ? (
                  <div className="mt-8">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/42">
                      Official performances
                    </p>
                    <PremiumScrollRow className="mt-4">
                      {performances.slice(0, 8).map((p) => (
                        <PerformancePosterCard
                          key={p.id}
                          title={p.title}
                          meta={`${PERFORMANCE_KIND_LABEL[p.performanceType]} · ${PERFORMANCE_STATUS_LABEL[p.status]}`}
                          accentSeed={p.id}
                        />
                      ))}
                    </PremiumScrollRow>
                  </div>
                ) : null}
                {contestantHistory ? (
                  <div className="mt-8 border-t border-white/[0.07] pt-8">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/42">
                      Official history
                    </p>
                    <dl className="mt-4 space-y-3 text-xs leading-relaxed text-foreground/72">
                      <div className="flex justify-between gap-4">
                        <dt>Seasons with performance</dt>
                        <dd className="font-semibold text-foreground tabular-nums">
                          {contestantHistory.seasonsParticipatedCount}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt>Published advancements</dt>
                        <dd className="font-semibold text-foreground tabular-nums">
                          {contestantHistory.publishedAdvancementOutcomeCount}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt>Historical performances</dt>
                        <dd className="font-semibold text-foreground tabular-nums">
                          {contestantHistory.historicalPerformanceCount}
                        </dd>
                      </div>
                      {contestantHistory.seasonTitlesSample.length > 0 ? (
                        <p className="text-foreground/52">
                          Seasons:{" "}
                          {contestantHistory.seasonTitlesSample.join(", ")}
                          {contestantHistory.seasonsParticipatedCount > 5
                            ? "…"
                            : ""}
                        </p>
                      ) : null}
                    </dl>
                  </div>
                ) : null}
              </SpotlightCard>
              <AiInsightBlock
                variant="judge"
                output={judgeInsight}
                className="mt-0"
              />
            </>
          )}
        </div>
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center rounded-[1.25rem] border border-white/[0.12] bg-white/[0.04] text-sm font-medium text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition hover:bg-white/[0.07]"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
