export const APP_NAME = "Meet 4 Coffee";

export const SUPPORTED_LOCALES = ["en", "es", "pt-br"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const MEMBERSHIP_ROLES = ["owner", "member"] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export const MEMBERSHIP_STATES = [
  "invited",
  "pending_onboarding",
  "active",
  "inactive",
] as const;
export type MembershipState = (typeof MEMBERSHIP_STATES)[number];

export const SUBSCRIPTION_TIERS = ["free", "premium", "ultimate"] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export const ASSIGNMENT_POLICIES = ["mandatory", "optional"] as const;
export type AssignmentPolicy = (typeof ASSIGNMENT_POLICIES)[number];

export const CLUB_VISIBILITIES = ["public", "hidden"] as const;
export type ClubVisibility = (typeof CLUB_VISIBILITIES)[number];

export const CLUB_JOIN_POLICIES = [
  "free_join",
  "approval_required",
  "owner_only",
] as const;
export type ClubJoinPolicy = (typeof CLUB_JOIN_POLICIES)[number];

export const MEETING_MODES = ["single_shared", "generated_groups"] as const;
export type MeetingMode = (typeof MEETING_MODES)[number];

export const MEETING_LINK_PROVIDERS = ["google_meet"] as const;
export type MeetingLinkProvider = (typeof MEETING_LINK_PROVIDERS)[number];

export const ROUND_FREQUENCIES = ["weekly", "biweekly", "monthly"] as const;
export type RoundFrequency = (typeof ROUND_FREQUENCIES)[number];

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const PARTICIPANT_STATES = [
  "pending",
  "confirmed",
  "declined",
  "canceled",
  "attended",
] as const;
export type ParticipantState = (typeof PARTICIPANT_STATES)[number];

export const INTEGRATION_PROVIDERS = [
  "slack",
  "google_calendar",
] as const;
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

export const PLAN_SEAT_LIMITS: Record<SubscriptionTier, number | null> = {
  free: 5,
  premium: 50,
  ultimate: null,
};

export interface WorkspaceHours {
  timezone: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityWindow {
  weekday: Weekday;
  startTime: string;
  endTime: string;
}

export interface MeetingParticipantSummary {
  id: string;
  name: string;
  email?: string | null;
  language?: string | null;
}

export interface MatchParticipant extends MeetingParticipantSummary {
  recentMeetingCount: number;
  recentPairings: Record<string, number>;
  absoluteOptOutUserIds: string[];
  weightedOptOutUserIds: string[];
  availability: AvailabilityWindow[];
  lastSkippedAt?: string | null;
}

export interface ClubSummary {
  id: string;
  name: string;
  description: string | null;
  assignmentPolicy: AssignmentPolicy;
  visibility: ClubVisibility;
  joinPolicy: ClubJoinPolicy;
  meetingMode: MeetingMode;
  meetingLinkProvider: MeetingLinkProvider;
  frequency: RoundFrequency;
  groupSizeTarget: number;
  durationMinutes: number;
  calendarEventEnabled: boolean;
  reminderMinutesBefore: number;
  anchorWeekday?: Weekday | null;
  anchorTime?: string | null;
}

export interface GeneratedMeetingGroup {
  participantIds: string[];
  score: number;
}

export interface SeatStatus {
  allowed: boolean;
  current: number;
  max: number | null;
  reason: "within_limit" | "seat_limit_reached";
}

export interface TimeSlotCandidate {
  weekday: Weekday;
  startTime: string;
  endTime: string;
  score: number;
}

export interface MeetingRoundDecision {
  groups: GeneratedMeetingGroup[];
  skippedParticipantIds: string[];
}
