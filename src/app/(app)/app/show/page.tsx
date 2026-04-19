import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Show · BETALENT",
  description: "Watch performances and season moments on BETALENT.",
};

export default function AppShowPage() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        BETALENT · Show
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">The show</h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        This is where performances, episodes, and spotlight moments will live —
        a single, intentional viewing space for the competition.
      </p>
      <p className="text-sm leading-relaxed text-foreground/65">
        Playback and programming are not built yet. When the season runs, the
        show surface will anchor here.
      </p>
    </div>
  );
}
