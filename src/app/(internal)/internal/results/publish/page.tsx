import type { Metadata } from "next";

import { InternalResultsTools } from "@/components/results/InternalResultsTools";
import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";
import { getSession } from "@/server/auth/session";
import {
  isAuditionReviewerEmail,
  parseAuditionReviewerEmailAllowlist,
} from "@/server/auditions/reviewer.guard";

export const metadata: Metadata = {
  title: "Results publish · BETALENT",
  robots: { index: false, follow: false },
};

export default async function InternalResultsPublishPage() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const allowlistConfigured = parseAuditionReviewerEmailAllowlist().size > 0;
  const isOperator = isAuditionReviewerEmail(session.user.email);

  return (
    <MobilePageShell>
      <AppContainer>
        <main className="flex flex-col gap-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
            BETALENT · Internal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Stage results (manual)
          </h1>
          <p className="text-sm leading-relaxed text-foreground/70">
            Draft → ordered entries → publish. Consumer pages only trust{" "}
            <code className="mx-1 rounded bg-foreground/5 px-1 text-xs">
              PUBLISHED
            </code>{" "}
            packages. Same email allowlist as audition review (
            <code className="rounded bg-foreground/5 px-1 text-xs">
              BETALENT_AUDITION_REVIEWER_EMAILS
            </code>
            ).
          </p>

          {!allowlistConfigured ? (
            <p className="text-sm text-foreground/75">
              Configure reviewer emails to use this stub.
            </p>
          ) : null}

          {allowlistConfigured && !isOperator ? (
            <p className="text-sm text-foreground/75">Restricted.</p>
          ) : null}

          {allowlistConfigured && isOperator ? <InternalResultsTools /> : null}
        </main>
      </AppContainer>
    </MobilePageShell>
  );
}
