import type { SubscriptionTier } from "@meet4coffee/core";
import { PLAN_SEAT_LIMITS } from "@meet4coffee/core";
import { createServerSupabaseClient } from "@meet4coffee/supabase";
import type { Database } from "@meet4coffee/supabase";

import type {
  ClubRecord,
  ClubWithCurrentMembership,
  MeetingWithParticipant,
  OptOutTarget,
  ProfileData,
  WorkspaceConfigData,
  WorkspaceMemberWithProfile,
} from "./app-types";

export async function getWorkspaceHomeData(workspaceId: string, memberId: string) {
  const supabase = await createServerSupabaseClient();

  const [{ data: participantMeetings }, { count: clubCount }, { data: subscription }, { count: memberCount }] =
    await Promise.all([
      supabase
        .from("meeting_participants")
        .select(
          "id, meetings(id, title, start_at, meeting_link_provider, meeting_link_url, status)",
        )
        .eq("workspace_id", workspaceId)
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase.from("clubs").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
      supabase
        .from("workspace_subscriptions")
        .select("tier, status")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("workspace_members")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .in("status", ["active", "pending_onboarding"]),
    ]);

  const tier = (subscription?.tier as SubscriptionTier | undefined) ?? "free";
  const nextMeeting =
    ((participantMeetings ?? []) as MeetingWithParticipant[])
      .map((entry) => entry.meetings)
      .filter(
        (meeting): meeting is NonNullable<MeetingWithParticipant["meetings"]> =>
          Boolean(meeting?.start_at && new Date(meeting.start_at) >= new Date()),
      )
      .sort(
        (left, right) =>
          new Date(left.start_at ?? "").getTime() - new Date(right.start_at ?? "").getTime(),
      )[0] ?? null;

  return {
    nextMeeting,
    clubCount: clubCount ?? 0,
    memberCount: memberCount ?? 0,
    tier,
    seatLimit: PLAN_SEAT_LIMITS[tier],
  };
}

export async function getWorkspaceMembers(workspaceId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: members } = await supabase
    .from("workspace_members")
    .select("id, role, status, user_id")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  const typedMembers = (members ?? []) as WorkspaceMemberWithProfile[];
  const userIds = typedMembers.map((member) => member.user_id);
  const { data: profiles } = userIds.length
    ? await supabase
      .from("member_profiles")
      .select("id, workspace_id, user_id, name, location, job_title, language, bio, slack_user_id")
      .eq("workspace_id", workspaceId)
      .in("user_id", userIds)
    : { data: [] as Array<Record<string, unknown>> };

  const profileMap = new Map(
    ((profiles ?? []) as WorkspaceMemberWithProfile["member_profiles"][]).flatMap((profile) =>
      profile ? [[profile.user_id, profile] as const] : [],
    ),
  );

  return typedMembers.map((member) => ({
    ...member,
    member_profiles: profileMap.get(member.user_id) ?? null,
  }));
}

export async function getWorkspaceClubs(workspaceId: string, memberId: string) {
  const supabase = await createServerSupabaseClient();
  const [{ data: clubsData }, { data: membershipsData }] = await Promise.all([
    supabase
      .from("clubs")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    supabase
      .from("club_memberships")
      .select("id, club_id, member_id, status")
      .eq("workspace_id", workspaceId)
      .eq("member_id", memberId),
  ]);

  const membershipsByClubId = new Map(
    ((membershipsData ?? []) as Array<{
      id: string;
      club_id: string;
      member_id: string;
      status: "active" | "pending_approval" | "invited" | "left" | "removed";
    }>).map((membership) => [membership.club_id, membership]),
  );

  return ((clubsData ?? []) as ClubRecord[]).map((club): ClubWithCurrentMembership => ({
    ...club,
    currentMembership: membershipsByClubId.get(club.id) ?? null,
  }));
}

export async function getWorkspaceMeetings(workspaceId: string, memberId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("meeting_participants")
    .select(
      `
        id,
        state,
        rating,
        meetings (
          id,
          title,
          description,
          start_at,
          end_at,
          status,
          meeting_link_provider,
          meeting_link_url
        )
      `,
    )
    .eq("workspace_id", workspaceId)
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  return (data ?? []) as MeetingWithParticipant[];
}

export async function getProfileData(workspaceId: string, userId: string): Promise<ProfileData> {
  const supabase = await createServerSupabaseClient();
  const [{ data: profile }, { data: interests }, { data: selectedInterests }, { data: availability }] =
    await Promise.all([
      supabase
        .from("member_profiles")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("interests").select("*").order("name", { ascending: true }),
      supabase
        .from("member_interests")
        .select("interest_id")
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId),
      supabase
        .from("member_availability_windows")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)
        .order("weekday", { ascending: true }),
    ]);

  const memberInterests =
    (selectedInterests ?? []) as Array<
      Pick<Database["public"]["Tables"]["member_interests"]["Row"], "interest_id">
    >;

  return {
    profile: profile as ProfileData["profile"],
    interests: interests ?? [],
    selectedInterestIds: memberInterests.map((entry) => entry.interest_id),
    availability: availability ?? [],
  };
}

export async function getOptOuts(
  workspaceId: string,
  sourceMemberId: string,
): Promise<OptOutTarget[]> {
  const supabase = await createServerSupabaseClient();

  const { data: optOuts } = await supabase
    .from("member_opt_outs")
    .select("target_member_id")
    .eq("workspace_id", workspaceId)
    .eq("source_member_id", sourceMemberId);

  const targetIds = (optOuts ?? []).map((o: { target_member_id: string }) => o.target_member_id);
  if (targetIds.length === 0) return [];

  const { data: members } = await supabase
    .from("workspace_members")
    .select("id, user_id")
    .eq("workspace_id", workspaceId)
    .in("id", targetIds);

  const typedMembers = (members ?? []) as Array<{ id: string; user_id: string }>;
  const userIds = typedMembers.map((m) => m.user_id);

  const { data: profiles } = userIds.length
    ? await supabase
      .from("member_profiles")
      .select("user_id, name, email")
      .eq("workspace_id", workspaceId)
      .in("user_id", userIds)
    : { data: [] as Array<{ user_id: string; name: string | null; email: string | null }> };

  const profileMap = new Map<string, { name: string | null; email: string | null }>(
    (profiles ?? []).map((p: { user_id: string; name: string | null; email: string | null }) => [p.user_id, { name: p.name, email: p.email }]),
  );

  return typedMembers.map((m) => ({
    memberId: m.id,
    userId: m.user_id,
    name: profileMap.get(m.user_id)?.name ?? null,
    email: profileMap.get(m.user_id)?.email ?? null,
  }));
}

export async function getWorkspaceMembersSearchable(
  workspaceId: string,
  excludeMemberId: string,
): Promise<OptOutTarget[]> {
  const supabase = await createServerSupabaseClient();

  const { data: members } = await supabase
    .from("workspace_members")
    .select("id, user_id")
    .eq("workspace_id", workspaceId)
    .eq("status", "active")
    .neq("id", excludeMemberId);

  const userIds = (members ?? []).map((m: { id: string; user_id: string }) => m.user_id);

  const { data: profiles } = userIds.length
    ? await supabase
      .from("member_profiles")
      .select("user_id, name, email")
      .eq("workspace_id", workspaceId)
      .in("user_id", userIds)
    : { data: [] as Array<{ user_id: string; name: string | null; email: string | null }> };

  const profileMap = new Map<string, { name: string | null; email: string | null }>(
    (profiles ?? []).map((p: { user_id: string; name: string | null; email: string | null }) => [p.user_id, { name: p.name, email: p.email }]),
  );

  return ((members ?? []) as Array<{ id: string; user_id: string }>).map((m) => ({
    memberId: m.id,
    userId: m.user_id,
    name: profileMap.get(m.user_id)?.name ?? null,
    email: profileMap.get(m.user_id)?.email ?? null,
  }));
}

export async function getWorkspaceConfigData(workspaceId: string): Promise<WorkspaceConfigData> {
  const supabase = await createServerSupabaseClient();
  const [invites, groups, clubs, integrations, subscription, members] = await Promise.all([
    supabase
      .from("workspace_invites")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    supabase.from("groups").select("*").eq("workspace_id", workspaceId).order("name"),
    supabase.from("clubs").select("*").eq("workspace_id", workspaceId).order("name"),
    supabase
      .from("workspace_integrations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("provider"),
    supabase
      .from("workspace_subscriptions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getWorkspaceMembers(workspaceId),
  ]);

  return {
    invites: invites.data ?? [],
    groups: groups.data ?? [],
    clubs: clubs.data ?? [],
    integrations: integrations.data ?? [],
    subscription: subscription.data ?? null,
    members,
  };
}
