import Stripe from "stripe";

import { getStripeConfig } from "../env";

export function getStripeClient() {
  const { secretKey } = getStripeConfig();

  if (!secretKey) {
    throw new Error("Stripe is not configured.");
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-02-25.clover",
  });
}
