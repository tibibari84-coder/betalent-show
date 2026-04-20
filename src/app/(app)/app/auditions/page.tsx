import type { Metadata } from "next";

import { AuditionDraftCreateForm } from "@/components/auditions/AuditionDraftCreateForm";
import { AuditionSubmissionRow } from "@/components/auditions/AuditionSubmissionRow";
import { MemberHero } from "@/components/member/MemberHero";
import {
  FocusStrip,
  PremiumEmptyState,
  PremiumMetaGrid,
  SectionHeader,
  SpotlightCard,
} from "@/components/premium";
import { DisclaimerStrip } from "@/components/shared/DisclaimerStrip";
import { ORIGINALS_ONLY_SHORT } from "@/lib/copy/disclaimers";
import { canWithdrawSubmission } from "@/server/auditions/eligibility.service";
import { loadAuditionsPageData } from "@/server/auditions/actions";

export const metadata: Metadata = {
  title: "Auditions · BETALENT",
  description:
    "Formal BETALENT competition entry — originals only, asynchronous submission windows.",
};

function formatRange(opensAt: Date, closesAt: Date) {
  const opts: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  };
  return `${opensAt.toLocaleString(undefined, opts)} – ${closesAt.toLocaleString(undefined, opts)}`;
}

export default async function AppAuditionsPage() {
  const {
    window,
    submissions,
    eligibilityMessage,
  } = await loadAuditionsPageData();

  const scheduleOpen = window?.scheduleOpen ?? false;
  const reviewPeriod = window?.reviewPeriod ?? false;

  const canStartNewDraft =
    Boolean(window && scheduleOpen && !eligibilityMessage);

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <MemberHero
        tone="auditions"
        eyebrow="Formal entry"
        title="Auditions"
        subtitle="Originals only. Formal windows on a published schedule — not a side upload."
      />

      <DisclaimerStrip>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/50">
          Originals only
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          {ORIGINALS_ONLY_SHORT}
        </p>
      </DisclaimerStrip>

      {!window ? (
        <PremiumEmptyState title="Submission window">
          No window is open. When production schedules the next intake, entries
          begin here — deliberate and on the record.
        </PremiumEmptyState>
      ) : (
        <>
          <FocusStrip
            items={[
              { label: "Window", value: window.title },
              { label: "Schedule", value: formatRange(window.opensAt, window.closesAt) },
              {
                label: "Submissions",
                value: scheduleOpen ? "Open" : "Closed",
              },
            ]}
          />

          <SpotlightCard>
            <SectionHeader
              eyebrow="Formal record"
              title="Window detail"
              subtitle="Operator-published audition configuration."
            />
            <div className="mt-8">
              <PremiumMetaGrid
                rows={[
                  ...(window.description
                    ? [
                        {
                          label: "Brief",
                          value: window.description,
                        },
                      ]
                    : []),
                  {
                    label: "Review period",
                    value: reviewPeriod ? "Active" : "Not active",
                  },
                  ...(window.maxSubmissionsPerUser != null
                    ? [
                        {
                          label: "Max entries / member",
                          value: String(window.maxSubmissionsPerUser),
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          </SpotlightCard>
        </>
      )}

      {window && eligibilityMessage ? (
        <p className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] px-5 py-4 text-sm text-foreground/88 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          {eligibilityMessage}
        </p>
      ) : null}

      {window ? (
        <>
          <AuditionDraftCreateForm
            canStartNewDraft={canStartNewDraft}
            disabledReason={
              !scheduleOpen
                ? "Submissions are not open on the schedule for this window."
                : eligibilityMessage
            }
          />

          <section className="flex flex-col gap-5">
            <SectionHeader title="Your entries" eyebrow="This window" />
            {submissions.length === 0 ? (
              <PremiumEmptyState title="Entries">
                No drafts yet. Save a draft, then submit while the schedule is
                open.
              </PremiumEmptyState>
            ) : (
              <ul className="flex flex-col gap-4">
                {submissions.map((s) => {
                  const canWithdraw = canWithdrawSubmission({
                    submissionStatus: s.status,
                    hasTerminalDecision: s.hasTerminalReview,
                  }).ok;
                  const canSubmitDraft =
                    s.status === "DRAFT" && scheduleOpen;
                  return (
                    <AuditionSubmissionRow
                      key={s.id}
                      submission={s}
                      scheduleOpen={scheduleOpen}
                      canWithdraw={canWithdraw}
                      canSubmitDraft={canSubmitDraft}
                    />
                  );
                })}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
