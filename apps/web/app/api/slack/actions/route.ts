import { createAdminClient } from "@meet4coffee/supabase";

import { verifySlackSignature } from "@/lib/integrations/slack";

export async function POST(request: Request) {
  const body = await request.text();
  const timestamp = request.headers.get("x-slack-request-timestamp") ?? "";
  const signature = request.headers.get("x-slack-signature") ?? "";

  if (!verifySlackSignature(body, timestamp, signature)) {
    return Response.json({ error: "Invalid Slack signature." }, { status: 401 });
  }

  const payload = JSON.parse(new URLSearchParams(body).get("payload") ?? "{}");
  const action = payload.actions?.[0];

  if (!action) {
    return Response.json({ ok: true });
  }

  const admin = createAdminClient();

  if (action.action_id === "meeting_confirm") {
    await admin
      .from("meeting_participants")
      .update({ state: "confirmed" })
      .eq("id", action.value);
  }

  return Response.json({ ok: true });
}
