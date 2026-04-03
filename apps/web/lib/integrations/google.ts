import { createAdminClient } from "@meet4coffee/supabase";

import { getAppUrl, getGoogleConfig } from "../env";

export async function exchangeGoogleCode(code: string) {
  const { clientId, clientSecret } = getGoogleConfig();

  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar is not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${getAppUrl()}/api/integrations/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  return response.json();
}

export async function syncGoogleCalendarEvent(meetingId: string, workspaceId: string) {
  const admin = createAdminClient();
  const [{ data: integration }, { data: meeting }] = await Promise.all([
    admin
      .from("workspace_integrations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("provider", "google_calendar")
      .maybeSingle(),
    admin
      .from("meetings")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("id", meetingId)
      .maybeSingle(),
  ]);

  if (!integration?.access_token || !meeting) {
    return { synced: false, reason: "missing_integration_or_meeting" };
  }

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integration.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: meeting.title,
        description: meeting.description ?? undefined,
        start: {
          dateTime: meeting.start_at ?? undefined,
        },
        end: {
          dateTime: meeting.end_at ?? undefined,
        },
        conferenceData:
          meeting.meeting_link_provider === "google_meet"
            ? {
                createRequest: {
                  requestId: meeting.id,
                },
              }
            : undefined,
      }),
    },
  );

  return response.json();
}
