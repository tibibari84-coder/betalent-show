import type { Metadata } from "next";

import { AuditionDraftCreateForm } from "@/components/auditions/AuditionDraftCreateForm";
import { AuditionSubmissionRow } from "@/components/auditions/AuditionSubmissionRow";
import { DisclaimerStrip } from "@/components/shared/DisclaimerStrip";
import { EmptyState } from "@/components/shared/EmptyState";
import { ORIGINALS_ONLY_SHORT } from "@/lib/copy/disclaimers";
import { canWithdrawSubmission } from "@/server/auditions/eligibility.service";
import { loadAuditionsPageData } from "@/server/auditions/actions";

export const metadata: Metadata = {
  title: "Auditions · BETALENT",
  description: "Formal competition entry path for BETALENT.",
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
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        BETALENT · Auditions
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Auditions</h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        Formal entry to BETALENT Season 1 runs through audition windows on a
        published schedule. Posting media elsewhere does not create an official
        submission — only a completed entry submitted while the window is open
        on schedule counts.
      </p>

      <DisclaimerStrip>
        <p className="font-medium text-foreground/82">Originals Only</p>
        <p className="mt-2">{ORIGINALS_ONLY_SHORT}</p>
      </DisclaimerStrip>

      {!window ? (
        <EmptyState title="No audition window">
          There is no BETALENT audition window configured or open right now. When
          production schedules the next window, formal entries will start here —
          this page will not accept side-channel uploads.
        </EmptyState>
      ) : (
        <dl className="grid gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-foreground/50">
              Window
            </dt>
            <dd className="font-medium text-foreground">{window.title}</dd>
          </div>
          {window.description ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-foreground/50">
                Details
              </dt>
              <dd className="text-foreground/75">{window.description}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs uppercase tracking-wide text-foreground/50">
              Schedule
            </dt>
            <dd className="font-medium text-foreground">
              {formatRange(window.opensAt, window.closesAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-foreground/50">
              Submissions (schedule)
            </dt>
            <dd className="font-medium text-foreground">
              {scheduleOpen ? "Open" : "Closed"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-foreground/50">
              Review period
            </dt>
            <dd className="font-medium text-foreground">
              {reviewPeriod ? "Active / flagged" : "Not active"}
            </dd>
          </div>
          {window.maxSubmissionsPerUser != null ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-foreground/50">
                Max entries per member
              </dt>
              <dd className="font-medium text-foreground">
                {window.maxSubmissionsPerUser}
              </dd>
            </div>
          ) : null}
        </dl>
      )}

      {window && eligibilityMessage ? (
        <p className="rounded-xl border border-foreground/10 bg-amber-500/5 px-3 py-2 text-sm text-foreground/80">
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

          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Your entries for this window
            </h2>
            {submissions.length === 0 ? (
              <div className="mt-2">
                <EmptyState title="Your entries">
                  No drafts or submissions for this window yet. Save a draft
                  first, then submit while the schedule shows submissions open.
                </EmptyState>
              </div>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
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
          </div>
        </>
      ) : null}
    </div>
  );
}
