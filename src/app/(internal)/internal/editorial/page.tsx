import type { Metadata } from "next";

import { InternalEditorialTools } from "@/components/editorial/InternalEditorialTools";
import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";
import { getSession } from "@/server/auth/session";
import {
  isAuditionReviewerEmail,
  parseAuditionReviewerEmailAllowlist,
} from "@/server/auditions/reviewer.guard";
import { prisma } from "@/server/db/prisma";

export const metadata: Metadata = {
  title: "Editorial · BETALENT",
  robots: { index: false, follow: false },
};

export default async function InternalEditorialPage() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const allowlistConfigured = parseAuditionReviewerEmailAllowlist().size > 0;
  const isOperator = isAuditionReviewerEmail(session.user.email);

  const slots = await prisma.editorialSlot.findMany({
    orderBy: { slotKey: "asc" },
    select: { id: true, slotKey: true, title: true },
  });

  return (
    <MobilePageShell>
      <AppContainer>
        <main className="flex flex-col gap-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
            BETALENT · Internal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Editorial placements
          </h1>
          <p className="text-sm leading-relaxed text-foreground/70">
            Manual curated framing — separate from official StageResult /
            AdvancementDecision truth. Uses the same reviewer email allowlist as
            auditions.
          </p>

          {!allowlistConfigured ? (
            <p className="text-sm text-foreground/75">
              Configure{" "}
              <code className="rounded bg-foreground/5 px-1 text-xs">
                BETALENT_AUDITION_REVIEWER_EMAILS
              </code>
              .
            </p>
          ) : null}

          {allowlistConfigured && !isOperator ? (
            <p className="text-sm text-foreground/75">Restricted.</p>
          ) : null}

          {allowlistConfigured && isOperator ? (
            <InternalEditorialTools slots={slots} />
          ) : null}
        </main>
      </AppContainer>
    </MobilePageShell>
  );
}
