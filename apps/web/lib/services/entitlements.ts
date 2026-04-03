import type { SubscriptionTier } from "@meet4coffee/core";
import { PLAN_SEAT_LIMITS } from "@meet4coffee/core";
import { createServerSupabaseClient } from "@meet4coffee/supabase";

export async function getWorkspaceSeatStatus(workspaceId: string) {
  const supabase = await createServerSupabaseClient();
  const [{ data: subscription }, { count }] = await Promise.all([
    supabase
      .from("workspace_subscriptions")
      .select("tier")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("workspace_members")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .in("status", ["active", "pending_onboarding"]),
  ]);

  const tier = (subscription?.tier as SubscriptionTier | undefined) ?? "free";
  const max = PLAN_SEAT_LIMITS[tier];
  const current = count ?? 0;

  return {
    tier,
    current,
    max,
    allowed: max === null || current < max,
    reason: max === null || current < max ? "within_limit" : "seat_limit_reached",
  };
}
