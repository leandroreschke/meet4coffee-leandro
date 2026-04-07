export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: Timestamps & {
          id: string;
          name: string;
          slug: string;
          timezone: string;
          workday_start: string;
          workday_end: string;
          default_locale: string;
          owner_member_id: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["workspaces"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["workspaces"]["Row"]>;
      };
      workspace_members: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          user_id: string;
          role: string;
          status: string;
          invited_email: string | null;
          seat_consuming: boolean;
          joined_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["workspace_members"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["workspace_members"]["Row"]>;
      };
      member_profiles: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          user_id: string;
          email: string | null;
          preferred_locale: string;
          name: string | null;
          location: string | null;
          job_title: string | null;
          language: string | null;
          bio: string | null;
          slack_user_id: string | null;
          avatar_url: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["member_profiles"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["member_profiles"]["Row"]>;
      };
      member_availability_windows: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          user_id: string;
          weekday: string;
          start_time: string;
          end_time: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["member_availability_windows"]["Row"],
          keyof Timestamps
        > &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["member_availability_windows"]["Row"]>;
      };
      interests: {
        Row: Timestamps & {
          id: string;
          name: string;
          slug: string;
          created_by_user_id: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["interests"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["interests"]["Row"]>;
      };
      member_interests: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          user_id: string;
          interest_id: string;
        };
        Insert: Omit<Database["public"]["Tables"]["member_interests"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["member_interests"]["Row"]>;
      };
      interest_suggestions: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          user_id: string;
          name: string;
          status: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["interest_suggestions"]["Row"],
          keyof Timestamps
        > &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["interest_suggestions"]["Row"]>;
      };
      groups: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["groups"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["groups"]["Row"]>;
      };
      group_memberships: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          group_id: string;
          member_id: string;
        };
        Insert: Omit<Database["public"]["Tables"]["group_memberships"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["group_memberships"]["Row"]>;
      };
      clubs: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          visibility: string;
          join_policy: string;
          meeting_link_provider: string;
          frequency: string;
          group_size_target: number;
          duration_minutes: number;
          reminder_minutes_before: number;
          calendar_event_enabled: boolean;
          is_ready: boolean;
          anchor_weekday: string | null;
          anchor_time: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["clubs"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["clubs"]["Row"]>;
      };
      club_group_assignments: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          club_id: string;
          group_id: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["club_group_assignments"]["Row"],
          keyof Timestamps
        > &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["club_group_assignments"]["Row"]>;
      };
      club_memberships: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          club_id: string;
          member_id: string;
          status: string;
        };
        Insert: Omit<Database["public"]["Tables"]["club_memberships"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["club_memberships"]["Row"]>;
      };
      workspace_invites: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          created_by_member_id: string;
          token_hash: string;
          invited_email: string | null;
          usage_limit: number | null;
          usage_count: number;
          expires_at: string | null;
          revoked_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["workspace_invites"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["workspace_invites"]["Row"]>;
      };
      meeting_rounds: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          club_id: string;
          period_key: string;
          status: string;
          scheduled_for: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["meeting_rounds"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["meeting_rounds"]["Row"]>;
      };
      meetings: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          meeting_round_id: string;
          title: string;
          description: string | null;
          start_at: string | null;
          end_at: string | null;
          status: string;
          meeting_link_provider: string;
          meeting_link_url: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["meetings"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["meetings"]["Row"]>;
      };
      meeting_participants: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          meeting_id: string;
          member_id: string;
          state: string;
          rating: number | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["meeting_participants"]["Row"],
          keyof Timestamps
        > &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["meeting_participants"]["Row"]>;
      };
      meeting_reschedule_proposals: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          meeting_id: string;
          proposed_by_member_id: string;
          proposed_start_at: string;
          proposed_end_at: string;
          status: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["meeting_reschedule_proposals"]["Row"],
          keyof Timestamps
        > &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["meeting_reschedule_proposals"]["Row"]>;
      };
      meeting_reschedule_responses: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          proposal_id: string;
          member_id: string;
          response: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["meeting_reschedule_responses"]["Row"],
          keyof Timestamps
        > &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["meeting_reschedule_responses"]["Row"]>;
      };
      member_opt_outs: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          source_member_id: string;
          target_member_id: string;
        };
        Insert: Omit<Database["public"]["Tables"]["member_opt_outs"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["member_opt_outs"]["Row"]>;
      };
      round_exclusions: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          meeting_round_id: string;
          member_id: string;
          reason: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["round_exclusions"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["round_exclusions"]["Row"]>;
      };
      workspace_subscriptions: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          tier: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
        };
        Insert: Omit<
          Database["public"]["Tables"]["workspace_subscriptions"]["Row"],
          keyof Timestamps
        > &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["workspace_subscriptions"]["Row"]>;
      };
      stripe_events: {
        Row: Timestamps & {
          id: string;
          event_id: string;
          type: string;
          payload: Json;
        };
        Insert: Omit<Database["public"]["Tables"]["stripe_events"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["stripe_events"]["Row"]>;
      };
      workspace_integrations: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          provider: string;
          status: string;
          external_workspace_id: string | null;
          access_token: string | null;
          refresh_token: string | null;
          metadata: Json;
        };
        Insert: Omit<
          Database["public"]["Tables"]["workspace_integrations"]["Row"],
          keyof Timestamps
        > &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["workspace_integrations"]["Row"]>;
      };
      meeting_external_links: {
        Row: Timestamps & {
          id: string;
          workspace_id: string;
          meeting_id: string;
          provider: string;
          external_id: string | null;
          url: string | null;
          metadata: Json;
        };
        Insert: Omit<
          Database["public"]["Tables"]["meeting_external_links"]["Row"],
          keyof Timestamps
        > &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["meeting_external_links"]["Row"]>;
      };
      audit_logs: {
        Row: Timestamps & {
          id: string;
          workspace_id: string | null;
          actor_member_id: string | null;
          action: string;
          target_type: string;
          target_id: string | null;
          metadata: Json;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
      };
      cron_run_logs: {
        Row: {
          id: string;
          job_name: string;
          workspace_id: string | null;
          club_id: string | null;
          status: string;
          error_message: string | null;
          rounds_generated: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cron_run_logs"]["Row"], "id" | "created_at"> &
        Partial<Pick<Database["public"]["Tables"]["cron_run_logs"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["cron_run_logs"]["Row"]>;
      };
      content_authors: {
        Row: Timestamps & {
          key: string;
          name: string;
          bio: string | null;
          avatar_path: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["content_authors"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["content_authors"]["Row"]>;
      };
      content_items: {
        Row: Timestamps & {
          id: string;
          section: string;
          slug: string;
          title: string;
          excerpt: string | null;
          seo_title: string | null;
          seo_description: string | null;
          tags: string[];
          body_path: string;
          cover_image_path: string | null;
          author_key: string | null;
          is_published: boolean;
          published_at: string | null;
          is_archived: boolean;
          archived_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["content_items"]["Row"], keyof Timestamps> &
        Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["content_items"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
