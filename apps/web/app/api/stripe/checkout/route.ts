import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@meet4coffee/supabase";

import { getAppUrl, getStripeConfig } from "@/lib/env";
import { getStripeClient } from "@/lib/integrations/stripe";

export async function POST(request: Request) {
  const formData = await request.formData();
  const workspaceSlug = String(formData.get("workspace_slug") ?? "");
  const tier = String(formData.get("tier") ?? "premium");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("id, role, workspace_id, workspaces(id, slug, name)")
    .eq("user_id", user.id)
    .eq("workspaces.slug", workspaceSlug)
    .maybeSingle();

  if (!membership || membership.role !== "owner") {
    redirect(`/w/${workspaceSlug}/config`);
  }

  const stripe = getStripeClient();
  const config = getStripeConfig();
  const priceId =
    tier === "ultimate" ? config.ultimatePriceId : config.premiumPriceId;

  if (!priceId) {
    return Response.json({ error: "Missing Stripe price configuration." }, { status: 500 });
  }

  const { data: subscription } = await supabase
    .from("workspace_subscriptions")
    .select("stripe_customer_id")
    .eq("workspace_id", membership.workspace_id)
    .maybeSingle();

  let customerId = subscription?.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: membership.workspaces?.name ?? undefined,
      metadata: {
        workspace_id: membership.workspace_id,
      },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getAppUrl()}/w/${workspaceSlug}/config?billing=success`,
    cancel_url: `${getAppUrl()}/w/${workspaceSlug}/config?billing=cancelled`,
    metadata: {
      workspace_id: membership.workspace_id,
      tier,
    },
  });

  redirect(session.url ?? `/w/${workspaceSlug}/config`);
}
