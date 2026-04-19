import type { Metadata } from "next";

import { AuditionDraftCreateForm } from "@/components/auditions/AuditionDraftCreateForm";
import { AuditionSubmissionRow } from "@/components/auditions/AuditionSubmissionRow";
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
        Formal entry to BETALENT Season 1 (Originals Only) runs through audition
        windows. Uploading media elsewhere is not the same as an official
        submission — only a submitted entry tied to an open window counts.
      </p>

      {!window ? (
        <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm text-foreground/75">
          There is no open BETALENT audition window right now. When the next
          window is scheduled and opened, you will be able to start a formal
          entry here.
        </div>
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
              <p className="mt-2 text-sm text-foreground/60">
                No drafts or submissions yet for the current open window.
              </p>
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
