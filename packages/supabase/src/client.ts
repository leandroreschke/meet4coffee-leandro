import { cookies } from "next/headers";
import { createBrowserClient as createSupabaseBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";
import { assertSupabaseEnv, getSupabaseEnv } from "./env";

export function createBrowserClient() {
  const env = assertSupabaseEnv();

  return createSupabaseBrowserClient(env.url, env.anonKey);
}

export async function createServerSupabaseClient() {
  const env = assertSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(nextCookies: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          for (const cookie of nextCookies) {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          }
        } catch {
          // Server Components may not allow mutating cookies during render.
        }
      },
    },
  });
}

export function createAdminClient() {
  const env = getSupabaseEnv();

  if (!env.url || !env.serviceRoleKey) {
    throw new Error("Supabase service role environment variables are not configured.");
  }

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
