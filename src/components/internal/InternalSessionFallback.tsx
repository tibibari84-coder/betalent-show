import Link from "next/link";

import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";

/** Rare edge case — layout normally redirects unauthenticated users away from `/internal`. */
export function InternalSessionFallback() {
  return (
    <MobilePageShell>
      <AppContainer>
        <main className="flex flex-col gap-4 py-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
            BETALENT · Internal
          </p>
          <p className="text-sm text-foreground/75">
            Session could not be loaded. Try signing in again to reach internal
            tools.
          </p>
          <Link
            href="/login?redirect=%2Finternal"
            className="text-sm font-medium text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </main>
      </AppContainer>
    </MobilePageShell>
  );
}
