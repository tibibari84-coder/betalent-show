"use client";

import { useActionState, useMemo, useState } from "react";

import { createEpisodeAdminAction } from "@/server/admin/show-admin-actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { AdminFeedback } from "./AdminFeedback";

const initialState = {};
const createEpisodeStatuses = [
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
] as const;

export function AdminEpisodeCreateForm(props: {
  seasons: Array<{ id: string; title: string; status: string }>;
  stages: Array<{ id: string; title: string; seasonId: string; season: { title: string } }>;
}) {
  const [state, action, pending] = useActionState(createEpisodeAdminAction, initialState);
  const [seasonId, setSeasonId] = useState("");
  const visibleStages = useMemo(
    () => props.stages.filter((stage) => !seasonId || stage.seasonId === seasonId),
    [props.stages, seasonId],
  );

  return (
    <form action={action} className="space-y-4">
      <AdminFeedback state={state} />
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Season">
          <select
            name="seasonId"
            className="foundation-form-input h-12 px-4"
            required
            value={seasonId}
            onChange={(event) => setSeasonId(event.target.value)}
          >
            <option value="">Select season</option>
            {props.seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.title} ({season.status})
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Stage">
          <select name="stageId" className="foundation-form-input h-12 px-4">
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
          <Input name="title" className="foundation-form-input h-12 px-4" required />
        </FormField>
        <FormField label="Slug">
          <Input name="slug" className="foundation-form-input h-12 px-4" />
        </FormField>
        <FormField label="Order">
          <Input name="orderIndex" type="number" min="0" defaultValue="0" className="foundation-form-input h-12 px-4" required />
        </FormField>
      </div>
      <FormField label="Description">
        <Textarea name="description" className="foundation-form-input min-h-24 px-4 py-3" />
      </FormField>
      <div className="grid gap-4 md:grid-cols-3">
        <FormField label="Status">
          <select name="status" defaultValue="DRAFT" className="foundation-form-input h-12 px-4">
            {createEpisodeStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Premiere At">
          <Input name="premiereAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
        <FormField label="Published At">
          <Input name="publishedAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
      </div>
      <p className="text-sm text-white/58">
        New episodes must begin as <strong className="text-white">Draft</strong> or <strong className="text-white">Scheduled</strong>. Publishing is an explicit follow-up lifecycle action.
      </p>
      <Button type="submit" disabled={pending} className="foundation-primary-button h-11 px-5 text-sm font-semibold uppercase tracking-[0.08em]">
        {pending ? "Creating..." : "Create episode"}
      </Button>
    </form>
  );
}
