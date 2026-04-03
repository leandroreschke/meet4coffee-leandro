"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@meet4coffee/supabase";

import { getWorkspaceContext } from "../auth";

const VALID_ASSIGNMENT_POLICIES = new Set(["mandatory", "optional"]);
const VALID_VISIBILITIES = new Set(["public", "hidden"]);
const VALID_JOIN_POLICIES = new Set(["free_join", "approval_required", "owner_only"]);
const VALID_MEETING_MODES = new Set(["single_shared", "generated_groups"]);
const VALID_FREQUENCIES = new Set(["weekly", "biweekly", "monthly"]);
const VALID_WEEKDAYS = new Set([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

function normalizeOptionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function parsePositiveNumber(value: FormDataEntryValue | null, fallback: number, min = 0) {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.floor(parsed));
}

function parseClubPayload(formData: FormData) {
  const assignmentPolicy = String(formData.get("assignment_policy") ?? "optional");
  const visibility = String(formData.get("visibility") ?? "public");
  const joinPolicy = String(formData.get("join_policy") ?? "free_join");
  const meetingMode = String(formData.get("meeting_mode") ?? "generated_groups");
  const frequency = String(formData.get("frequency") ?? "weekly");
  const anchorWeekdayRaw = normalizeOptionalText(formData.get("anchor_weekday"));
  const anchorWeekday = anchorWeekdayRaw?.toLowerCase() ?? null;

  if (!VALID_ASSIGNMENT_POLICIES.has(assignmentPolicy)) {
    throw new Error("invalid_assignment_policy");
  }
  if (!VALID_VISIBILITIES.has(visibility)) {
    throw new Error("invalid_visibility");
  }
  if (!VALID_JOIN_POLICIES.has(joinPolicy)) {
    throw new Error("invalid_join_policy");
  }
  if (!VALID_MEETING_MODES.has(meetingMode)) {
    throw new Error("invalid_meeting_mode");
  }
  if (!VALID_FREQUENCIES.has(frequency)) {
    throw new Error("invalid_frequency");
  }
  if (anchorWeekday && !VALID_WEEKDAYS.has(anchorWeekday)) {
    throw new Error("invalid_anchor_weekday");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("missing_name");
  }

  return {
    name,
    description: normalizeOptionalText(formData.get("description")),
    assignment_policy: assignmentPolicy,
    visibility,
    join_policy: joinPolicy,
    meeting_mode: meetingMode,
    meeting_link_provider: "google_meet" as const,
    frequency,
    group_size_target: parsePositiveNumber(formData.get("group_size_target"), 2, 2),
    duration_minutes: parsePositiveNumber(formData.get("duration_minutes"), 30, 1),
    reminder_minutes_before: parsePositiveNumber(formData.get("reminder_minutes_before"), 30, 0),
    calendar_event_enabled: formData.get("calendar_event_enabled") === "on",
    anchor_weekday: anchorWeekday,
    anchor_time: normalizeOptionalText(formData.get("anchor_time")),
  };
}

export async function createGroupAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const context = await getWorkspaceContext(workspaceSlug);

  if (context.membership.role !== "owner") {
    redirect(`/w/${workspaceSlug}`);
  }

  const supabase = await createServerSupabaseClient();

  await supabase.from("groups").insert({
    workspace_id: context.workspace.id,
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || null,
  });

  revalidatePath(`/w/${workspaceSlug}/config`);
}

export async function createClubAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const context = await getWorkspaceContext(workspaceSlug);

  if (context.membership.role !== "owner") {
    redirect(`/w/${workspaceSlug}`);
  }

  const supabase = await createServerSupabaseClient();

  try {
    const payload = parseClubPayload(formData);
    const { error } = await supabase.from("clubs").insert({
      workspace_id: context.workspace.id,
      ...payload,
    });

    if (error) {
      redirect(`/w/${workspaceSlug}/config?clubs_status=create_error`);
    }
  } catch {
    redirect(`/w/${workspaceSlug}/config?clubs_status=create_invalid`);
  }

  revalidatePath(`/w/${workspaceSlug}/config`);
  revalidatePath(`/w/${workspaceSlug}/clubs`);
  redirect(`/w/${workspaceSlug}/config?clubs_status=created`);
}

export async function updateClubAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const clubId = String(formData.get("club_id"));
  const context = await getWorkspaceContext(workspaceSlug);

  if (context.membership.role !== "owner") {
    redirect(`/w/${workspaceSlug}`);
  }

  if (!clubId) {
    redirect(`/w/${workspaceSlug}/config?clubs_status=update_invalid`);
  }

  const supabase = await createServerSupabaseClient();

  try {
    const payload = parseClubPayload(formData);
    const { error } = await supabase
      .from("clubs")
      .update(payload)
      .eq("workspace_id", context.workspace.id)
      .eq("id", clubId);

    if (error) {
      redirect(`/w/${workspaceSlug}/config?clubs_status=update_error`);
    }
  } catch {
    redirect(`/w/${workspaceSlug}/config?clubs_status=update_invalid`);
  }

  revalidatePath(`/w/${workspaceSlug}/config`);
  revalidatePath(`/w/${workspaceSlug}/clubs`);
  redirect(`/w/${workspaceSlug}/config?clubs_status=updated`);
}

export async function deleteClubAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const clubId = String(formData.get("club_id"));
  const context = await getWorkspaceContext(workspaceSlug);

  if (context.membership.role !== "owner") {
    redirect(`/w/${workspaceSlug}`);
  }

  if (!clubId) {
    redirect(`/w/${workspaceSlug}/config?clubs_status=delete_invalid`);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("clubs")
    .delete()
    .eq("workspace_id", context.workspace.id)
    .eq("id", clubId);

  if (error) {
    redirect(`/w/${workspaceSlug}/config?clubs_status=delete_error`);
  }

  revalidatePath(`/w/${workspaceSlug}/config`);
  revalidatePath(`/w/${workspaceSlug}/clubs`);
  redirect(`/w/${workspaceSlug}/config?clubs_status=deleted`);
}

export async function joinClubAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const clubId = String(formData.get("club_id"));
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  await supabase.from("club_memberships").upsert(
    {
      workspace_id: context.workspace.id,
      club_id: clubId,
      member_id: context.membership.id,
      status: "active",
    },
    {
      onConflict: "workspace_id,club_id,member_id",
    },
  );

  revalidatePath(`/w/${workspaceSlug}/clubs`);
}

export async function requestClubAccessAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const clubId = String(formData.get("club_id"));
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  await supabase.from("club_memberships").upsert(
    {
      workspace_id: context.workspace.id,
      club_id: clubId,
      member_id: context.membership.id,
      status: "pending_approval",
    },
    {
      onConflict: "workspace_id,club_id,member_id",
    },
  );

  revalidatePath(`/w/${workspaceSlug}/clubs`);
}

export async function leaveClubAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const clubId = String(formData.get("club_id"));
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  await supabase
    .from("club_memberships")
    .update({ status: "left" })
    .eq("workspace_id", context.workspace.id)
    .eq("club_id", clubId)
    .eq("member_id", context.membership.id);

  revalidatePath(`/w/${workspaceSlug}/clubs`);
}
