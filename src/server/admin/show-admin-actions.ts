"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminActionAccess } from "./admin-guard";
import {
  archiveEpisodeMutation,
  archiveSeasonMutation,
  archiveStageMutation,
  createEpisodeMutation,
  createSeasonMutation,
  createStageMutation,
  parseArchiveInput,
  parseEpisodeInput,
  parseSeasonInput,
  parseStageInput,
  parseSubmissionStatusInput,
  updateEpisodeMutation,
  updateSeasonMutation,
  updateStageMutation,
  updateSubmissionReviewStatusMutation,
} from "./show-admin.service";

export type AdminActionState = {
  ok?: boolean;
  error?: string;
  detail?: string;
};

function mapAdminError(error: unknown, fallback: string) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

function revalidateAdminSurfaces() {
  revalidatePath("/admin");
  revalidatePath("/admin/seasons");
  revalidatePath("/admin/stages");
  revalidatePath("/admin/episodes");
  revalidatePath("/admin/submissions");
  revalidatePath("/app");
  revalidatePath("/app/seasons");
  revalidatePath("/app/submissions");
}

export async function createSeasonAdminAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdminActionAccess();
    const input = parseSeasonInput(formData);
    const row = await createSeasonMutation(session.user.id, input);
    revalidateAdminSurfaces();
    return { ok: true, detail: `Season created: ${row.title}` };
  } catch (error) {
    return { error: mapAdminError(error, "Could not create season.") };
  }
}

export async function updateSeasonAdminAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdminActionAccess();
    const input = parseSeasonInput(formData);
    const row = await updateSeasonMutation(session.user.id, input);
    revalidateAdminSurfaces();
    return { ok: true, detail: `Season updated: ${row.title}` };
  } catch (error) {
    return { error: mapAdminError(error, "Could not update season.") };
  }
}

export async function archiveSeasonAdminAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdminActionAccess();
    const input = parseArchiveInput(formData);
    const row = await archiveSeasonMutation(session.user.id, input);
    revalidateAdminSurfaces();
    return { ok: true, detail: `Season archived: ${row.title}` };
  } catch (error) {
    return { error: mapAdminError(error, "Could not archive season.") };
  }
}

export async function createStageAdminAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdminActionAccess();
    const input = parseStageInput(formData);
    const row = await createStageMutation(session.user.id, input);
    revalidateAdminSurfaces();
    return { ok: true, detail: `Stage created: ${row.title}` };
  } catch (error) {
    return { error: mapAdminError(error, "Could not create stage.") };
  }
}

export async function updateStageAdminAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdminActionAccess();
    const input = parseStageInput(formData);
    const row = await updateStageMutation(session.user.id, input);
    revalidateAdminSurfaces();
    return { ok: true, detail: `Stage updated: ${row.title}` };
  } catch (error) {
    return { error: mapAdminError(error, "Could not update stage.") };
  }
}

export async function archiveStageAdminAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdminActionAccess();
    const input = parseArchiveInput(formData);
    const row = await archiveStageMutation(session.user.id, input);
    revalidateAdminSurfaces();
    return { ok: true, detail: `Stage archived: ${row.title}` };
  } catch (error) {
    return { error: mapAdminError(error, "Could not archive stage.") };
  }
}

export async function createEpisodeAdminAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdminActionAccess();
    const input = parseEpisodeInput(formData);
    const row = await createEpisodeMutation(session.user.id, input);
    revalidateAdminSurfaces();
    return { ok: true, detail: `Episode created: ${row.title}` };
  } catch (error) {
    return { error: mapAdminError(error, "Could not create episode.") };
  }
}

export async function updateEpisodeAdminAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdminActionAccess();
    const input = parseEpisodeInput(formData);
    const row = await updateEpisodeMutation(session.user.id, input);
    revalidateAdminSurfaces();
    return { ok: true, detail: `Episode updated: ${row.title}` };
  } catch (error) {
    return { error: mapAdminError(error, "Could not update episode.") };
  }
}

export async function archiveEpisodeAdminAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdminActionAccess();
    const input = parseArchiveInput(formData);
    const row = await archiveEpisodeMutation(session.user.id, input);
    revalidateAdminSurfaces();
    return { ok: true, detail: `Episode archived: ${row.title}` };
  } catch (error) {
    return { error: mapAdminError(error, "Could not archive episode.") };
  }
}

export async function updateSubmissionReviewStatusAdminAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdminActionAccess();
    const input = parseSubmissionStatusInput(formData);
    const row = await updateSubmissionReviewStatusMutation(session.user.id, input);
    revalidateAdminSurfaces();
    return { ok: true, detail: `Submission moved to ${row.status.replace("_", " ")}` };
  } catch (error) {
    return { error: mapAdminError(error, "Could not update submission status.") };
  }
}
