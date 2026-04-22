"use client";

import { useActionState } from "react";

import { archiveStageAdminAction, updateStageAdminAction } from "@/server/admin/show-admin-actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { AdminFeedback } from "./AdminFeedback";

type StageRecord = {
  id: string;
  seasonId: string;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  stageType: string;
  status: string;
  submissionsOpenAt: Date | null;
  submissionsCloseAt: Date | null;
  judgingOpenAt: Date | null;
  judgingCloseAt: Date | null;
  votingOpenAt: Date | null;
  votingCloseAt: Date | null;
  resultsAt: Date | null;
};

const initialState = {};
const stageTransitions: Record<string, string[]> = {
  DRAFT: ["UPCOMING", "ARCHIVED"],
  UPCOMING: ["DRAFT", "OPEN", "ARCHIVED"],
  OPEN: ["JUDGING", "VOTING", "RESULTS", "COMPLETED", "ARCHIVED"],
  JUDGING: ["VOTING", "RESULTS", "COMPLETED", "ARCHIVED"],
  VOTING: ["RESULTS", "COMPLETED", "ARCHIVED"],
  RESULTS: ["COMPLETED", "ARCHIVED"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: [],
};
const stageStatusLabels: Record<string, string> = {
  DRAFT: "Draft",
  UPCOMING: "Upcoming",
  OPEN: "Open",
  JUDGING: "Judging",
  VOTING: "Voting",
  RESULTS: "Results",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

function toDateTimeLocal(value: Date | null) {
  if (!value) return "";
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function AdminStageEditForm(props: {
  stage: StageRecord;
  seasons: Array<{ id: string; title: string; status: string }>;
}) {
  const [updateState, updateAction, updating] = useActionState(updateStageAdminAction, initialState);
  const [archiveState, archiveAction, archiving] = useActionState(archiveStageAdminAction, initialState);
  const availableStatuses = [props.stage.status, ...stageTransitions[props.stage.status]];

  return (
    <div className="space-y-4">
      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="id" value={props.stage.id} />
        <AdminFeedback state={updateState} />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Season">
            <select name="seasonId" defaultValue={props.stage.seasonId} className="foundation-form-input h-12 px-4" required>
              {props.seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.title} ({season.status})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Title">
            <Input name="title" defaultValue={props.stage.title} className="foundation-form-input h-12 px-4" required />
          </FormField>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <FormField label="Slug">
            <Input name="slug" defaultValue={props.stage.slug} className="foundation-form-input h-12 px-4" required />
          </FormField>
          <FormField label="Order">
            <Input name="orderIndex" type="number" min="0" defaultValue={props.stage.orderIndex} className="foundation-form-input h-12 px-4" required />
          </FormField>
          <FormField label="Type">
            <select name="stageType" defaultValue={props.stage.stageType} className="foundation-form-input h-12 px-4">
              <option value="AUDITION">Audition</option>
              <option value="CALLBACK">Callback</option>
              <option value="SEMIFINAL">Semifinal</option>
              <option value="FINAL">Final</option>
              <option value="SPECIAL">Special</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select name="status" defaultValue={props.stage.status} className="foundation-form-input h-12 px-4">
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {stageStatusLabels[status]}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Description">
          <Textarea name="description" defaultValue={props.stage.description || ""} className="foundation-form-input min-h-24 px-4 py-3" />
        </FormField>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormField label="Submissions Open">
            <Input name="submissionsOpenAt" type="datetime-local" defaultValue={toDateTimeLocal(props.stage.submissionsOpenAt)} className="foundation-form-input h-12 px-4" />
          </FormField>
          <FormField label="Submissions Close">
            <Input name="submissionsCloseAt" type="datetime-local" defaultValue={toDateTimeLocal(props.stage.submissionsCloseAt)} className="foundation-form-input h-12 px-4" />
          </FormField>
          <FormField label="Judging Open">
            <Input name="judgingOpenAt" type="datetime-local" defaultValue={toDateTimeLocal(props.stage.judgingOpenAt)} className="foundation-form-input h-12 px-4" />
          </FormField>
          <FormField label="Judging Close">
            <Input name="judgingCloseAt" type="datetime-local" defaultValue={toDateTimeLocal(props.stage.judgingCloseAt)} className="foundation-form-input h-12 px-4" />
          </FormField>
          <FormField label="Voting Open">
            <Input name="votingOpenAt" type="datetime-local" defaultValue={toDateTimeLocal(props.stage.votingOpenAt)} className="foundation-form-input h-12 px-4" />
          </FormField>
          <FormField label="Voting Close">
            <Input name="votingCloseAt" type="datetime-local" defaultValue={toDateTimeLocal(props.stage.votingCloseAt)} className="foundation-form-input h-12 px-4" />
          </FormField>
          <FormField label="Results At">
            <Input name="resultsAt" type="datetime-local" defaultValue={toDateTimeLocal(props.stage.resultsAt)} className="foundation-form-input h-12 px-4" />
          </FormField>
        </div>
        <p className="text-sm text-white/58">
          Current lifecycle: <strong className="text-white">{stageStatusLabels[props.stage.status]}</strong>.
          {" "}
          {stageTransitions[props.stage.status].length > 0
            ? `Allowed next states: ${stageTransitions[props.stage.status].map((status) => stageStatusLabels[status]).join(", ")}.`
            : "No further lifecycle moves are allowed from this state."}
        </p>
        <Button type="submit" disabled={updating} className="foundation-chip text-[0.7rem]">
          {updating ? "Saving..." : "Save stage"}
        </Button>
      </form>

      <form action={archiveAction} className="space-y-3 rounded-[1rem] border border-red-500/15 bg-red-500/[0.04] p-4">
        <input type="hidden" name="id" value={props.stage.id} />
        <AdminFeedback state={archiveState} />
        <p className="text-sm text-white/70">Archive is explicit. Type `ARCHIVE` to continue.</p>
        <Input name="confirmText" className="foundation-form-input h-12 px-4" placeholder="ARCHIVE" required />
        <Button type="submit" disabled={archiving} className="foundation-nav-link text-[0.7rem]">
          {archiving ? "Archiving..." : "Archive stage"}
        </Button>
      </form>
    </div>
  );
}
