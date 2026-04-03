import { syncGoogleCalendarEvent } from "@/lib/integrations/google";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await syncGoogleCalendarEvent(body.meetingId, body.workspaceId);
  return Response.json(result);
}
