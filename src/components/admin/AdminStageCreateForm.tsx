"use client";

import { useActionState } from "react";

import { createStageAdminAction } from "@/server/admin/show-admin-actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { AdminFeedback } from "./AdminFeedback";

const initialState = {};
const createStageStatuses = [
  { value: "DRAFT", label: "Draft" },
  { value: "UPCOMING", label: "Upcoming" },
] as const;

export function AdminStageCreateForm(props: {
  seasons: Array<{ id: string; title: string; status: string }>;
}) {
  const [state, action, pending] = useActionState(createStageAdminAction, initialState);

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
        <FormField label="Title">
          <Input name="title" className="foundation-form-input h-12 px-4" required />
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <FormField label="Slug">
          <Input name="slug" className="foundation-form-input h-12 px-4" />
        </FormField>
        <FormField label="Order">
          <Input name="orderIndex" type="number" min="0" className="foundation-form-input h-12 px-4" defaultValue="0" required />
        </FormField>
        <FormField label="Type">
          <select name="stageType" className="foundation-form-input h-12 px-4" defaultValue="AUDITION">
            <option value="AUDITION">Audition</option>
            <option value="CALLBACK">Callback</option>
            <option value="SEMIFINAL">Semifinal</option>
            <option value="FINAL">Final</option>
            <option value="SPECIAL">Special</option>
          </select>
        </FormField>
        <FormField label="Status">
          <select name="status" className="foundation-form-input h-12 px-4" defaultValue="DRAFT">
            {createStageStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Description">
        <Textarea name="description" className="foundation-form-input min-h-24 px-4 py-3" />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FormField label="Submissions Open">
          <Input name="submissionsOpenAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
        <FormField label="Submissions Close">
          <Input name="submissionsCloseAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
        <FormField label="Judging Open">
          <Input name="judgingOpenAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
        <FormField label="Judging Close">
          <Input name="judgingCloseAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
        <FormField label="Voting Open">
          <Input name="votingOpenAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
        <FormField label="Voting Close">
          <Input name="votingCloseAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
        <FormField label="Results At">
          <Input name="resultsAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
      </div>
      <p className="text-sm text-white/58">
        New stages must begin in <strong className="text-white">Draft</strong> or <strong className="text-white">Upcoming</strong>. Opening, judging, results, and archive moves are explicit lifecycle actions after creation.
      </p>
      <Button type="submit" disabled={pending} className="foundation-primary-button h-11 px-5 text-sm font-semibold uppercase tracking-[0.08em]">
        {pending ? "Creating..." : "Create stage"}
      </Button>
    </form>
  );
}
