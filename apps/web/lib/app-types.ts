import type { Locale as CoreLocale } from "@meet4coffee/core";
import type { Database } from "@meet4coffee/supabase";

export type Locale = CoreLocale;

export type MembershipRole = "owner" | "member";
export type AuthenticatedUser = {
  id: string;
  email?: string | null;
  user_metadata: Record<string, unknown>;
};

export type WorkspaceSummary = Pick<
  Database["public"]["Tables"]["workspaces"]["Row"],
  "id" | "name" | "slug" | "timezone" | "default_locale" | "workday_start" | "workday_end" | "owner_member_id"
>;

export type WorkspaceMembership = Pick<
  Database["public"]["Tables"]["workspace_members"]["Row"],
  "id" | "role" | "status" | "workspace_id" | "user_id"
> & {
  workspaces: WorkspaceSummary | null;
};

export type MemberProfileRecord = Pick<
  Database["public"]["Tables"]["member_profiles"]["Row"],
  "id" | "workspace_id" | "user_id" | "name" | "location" | "job_title" | "language" | "bio" | "slack_user_id" | "avatar_url"
>;

export type WorkspaceContext = {
  user: AuthenticatedUser;
  membership: WorkspaceMembership;
  workspace: WorkspaceSummary;
  profile: MemberProfileRecord | null;
  locale: Locale;
};

export type WorkspaceMemberWithProfile = Pick<
  Database["public"]["Tables"]["workspace_members"]["Row"],
  "id" | "role" | "status" | "user_id"
> & {
  member_profiles: MemberProfileRecord | null;
};

export type ClubMembershipSummary = Pick<
  Database["public"]["Tables"]["club_memberships"]["Row"],
  "id" | "member_id" | "status"
>;

export type ClubRecord = Database["public"]["Tables"]["clubs"]["Row"] & {
  club_memberships?: ClubMembershipSummary[] | null;
};

export type ClubWithCurrentMembership = Database["public"]["Tables"]["clubs"]["Row"] & {
  currentMembership: ClubMembershipSummary | null;
};

export type MeetingRecord = Pick<
  Database["public"]["Tables"]["meetings"]["Row"],
  "id" | "title" | "description" | "start_at" | "end_at" | "status" | "meeting_link_provider" | "meeting_link_url"
>;

export type MeetingParticipantRecord = Pick<
  Database["public"]["Tables"]["meeting_participants"]["Row"],
  "id" | "workspace_id" | "meeting_id" | "member_id" | "state" | "rating"
>;

export type MeetingWithParticipant = MeetingParticipantRecord & {
  meetings: MeetingRecord | null;
};

export type AvailabilityRecord = Database["public"]["Tables"]["member_availability_windows"]["Row"];

export type ProfileData = {
  profile: MemberProfileRecord | null;
  interests: Database["public"]["Tables"]["interests"]["Row"][];
  selectedInterestIds: string[];
  availability: AvailabilityRecord[];
};

export type WorkspaceConfigData = {
  invites: Database["public"]["Tables"]["workspace_invites"]["Row"][];
  groups: Database["public"]["Tables"]["groups"]["Row"][];
  clubs: Database["public"]["Tables"]["clubs"]["Row"][];
  integrations: Database["public"]["Tables"]["workspace_integrations"]["Row"][];
  subscription: Database["public"]["Tables"]["workspace_subscriptions"]["Row"] | null;
  members: WorkspaceMemberWithProfile[];
};

export type OptOutRecord = Database["public"]["Tables"]["member_opt_outs"]["Row"];

export type OptOutTarget = {
  memberId: string;
  userId: string;
  name: string | null;
  email: string | null;
};

export type ContentSection = "blog" | "help";

export type ContentAuthorRecord = Database["public"]["Tables"]["content_authors"]["Row"];

export type ContentItemRecord = Database["public"]["Tables"]["content_items"]["Row"];

export type PublishedContentListItem = Pick<
  ContentItemRecord,
  | "id"
  | "section"
  | "slug"
  | "title"
  | "excerpt"
  | "tags"
  | "cover_image_path"
  | "published_at"
  | "updated_at"
> & {
  author: Pick<ContentAuthorRecord, "key" | "name" | "avatar_path"> | null;
};

export type PublishedContentItem = ContentItemRecord & {
  author: ContentAuthorRecord | null;
  body: string;
};
