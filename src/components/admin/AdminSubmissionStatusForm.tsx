"use client";

import { useActionState } from "react";

import { updateSubmissionReviewStatusAdminAction } from "@/server/admin/show-admin-actions";
import { Button } from "@/components/ui/Button";

import { AdminFeedback } from "./AdminFeedback";

const initialState = {};
const submissionActionLabels: Record<string, string> = {
  UNDER_REVIEW: "Start review",
  ACCEPTED: "Accept submission",
  REJECTED: "Reject submission",
  WITHDRAWN: "Withdraw from queue",
};

export function AdminSubmissionStatusForm(props: {
  submissionId: string;
  currentStatus: string;
  allowedNext: string[];
}) {
  const [state, action, pending] = useActionState(updateSubmissionReviewStatusAdminAction, initialState);

  if (props.allowedNext.length === 0) {
    return (
      <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/58">
        No further review transitions are allowed from {props.currentStatus.replace("_", " ")}.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={props.submissionId} />
      <AdminFeedback state={state} />
      <p className="text-sm text-white/58">
        Current queue state: <strong className="text-white">{props.currentStatus.replace("_", " ")}</strong>.
      </p>
      <div className="flex flex-wrap gap-2">
        {props.allowedNext.map((status) => (
          <Button
            key={status}
            type="submit"
            name="status"
            value={status}
            disabled={pending}
            className="foundation-chip text-[0.7rem]"
          >
            {pending ? "Saving..." : submissionActionLabels[status] || status.replace("_", " ")}
          </Button>
        ))}
      </div>
    </form>
  );
}
