import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@meet4coffee/supabase";

import { getAppUrl } from "@/lib/env";
import { getStripeClient } from "@/lib/integrations/stripe";

export async function POST(request: Request) {
  const formData = await request.formData();
  const workspaceSlug = String(formData.get("workspace_slug") ?? "");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role, workspace_id, workspaces(slug)")
    .eq("user_id", user.id)
    .eq("workspaces.slug", workspaceSlug)
    .maybeSingle();

  const { data: subscription } = membership
    ? await supabase
        .from("workspace_subscriptions")
        .select("stripe_customer_id")
        .eq("workspace_id", membership.workspace_id)
        .maybeSingle()
    : { data: null };

  const customerId = subscription?.stripe_customer_id;

  if (!membership || membership.role !== "owner" || !customerId) {
    redirect(`/w/${workspaceSlug}/config`);
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getAppUrl()}/w/${workspaceSlug}/config`,
  });

  redirect(session.url);
}
