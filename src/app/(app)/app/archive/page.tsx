import type { Metadata } from "next";

import {
  listArchivedSeasons,
  listArchivedStagesForSeason,
} from "@/server/archive/archive.service";

export const metadata: Metadata = {
  title: "Archive · BETALENT",
  description: "Historical seasons and stages — official archive context.",
};

export default async function AppArchivePage() {
  const seasons = await listArchivedSeasons();

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        BETALENT · Archive
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        Completed and archived seasons appear here — not the live competition
        surface. Rows are driven by explicit{" "}
        <code className="rounded bg-foreground/5 px-1 font-mono text-[11px]">
          Season
        </code>{" "}
        /{" "}
        <code className="rounded bg-foreground/5 px-1 font-mono text-[11px]">
          Stage
        </code>{" "}
        statuses, not feeds or guesses.
      </p>

      {seasons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-foreground/15 p-4 text-sm text-foreground/65">
          No archived seasons yet. When a BETALENT season is marked completed or
          archived, it will be listed here.
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {await Promise.all(
            seasons.map(async (s) => {
              const stages = await listArchivedStagesForSeason(s.id);
              return (
                <li
                  key={s.id}
                  className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm"
                >
                  <p className="font-medium text-foreground">{s.title}</p>
                  <p className="mt-1 text-xs text-foreground/55">
                    Status: {s.status} · slug /{s.slug}
                  </p>
                  {stages.length === 0 ? (
                    <p className="mt-2 text-xs text-foreground/55">
                      No archived stages indexed for this season yet.
                    </p>
                  ) : (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-foreground/70">
                      {stages.map((st) => (
                        <li key={st.id}>
                          {st.title}{" "}
                          <span className="text-foreground/45">({st.status})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }),
          )}
        </ul>
      )}
    </div>
  );
}
