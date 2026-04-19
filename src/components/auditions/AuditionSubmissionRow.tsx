"use client";

import { useActionState } from "react";

import type { UserSubmissionListItem } from "@/server/auditions/types";
import {
  submitAuditionDraftAction,
  withdrawAuditionSubmissionAction,
  type AuditionActionState,
} from "@/server/auditions/actions";

import {
  AUDITION_RIGHTS_STATUS_LABEL,
  AUDITION_REVIEW_STATUS_LABEL,
  AUDITION_SUBMISSION_STATUS_LABEL,
  AUDITION_SUBMISSION_TYPE_LABEL,
} from "@/lib/auditions/labels";

const initial: AuditionActionState | undefined = undefined;

export function AuditionSubmissionRow(props: {
  submission: UserSubmissionListItem;
  scheduleOpen: boolean;
  canWithdraw: boolean;
  canSubmitDraft: boolean;
}) {
  const { submission: s } = props;
  const [submitState, submitAction] = useActionState(
    submitAuditionDraftAction,
    initial,
  );
  const [withdrawState, withdrawAction] = useActionState(
    withdrawAuditionSubmissionAction,
    initial,
  );

  const reviewLabel = s.latestReview
    ? AUDITION_REVIEW_STATUS_LABEL[s.latestReview.status]
    : "No review row";

  return (
    <li className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{s.title}</p>
        <p className="text-xs text-foreground/60">
          {AUDITION_SUBMISSION_TYPE_LABEL[s.submissionType]} ·{" "}
          {AUDITION_SUBMISSION_STATUS_LABEL[s.status]}
        </p>
        <p className="text-xs text-foreground/55">{AUDITION_RIGHTS_STATUS_LABEL[s.rightsStatus]}</p>
        <p className="text-xs text-foreground/55">{reviewLabel}</p>
        {s.externalMediaRef ? (
          <p className="truncate text-xs text-foreground/45">
            Temp. media ref: {s.externalMediaRef}
          </p>
        ) : null}
        {s.mappedPerformanceId ? (
          <p className="text-xs font-medium text-emerald-700/90 dark:text-emerald-400/90">
            Mapped to official BETALENT Performance (show object).
          </p>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {props.canSubmitDraft ? (
          <form action={submitAction} className="inline">
            <input type="hidden" name="submissionId" value={s.id} />
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-xl border border-foreground/20 px-3 text-xs font-medium text-foreground transition hover:bg-foreground/5"
            >
              Submit formal entry
            </button>
          </form>
        ) : null}
        {props.canWithdraw ? (
          <form action={withdrawAction} className="inline">
            <input type="hidden" name="submissionId" value={s.id} />
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-xl border border-red-500/30 px-3 text-xs font-medium text-red-700 transition hover:bg-red-500/10 dark:text-red-400"
            >
              Withdraw
            </button>
          </form>
        ) : null}
      </div>
      {!props.scheduleOpen && s.status === "DRAFT" ? (
        <p className="mt-2 text-xs text-foreground/55">
          Submit is available only while the audition schedule is open.
        </p>
      ) : null}
      {submitState?.error ? (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
          {submitState.error}
        </p>
      ) : null}
      {withdrawState?.error ? (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
          {withdrawState.error}
        </p>
      ) : null}
    </li>
  );
}
