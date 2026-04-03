import { createAdminClient } from "@meet4coffee/supabase";

import { getCronSecret } from "@/lib/env";
import { generateRoundsForWorkspace } from "@/lib/services/rounds";

function isAuthorized(request: Request) {
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  return bearer && bearer === getCronSecret();
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: workspaces } = await admin.from("workspaces").select("id");

  const output = [];

  for (const workspace of workspaces ?? []) {
    const rounds = await generateRoundsForWorkspace(workspace.id);
    output.push({ workspaceId: workspace.id, created: rounds.length });
  }

  return Response.json({ ok: true, output });
}
