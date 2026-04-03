import { NextResponse } from "next/server";

import { type Locale } from "@meet4coffee/i18n";
import { createAdminClient } from "@meet4coffee/supabase";

import { exchangeSlackCode } from "@/lib/integrations/slack";
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
    return NextResponse.redirect(new URL("/setup?slack=missing_state", request.url));
  }

  const verifiedState = verifyOAuthStateToken(state, "slack");

  if (!verifiedState.ok) {
    return NextResponse.redirect(new URL("/setup?slack=invalid_state", request.url));
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
          integration: "slack",
          status: "unauthorized_state",
        }),
        request.url,
      ),
    );
  }

  try {
    const oauthPayload = await exchangeSlackCode(code);
    const { data: existingIntegration } = await admin
      .from("workspace_integrations")
      .select("metadata")
      .eq("workspace_id", statePayload.workspaceId)
      .eq("provider", "slack")
      .maybeSingle();

    const existingMetadata =
      existingIntegration?.metadata &&
      typeof existingIntegration.metadata === "object" &&
      !Array.isArray(existingIntegration.metadata)
        ? { ...existingIntegration.metadata }
        : {};

    const metadata = {
      ...existingMetadata,
      slack_oauth: oauthPayload,
      slack_connected_at: new Date().toISOString(),
    };

    await admin.from("workspace_integrations").upsert(
      {
        workspace_id: statePayload.workspaceId,
        provider: "slack",
        status: oauthPayload.ok ? "connected" : "failed",
        external_workspace_id: oauthPayload.team?.id ?? null,
        access_token: oauthPayload.access_token ?? null,
        refresh_token: null,
        metadata,
      },
      { onConflict: "workspace_id,provider" },
    );

    return NextResponse.redirect(
      new URL(
        buildRedirectPath({
          workspaceSlug: statePayload.workspaceSlug,
          locale: statePayload.locale,
          integration: "slack",
          status: oauthPayload.ok ? "connected" : "token_error",
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
          integration: "slack",
          status: "token_exchange_failed",
        }),
        request.url,
      ),
    );
  }
}
