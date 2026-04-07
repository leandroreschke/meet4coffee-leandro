import { createAdminClient } from "@meet4coffee/supabase";

import { getCronSecret } from "@/lib/env";
import { generateRoundsForWorkspace } from "@/lib/services/rounds";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  const output: Array<{ workspaceId: string; created: number; error?: string }> = [];

  for (const workspace of (workspaces ?? []) as Array<{ id: string }>) {
    try {
      const rounds = await generateRoundsForWorkspace(workspace.id);
      output.push({ workspaceId: workspace.id, created: rounds.length });

      if (rounds.length > 0) {
        await admin.from("cron_run_logs").insert(
          rounds.map((round) => ({
            job_name: "generate-rounds",
            workspace_id: workspace.id,
            club_id: round.club_id,
            status: "success" as const,
            rounds_generated: 1,
          })),
        );
      } else {
        await admin.from("cron_run_logs").insert({
          job_name: "generate-rounds",
          workspace_id: workspace.id,
          status: "skipped" as const,
          rounds_generated: 0,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      output.push({ workspaceId: workspace.id, created: 0, error: message });
      await admin.from("cron_run_logs").insert({
        job_name: "generate-rounds",
        workspace_id: workspace.id,
        status: "error" as const,
        error_message: message,
        rounds_generated: 0,
      });
    }
  }

  return Response.json({ ok: true, output });
}
