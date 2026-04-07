import type { ClubWithCurrentMembership, MeetingWithParticipant } from "./app-types";

function iso(daysFromNow: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function addMinutes(isoString: string, minutes: number): string {
  return new Date(new Date(isoString).getTime() + minutes * 60_000).toISOString();
}

const WORKSPACE_ID = "mock-workspace";
const MEMBER_ID = "mock-member";

export const MOCK_CLUBS: ClubWithCurrentMembership[] = [
  {
    id: "mock-club-1",
    workspace_id: WORKSPACE_ID,
    name: "Coffee Roulette",
    description:
      "Weekly random coffee chats to spark serendipitous connections across the team.",
    visibility: "public",
    join_policy: "free_join",
    frequency: "weekly",
    group_size_target: 2,
    duration_minutes: 30,
    reminder_minutes_before: 60,
    meeting_link_provider: "google_meet",
    calendar_event_enabled: true,
    is_ready: true,
    anchor_weekday: "Wednesday",
    anchor_time: "10:00",
    created_at: iso(-60),
    updated_at: iso(-7),
    currentMembership: { id: "mock-cm-1", member_id: MEMBER_ID, status: "active" },
  },
  {
    id: "mock-club-2",
    workspace_id: WORKSPACE_ID,
    name: "Learning Circle",
    description:
      "Bi-weekly knowledge-sharing sessions and book club for curious minds.",
    visibility: "public",
    join_policy: "free_join",
    frequency: "biweekly",
    group_size_target: 4,
    duration_minutes: 60,
    reminder_minutes_before: 1440,
    meeting_link_provider: "zoom",
    calendar_event_enabled: true,
    is_ready: true,
    anchor_weekday: "Friday",
    anchor_time: "14:00",
    created_at: iso(-45),
    updated_at: iso(-3),
    currentMembership: null,
  },
  {
    id: "mock-club-3",
    workspace_id: WORKSPACE_ID,
    name: "Founders Fireside",
    description:
      "Monthly deep-dives for leadership to discuss strategy, culture and company direction.",
    visibility: "public",
    join_policy: "invite_only",
    frequency: "monthly",
    group_size_target: 6,
    duration_minutes: 90,
    reminder_minutes_before: 2880,
    meeting_link_provider: "google_meet",
    calendar_event_enabled: true,
    is_ready: true,
    anchor_weekday: "Thursday",
    anchor_time: "16:00",
    created_at: iso(-90),
    updated_at: iso(-1),
    currentMembership: null,
  },
];

export type MeetingEntryWithInterests = MeetingWithParticipant & {
  sharedInterests: string[];
};

export const MOCK_UPCOMING_MEETINGS: MeetingEntryWithInterests[] = [
  {
    id: "mock-participant-upcoming-1",
    workspace_id: WORKSPACE_ID,
    meeting_id: "mock-meeting-upcoming-1",
    member_id: MEMBER_ID,
    state: "accepted",
    rating: null,
    sharedInterests: ["Remote Work", "Product Design"],
    meetings: {
      id: "mock-meeting-upcoming-1",
      title: "Coffee Roulette – Week 15",
      description: "Your weekly random coffee break",
      start_at: iso(3),
      end_at: addMinutes(iso(3), 30),
      status: "scheduled",
      meeting_link_provider: "google_meet",
      meeting_link_url: "https://meet.google.com/abc-defg-hij",
    },
  },
];

export const MOCK_PAST_MEETINGS: MeetingEntryWithInterests[] = [
  {
    id: "mock-participant-past-1",
    workspace_id: WORKSPACE_ID,
    meeting_id: "mock-meeting-past-1",
    member_id: MEMBER_ID,
    state: "completed",
    rating: 5,
    sharedInterests: [],
    meetings: {
      id: "mock-meeting-past-1",
      title: "Coffee Roulette – Week 14",
      description: null,
      start_at: iso(-7),
      end_at: addMinutes(iso(-7), 30),
      status: "completed",
      meeting_link_provider: "google_meet",
      meeting_link_url: null,
    },
  },
  {
    id: "mock-participant-past-2",
    workspace_id: WORKSPACE_ID,
    meeting_id: "mock-meeting-past-2",
    member_id: MEMBER_ID,
    state: "completed",
    rating: 4,
    sharedInterests: [],
    meetings: {
      id: "mock-meeting-past-2",
      title: "Coffee Roulette – Week 13",
      description: null,
      start_at: iso(-14),
      end_at: addMinutes(iso(-14), 30),
      status: "completed",
      meeting_link_provider: "google_meet",
      meeting_link_url: null,
    },
  },
  {
    id: "mock-participant-past-3",
    workspace_id: WORKSPACE_ID,
    meeting_id: "mock-meeting-past-3",
    member_id: MEMBER_ID,
    state: "completed",
    rating: 5,
    sharedInterests: [],
    meetings: {
      id: "mock-meeting-past-3",
      title: "Coffee Roulette – Week 12",
      description: null,
      start_at: iso(-21),
      end_at: addMinutes(iso(-21), 30),
      status: "completed",
      meeting_link_provider: "google_meet",
      meeting_link_url: null,
    },
  },
];
