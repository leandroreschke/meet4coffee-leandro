import { NextResponse } from "next/server";

import { type Locale } from "@meet4coffee/i18n";
import { createAdminClient } from "@meet4coffee/supabase";

import { exchangeGoogleCode } from "@/lib/integrations/google";
import { verifyOAuthStateToken } from "@/lib/integrations/oauth-state";
import { localizePath } from "@/lib/locale";

function buildRedirectPath(input: {
  workspaceSlug: string;
  locale: Locale;
  integration: string;
  status: string;
}) {
  const path = localizePath(`/w/${input.workspaceSlug}/config`, input.locale);
  const params = new URLSearchParams({
    integration: input.integration,
    status: input.status,
  });
  return `${path}?${params.toString()}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/setup?google=missing_state", request.url));
  }

  const verifiedState = verifyOAuthStateToken(state, "google_calendar");

  if (!verifiedState.ok) {
    return NextResponse.redirect(new URL("/setup?google=invalid_state", request.url));
  }

  const { payload: statePayload } = verifiedState;
  const admin = createAdminClient();

  const { data: ownerMembership } = await admin
    .from("workspace_members")
    .select("id")
    .eq("id", statePayload.actorMemberId)
    .eq("workspace_id", statePayload.workspaceId)
    .eq("user_id", statePayload.actorUserId)
    .eq("role", "owner")
    .in("status", ["active", "pending_onboarding"])
    .maybeSingle();

  if (!ownerMembership?.id) {
    return NextResponse.redirect(
      new URL(
        buildRedirectPath({
          workspaceSlug: statePayload.workspaceSlug,
          locale: statePayload.locale,
          integration: "google_calendar",
          status: "unauthorized_state",
        }),
        request.url,
      ),
    );
  }

  try {
    const oauthPayload = await exchangeGoogleCode(code);
    const { data: existingIntegration } = await admin
      .from("workspace_integrations")
      .select("metadata")
      .eq("workspace_id", statePayload.workspaceId)
      .eq("provider", "google_calendar")
      .maybeSingle();

    const existingMetadata =
      existingIntegration?.metadata &&
      typeof existingIntegration.metadata === "object" &&
      !Array.isArray(existingIntegration.metadata)
        ? { ...existingIntegration.metadata }
        : {};

    const metadata = {
      ...existingMetadata,
      google_oauth: oauthPayload,
      google_connected_at: new Date().toISOString(),
    };

    await admin.from("workspace_integrations").upsert(
      {
        workspace_id: statePayload.workspaceId,
        provider: "google_calendar",
        status: oauthPayload.access_token ? "connected" : "failed",
        external_workspace_id: null,
        access_token: oauthPayload.access_token ?? null,
        refresh_token: oauthPayload.refresh_token ?? null,
        metadata,
      },
      { onConflict: "workspace_id,provider" },
    );

    return NextResponse.redirect(
      new URL(
        buildRedirectPath({
          workspaceSlug: statePayload.workspaceSlug,
          locale: statePayload.locale,
          integration: "google_calendar",
          status: oauthPayload.access_token ? "connected" : "token_error",
        }),
        request.url,
      ),
    );
  } catch {
    return NextResponse.redirect(
      new URL(
        buildRedirectPath({
          workspaceSlug: statePayload.workspaceSlug,
          locale: statePayload.locale,
          integration: "google_calendar",
          status: "token_exchange_failed",
        }),
        request.url,
      ),
    );
  }
}
