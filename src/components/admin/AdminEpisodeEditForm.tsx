"use client";

import { useActionState, useMemo, useState } from "react";

import { archiveEpisodeAdminAction, updateEpisodeAdminAction } from "@/server/admin/show-admin-actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { AdminFeedback } from "./AdminFeedback";

type EpisodeRecord = {
  id: string;
  seasonId: string;
  stageId: string | null;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  status: string;
  premiereAt: Date | null;
  publishedAt: Date | null;
};

const initialState = {};
const episodeTransitions: Record<string, string[]> = {
  DRAFT: ["SCHEDULED", "ARCHIVED"],
  SCHEDULED: ["DRAFT", "PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: [],
};
const episodeStatusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

function toDateTimeLocal(value: Date | null) {
  if (!value) return "";
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function AdminEpisodeEditForm(props: {
  episode: EpisodeRecord;
  seasons: Array<{ id: string; title: string; status: string }>;
  stages: Array<{ id: string; title: string; seasonId: string; season: { title: string } }>;
}) {
  const [updateState, updateAction, updating] = useActionState(updateEpisodeAdminAction, initialState);
  const [archiveState, archiveAction, archiving] = useActionState(archiveEpisodeAdminAction, initialState);
  const [seasonId, setSeasonId] = useState(props.episode.seasonId);
  const availableStatuses = [props.episode.status, ...episodeTransitions[props.episode.status]];
  const visibleStages = useMemo(
    () => props.stages.filter((stage) => stage.seasonId === seasonId),
    [props.stages, seasonId],
  );

  return (
    <div className="space-y-4">
      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="id" value={props.episode.id} />
        <AdminFeedback state={updateState} />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Season">
            <select
              name="seasonId"
              defaultValue={props.episode.seasonId}
              className="foundation-form-input h-12 px-4"
              required
              onChange={(event) => setSeasonId(event.target.value)}
            >
              {props.seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.title} ({season.status})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Stage">
            <select name="stageId" defaultValue={props.episode.stageId || ""} className="foundation-form-input h-12 px-4">
              <option value="">No stage</option>
              {visibleStages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.season.title} → {stage.title}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Title">
            <Input name="title" defaultValue={props.episode.title} className="foundation-form-input h-12 px-4" required />
          </FormField>
          <FormField label="Slug">
            <Input name="slug" defaultValue={props.episode.slug} className="foundation-form-input h-12 px-4" required />
          </FormField>
          <FormField label="Order">
            <Input name="orderIndex" type="number" min="0" defaultValue={props.episode.orderIndex} className="foundation-form-input h-12 px-4" required />
          </FormField>
        </div>
        <FormField label="Description">
          <Textarea name="description" defaultValue={props.episode.description || ""} className="foundation-form-input min-h-24 px-4 py-3" />
        </FormField>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Status">
            <select name="status" defaultValue={props.episode.status} className="foundation-form-input h-12 px-4">
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {episodeStatusLabels[status]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Premiere At">
            <Input name="premiereAt" type="datetime-local" defaultValue={toDateTimeLocal(props.episode.premiereAt)} className="foundation-form-input h-12 px-4" />
          </FormField>
          <FormField label="Published At">
            <Input name="publishedAt" type="datetime-local" defaultValue={toDateTimeLocal(props.episode.publishedAt)} className="foundation-form-input h-12 px-4" />
          </FormField>
        </div>
        <p className="text-sm text-white/58">
          Current lifecycle: <strong className="text-white">{episodeStatusLabels[props.episode.status]}</strong>.
          {" "}
          {episodeTransitions[props.episode.status].length > 0
            ? `Allowed next states: ${episodeTransitions[props.episode.status].map((status) => episodeStatusLabels[status]).join(", ")}.`
            : "No further lifecycle moves are allowed from this state."}
        </p>
        <Button type="submit" disabled={updating} className="foundation-chip text-[0.7rem]">
          {updating ? "Saving..." : "Save episode"}
        </Button>
      </form>

      <form action={archiveAction} className="space-y-3 rounded-[1rem] border border-red-500/15 bg-red-500/[0.04] p-4">
        <input type="hidden" name="id" value={props.episode.id} />
        <AdminFeedback state={archiveState} />
        <p className="text-sm text-white/70">Archive is explicit. Type `ARCHIVE` to continue.</p>
        <Input name="confirmText" className="foundation-form-input h-12 px-4" placeholder="ARCHIVE" required />
        <Button type="submit" disabled={archiving} className="foundation-nav-link text-[0.7rem]">
          {archiving ? "Archiving..." : "Archive episode"}
        </Button>
      </form>
    </div>
  );
}
