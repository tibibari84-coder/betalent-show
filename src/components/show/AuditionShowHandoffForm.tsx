"use client";

import { useActionState } from "react";

import {
  mapAuditionToShowAction,
  type ShowHandoffActionState,
} from "@/server/performances/handoff-actions";

import { SubmitButton } from "../auth/SubmitButton";

const initial: ShowHandoffActionState | undefined = undefined;

export function AuditionShowHandoffForm() {
  const [state, formAction] = useActionState(mapAuditionToShowAction, initial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-3">
      {state?.error ? (
        <p
          className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-300">
          Mapped. Performance id:{" "}
          <span className="font-mono text-xs">{state.performanceId}</span>
        </p>
      ) : null}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wide text-foreground/60">
          Audition submission ID
        </label>
        <input
          name="auditionSubmissionId"
          required
          placeholder="cuid…"
          className="h-11 w-full rounded-xl border border-foreground/15 bg-transparent px-3 font-mono text-xs outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wide text-foreground/60">
          Season ID override (optional)
        </label>
        <input
          name="seasonIdOverride"
          placeholder="If audition window has no season"
          className="h-11 w-full rounded-xl border border-foreground/15 bg-transparent px-3 font-mono text-xs outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
        />
      </div>
      <SubmitButton className="text-sm">
        Map to Contestant + Performance
      </SubmitButton>
    </form>
  );
}
