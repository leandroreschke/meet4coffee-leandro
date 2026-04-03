import { createAdminClient } from "@meet4coffee/supabase";

export async function writeAuditLog(input: {
  workspaceId?: string | null;
  actorMemberId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("audit_logs").insert({
    workspace_id: input.workspaceId ?? null,
    actor_member_id: input.actorMemberId ?? null,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    throw new Error(`Audit log write failed: ${error.message}`);
  }
}
