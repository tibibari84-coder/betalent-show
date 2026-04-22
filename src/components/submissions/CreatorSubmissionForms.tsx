"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  createSubmissionDraftAction,
  submitSubmissionDraftAction,
  updateSubmissionDraftAction,
  type SubmissionActionState,
} from "@/server/submissions/actions";

const initialState: SubmissionActionState = {};

type ReadyAssetOption = {
  id: string;
  label: string;
};

function SubmissionActionFeedback({ state }: { state: SubmissionActionState }) {
  if (!state.error && !state.detail) {
    return null;
  }

  return (
    <p
      className={
        state.error
          ? "rounded-[1rem] border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-100"
          : "rounded-[1rem] border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-100"
      }
    >
      {state.error || state.detail}
    </p>
  );
}

export function SubmissionDraftCreateForm({
  assets,
}: {
  assets: ReadyAssetOption[];
}) {
  const [state, action, pending] = useActionState(createSubmissionDraftAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <SubmissionActionFeedback state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-white/62">Title</span>
          <Input
            name="title"
            required
            className="foundation-form-input h-12 rounded-[1rem] px-4"
            placeholder="Title this entry"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-white/62">Ready asset</span>
          <select
            name="videoAssetId"
            required
            className="foundation-form-input h-12 w-full rounded-[1rem] px-4 text-sm text-white"
            defaultValue=""
          >
            <option value="" disabled className="bg-black text-white">
              Select READY asset
            </option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id} className="bg-black text-white">
                {asset.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm text-white/62">Description</span>
        <Textarea
          name="description"
          rows={4}
          className="foundation-form-input min-h-28 rounded-[1rem] px-4 py-3"
          placeholder="Keep the context concise and intentional."
        />
      </label>

      <Button
        type="submit"
        disabled={pending}
        className="foundation-primary-button min-h-[3.1rem] rounded-full px-5 text-sm font-semibold"
      >
        {pending ? "Creating..." : "Create submission draft"}
      </Button>
    </form>
  );
}

export function SubmissionDraftEditor({
  draft,
  assets,
}: {
  draft: {
    id: string;
    title: string;
    description: string | null;
    videoAssetId: string;
  };
  assets: ReadyAssetOption[];
}) {
  const [updateState, updateAction, updating] = useActionState(updateSubmissionDraftAction, initialState);
  const [submitState, submitAction, submitting] = useActionState(submitSubmissionDraftAction, initialState);

  return (
    <div className="space-y-4">
      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="id" value={draft.id} />
        <SubmissionActionFeedback state={updateState} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-white/62">Title</span>
            <Input
              name="title"
              defaultValue={draft.title}
              required
              className="foundation-form-input h-12 rounded-[1rem] px-4"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-white/62">Ready asset</span>
            <select
              name="videoAssetId"
              required
              defaultValue={draft.videoAssetId}
              className="foundation-form-input h-12 w-full rounded-[1rem] px-4 text-sm text-white"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id} className="bg-black text-white">
                  {asset.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm text-white/62">Description</span>
          <Textarea
            name="description"
            defaultValue={draft.description || ""}
            rows={4}
            className="foundation-form-input min-h-28 rounded-[1rem] px-4 py-3"
          />
        </label>

        <Button
          type="submit"
          disabled={updating}
          className="foundation-chip rounded-full px-4 py-2 text-[0.76rem] uppercase tracking-[0.08em]"
        >
          {updating ? "Saving..." : "Save changes"}
        </Button>
      </form>

      <form action={submitAction} className="space-y-3 rounded-[1rem] border border-emerald-500/20 bg-emerald-500/[0.08] p-4">
        <input type="hidden" name="id" value={draft.id} />
        <SubmissionActionFeedback state={submitState} />
        <p className="text-sm text-emerald-100/90">
          Ready to submit. This locks creator editing and moves the entry into review.
        </p>
        <Button
          type="submit"
          disabled={submitting}
          className="foundation-primary-button min-h-[3.1rem] rounded-full px-5 text-sm font-semibold"
        >
          {submitting ? "Submitting..." : "Submit for review"}
        </Button>
      </form>
    </div>
  );
}
