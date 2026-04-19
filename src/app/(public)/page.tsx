import Link from "next/link";

import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";

export default function HomePage() {
  return (
    <MobilePageShell>
      <AppContainer>
        <main className="flex flex-col gap-4 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/60">
            Web skeleton
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            BeTalent
          </h1>
          <p className="text-base text-foreground/80">
            Premium Digital Talent Show
          </p>
          <p className="text-sm leading-relaxed text-foreground/65 text-pretty">
            Structured competition — originals-first, show-first — built as a
            mobile web experience from day one.
          </p>
          <p className="mt-4 text-xs text-foreground/50">
            Reserved routes for later phases:{" "}
            <code className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-[0.7rem]">
              /app
            </code>
            ,{" "}
            <code className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-[0.7rem]">
              /internal
            </code>
            .
          </p>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-foreground/60">
            <Link
              className="font-medium text-foreground underline-offset-4 hover:underline"
              href="/login"
            >
              Sign in
            </Link>
            <span className="text-foreground/35">·</span>
            <Link
              className="font-medium text-foreground underline-offset-4 hover:underline"
              href="/register"
            >
              Create account
            </Link>
          </p>
        </main>
      </AppContainer>
    </MobilePageShell>
  );
}
