import type { Metadata } from "next";

import { InternalAiTools } from "@/components/ai/InternalAiTools";
import { InternalSessionFallback } from "@/components/internal/InternalSessionFallback";
import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";
import { isOpenAiConfigured } from "@/lib/env/sanity";
import { getSession } from "@/server/auth/session";
import {
  isAuditionReviewerEmail,
  parseAuditionReviewerEmailAllowlist,
} from "@/server/auditions/reviewer.guard";
import { listRecentAiOutputs } from "@/server/ai/ai-output.service";
import {
  missingOperatorAllowlistMessage,
  notAuthorizedOperatorMessage,
} from "@/server/internal/access-copy";

export const metadata: Metadata = {
  title: "AI layer · BETALENT",
  robots: { index: false, follow: false },
};

export default async function InternalAiPage() {
  const session = await getSession();
  if (!session) {
    return <InternalSessionFallback />;
  }

  const allowlistConfigured = parseAuditionReviewerEmailAllowlist().size > 0;
  const isOperator = isAuditionReviewerEmail(session.user.email);
  const recent = await listRecentAiOutputs(25);

  return (
    <MobilePageShell>
      <AppContainer>
        <main className="flex flex-col gap-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
            BETALENT · Internal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">AI layer</h1>
          <p className="text-sm leading-relaxed text-foreground/70">
            Interpretive AI copy only — separate from official StageResult,
            AdvancementDecision, and editorial placement truth. Generate, review,
            then publish for optional member surfaces.
          </p>

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
            <InternalAiTools
              recent={recent}
              openAiConfigured={isOpenAiConfigured()}
            />
          ) : null}
        </main>
      </AppContainer>
    </MobilePageShell>
  );
}
