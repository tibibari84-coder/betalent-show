import type { Metadata } from "next";

import { InternalShowSetupForms } from "@/components/setup/InternalShowSetupForms";
import { InternalSessionFallback } from "@/components/internal/InternalSessionFallback";
import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";
import { getPrimaryOpenAuditionWindow } from "@/server/auditions/window.service";
import { getSession } from "@/server/auth/session";
import {
  isAuditionReviewerEmail,
  parseAuditionReviewerEmailAllowlist,
} from "@/server/auditions/reviewer.guard";
import { getCurrentSeason } from "@/server/show/season.service";
import { getCurrentStage } from "@/server/show/stage.service";
import {
  missingOperatorAllowlistMessage,
  notAuthorizedOperatorMessage,
} from "@/server/internal/access-copy";
import {
  listAllStagesForSetup,
  listSeasonsForSetup,
} from "@/server/setup/show-setup.service";

export const metadata: Metadata = {
  title: "Show setup · BETALENT",
  robots: { index: false, follow: false },
};

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function InternalShowSetupPage() {
  const session = await getSession();
  if (!session) {
    return <InternalSessionFallback />;
  }

  const allowlistConfigured = parseAuditionReviewerEmailAllowlist().size > 0;
  const isOperator = isAuditionReviewerEmail(session.user.email);

  const now = new Date();
  const defaultOpens = toDatetimeLocalValue(now);
  const defaultCloses = toDatetimeLocalValue(
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  );

  const [seasons, stages, liveSeason, openWindow] = await Promise.all([
    listSeasonsForSetup(),
    listAllStagesForSetup(),
    getCurrentSeason(now),
    getPrimaryOpenAuditionWindow(now),
  ]);

  const liveStage =
    liveSeason != null ? await getCurrentStage(liveSeason.id, now) : null;

  return (
    <MobilePageShell>
      <AppContainer>
        <main className="flex flex-col gap-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
            BETALENT · Internal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Show setup</h1>
          <p className="text-sm leading-relaxed text-foreground/70">
            Bootstrap official Season, Stage, and AuditionWindow rows so member
            surfaces read real show state. Same operator allowlist as other
            internal tools — not a full admin product.
          </p>

          <section className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/55">
              Current snapshot
            </h2>
            <dl className="mt-3 grid gap-2 text-foreground/80">
              <div>
                <dt className="text-[11px] uppercase text-foreground/50">
                  LIVE season (resolver)
                </dt>
                <dd>
                  {liveSeason
                    ? `${liveSeason.title} · ${liveSeason.slug} · ${liveSeason.status}`
                    : "None (no LIVE season matching date rules)"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-foreground/50">
                  Current stage (for live season)
                </dt>
                <dd>
                  {liveStage
                    ? `${liveStage.title} · ${liveStage.slug} · ${liveStage.status}`
                    : liveSeason
                      ? "None"
                      : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-foreground/50">
                  Primary OPEN audition window (schedule)
                </dt>
                <dd>
                  {openWindow
                    ? `${openWindow.title} · ${openWindow.slug} · ${openWindow.status}`
                    : "None (needs OPEN + opensAt/closesAt containing now)"}
                </dd>
              </div>
            </dl>
          </section>

          {!allowlistConfigured ? (
            <p className="text-sm leading-relaxed text-foreground/75">
              {missingOperatorAllowlistMessage()}
            </p>
          ) : null}

          {allowlistConfigured && !isOperator ? (
            <p className="text-sm leading-relaxed text-foreground/75">
              {notAuthorizedOperatorMessage()}
            </p>
          ) : null}

          {allowlistConfigured && isOperator ? (
            <InternalShowSetupForms
              seasons={seasons}
              stages={stages}
              defaultOpensLocal={defaultOpens}
              defaultClosesLocal={defaultCloses}
            />
          ) : null}
        </main>
      </AppContainer>
    </MobilePageShell>
  );
}
