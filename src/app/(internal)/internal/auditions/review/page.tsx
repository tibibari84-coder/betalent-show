import type { Metadata } from "next";

import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";
import { AuditionReviewDecisionForm } from "@/components/auditions/AuditionReviewDecisionForm";
import { getSession } from "@/server/auth/session";
import { listSubmissionsAwaitingReview } from "@/server/auditions/review.service";
import {
  isAuditionReviewerEmail,
  parseAuditionReviewerEmailAllowlist,
} from "@/server/auditions/reviewer.guard";

export const metadata: Metadata = {
  title: "Audition review · BETALENT",
  robots: { index: false, follow: false },
};

export default async function InternalAuditionReviewPage() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const allowlist = parseAuditionReviewerEmailAllowlist();
  const allowlistConfigured = allowlist.size > 0;
  const isReviewer = isAuditionReviewerEmail(session.user.email);

  const rows = isReviewer && allowlistConfigured
    ? await listSubmissionsAwaitingReview({ take: 50 })
    : [];

  return (
    <MobilePageShell>
      <AppContainer>
        <main className="flex flex-col gap-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
            BETALENT · Internal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Audition review (minimal)
          </h1>

          {!allowlistConfigured ? (
            <p className="text-sm leading-relaxed text-foreground/70">
              Configure <code className="rounded bg-foreground/5 px-1 py-0.5 text-xs">BETALENT_AUDITION_REVIEWER_EMAILS</code>{" "}
              (comma-separated emails) to enable this stub. It is not a full admin
              console.
            </p>
          ) : null}

          {allowlistConfigured && !isReviewer ? (
            <p className="text-sm text-foreground/75">
              This queue is restricted to configured BETALENT audition reviewers.
            </p>
          ) : null}

          {isReviewer && allowlistConfigured ? (
            <ul className="flex flex-col gap-4">
              {rows.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-foreground/15 p-6 text-center text-sm text-foreground/60">
                  No submissions awaiting review.
                </li>
              ) : (
                rows.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm"
                  >
                    <p className="font-medium text-foreground">{row.title}</p>
                    <p className="mt-1 text-xs text-foreground/60">
                      Window: {row.auditionWindow.title} ({row.auditionWindow.slug})
                    </p>
                    <p className="text-xs text-foreground/60">
                      Artist:{" "}
                      {row.user.displayName ?? row.user.email}
                    </p>
                    <p className="text-xs text-foreground/55">
                      Status: {row.status} · Rights: {row.rightsStatus}
                    </p>
                    <AuditionReviewDecisionForm
                      submissionId={row.id}
                      entryTitle={row.title}
                    />
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </main>
      </AppContainer>
    </MobilePageShell>
  );
}
