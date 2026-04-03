"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@meet4coffee/supabase";

import { getWorkspaceContext } from "../auth";
import { writeAuditLog } from "../services/audit";

export async function updateMemberRoleAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const targetMemberId = String(formData.get("target_member_id"));
  const nextRole = String(formData.get("role"));
  const context = await getWorkspaceContext(workspaceSlug);

  if (context.membership.role !== "owner") {
    redirect(`/w/${workspaceSlug}/config`);
  }

  const supabase = await createServerSupabaseClient();
  const { data: targetMember } = await supabase
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", context.workspace.id)
    .eq("id", targetMemberId)
    .maybeSingle();

  if (!targetMember || targetMember.role === "owner") {
    redirect(`/w/${workspaceSlug}/config`);
  }

  if (nextRole !== "member") {
    redirect(`/w/${workspaceSlug}/config`);
  }

  await supabase
    .from("workspace_members")
    .update({ role: nextRole })
    .eq("id", targetMemberId)
    .eq("workspace_id", context.workspace.id);

  await writeAuditLog({
    workspaceId: context.workspace.id,
    actorMemberId: context.membership.id,
    action: "member.role_updated",
    targetType: "workspace_member",
    targetId: targetMemberId,
    metadata: { role: nextRole },
  });

  revalidatePath(`/w/${workspaceSlug}/config`);
}

export async function transferOwnershipAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const targetMemberId = String(formData.get("target_member_id"));
  const context = await getWorkspaceContext(workspaceSlug);

  if (context.membership.role !== "owner") {
    redirect(`/w/${workspaceSlug}/config`);
  }

  const supabase = await createServerSupabaseClient();
  const { data: targetMember } = await supabase
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", context.workspace.id)
    .eq("id", targetMemberId)
    .maybeSingle();

  if (!targetMember) {
    redirect(`/w/${workspaceSlug}/config`);
  }

  await supabase
    .from("workspace_members")
    .update({ role: "member" })
    .eq("id", context.membership.id)
    .eq("workspace_id", context.workspace.id);

  await supabase
    .from("workspace_members")
    .update({ role: "owner" })
    .eq("id", targetMemberId)
    .eq("workspace_id", context.workspace.id);

  await supabase
    .from("workspaces")
    .update({ owner_member_id: targetMemberId })
    .eq("id", context.workspace.id);

  await writeAuditLog({
    workspaceId: context.workspace.id,
    actorMemberId: context.membership.id,
    action: "workspace.ownership_transferred",
    targetType: "workspace",
    targetId: context.workspace.id,
    metadata: { target_member_id: targetMemberId },
  });

  revalidatePath(`/w/${workspaceSlug}/config`);
}
