import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { normalizeLocale, type Locale } from "@meet4coffee/i18n";

export type OAuthProvider = "slack" | "google_calendar";

type OAuthStatePayloadV1 = {
  version: 1;
  provider: OAuthProvider;
  workspaceId: string;
  workspaceSlug: string;
  locale: Locale;
  actorMemberId: string;
  actorUserId: string;
  issuedAt: number;
  nonce: string;
};

const OAUTH_STATE_TTL_MS = 15 * 60 * 1000;

function getOAuthStateSecret() {
  const secret =
    process.env.INTEGRATIONS_OAUTH_STATE_SECRET ??
    process.env.CRON_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("OAuth state secret is not configured.");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getOAuthStateSecret()).update(value).digest("base64url");
}

export function createOAuthStateToken(input: {
  provider: OAuthProvider;
  workspaceId: string;
  workspaceSlug: string;
  locale: Locale;
  actorMemberId: string;
  actorUserId: string;
}) {
  const payload: OAuthStatePayloadV1 = {
    version: 1,
    provider: input.provider,
    workspaceId: input.workspaceId,
    workspaceSlug: input.workspaceSlug,
    locale: normalizeLocale(input.locale),
    actorMemberId: input.actorMemberId,
    actorUserId: input.actorUserId,
    issuedAt: Date.now(),
    nonce: randomUUID(),
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyOAuthStateToken(token: string, expectedProvider: OAuthProvider) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || token.split(".").length !== 2) {
    return { ok: false as const, reason: "malformed" };
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return { ok: false as const, reason: "invalid_signature" };
  }

  let parsedPayload: unknown;

  try {
    parsedPayload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    return { ok: false as const, reason: "invalid_json" };
  }

  if (
    !parsedPayload ||
    typeof parsedPayload !== "object" ||
    (parsedPayload as { version?: unknown }).version !== 1
  ) {
    return { ok: false as const, reason: "invalid_version" };
  }

  const payload = parsedPayload as OAuthStatePayloadV1;

  if (payload.provider !== expectedProvider) {
    return { ok: false as const, reason: "wrong_provider" };
  }

  if (Date.now() - payload.issuedAt > OAUTH_STATE_TTL_MS) {
    return { ok: false as const, reason: "expired" };
  }

  return {
    ok: true as const,
    payload: {
      ...payload,
      locale: normalizeLocale(payload.locale),
    },
  };
}
