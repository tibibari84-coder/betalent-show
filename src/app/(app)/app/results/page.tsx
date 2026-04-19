import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Results · BETALENT",
  description: "Advancement and results for BETALENT.",
};

export default function AppResultsPage() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        BETALENT · Results
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        Advancement, stage outcomes, and what happens next — a dedicated results
        space tied to the show, not a ranked social feed.
      </p>
      <p className="text-sm leading-relaxed text-foreground/65">
        Scores and placements are not live yet. This area will carry the season
        story forward with clarity.
      </p>
    </div>
  );
}
