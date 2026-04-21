"use client";

import { useActionState } from "react";

import { archiveSeasonAdminAction, updateSeasonAdminAction } from "@/server/admin/show-admin-actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { AdminFeedback } from "./AdminFeedback";

type SeasonRecord = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  startAt: Date | null;
  endAt: Date | null;
};

const initialState = {};

function toDateTimeLocal(value: Date | null) {
  if (!value) return "";
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function AdminSeasonEditForm(props: { season: SeasonRecord }) {
  const [updateState, updateAction, updating] = useActionState(updateSeasonAdminAction, initialState);
  const [archiveState, archiveAction, archiving] = useActionState(archiveSeasonAdminAction, initialState);

  return (
    <div className="space-y-4">
      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="id" value={props.season.id} />
        <AdminFeedback state={updateState} />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Title">
            <Input name="title" defaultValue={props.season.title} className="foundation-form-input h-12 px-4" required />
          </FormField>
          <FormField label="Slug">
            <Input name="slug" defaultValue={props.season.slug} className="foundation-form-input h-12 px-4" required />
          </FormField>
        </div>
        <FormField label="Description">
          <Textarea name="description" defaultValue={props.season.description || ""} className="foundation-form-input min-h-24 px-4 py-3" />
        </FormField>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Status">
            <select name="status" defaultValue={props.season.status} className="foundation-form-input h-12 px-4">
              <option value="DRAFT">Draft</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="LIVE">Live</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </FormField>
          <FormField label="Start At">
            <Input name="startAt" type="datetime-local" defaultValue={toDateTimeLocal(props.season.startAt)} className="foundation-form-input h-12 px-4" />
          </FormField>
          <FormField label="End At">
            <Input name="endAt" type="datetime-local" defaultValue={toDateTimeLocal(props.season.endAt)} className="foundation-form-input h-12 px-4" />
          </FormField>
        </div>
        <Button type="submit" disabled={updating} className="foundation-chip text-[0.7rem]">
          {updating ? "Saving..." : "Save season"}
        </Button>
      </form>

      <form action={archiveAction} className="space-y-3 rounded-[1rem] border border-red-500/15 bg-red-500/[0.04] p-4">
        <input type="hidden" name="id" value={props.season.id} />
        <AdminFeedback state={archiveState} />
        <p className="text-sm text-white/70">Archive is explicit. Type `ARCHIVE` to continue.</p>
        <Input name="confirmText" className="foundation-form-input h-12 px-4" placeholder="ARCHIVE" required />
        <Button type="submit" disabled={archiving} className="foundation-nav-link text-[0.7rem]">
          {archiving ? "Archiving..." : "Archive season"}
        </Button>
      </form>
    </div>
  );
}
