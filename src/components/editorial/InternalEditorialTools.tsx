"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/SubmitButton";
import {
  createDraftPlacementAction,
  ensureDefaultEditorialSlotsAction,
  publishPlacementAction,
  type EditorialActionState,
} from "@/server/editorial/editorial-actions";

const initial: EditorialActionState | undefined = undefined;

export function InternalEditorialTools(props: {
  slots: { id: string; slotKey: string; title: string }[];
}) {
  const [seedState, seedAction] = useActionState(
    ensureDefaultEditorialSlotsAction,
    initial,
  );
  const [draftState, draftAction] = useActionState(
    createDraftPlacementAction,
    initial,
  );
  const [pubState, pubAction] = useActionState(publishPlacementAction, initial);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-sm font-semibold tracking-tight">1. Default slots</h2>
        <form action={seedAction} className="mt-2">
          {seedState?.error ? (
            <p className="mb-2 text-sm text-red-600 dark:text-red-400">
              {seedState.error}
            </p>
          ) : null}
          {seedState?.ok ? (
            <p className="mb-2 text-sm text-emerald-700 dark:text-emerald-400">
              {seedState.detail ?? "OK"}
            </p>
          ) : null}
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Ensure default BETALENT slots
          </SubmitButton>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-tight">
          2. Draft placement
        </h2>
        <form action={draftAction} className="mt-2 flex max-w-lg flex-col gap-2">
          {draftState?.error ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {draftState.error}
            </p>
          ) : null}
          {draftState?.ok ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Draft saved.
            </p>
          ) : null}
          <select
            name="editorialSlotId"
            required
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          >
            <option value="">— slot —</option>
            {props.slots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.slotKey}
              </option>
            ))}
          </select>
          <select name="targetType" required className="h-10 rounded-xl border border-foreground/15 px-3 text-sm">
            <option value="SEASON">SEASON</option>
            <option value="STAGE">STAGE</option>
            <option value="EPISODE">EPISODE</option>
            <option value="PERFORMANCE">PERFORMANCE</option>
            <option value="CONTESTANT">CONTESTANT</option>
            <option value="STAGE_RESULT">STAGE_RESULT</option>
          </select>
          <input name="seasonId" placeholder="season id" className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs" />
          <input name="stageId" placeholder="stage id" className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs" />
          <input name="episodeId" placeholder="episode id" className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs" />
          <input name="performanceId" placeholder="performance id" className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs" />
          <input name="contestantId" placeholder="contestant id" className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs" />
          <input name="stageResultId" placeholder="stage result id" className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs" />
          <input name="headline" placeholder="Headline" className="h-10 rounded-xl border border-foreground/15 px-3 text-sm" />
          <textarea name="subheadline" placeholder="Subheadline" rows={2} className="rounded-xl border border-foreground/15 px-3 py-2 text-sm" />
          <input name="ctaLabel" placeholder="CTA label" className="h-10 rounded-xl border border-foreground/15 px-3 text-sm" />
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Save draft
          </SubmitButton>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-tight">
          3. Publish placement
        </h2>
        <form action={pubAction} className="mt-2 flex max-w-lg flex-col gap-2">
          {pubState?.error ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {pubState.error}
            </p>
          ) : null}
          {pubState?.ok ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Published (prior published for slot archived).
            </p>
          ) : null}
          <input
            name="placementId"
            required
            placeholder="placement id"
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Publish
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
