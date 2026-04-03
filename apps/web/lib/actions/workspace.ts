"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient, createServerSupabaseClient } from "@meet4coffee/supabase";

import { requireUser, getWorkspaceContext } from "../auth";
import {
  initialCreateWorkspaceFormState,
  type CreateWorkspaceFormState,
} from "../forms/workspace-form-state";
import { writeAuditLog } from "../services/audit";
import { claimWorkspaceInviteOrRedirect } from "../services/invites";
import { getSupportedTimezones } from "../timezones";
import { slugify } from "../utils";
import { hashToken } from "../server-utils";

function getCreateWorkspaceValues(formData: FormData): CreateWorkspaceFormState["values"] {
  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    timezone: String(formData.get("timezone") ?? initialCreateWorkspaceFormState.values.timezone),
    workdayStart: String(
      formData.get("workday_start") ?? initialCreateWorkspaceFormState.values.workdayStart,
    ),
    workdayEnd: String(
      formData.get("workday_end") ?? initialCreateWorkspaceFormState.values.workdayEnd,
    ),
  };
}

export async function createWorkspaceAction(
  _prevState: CreateWorkspaceFormState,
  formData: FormData,
): Promise<CreateWorkspaceFormState> {
  const values = getCreateWorkspaceValues(formData);
  const user = await requireUser();
  const supabase = createAdminClient();
  let workspaceId: string | null = null;
  let membershipId: string | null = null;

  try {
    if (!values.name) {
      return { message: "Organization name is required.", redirectTo: null, values };
    }

    const slug = slugify(values.slug || values.name);

    if (!slug) {
      return { message: "Organization URL slug is required.", redirectTo: null, values };
    }

    const supportedTimezones = new Set(getSupportedTimezones());

    if (!supportedTimezones.has(values.timezone)) {
      return { message: "Select a valid timezone from the list.", redirectTo: null, values };
    }

    if (values.workdayEnd <= values.workdayStart) {
      return { message: "Workday end must be after workday start.", redirectTo: null, values };
    }

    const { data: existingOwnerMembership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("role", "owner")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existingOwnerMembership?.workspace_id) {
      const { data: existingWorkspace } = await supabase
        .from("workspaces")
        .select("slug")
        .eq("id", existingOwnerMembership.workspace_id)
        .maybeSingle();

      if (existingWorkspace?.slug) {
        return {
          message: null,
          redirectTo: `/w/${existingWorkspace.slug}`,
          values: initialCreateWorkspaceFormState.values,
        };
      }

      return {
        message: "You already own an organization.",
        redirectTo: null,
        values,
      };
    }

    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .insert({
        name: values.name,
        slug,
        timezone: values.timezone,
        workday_start: values.workdayStart,
        workday_end: values.workdayEnd,
        default_locale: "en",
      })
      .select("*")
      .single();

    if (workspaceError || !workspace) {
      return {
        message:
          workspaceError?.code === "23505"
            ? "That organization URL slug is already taken."
            : workspaceError?.message ?? "Could not create the organization.",
        redirectTo: null,
        values,
      };
    }

    workspaceId = workspace.id;

    const { data: membership, error: membershipError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner",
        status: "active",
        invited_email: user.email ?? null,
        seat_consuming: true,
        joined_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (membershipError || !membership) {
      return {
        message: membershipError?.message ?? "Could not add you as the organization owner.",
        redirectTo: null,
        values,
      };
    }

    membershipId = membership.id;

    const { error: ownerUpdateError } = await supabase
      .from("workspaces")
      .update({ owner_member_id: membership.id })
      .eq("id", workspace.id);

    if (ownerUpdateError) {
      return {
        message: ownerUpdateError.message ?? "Could not finish organization setup.",
        redirectTo: null,
        values,
      };
    }

    const { error: profileError } = await supabase.from("member_profiles").upsert({
      workspace_id: workspace.id,
      user_id: user.id,
      name: user.user_metadata?.full_name ?? null,
      language: "en",
    });

    if (profileError) {
      return {
        message: profileError.message ?? "Could not create your owner profile.",
        redirectTo: null,
        values,
      };
    }

    const { error: subscriptionError } = await supabase.from("workspace_subscriptions").insert({
      workspace_id: workspace.id,
      tier: "free",
      status: "active",
      cancel_at_period_end: false,
    });

    if (subscriptionError) {
      return {
        message: subscriptionError.message ?? "Could not start the free organization plan.",
        redirectTo: null,
        values,
      };
    }

    await writeAuditLog({
      workspaceId: workspace.id,
      actorMemberId: membership.id,
      action: "workspace.created",
      targetType: "workspace",
      targetId: workspace.id,
      metadata: { slug },
    });

    revalidatePath("/setup");
    revalidatePath(`/w/${workspace.slug}`);

    return {
      message: null,
      redirectTo: `/w/${workspace.slug}`,
      values: initialCreateWorkspaceFormState.values,
    };
  } catch (error) {
    if (membershipId) {
      await supabase.from("workspace_members").delete().eq("id", membershipId);
    }

    if (workspaceId) {
      await supabase.from("workspaces").delete().eq("id", workspaceId);
    }

    const message =
      error instanceof Error ? error.message : "Could not complete organization setup.";

    return { message, redirectTo: null, values };
  }
}

export async function createInviteAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  const inviteId = crypto.randomUUID();
  const usage = String(formData.get("usage") ?? "single");
  const rawEmail = String(formData.get("email") ?? "").trim().toLowerCase();
  const invitedEmail = usage === "single" && rawEmail.length > 0 ? rawEmail : null;

  await supabase.from("workspace_invites").insert({
    id: inviteId,
    workspace_id: context.workspace.id,
    created_by_member_id: context.membership.id,
    token_hash: hashToken(inviteId),
    invited_email: invitedEmail,
    usage_limit: usage === "single" ? 1 : null,
    usage_count: 0,
  });

  revalidatePath(`/w/${workspaceSlug}/config`);
}

export async function revokeInviteAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const inviteId = String(formData.get("invite_id"));
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  if (context.membership.role !== "owner") {
    redirect(`/w/${workspaceSlug}`);
  }

  await supabase
    .from("workspace_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", inviteId)
    .eq("workspace_id", context.workspace.id);

  revalidatePath(`/w/${workspaceSlug}/config`);
}

export async function deleteWorkspaceAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const confirmationSlug = String(formData.get("confirm_slug") ?? "").trim();
  const context = await getWorkspaceContext(workspaceSlug);

  if (context.membership.role !== "owner") {
    redirect(`/w/${workspaceSlug}`);
  }

  if (confirmationSlug !== context.workspace.slug) {
    redirect(`/w/${workspaceSlug}/config?danger=confirmation_mismatch`);
  }

  const admin = createAdminClient();

  await admin.from("workspaces").delete().eq("id", context.workspace.id);

  revalidatePath("/");
  revalidatePath("/welcome");

  const { data: remainingMembership } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", context.user.id)
    .in("status", ["active", "pending_onboarding"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (remainingMembership?.workspace_id) {
    const { data: workspace } = await admin
      .from("workspaces")
      .select("slug")
      .eq("id", remainingMembership.workspace_id)
      .maybeSingle();

    if (workspace?.slug) {
      redirect(`/w/${workspace.slug}`);
    }
  }

  redirect("/welcome?workspace_deleted=1");
}

export async function joinWorkspaceWithInviteAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const user = await requireUser();
  await claimWorkspaceInviteOrRedirect({
    token,
    userId: user.id,
    userEmail: user.email ?? null,
  });
}
