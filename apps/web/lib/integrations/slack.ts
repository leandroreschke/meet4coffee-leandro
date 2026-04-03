import { createHmac, timingSafeEqual } from "node:crypto";

import { createAdminClient } from "@meet4coffee/supabase";

import { getAppUrl, getSlackConfig } from "../env";

function toBuffer(value: string) {
  return Buffer.from(value, "utf8");
}

export function verifySlackSignature(body: string, timestamp: string, signature: string) {
  const { signingSecret } = getSlackConfig();

  if (!signingSecret) {
    return false;
  }

  const basestring = `v0:${timestamp}:${body}`;
  const expected = `v0=${createHmac("sha256", signingSecret).update(basestring).digest("hex")}`;

  try {
    return timingSafeEqual(toBuffer(expected), toBuffer(signature));
  } catch {
    return false;
  }
}

export async function exchangeSlackCode(code: string) {
  const { clientId, clientSecret } = getSlackConfig();

  if (!clientId || !clientSecret) {
    throw new Error("Slack is not configured.");
  }

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${getAppUrl()}/api/integrations/slack/callback`,
    }),
  });

  return response.json();
}

export async function sendSlackReminder(input: {
  workspaceId: string;
  memberId: string;
  text: string;
}) {
  const admin = createAdminClient();
  const [{ data: integration }, { data: member }] = await Promise.all([
    admin
      .from("workspace_integrations")
      .select("*")
      .eq("workspace_id", input.workspaceId)
      .eq("provider", "slack")
      .maybeSingle(),
    admin
      .from("workspace_members")
      .select("user_id, member_profiles(slack_user_id)")
      .eq("workspace_id", input.workspaceId)
      .eq("id", input.memberId)
      .maybeSingle(),
  ]);

  const botToken = integration?.access_token;
  const profile =
    member?.member_profiles && !Array.isArray(member.member_profiles)
      ? member.member_profiles
      : null;
  const slackUserId = profile?.slack_user_id;

  if (!botToken || !slackUserId) {
    return { delivered: false, reason: "missing_mapping" };
  }

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel: slackUserId,
      text: input.text,
    }),
  });

  return response.json();
}
