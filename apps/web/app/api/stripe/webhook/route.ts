import { createAdminClient } from "@meet4coffee/supabase";

import { getStripeConfig } from "@/lib/env";
import { getStripeClient } from "@/lib/integrations/stripe";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const { webhookSecret } = getStripeConfig();

  if (!signature || !webhookSecret) {
    return Response.json({ error: "Missing Stripe webhook configuration." }, { status: 400 });
  }

  const stripe = getStripeClient();
  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  const admin = createAdminClient();

  const { data: existingEvent } = await admin
    .from("stripe_events")
    .select("id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existingEvent) {
    return Response.json({ ok: true });
  }

  await admin.from("stripe_events").insert({
    event_id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;
    const workspaceId = subscription.metadata?.workspace_id;

    if (workspaceId) {
      await admin.from("workspace_subscriptions").upsert(
        {
          workspace_id: workspaceId,
          tier: subscription.items.data[0]?.price.lookup_key ?? subscription.items.data[0]?.price.id ?? "premium",
          status: subscription.status,
          stripe_customer_id:
            typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null,
          stripe_subscription_id: subscription.id,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
        { onConflict: "workspace_id" },
      );
    }
  }

  return Response.json({ ok: true });
}
