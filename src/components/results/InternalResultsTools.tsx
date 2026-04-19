"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/SubmitButton";
import {
  createDraftStageResultAction,
  publishStageResultAction,
  recordAdvancementDecisionAction,
  replaceStageResultEntriesAction,
  type ResultsActionState,
} from "@/server/results/results-actions";

const initial: ResultsActionState | undefined = undefined;

export function InternalResultsTools() {
  const [draftState, draftAction] = useActionState(
    createDraftStageResultAction,
    initial,
  );
  const [entriesState, entriesAction] = useActionState(
    replaceStageResultEntriesAction,
    initial,
  );
  const [publishState, publishAction] = useActionState(
    publishStageResultAction,
    initial,
  );
  const [advState, advAction] = useActionState(
    recordAdvancementDecisionAction,
    initial,
  );

  const exampleEntries = `[
  {
    "performanceId": "performance_cuid",
    "contestantId": "contestant_cuid",
    "placementOrder": 1,
    "highlightLabel": "Top artist"
  }
]`;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold tracking-tight">1. Draft package</h2>
        <form action={draftAction} className="flex max-w-lg flex-col gap-2">
          {draftState?.error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {draftState.error}
            </p>
          ) : null}
          {draftState?.ok ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Created id:{" "}
              <span className="font-mono text-xs">{draftState.id}</span>
            </p>
          ) : null}
          <input
            name="seasonId"
            required
            placeholder="Season id"
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <input
            name="stageId"
            required
            placeholder="Stage id"
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <input
            name="title"
            required
            placeholder="Result package title"
            className="h-10 rounded-xl border border-foreground/15 px-3 text-sm"
          />
          <textarea
            name="summary"
            rows={2}
            placeholder="Summary (optional)"
            className="rounded-xl border border-foreground/15 px-3 py-2 text-sm"
          />
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Create draft
          </SubmitButton>
        </form>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold tracking-tight">
          2. Replace ordered entries
        </h2>
        <p className="text-xs text-foreground/60">
          JSON array — explicit placement (not inferred from Performance status).
        </p>
        <form action={entriesAction} className="flex max-w-lg flex-col gap-2">
          {entriesState?.error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {entriesState.error}
            </p>
          ) : null}
          {entriesState?.ok ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Entries saved for{" "}
              <span className="font-mono text-xs">{entriesState.id}</span>
            </p>
          ) : null}
          <input
            name="stageResultId"
            required
            placeholder="Stage result id"
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <textarea
            name="entriesJson"
            required
            rows={8}
            defaultValue={exampleEntries}
            className="rounded-xl border border-foreground/15 px-3 py-2 font-mono text-xs"
          />
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Save entries
          </SubmitButton>
        </form>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold tracking-tight">3. Publish</h2>
        <form action={publishAction} className="flex max-w-lg flex-col gap-2">
          {publishState?.error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {publishState.error}
            </p>
          ) : null}
          {publishState?.ok ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Published <span className="font-mono text-xs">{publishState.id}</span>
            </p>
          ) : null}
          <input
            name="stageResultId"
            required
            placeholder="Stage result id"
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Publish (public boundary)
          </SubmitButton>
        </form>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold tracking-tight">
          4. Advancement decision (optional link to package)
        </h2>
        <form action={advAction} className="flex max-w-lg flex-col gap-2">
          {advState?.error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {advState.error}
            </p>
          ) : null}
          {advState?.ok ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Saved <span className="font-mono text-xs">{advState.id}</span>
            </p>
          ) : null}
          <input
            name="seasonId"
            required
            placeholder="Season id"
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <input
            name="stageId"
            required
            placeholder="Stage id"
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <input
            name="contestantId"
            required
            placeholder="Contestant id"
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <input
            name="performanceId"
            placeholder="Performance id (optional)"
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <select
            name="decision"
            required
            className="h-10 rounded-xl border border-foreground/15 px-3 text-sm"
          >
            <option value="ADVANCED">ADVANCED</option>
            <option value="ELIMINATED">ELIMINATED</option>
            <option value="HOLD">HOLD</option>
            <option value="PENDING">PENDING</option>
            <option value="WINNER">WINNER</option>
            <option value="RUNNER_UP">RUNNER_UP</option>
            <option value="WILDCARD">WILDCARD</option>
          </select>
          <input
            name="stageResultId"
            placeholder="Stage result id (optional)"
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <textarea
            name="note"
            rows={2}
            placeholder="Internal note (optional)"
            className="rounded-xl border border-foreground/15 px-3 py-2 text-sm"
          />
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Record decision
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
