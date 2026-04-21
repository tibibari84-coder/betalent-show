"use client";

import { useActionState } from "react";

import { createStageAdminAction } from "@/server/admin/show-admin-actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { AdminFeedback } from "./AdminFeedback";

const initialState = {};

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
            <option value="DRAFT">Draft</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="OPEN">Open</option>
            <option value="JUDGING">Judging</option>
            <option value="VOTING">Voting</option>
            <option value="RESULTS">Results</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
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
      <Button type="submit" disabled={pending} className="foundation-primary-button h-11 px-5 text-sm font-semibold uppercase tracking-[0.08em]">
        {pending ? "Creating..." : "Create stage"}
      </Button>
    </form>
  );
}
