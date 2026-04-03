import { PLAN_SEAT_LIMITS, type SubscriptionTier } from "@meet4coffee/core";

const DEFAULT_APP_URL = "http://localhost:3000";

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;
}

export function getCronSecret() {
  return process.env.CRON_SECRET;
}

export function getContentRevalidateSecret() {
  return process.env.CONTENT_REVALIDATE_SECRET;
}

export function getStripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    ultimatePriceId: process.env.STRIPE_ULTIMATE_PRICE_ID,
    customerPortalConfigurationId: process.env.STRIPE_CUSTOMER_PORTAL_CONFIGURATION_ID,
  };
}

export function getSlackConfig() {
  return {
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
  };
}

export function getGoogleConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

export function getZoomConfig() {
  return {
    clientId: process.env.ZOOM_CLIENT_ID,
    clientSecret: process.env.ZOOM_CLIENT_SECRET,
  };
}

export function getSeatLimitForTier(tier: SubscriptionTier) {
  return PLAN_SEAT_LIMITS[tier];
}
