import {
  buildPairHistory,
  chooseBestTimeSlot,
  generateMeetingGroups,
  getPeriodKey,
  type MatchParticipant,
  type Weekday,
  type WorkspaceHours,
} from "@meet4coffee/core";
import { createAdminClient } from "@meet4coffee/supabase";

import type { Database } from "@meet4coffee/supabase";

type ClubRow = Pick<
  Database["public"]["Tables"]["clubs"]["Row"],
  | "id"
  | "workspace_id"
  | "name"
  | "description"
  | "meeting_link_provider"
  | "frequency"
  | "group_size_target"
  | "duration_minutes"
  | "is_ready"
>;

type ClubMembershipRow = Pick<
  Database["public"]["Tables"]["club_memberships"]["Row"],
  "id" | "member_id" | "status"
>;

type WorkspaceMemberRow = Pick<
  Database["public"]["Tables"]["workspace_members"]["Row"],
  "id" | "user_id" | "status"
>;

type MemberProfileRow = Pick<
  Database["public"]["Tables"]["member_profiles"]["Row"],
  "user_id" | "name" | "language"
>;

type AvailabilityRow = Pick<
  Database["public"]["Tables"]["member_availability_windows"]["Row"],
  "weekday" | "start_time" | "end_time"
>;

type MeetingParticipantRow = Pick<
  Database["public"]["Tables"]["meeting_participants"]["Row"],
  "member_id" | "meeting_id"
>;

type RoundExclusionRow = Pick<
  Database["public"]["Tables"]["round_exclusions"]["Row"],
  "member_id" | "created_at"
>;

function getNextPeriodKey(
  frequency: "weekly" | "biweekly" | "monthly",
  now: Date,
): string {
  const msPerDay = 24 * 60 * 60 * 1000;
  if (frequency === "monthly") {
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return getPeriodKey(frequency, next);
  }
  const daysAhead = frequency === "biweekly" ? 14 : 7;
  const next = new Date(now.getTime() + daysAhead * msPerDay);
  return getPeriodKey(frequency, next);
}

async function getSeatStatus(workspaceId: string) {
  const admin = createAdminClient();
  const [{ data: subscription }, { count }] = await Promise.all([
    admin
      .from("workspace_subscriptions")
      .select("tier")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("workspace_members")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .in("status", ["active", "pending_onboarding"]),
  ]);

  const tier = subscription?.tier ?? "free";
  const max = tier === "premium" ? 50 : tier === "ultimate" ? null : 5;
  const current = count ?? 0;

  return { allowed: max === null || current < max };
}

async function buildRecentPairings(
  admin: ReturnType<typeof createAdminClient>,
  workspaceId: string,
  clubId: string,
  memberIds: string[],
): Promise<Record<string, Record<string, number>>> {
  const { data: recentRoundsData } = await admin
    .from("meeting_rounds")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("club_id", clubId)
    .order("created_at", { ascending: false })
    .limit(8);

  const recentRoundIds = (recentRoundsData ?? []).map((r: { id: string }) => r.id);
  if (recentRoundIds.length === 0) {
    return {};
  }

  const { data: participantsData } = await admin
    .from("meeting_participants")
    .select("member_id, meeting_id")
    .eq("workspace_id", workspaceId)
    .in("member_id", memberIds);

  const { data: meetingsData } = await admin
    .from("meetings")
    .select("id, meeting_round_id")
    .in("meeting_round_id", recentRoundIds);

  const meetingToRound = new Map(
    (meetingsData ?? []).map((m: { id: string; meeting_round_id: string }) => [m.id, m.meeting_round_id]),
  );

  const meetingToMembers = new Map<string, string[]>();
  for (const row of (participantsData ?? []) as MeetingParticipantRow[]) {
    if (!meetingToRound.has(row.meeting_id)) continue;
    const arr = meetingToMembers.get(row.meeting_id) ?? [];
    arr.push(row.member_id);
    meetingToMembers.set(row.meeting_id, arr);
  }

  const pairings: Record<string, Record<string, number>> = {};

  for (const [, members] of meetingToMembers) {
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const a = members[i];
        const b = members[j];
        pairings[a] = pairings[a] ?? {};
        pairings[a][b] = (pairings[a][b] ?? 0) + 1;
        pairings[b] = pairings[b] ?? {};
        pairings[b][a] = (pairings[b][a] ?? 0) + 1;
      }
    }
  }

  return pairings;
}

export async function generateRoundsForWorkspace(workspaceId: string, now = new Date()) {
  const admin = createAdminClient();
  const seatStatus = await getSeatStatus(workspaceId);

  if (!seatStatus.allowed) {
    return [];
  }

  const [{ data: workspace }, { data: clubsData }] = await Promise.all([
    admin
      .from("workspaces")
      .select("timezone, workday_start, workday_end")
      .eq("id", workspaceId)
      .single(),
    admin.from("clubs").select("*").eq("workspace_id", workspaceId).eq("is_ready", true),
  ]);

  const clubs = (clubsData ?? []) as ClubRow[];

  if (!clubs.length) {
    return [];
  }

  const workspaceHours: WorkspaceHours = {
    timezone: workspace?.timezone ?? "UTC",
    startTime: workspace?.workday_start ?? "09:00",
    endTime: workspace?.workday_end ?? "17:00",
  };

  const results: Database["public"]["Tables"]["meeting_rounds"]["Row"][] = [];

  for (const club of clubs) {
    const periodKey = getNextPeriodKey(
      club.frequency as "weekly" | "biweekly" | "monthly",
      now,
    );

    const { data: existingRound } = await admin
      .from("meeting_rounds")
      .select("id")
      .eq("club_id", club.id)
      .eq("period_key", periodKey)
      .maybeSingle();

    if (existingRound) {
      continue;
    }

    const { data: membershipsData } = await admin
      .from("club_memberships")
      .select("id, member_id, status")
      .eq("workspace_id", workspaceId)
      .eq("club_id", club.id)
      .eq("status", "active");

    const memberships = (membershipsData ?? []) as ClubMembershipRow[];
    const membershipIds = memberships.map((entry) => entry.member_id);

    if (membershipIds.length === 0) {
      continue;
    }

    const { data: workspaceMembersData } = await admin
      .from("workspace_members")
      .select("id, user_id, status")
      .eq("workspace_id", workspaceId)
      .in("id", membershipIds)
      .eq("status", "active");

    const workspaceMembers = (workspaceMembersData ?? []) as WorkspaceMemberRow[];

    if (workspaceMembers.length === 0) {
      continue;
    }

    const memberIds = workspaceMembers.map((m) => m.id);
    const userIds = workspaceMembers.map((member) => member.user_id);

    const [
      { data: profilesData },
      { data: round },
      pairHistory,
    ] = await Promise.all([
      admin
        .from("member_profiles")
        .select("user_id, name, language")
        .eq("workspace_id", workspaceId)
        .in("user_id", userIds),
      admin
        .from("meeting_rounds")
        .insert({
          workspace_id: workspaceId,
          club_id: club.id,
          period_key: periodKey,
          status: "draft",
        })
        .select("*")
        .single(),
      buildRecentPairings(admin, workspaceId, club.id, memberIds),
    ]);

    if (!round) {
      continue;
    }

    const profileMap = new Map(
      ((profilesData ?? []) as MemberProfileRow[]).map((profile) => [profile.user_id, profile]),
    );

    const participants = (
      await Promise.all(
        workspaceMembers.map(async (member): Promise<MatchParticipant> => {
          const profile = profileMap.get(member.user_id);
          const [
            { data: optOutsData },
            { data: recentMeetingsData },
            { data: availabilityData },
            { data: exclusionsData },
          ] = await Promise.all([
            admin
              .from("member_opt_outs")
              .select("target_member_id")
              .eq("workspace_id", workspaceId)
              .eq("source_member_id", member.id),
            admin
              .from("meeting_participants")
              .select("meeting_id")
              .eq("workspace_id", workspaceId)
              .eq("member_id", member.id)
              .order("created_at", { ascending: false })
              .limit(8),
            admin
              .from("member_availability_windows")
              .select("weekday, start_time, end_time")
              .eq("workspace_id", workspaceId)
              .eq("user_id", member.user_id),
            admin
              .from("round_exclusions")
              .select("member_id, created_at")
              .eq("workspace_id", workspaceId)
              .eq("member_id", member.id)
              .order("created_at", { ascending: false })
              .limit(1),
          ]);

          const availability = (availabilityData ?? []) as AvailabilityRow[];
          const exclusions = (exclusionsData ?? []) as RoundExclusionRow[];
          const lastSkippedAt = exclusions[0]?.created_at ?? null;

          return {
            id: member.id,
            name: profile?.name ?? "Member",
            language: profile?.language ?? "en",
            recentMeetingCount: recentMeetingsData?.length ?? 0,
            recentPairings: pairHistory[member.id] ?? {},
            absoluteOptOutUserIds: (
              (optOutsData ?? []) as Array<
                Pick<Database["public"]["Tables"]["member_opt_outs"]["Row"], "target_member_id">
              >
            ).map((item) => item.target_member_id),
            weightedOptOutUserIds: [],
            availability: availability.map((item) => ({
              weekday: item.weekday as Weekday,
              startTime: item.start_time,
              endTime: item.end_time,
            })),
            lastSkippedAt,
          };
        }),
      )
    ).filter((participant) => participant.id);

    if (participants.length === 0) {
      continue;
    }

    const decision = generateMeetingGroups(participants, club.group_size_target);

    if (decision.skippedParticipantIds.length > 0) {
      await admin.from("round_exclusions").insert(
        decision.skippedParticipantIds.map((memberId) => ({
          workspace_id: workspaceId,
          meeting_round_id: round.id,
          member_id: memberId,
          reason: "odd_member_out",
        })),
      );
    }

    for (const group of decision.groups) {
      const memberAvailability = participants
        .filter((participant) => group.participantIds.includes(participant.id))
        .map((participant) => participant.availability);

      const slot = chooseBestTimeSlot(workspaceHours, memberAvailability, club.duration_minutes);
      const { data: meeting } = await admin
        .from("meetings")
        .insert({
          workspace_id: workspaceId,
          meeting_round_id: round.id,
          title: `${club.name} roulette`,
          description: club.description,
          status: "scheduled",
          meeting_link_provider: club.meeting_link_provider,
        })
        .select("*")
        .single();

      if (!meeting) {
        continue;
      }

      const { data: existingParticipants } = await admin
        .from("meeting_participants")
        .select("member_id")
        .eq("workspace_id", workspaceId)
        .in(
          "meeting_id",
          (
            await admin
              .from("meetings")
              .select("id")
              .eq("meeting_round_id", round.id)
          ).data?.map((m: { id: string }) => m.id) ?? [],
        );

      const alreadyAssigned = new Set(
        (existingParticipants ?? []).map((p: { member_id: string }) => p.member_id),
      );

      const newParticipants = group.participantIds.filter((id) => !alreadyAssigned.has(id));

      if (newParticipants.length > 0) {
        await admin.from("meeting_participants").insert(
          newParticipants.map((memberId) => ({
            workspace_id: workspaceId,
            meeting_id: meeting.id,
            member_id: memberId,
            state: "pending",
          })),
        );
      }

      await admin.from("meeting_external_links").insert({
        workspace_id: workspaceId,
        meeting_id: meeting.id,
        provider: "matching_engine",
        external_id: null,
        url: null,
        metadata: {
          slot,
          pair_history: buildPairHistory(group.participantIds),
          skipped_participant_ids: decision.skippedParticipantIds,
        },
      });
    }

    results.push(round);
  }

  return results;
}
