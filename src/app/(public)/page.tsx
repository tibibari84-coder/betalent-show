import Link from "next/link";

import { PremiumHero } from "@/components/premium/PremiumHero";
import { SpotlightCard } from "@/components/premium/SpotlightCard";
import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";

export default function HomePage() {
  return (
    <MobilePageShell className="gap-10 pb-12 sm:gap-12 sm:pb-16">
      <AppContainer>
        <div className="flex flex-col gap-10 sm:gap-12">
          <PremiumHero
            eyebrow="Premium talent show"
            title="BETALENT"
            subtitle="Structured competition — originals-first, asynchronous and on-demand."
            tone="lobby"
          />

          <SpotlightCard emphasis="medium">
            <p className="text-center text-[13px] leading-relaxed text-foreground/72">
              Mobile-first experience. Sign in for the member lobby, or continue
              onboarding when invited.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/[0.14] bg-white/[0.12] px-8 text-sm font-semibold tracking-tight text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-md transition hover:bg-white/[0.18] dark:border-white/[0.12] dark:bg-white/[0.08]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-foreground/15 bg-transparent px-8 text-sm font-semibold tracking-tight text-foreground transition hover:bg-foreground/[0.06] dark:border-white/[0.14] dark:hover:bg-white/[0.06]"
              >
                Create account
              </Link>
            </div>
            <p className="mt-8 text-center text-[11px] leading-relaxed text-foreground/48">
              Routes:{" "}
              <code className="rounded-md bg-foreground/[0.08] px-1.5 py-0.5 font-mono text-[0.65rem] dark:bg-white/[0.06]">
                /welcome
              </code>{" "}
              onboarding ·{" "}
              <code className="rounded-md bg-foreground/[0.08] px-1.5 py-0.5 font-mono text-[0.65rem] dark:bg-white/[0.06]">
                /app
              </code>{" "}
              member ·{" "}
              <code className="rounded-md bg-foreground/[0.08] px-1.5 py-0.5 font-mono text-[0.65rem] dark:bg-white/[0.06]">
                /internal
              </code>{" "}
              operators
            </p>
          </SpotlightCard>
        </div>
      </AppContainer>
    </MobilePageShell>
  );
}
