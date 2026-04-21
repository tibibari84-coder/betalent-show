"use client";

import { useActionState } from "react";

import { createEpisodeAdminAction } from "@/server/admin/show-admin-actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { AdminFeedback } from "./AdminFeedback";

const initialState = {};

export function AdminEpisodeCreateForm(props: {
  seasons: Array<{ id: string; title: string; status: string }>;
  stages: Array<{ id: string; title: string; season: { title: string } }>;
}) {
  const [state, action, pending] = useActionState(createEpisodeAdminAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <AdminFeedback state={state} />
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Season">
          <select name="seasonId" className="foundation-form-input h-12 px-4" required>
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
            {props.stages.map((stage) => (
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
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </FormField>
        <FormField label="Premiere At">
          <Input name="premiereAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
        <FormField label="Published At">
          <Input name="publishedAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
      </div>
      <Button type="submit" disabled={pending} className="foundation-primary-button h-11 px-5 text-sm font-semibold uppercase tracking-[0.08em]">
        {pending ? "Creating..." : "Create episode"}
      </Button>
    </form>
  );
}
