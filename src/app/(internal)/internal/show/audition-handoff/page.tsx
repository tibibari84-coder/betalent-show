import type { Metadata } from "next";

import { AuditionShowHandoffForm } from "@/components/show/AuditionShowHandoffForm";
import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";
import { getSession } from "@/server/auth/session";
import {
  isAuditionReviewerEmail,
  parseAuditionReviewerEmailAllowlist,
} from "@/server/auditions/reviewer.guard";
export const metadata: Metadata = {
  title: "Audition → show handoff · BETALENT",
  robots: { index: false, follow: false },
};

export default async function AuditionShowHandoffPage() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const allowlistConfigured = parseAuditionReviewerEmailAllowlist().size > 0;
  const isReviewer = isAuditionReviewerEmail(session.user.email);

  return (
    <MobilePageShell>
      <AppContainer>
        <main className="flex flex-col gap-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
            BETALENT · Internal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Audition → show mapping
          </h1>
          <p className="text-sm leading-relaxed text-foreground/70">
            Manual-first promotion of an ACCEPTED audition submission into a
            Contestant + official Performance. This is not results logic — only
            domain handoff.
          </p>

          {!allowlistConfigured ? (
            <p className="text-sm text-foreground/75">
              Configure{" "}
              <code className="rounded bg-foreground/5 px-1 py-0.5 text-xs">
                BETALENT_AUDITION_REVIEWER_EMAILS
              </code>{" "}
              (same allowlist as audition review).
            </p>
          ) : null}

          {allowlistConfigured && !isReviewer ? (
            <p className="text-sm text-foreground/75">
              Restricted to configured BETALENT operators.
            </p>
          ) : null}

          {allowlistConfigured && isReviewer ? <AuditionShowHandoffForm /> : null}
        </main>
      </AppContainer>
    </MobilePageShell>
  );
}
