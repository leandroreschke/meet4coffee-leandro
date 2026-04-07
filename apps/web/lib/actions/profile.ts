"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { localizePath } from "../locale";

import { createAdminClient, createServerSupabaseClient } from "@meet4coffee/supabase";
import { normalizeLocale } from "@meet4coffee/i18n";

import { getWorkspaceContext } from "../auth";
import { slugify } from "../utils";

function profileStatusPath(basePath: string, status: string, code?: string | null) {
  const query = code
    ? `?profile_status=${status}&profile_code=${encodeURIComponent(code)}`
    : `?profile_status=${status}`;
  return `${basePath}${query}`;
}

function parseNewInterests(raw: string) {
  const names = raw
    .split(/[,;\n]/g)
    .map((value) => value.trim().replace(/\s+/g, " "))
    .filter(Boolean);

  const bySlug = new Map<string, string>();

  for (const name of names) {
    const slug = slugify(name);

    if (!slug) {
      continue;
    }

    if (!bySlug.has(slug)) {
      bySlug.set(slug, name);
    }
  }

  return Array.from(bySlug.entries()).map(([slug, name]) => ({ slug, name }));
}

export async function saveProfileAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const profilePath = `/w/${workspaceSlug}/profile`;
  const context = await getWorkspaceContext(workspaceSlug);
  const admin = createAdminClient();

  const language = normalizeLocale(String(formData.get("language") ?? "en"));
  const selectedInterestIds = formData
    .getAll("interest_ids")
    .map((value) => String(value))
    .filter(Boolean);
  const newInterests = parseNewInterests(String(formData.get("new_interests") ?? ""));

  let createdInterestIds: string[] = [];

  if (newInterests.length > 0) {
    const upsertInterests = await admin.from("interests").upsert(
      newInterests.map((interest) => ({
        name: interest.name,
        slug: interest.slug,
        created_by_user_id: context.user.id,
      })),
      { onConflict: "slug" },
    );
    if (upsertInterests.error) {
      redirect(profileStatusPath(profilePath, "error_interests", upsertInterests.error.code));
    }

    const { data: createdInterests, error: createdInterestsError } = await admin
      .from("interests")
      .select("id")
      .in(
        "slug",
        newInterests.map((interest) => interest.slug),
      );
    if (createdInterestsError) {
      redirect(profileStatusPath(profilePath, "error_interests", createdInterestsError.code));
    }

    createdInterestIds = ((createdInterests ?? []) as Array<{ id: string }>).map(
      (interest) => interest.id,
    );
  }

  const finalInterestIds = Array.from(new Set([...selectedInterestIds, ...createdInterestIds]));

  const saveProfileResult = await admin.from("member_profiles").upsert(
    {
      workspace_id: context.workspace.id,
      user_id: context.user.id,
      name: String(formData.get("name") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      job_title: String(formData.get("job_title") ?? "") || null,
      language,
      bio: String(formData.get("bio") ?? "") || null,
      slack_user_id: String(formData.get("slack_user_id") ?? "") || null,
    },
    {
      onConflict: "workspace_id,user_id",
    },
  );
  if (saveProfileResult.error) {
    console.error("Profile upsert error:", saveProfileResult.error);
    redirect(profileStatusPath(profilePath, "error_profile", saveProfileResult.error.code));
  }

  const activateMembershipResult = await admin
    .from("workspace_members")
    .update({ status: "active" })
    .eq("id", context.membership.id)
    .eq("workspace_id", context.workspace.id);
  if (activateMembershipResult.error) {
    console.error("Membership activation error:", activateMembershipResult.error);
    redirect(profileStatusPath(profilePath, "error_membership", activateMembershipResult.error.code));
  }

  const clearInterestsResult = await admin
    .from("member_interests")
    .delete()
    .eq("workspace_id", context.workspace.id)
    .eq("user_id", context.user.id);
  if (clearInterestsResult.error) {
    console.error("Clear interests error:", clearInterestsResult.error);
    redirect(profileStatusPath(profilePath, "error_interests", clearInterestsResult.error.code));
  }

  if (finalInterestIds.length > 0) {
    const insertInterestsResult = await admin.from("member_interests").insert(
      finalInterestIds.map((interestId) => ({
        workspace_id: context.workspace.id,
        user_id: context.user.id,
        interest_id: interestId,
      })),
    );
    if (insertInterestsResult.error) {
      console.error("Insert interests error:", insertInterestsResult.error);
      redirect(profileStatusPath(profilePath, "error_interests", insertInterestsResult.error.code));
    }
  }

  const cookieStore = await cookies();
  cookieStore.set("m4c-locale", language, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  });

  const localizedProfilePath = localizePath(profilePath, language);
  revalidatePath(profilePath);
  redirect(`${localizedProfilePath}?profile_status=saved`);
}

export async function saveAvailabilityAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  const weekday = String(formData.get("weekday"));
  const startTime = String(formData.get("start_time"));
  const endTime = String(formData.get("end_time"));

  await supabase.from("member_availability_windows").insert({
    workspace_id: context.workspace.id,
    user_id: context.user.id,
    weekday,
    start_time: startTime,
    end_time: endTime,
  });

  revalidatePath(`/w/${workspaceSlug}/profile`);
}

export async function toggleOptOutAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const targetMemberId = String(formData.get("target_member_id"));
  const enabled = String(formData.get("enabled")) === "true";
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  if (enabled) {
    await supabase.from("member_opt_outs").insert({
      workspace_id: context.workspace.id,
      source_member_id: context.membership.id,
      target_member_id: targetMemberId,
    });
  } else {
    await supabase
      .from("member_opt_outs")
      .delete()
      .eq("workspace_id", context.workspace.id)
      .eq("source_member_id", context.membership.id)
      .eq("target_member_id", targetMemberId);
  }

  revalidatePath(`/w/${workspaceSlug}/members`);
}

export async function importProfileAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug"));
  const sourceWorkspaceId = String(formData.get("source_workspace_id"));
  const context = await getWorkspaceContext(workspaceSlug);
  const supabase = await createServerSupabaseClient();

  const { data: sourceProfile } = await supabase
    .from("member_profiles")
    .select("*")
    .eq("workspace_id", sourceWorkspaceId)
    .eq("user_id", context.user.id)
    .maybeSingle();

  if (sourceProfile) {
    await supabase.from("member_profiles").upsert(
      {
        workspace_id: context.workspace.id,
        user_id: context.user.id,
        name: sourceProfile.name,
        location: sourceProfile.location,
        job_title: sourceProfile.job_title,
        language: sourceProfile.language,
        bio: sourceProfile.bio,
        slack_user_id: sourceProfile.slack_user_id,
      },
      { onConflict: "workspace_id,user_id" },
    );
  }

  revalidatePath(`/w/${workspaceSlug}/profile`);
}

export async function setLocaleAction(formData: FormData) {
  const locale = normalizeLocale(String(formData.get("locale") ?? "en"));
  const cookieStore = await cookies();
  cookieStore.set("m4c-locale", locale, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });

  const redirectPath = String(formData.get("redirect_path") ?? "/");
  revalidatePath(redirectPath);
}
