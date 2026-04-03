import { redirect } from "next/navigation";

import { createAdminClient } from "@meet4coffee/supabase";

import { writeAuditLog } from "./audit";
import { getWorkspaceSeatStatus } from "./entitlements";

type ClaimInviteInput = {
  token: string;
  userId: string;
  userEmail: string | null;
};

const INVITE_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function claimWorkspaceInviteOrRedirect({
  token,
  userId,
  userEmail,
}: ClaimInviteInput) {
  const admin = createAdminClient();
  const normalizedToken = token.trim();

  if (!INVITE_ID_REGEX.test(normalizedToken)) {
    redirect("/sign-in?invite=invalid");
  }

  const { data: invite } = await admin
    .from("workspace_invites")
    .select("*")
    .eq("id", normalizedToken)
    .is("revoked_at", null)
    .maybeSingle();

  if (
    !invite ||
    (invite.expires_at && new Date(invite.expires_at) < new Date()) ||
    (invite.usage_limit !== null && invite.usage_count >= invite.usage_limit) ||
    (invite.invited_email &&
      invite.invited_email.toLowerCase() !== String(userEmail ?? "").toLowerCase())
  ) {
    redirect("/sign-in?invite=invalid");
  }

  const { data: existingMembership } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("workspace_id", invite.workspace_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingMembership?.workspace_id) {
    const { data: existingWorkspace } = await admin
      .from("workspaces")
      .select("slug")
      .eq("id", existingMembership.workspace_id)
      .maybeSingle();

    if (existingWorkspace?.slug) {
      redirect(`/w/${existingWorkspace.slug}`);
    }
  }

  const seatStatus = await getWorkspaceSeatStatus(invite.workspace_id);

  if (!seatStatus.allowed && seatStatus.max !== null) {
    const { data: workspace } = await admin
      .from("workspaces")
      .select("slug")
      .eq("id", invite.workspace_id)
      .maybeSingle();
    redirect(`/sign-in?invite=seat_limit&workspace=${workspace?.slug ?? ""}`);
  }

  const { data: membership, error: membershipInsertError } = await admin
    .from("workspace_members")
    .insert({
      workspace_id: invite.workspace_id,
      user_id: userId,
      role: "member",
      status: "pending_onboarding",
      invited_email: invite.invited_email ?? userEmail ?? null,
      seat_consuming: true,
      joined_at: new Date().toISOString(),
    })
    .select("id, workspace_id")
    .single();

  if (membershipInsertError?.code === "23505") {
    const { data: workspace } = await admin
      .from("workspaces")
      .select("slug")
      .eq("id", invite.workspace_id)
      .maybeSingle();
    redirect(`/w/${workspace?.slug ?? ""}`);
  }

  await admin
    .from("workspace_invites")
    .update({ usage_count: invite.usage_count + 1 })
    .eq("id", invite.id);

  if (membership) {
    await writeAuditLog({
      workspaceId: membership.workspace_id,
      actorMemberId: membership.id,
      action: "invite.claimed",
      targetType: "workspace_member",
      targetId: membership.id,
    });
  }

  const { data: workspace } = await admin
    .from("workspaces")
    .select("slug")
    .eq("id", invite.workspace_id)
    .maybeSingle();

  redirect(`/w/${workspace?.slug ?? ""}/profile`);
}

