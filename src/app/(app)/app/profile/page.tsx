import type { Metadata } from "next";

import { logoutAction } from "@/server/auth/actions";
import { getSession } from "@/server/auth/session";
import { AiInsightBlock } from "@/components/ai/AiInsightBlock";
import { EmptyState } from "@/components/shared/EmptyState";
import { ADVANCEMENT_DECISION_LABEL } from "@/lib/results/decision-labels";
import { CONTESTANT_STATUS_LABEL } from "@/lib/show/contestant-labels";
import { getContestantHistorySummary } from "@/server/archive/contestant-history.service";
import { getContestantByUserId } from "@/server/contestants/contestant.service";
import { listContestantPerformances } from "@/server/performances/performance.service";
import { getPublicJudgeForPerformance } from "@/server/ai/public-ai.service";
import { getLatestPublishedAdvancementSummaryForContestant } from "@/server/results/advancement.service";

export const metadata: Metadata = {
  title: "Profile · BETALENT",
  description: "Your BETALENT identity.",
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
    <div className="flex flex-col gap-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        BETALENT · You
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="text-sm text-foreground/70">
        Account settings from onboarding — not a social profile product.
      </p>

      <dl className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Display name
          </dt>
          <dd className="font-medium text-foreground">
            {u.displayName?.trim() || "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Username
          </dt>
          <dd className="font-medium text-foreground">
            {u.username ? `@${u.username}` : "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Email
          </dt>
          <dd className="break-all font-medium text-foreground">{u.email}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            City
          </dt>
          <dd className="text-foreground">{u.city?.trim() || "—"}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Country
          </dt>
          <dd className="text-foreground">{u.country?.trim() || "—"}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Audition interest
          </dt>
          <dd className="text-foreground">
            {u.wantsToAudition
              ? "Interested when submissions open"
              : "Not indicated"}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold tracking-tight">
          BETALENT show identity
        </h2>
        <p className="text-xs leading-relaxed text-foreground/60">
          Your account above is login and onboarding. Contestant is your
          competition-facing identity when you enter the show core — separate
          from this screen name until promoted from auditions.
        </p>
        {!contestant ? (
          <EmptyState title="Contestant identity">
            No BETALENT contestant record yet. When an accepted audition is mapped
            into the show core, your competition-facing identity appears here —
            separate from this account screen until then.
          </EmptyState>
        ) : (
          <>
          <dl className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wide text-foreground/50">
                Contestant display
              </dt>
              <dd className="font-medium text-foreground">
                {contestant.displayName}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wide text-foreground/50">
                Contestant handle
              </dt>
              <dd className="font-medium text-foreground">
                @{contestant.username}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wide text-foreground/50">
                Contestant status
              </dt>
              <dd className="font-medium text-foreground">
                {CONTESTANT_STATUS_LABEL[contestant.status]}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wide text-foreground/50">
                Latest published advancement
              </dt>
              <dd className="text-foreground">
                {publishedAdvancement ? (
                  <>
                    {ADVANCEMENT_DECISION_LABEL[publishedAdvancement.decision]} ·{" "}
                    {publishedAdvancement.stageTitle}
                    <span className="block text-xs text-foreground/55">
                      {publishedAdvancement.decidedAt.toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </span>
                  </>
                ) : (
                  "None published yet (unpublished decisions stay internal)."
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-wide text-foreground/50">
                Official performances
              </dt>
              <dd className="text-foreground">
                {performances.length === 0
                  ? "None yet"
                  : `${performances.length} in the show core`}
              </dd>
            </div>
            {performances.length > 0 ? (
              <ul className="mt-1 list-disc pl-5 text-xs text-foreground/70">
                {performances.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    {p.title}{" "}
                    <span className="text-foreground/50">({p.status})</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {contestantHistory ? (
              <div className="flex flex-col gap-0.5 border-t border-foreground/10 pt-4">
                <dt className="text-xs uppercase tracking-wide text-foreground/50">
                  Official history summary
                </dt>
                <dd className="space-y-1 text-xs leading-relaxed text-foreground/70">
                  <p>
                    Seasons with a performance:{" "}
                    <span className="font-medium text-foreground">
                      {contestantHistory.seasonsParticipatedCount}
                    </span>
                  </p>
                  <p>
                    Published advancement outcomes (official):{" "}
                    <span className="font-medium text-foreground">
                      {contestantHistory.publishedAdvancementOutcomeCount}
                    </span>
                  </p>
                  <p>
                    Historical performances (completed / archived context):{" "}
                    <span className="font-medium text-foreground">
                      {contestantHistory.historicalPerformanceCount}
                    </span>
                  </p>
                  {contestantHistory.seasonTitlesSample.length > 0 ? (
                    <p className="text-foreground/55">
                      Seasons:{" "}
                      {contestantHistory.seasonTitlesSample.join(", ")}
                      {contestantHistory.seasonsParticipatedCount > 5 ? "…" : ""}
                    </p>
                  ) : null}
                </dd>
              </div>
            ) : null}
          </dl>
          <AiInsightBlock variant="judge" output={judgeInsight} />
          </>
        )}
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-foreground/20 text-sm font-medium text-foreground transition hover:bg-foreground/5"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
