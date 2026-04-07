"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@meet4coffee/supabase";

import { getWorkspaceContext } from "../auth";

export async function addOptOutAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const targetMemberId = String(formData.get("target_member_id"));
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  if (!targetMemberId || targetMemberId === context.membership.id) {
    return;
  }

  await supabase.from("member_opt_outs").upsert(
    {
      workspace_id: context.workspace.id,
      source_member_id: context.membership.id,
      target_member_id: targetMemberId,
    },
    { onConflict: "workspace_id,source_member_id,target_member_id" },
  );

  revalidatePath(`/w/${workspaceSlug}/profile`);
}

export async function removeOptOutAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const targetMemberId = String(formData.get("target_member_id"));
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  if (!targetMemberId) {
    return;
  }

  await supabase
    .from("member_opt_outs")
    .delete()
    .eq("workspace_id", context.workspace.id)
    .eq("source_member_id", context.membership.id)
    .eq("target_member_id", targetMemberId);

  revalidatePath(`/w/${workspaceSlug}/profile`);
}
