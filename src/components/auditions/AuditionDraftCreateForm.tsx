"use client";

import { useActionState } from "react";

import {
  AUDITION_RIGHTS_DECLARATION,
  TEMPORARY_MEDIA_REFERENCE,
} from "@/lib/copy/disclaimers";
import {
  createAuditionDraftAction,
  type AuditionActionState,
} from "@/server/auditions/actions";

import { SubmitButton } from "../auth/SubmitButton";

const initial: AuditionActionState | undefined = undefined;

export function AuditionDraftCreateForm({
  canStartNewDraft,
  disabledReason,
}: {
  canStartNewDraft: boolean;
  disabledReason: string | null;
}) {
  const [state, formAction] = useActionState(
    createAuditionDraftAction,
    initial,
  );

  return (
    <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
      <h2 className="text-sm font-semibold tracking-tight">
        New formal entry (draft)
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-foreground/65">
        Saving a draft does not enter you into BETALENT — you must submit while
        the window is open on schedule.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-foreground/60">
        {AUDITION_RIGHTS_DECLARATION}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-foreground/60">
        {TEMPORARY_MEDIA_REFERENCE}
      </p>
      {!canStartNewDraft ? (
        <p className="mt-3 rounded-lg border border-foreground/10 bg-foreground/[0.03] px-3 py-2 text-sm text-foreground/75">
          {disabledReason ??
            "You cannot start a new draft right now."}
        </p>
      ) : null}
      <form action={formAction} className="mt-4 flex flex-col gap-3">
        {state?.error ? (
          <p
            className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-700 dark:text-red-400"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-foreground/60">
            Title
          </label>
          <input
            name="title"
            required
            disabled={!canStartNewDraft}
            className="h-11 w-full rounded-xl border border-foreground/15 bg-transparent px-3 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-foreground/60">
            Type
          </label>
          <select
            name="submissionType"
            required
            disabled={!canStartNewDraft}
            className="h-11 w-full rounded-xl border border-foreground/15 bg-transparent px-3 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 disabled:opacity-50"
          >
            <option value="ORIGINAL_SONG">Original song</option>
            <option value="ORIGINAL_TOPLINE">Original topline</option>
            <option value="ORIGINAL_INSTRUMENTAL">Original instrumental</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-foreground/60">
            Description (optional)
          </label>
          <textarea
            name="description"
            rows={3}
            disabled={!canStartNewDraft}
            className="w-full resize-y rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-foreground/60">
            Temporary external media reference (optional)
          </label>
          <input
            name="externalMediaRef"
            type="url"
            placeholder="URL or opaque ref — not processed as finished BETALENT media"
            disabled={!canStartNewDraft}
            className="h-11 w-full rounded-xl border border-foreground/15 bg-transparent px-3 text-xs outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 disabled:opacity-50"
          />
        </div>
        <SubmitButton
          disabled={!canStartNewDraft}
          className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save draft
        </SubmitButton>
      </form>
    </div>
  );
}
