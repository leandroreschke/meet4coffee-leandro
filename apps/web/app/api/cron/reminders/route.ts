import { createAdminClient } from "@meet4coffee/supabase";
import type { Database } from "@meet4coffee/supabase";

import { getCronSecret } from "@/lib/env";
import { sendSlackReminder } from "@/lib/integrations/slack";

type ReminderParticipant = Pick<
  Database["public"]["Tables"]["meeting_participants"]["Row"],
  "id" | "workspace_id" | "member_id"
> & {
  meetings: Pick<Database["public"]["Tables"]["meetings"]["Row"], "title" | "start_at"> | null;
};

function isAuthorized(request: Request) {
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  return bearer && bearer === getCronSecret();
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  const { data: participants } = await admin
    .from("meeting_participants")
    .select(
      `
        id,
        workspace_id,
        member_id,
        meetings (
          title,
          start_at
        )
      `,
    )
    .eq("state", "pending")
    .gte("meetings.start_at", now.toISOString())
    .lte("meetings.start_at", inOneHour);

  const reminderParticipants = (participants ?? []) as ReminderParticipant[];

  const delivered = await Promise.all(
    reminderParticipants.map(async (participant) => {
      const result = await sendSlackReminder({
        workspaceId: participant.workspace_id,
        memberId: participant.member_id,
        text: `Reminder: ${participant.meetings?.title ?? "Coffee break"} starts soon.`,
      });
      return { participantId: participant.id, result };
    }),
  );

  return Response.json({ ok: true, delivered });
}
