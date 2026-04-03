"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type Locale } from "@meet4coffee/i18n";
import { createAdminClient } from "@meet4coffee/supabase";

import { getWorkspaceContext } from "@/lib/auth";
import { getAppUrl, getGoogleConfig, getSlackConfig } from "@/lib/env";
import { createOAuthStateToken, type OAuthProvider } from "@/lib/integrations/oauth-state";
import { localizePath } from "@/lib/locale";

function getConfigPath(workspaceSlug: string, locale: Locale, params?: Record<string, string>) {
  const basePath = localizePath(`/w/${workspaceSlug}/config`, locale);
  if (!params) {
    return basePath;
  }

  const search = new URLSearchParams(params).toString();
  return search ? `${basePath}?${search}` : basePath;
}

function ensureOwnerRole(role: string, workspaceSlug: string) {
  if (role !== "owner") {
    redirect(`/w/${workspaceSlug}`);
  }
}

function getMetadataObject(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return { ...metadata };
}

async function getOwnerContextFromFormData(formData: FormData) {
  const workspaceSlug = String(formData.get("workspace_slug") ?? "").trim();
  const context = await getWorkspaceContext(workspaceSlug);
  ensureOwnerRole(context.membership.role, workspaceSlug);
  return context;
}

function buildSlackAuthorizeUrl(state: string) {
  const { clientId } = getSlackConfig();
  if (!clientId) {
    throw new Error("Slack OAuth client is not configured.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "chat:write,chat:write.public",
    redirect_uri: `${getAppUrl()}/api/integrations/slack/callback`,
    state,
  });

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

function buildGoogleAuthorizeUrl(state: string) {
  const { clientId } = getGoogleConfig();
  if (!clientId) {
    throw new Error("Google OAuth client is not configured.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${getAppUrl()}/api/integrations/google/callback`,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function startOAuth(provider: OAuthProvider, formData: FormData) {
  const context = await getOwnerContextFromFormData(formData);
  const state = createOAuthStateToken({
    provider,
    workspaceId: context.workspace.id,
    workspaceSlug: context.workspace.slug,
    locale: context.locale,
    actorMemberId: context.membership.id,
    actorUserId: context.user.id,
  });

  try {
    const destination =
      provider === "slack" ? buildSlackAuthorizeUrl(state) : buildGoogleAuthorizeUrl(state);
    redirect(destination);
  } catch {
    redirect(
      getConfigPath(context.workspace.slug, context.locale, {
        integration: provider,
        status: "oauth_not_configured",
      }),
    );
  }
}

export async function connectSlackIntegrationAction(formData: FormData) {
  await startOAuth("slack", formData);
}

export async function connectGoogleIntegrationAction(formData: FormData) {
  await startOAuth("google_calendar", formData);
}

export async function disconnectIntegrationAction(formData: FormData) {
  const provider = String(formData.get("provider") ?? "").trim() as OAuthProvider;
  const context = await getOwnerContextFromFormData(formData);
  const admin = createAdminClient();

  if (provider !== "slack" && provider !== "google_calendar") {
    redirect(
      getConfigPath(context.workspace.slug, context.locale, {
        integration: "unknown",
        status: "invalid_provider",
      }),
    );
  }

  await admin
    .from("workspace_integrations")
    .delete()
    .eq("workspace_id", context.workspace.id)
    .eq("provider", provider);

  revalidatePath(getConfigPath(context.workspace.slug, context.locale));

  redirect(
    getConfigPath(context.workspace.slug, context.locale, {
      integration: provider,
      status: "disconnected",
    }),
  );
}

export async function saveSlackChannelAction(formData: FormData) {
  const context = await getOwnerContextFromFormData(formData);
  const admin = createAdminClient();
  const slackChannelId = String(formData.get("slack_channel_id") ?? "").trim();

  const { data: slackIntegration } = await admin
    .from("workspace_integrations")
    .select("id, metadata")
    .eq("workspace_id", context.workspace.id)
    .eq("provider", "slack")
    .maybeSingle();

  if (!slackIntegration?.id) {
    redirect(
      getConfigPath(context.workspace.slug, context.locale, {
        integration: "slack",
        status: "not_connected",
      }),
    );
  }

  const metadata = getMetadataObject(slackIntegration.metadata);
  metadata.slack_channel_id = slackChannelId;

  await admin.from("workspace_integrations").update({ metadata }).eq("id", slackIntegration.id);

  revalidatePath(getConfigPath(context.workspace.slug, context.locale));

  redirect(
    getConfigPath(context.workspace.slug, context.locale, {
      integration: "slack",
      status: "saved",
    }),
  );
}

export async function sendSlackTestNotificationAction(formData: FormData) {
  const context = await getOwnerContextFromFormData(formData);
  const admin = createAdminClient();

  const { data: slackIntegration } = await admin
    .from("workspace_integrations")
    .select("id, access_token, metadata")
    .eq("workspace_id", context.workspace.id)
    .eq("provider", "slack")
    .maybeSingle();

  if (!slackIntegration?.id || !slackIntegration.access_token) {
    redirect(
      getConfigPath(context.workspace.slug, context.locale, {
        integration: "slack",
        status: "not_connected",
      }),
    );
  }

  const metadata = getMetadataObject(slackIntegration.metadata);
  const channelId = String(metadata.slack_channel_id ?? "").trim();

  if (!channelId) {
    redirect(
      getConfigPath(context.workspace.slug, context.locale, {
        integration: "slack",
        status: "missing_channel",
      }),
    );
  }

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${slackIntegration.access_token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel: channelId,
      text: `Meet 4 Coffee test: Slack integration is connected for ${context.workspace.name}.`,
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload.ok) {
    redirect(
      getConfigPath(context.workspace.slug, context.locale, {
        integration: "slack",
        status: "test_failed",
      }),
    );
  }

  metadata.slack_last_tested_at = new Date().toISOString();
  await admin.from("workspace_integrations").update({ metadata }).eq("id", slackIntegration.id);

  revalidatePath(getConfigPath(context.workspace.slug, context.locale));

  redirect(
    getConfigPath(context.workspace.slug, context.locale, {
      integration: "slack",
      status: "tested",
    }),
  );
}

export async function sendGoogleCalendarTestAction(formData: FormData) {
  const context = await getOwnerContextFromFormData(formData);
  const admin = createAdminClient();

  const { data: googleIntegration } = await admin
    .from("workspace_integrations")
    .select("id, access_token, metadata")
    .eq("workspace_id", context.workspace.id)
    .eq("provider", "google_calendar")
    .maybeSingle();

  if (!googleIntegration?.id || !googleIntegration.access_token) {
    redirect(
      getConfigPath(context.workspace.slug, context.locale, {
        integration: "google_calendar",
        status: "not_connected",
      }),
    );
  }

  const startAt = new Date(Date.now() + 15 * 60 * 1000);
  const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${googleIntegration.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: `Meet 4 Coffee test (${context.workspace.name})`,
        description: "This is a test event created from workspace integration settings.",
        start: {
          dateTime: startAt.toISOString(),
          timeZone: context.workspace.timezone,
        },
        end: {
          dateTime: endAt.toISOString(),
          timeZone: context.workspace.timezone,
        },
        conferenceData: {
          createRequest: {
            requestId: `m4c-test-${crypto.randomUUID()}`,
          },
        },
      }),
    },
  );

  const payload = await response.json();

  if (!response.ok || payload.error) {
    redirect(
      getConfigPath(context.workspace.slug, context.locale, {
        integration: "google_calendar",
        status: "test_failed",
      }),
    );
  }

  const metadata = getMetadataObject(googleIntegration.metadata);
  metadata.google_last_tested_at = new Date().toISOString();
  metadata.google_last_test_event = payload.htmlLink ?? payload.id ?? null;

  await admin.from("workspace_integrations").update({ metadata }).eq("id", googleIntegration.id);

  revalidatePath(getConfigPath(context.workspace.slug, context.locale));

  redirect(
    getConfigPath(context.workspace.slug, context.locale, {
      integration: "google_calendar",
      status: "tested",
    }),
  );
}

export async function testAllIntegrationsAction(formData: FormData) {
  const context = await getOwnerContextFromFormData(formData);
  const admin = createAdminClient();

  let slackTest = "skipped";
  let googleTest = "skipped";

  const [{ data: slackIntegration }, { data: googleIntegration }] = await Promise.all([
    admin
      .from("workspace_integrations")
      .select("id, access_token, metadata")
      .eq("workspace_id", context.workspace.id)
      .eq("provider", "slack")
      .maybeSingle(),
    admin
      .from("workspace_integrations")
      .select("id, access_token, metadata")
      .eq("workspace_id", context.workspace.id)
      .eq("provider", "google_calendar")
      .maybeSingle(),
  ]);

  if (slackIntegration?.id && slackIntegration.access_token) {
    const slackMetadata = getMetadataObject(slackIntegration.metadata);
    const channelId = String(slackMetadata.slack_channel_id ?? "").trim();

    if (channelId) {
      const slackResponse = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${slackIntegration.access_token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          channel: channelId,
          text: `Meet 4 Coffee test: Slack integration is connected for ${context.workspace.name}.`,
        }),
      });
      const slackPayload = await slackResponse.json();
      slackTest = slackResponse.ok && slackPayload.ok ? "ok" : "failed";
    } else {
      slackTest = "missing_channel";
    }
  } else {
    slackTest = "not_connected";
  }

  if (googleIntegration?.id && googleIntegration.access_token) {
    const startAt = new Date(Date.now() + 15 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);
    const googleResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleIntegration.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: `Meet 4 Coffee test (${context.workspace.name})`,
          description: "This is a test event created from workspace integration settings.",
          start: {
            dateTime: startAt.toISOString(),
            timeZone: context.workspace.timezone,
          },
          end: {
            dateTime: endAt.toISOString(),
            timeZone: context.workspace.timezone,
          },
          conferenceData: {
            createRequest: {
              requestId: `m4c-test-${crypto.randomUUID()}`,
            },
          },
        }),
      },
    );
    const googlePayload = await googleResponse.json();
    googleTest = googleResponse.ok && !googlePayload.error ? "ok" : "failed";
  } else {
    googleTest = "not_connected";
  }

  revalidatePath(getConfigPath(context.workspace.slug, context.locale));

  redirect(
    getConfigPath(context.workspace.slug, context.locale, {
      integration: "all",
      status: "done",
      slack_test: slackTest,
      google_test: googleTest,
    }),
  );
}
