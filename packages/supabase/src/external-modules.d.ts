declare module "@supabase/ssr" {
  export function createBrowserClient<T>(url: string, anonKey: string): any;
  export function createServerClient<T>(
    url: string,
    anonKey: string,
    options: Record<string, unknown>,
  ): any;
}

declare module "@supabase/supabase-js" {
  export function createClient<T>(url: string, key: string, options?: Record<string, unknown>): any;
}
