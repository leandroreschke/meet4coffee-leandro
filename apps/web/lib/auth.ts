import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

import { createAdminClient, createServerSupabaseClient } from "@meet4coffee/supabase";
import { normalizeLocale, resolveLocale } from "@meet4coffee/i18n";

import type {
  Locale,
  MemberProfileRecord,
  WorkspaceContext,
  WorkspaceMembership,
  WorkspaceSummary,
} from "./app-types";

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function getCurrentMemberships() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const supabase = createAdminClient();
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("id, role, status, workspace_id, user_id")
    .eq("user_id", user.id)
    .in("status", ["active", "pending_onboarding"])
    .order("created_at", { ascending: true });

  const membershipRows = (memberships ?? []) as WorkspaceMembership[];

  if (membershipRows.length === 0) {
    return [];
  }

  const workspaceIds = Array.from(new Set(membershipRows.map((membership) => membership.workspace_id)));
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name, slug, timezone, default_locale, workday_start, workday_end, owner_member_id")
    .in("id", workspaceIds);

  const typedWorkspaces = (workspaces ?? []) as WorkspaceSummary[];
  const workspaceById = new Map<string, WorkspaceSummary>(
    typedWorkspaces.map((workspace) => [workspace.id, workspace]),
  );

  return membershipRows
    .map((membership) => ({
      ...membership,
      workspaces: workspaceById.get(membership.workspace_id) ?? null,
    }))
    .filter((membership): membership is WorkspaceMembership => membership.workspaces !== null);
}

export async function getWorkspaceContext(workspaceSlug: string): Promise<WorkspaceContext> {
  const user = await requireUser();
  const supabase = createAdminClient();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, slug, timezone, default_locale, workday_start, workday_end, owner_member_id")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (!workspace) {
    redirect("/setup");
  }

  const typedWorkspace = workspace as WorkspaceSummary;

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("id, role, status, workspace_id, user_id")
    .eq("user_id", user.id)
    .eq("workspace_id", typedWorkspace.id)
    .in("status", ["active", "pending_onboarding"])
    .maybeSingle();

  if (!membership) {
    redirect("/setup");
  }

  const typedMembership: WorkspaceMembership = {
    ...(membership as WorkspaceMembership),
    workspaces: typedWorkspace,
  };

  const { data: profile } = await supabase
    .from("member_profiles")
    .select("*")
    .eq("workspace_id", typedMembership.workspace_id)
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user,
    membership: typedMembership,
    workspace: typedWorkspace,
    profile: (profile as MemberProfileRecord | null) ?? null,
    locale: resolveLocale(
      await getPreferredLocale(),
      typedWorkspace.default_locale,
      null,
    ),
  };
}

export async function getPreferredLocale(): Promise<Locale> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const cookieLocale = cookieStore.get("m4c-locale")?.value;
  const headerLocale = headerStore.get("x-m4c-locale");
  const browserLocale = headerStore.get("accept-language");
  return normalizeLocale(cookieLocale ?? headerLocale ?? browserLocale);
}
