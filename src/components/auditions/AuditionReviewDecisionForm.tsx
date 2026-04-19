"use client";

import { useActionState } from "react";

import {
  auditionReviewDecisionAction,
  type AuditionReviewActionState,
} from "@/server/auditions/actions";

import { SubmitButton } from "../auth/SubmitButton";

const initial: AuditionReviewActionState | undefined = undefined;

export function AuditionReviewDecisionForm(props: {
  submissionId: string;
  entryTitle: string;
}) {
  const [state, formAction] = useActionState(
    auditionReviewDecisionAction,
    initial,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-foreground/10 pt-3">
      <input type="hidden" name="submissionId" value={props.submissionId} />
      <p className="text-xs font-medium text-foreground/80">{props.entryTitle}</p>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] uppercase tracking-wide text-foreground/55">
          Decision
        </label>
        <select
          name="decision"
          required
          className="h-10 w-full rounded-xl border border-foreground/15 bg-transparent px-3 text-sm outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
        >
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="NEEDS_REVIEW">Needs review (rights / follow-up)</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] uppercase tracking-wide text-foreground/55">
          Note (optional)
        </label>
        <textarea
          name="decisionNote"
          rows={2}
          className="w-full resize-y rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
        />
      </div>
      {state?.error ? (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton className="h-9 w-auto px-4 text-xs">
        Record decision
      </SubmitButton>
    </form>
  );
}
