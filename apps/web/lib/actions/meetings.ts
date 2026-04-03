"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@meet4coffee/supabase";

import { getWorkspaceContext } from "../auth";

export async function confirmMeetingAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const participantId = String(formData.get("participant_id"));
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  await supabase
    .from("meeting_participants")
    .update({ state: "confirmed" })
    .eq("id", participantId)
    .eq("workspace_id", context.workspace.id)
    .eq("member_id", context.membership.id);

  revalidatePath(`/w/${workspaceSlug}/breaks`);
}

export async function cancelMeetingAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const participantId = String(formData.get("participant_id"));
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  await supabase
    .from("meeting_participants")
    .update({ state: "canceled" })
    .eq("id", participantId)
    .eq("workspace_id", context.workspace.id)
    .eq("member_id", context.membership.id);

  revalidatePath(`/w/${workspaceSlug}/breaks`);
}

export async function rateMeetingAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const participantId = String(formData.get("participant_id"));
  const rating = Number(formData.get("rating") ?? 5);
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  await supabase
    .from("meeting_participants")
    .update({ rating, state: "attended" })
    .eq("id", participantId)
    .eq("workspace_id", context.workspace.id)
    .eq("member_id", context.membership.id);

  revalidatePath(`/w/${workspaceSlug}/breaks`);
}

export async function proposeRescheduleAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const meetingId = String(formData.get("meeting_id"));
  const startAt = String(formData.get("proposed_start_at"));
  const endAt = String(formData.get("proposed_end_at"));
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  await supabase.from("meeting_reschedule_proposals").insert({
    workspace_id: context.workspace.id,
    meeting_id: meetingId,
    proposed_by_member_id: context.membership.id,
    proposed_start_at: startAt,
    proposed_end_at: endAt,
    status: "pending",
  });

  revalidatePath(`/w/${workspaceSlug}/breaks`);
}
