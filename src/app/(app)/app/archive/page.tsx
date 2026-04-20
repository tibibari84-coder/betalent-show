import type { Metadata } from "next";

import { MemberHero } from "@/components/member/MemberHero";
import {
  PremiumEmptyState,
  SectionHeader,
  SpotlightCard,
} from "@/components/premium";
import {
  listArchivedSeasons,
  listArchivedStagesForSeason,
} from "@/server/archive/archive.service";

export const metadata: Metadata = {
  title: "Archive · BETALENT",
  description:
    "BETALENT historical seasons — official archive, not a recommendation feed.",
};

export default async function AppArchivePage() {
  const seasons = await listArchivedSeasons();

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <MemberHero
        tone="archive"
        eyebrow="Legacy"
        title="Archive"
        subtitle="Completed seasons — permanent record, on demand."
      />

      {seasons.length === 0 ? (
        <PremiumEmptyState title="Catalog">
          Nothing archived yet. Finished seasons move here while the active run
          stays under Show and Results.
        </PremiumEmptyState>
      ) : (
        <section className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="Recorded run"
            title="Seasons"
            subtitle="Indexed from official season and stage records."
          />
          <ul className="flex flex-col gap-6">
            {await Promise.all(
              seasons.map(async (s) => {
                const stages = await listArchivedStagesForSeason(s.id);
                return (
                  <li key={s.id}>
                    <SpotlightCard>
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-foreground/45">
                          BETALENT season
                        </p>
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                          {s.title}
                        </h2>
                        <p className="text-xs text-foreground/55">
                          Status {s.status} · /{s.slug}
                        </p>
                      </div>
                      {stages.length === 0 ? (
                        <p className="mt-6 text-sm text-foreground/55">
                          No archived stages indexed for this season yet.
                        </p>
                      ) : (
                        <ul className="mt-6 flex flex-col gap-3 border-t border-white/[0.07] pt-6">
                          {stages.map((st) => (
                            <li
                              key={st.id}
                              className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
                            >
                              <span className="font-medium text-foreground">
                                {st.title}
                              </span>
                              <span className="text-xs text-foreground/48">
                                {st.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </SpotlightCard>
                  </li>
                );
              }),
            )}
          </ul>
        </section>
      )}
    </div>
  );
}
