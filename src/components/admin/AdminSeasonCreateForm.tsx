"use client";

import { useActionState } from "react";

import { createSeasonAdminAction } from "@/server/admin/show-admin-actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { AdminFeedback } from "./AdminFeedback";

const initialState = {};

export function AdminSeasonCreateForm() {
  const [state, action, pending] = useActionState(createSeasonAdminAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <AdminFeedback state={state} />
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Title">
          <Input name="title" className="foundation-form-input h-12 px-4" required />
        </FormField>
        <FormField label="Slug">
          <Input name="slug" className="foundation-form-input h-12 px-4" placeholder="auto-from-title" />
        </FormField>
      </div>

      <FormField label="Description">
        <Textarea name="description" className="foundation-form-input min-h-24 px-4 py-3" />
      </FormField>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField label="Status">
          <select name="status" defaultValue="DRAFT" className="foundation-form-input h-12 px-4">
            <option value="DRAFT">Draft</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </FormField>
        <FormField label="Start At">
          <Input name="startAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
        <FormField label="End At">
          <Input name="endAt" type="datetime-local" className="foundation-form-input h-12 px-4" />
        </FormField>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="foundation-primary-button h-11 px-5 text-sm font-semibold uppercase tracking-[0.08em]"
      >
        {pending ? "Creating..." : "Create season"}
      </Button>
    </form>
  );
}
