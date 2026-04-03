type SupabaseEnv = {
  url?: string;
  anonKey?: string;
  serviceRoleKey?: string;
};

type ConfiguredSupabaseEnv = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
};

export function getSupabaseEnv(): SupabaseEnv {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function assertSupabaseEnv(): ConfiguredSupabaseEnv {
  const env = getSupabaseEnv();

  if (!env.url || !env.anonKey) {
    throw new Error("Supabase URL and anon key environment variables are not configured.");
  }

  return {
    url: env.url,
    anonKey: env.anonKey,
    serviceRoleKey: env.serviceRoleKey,
  };
}
