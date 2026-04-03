/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "stripe" {
  export default class Stripe {
    constructor(secretKey: string, options?: Record<string, unknown>);
    customers: {
      create(input: Record<string, unknown>): Promise<{ id: string }>;
    };
    checkout: {
      sessions: {
        create(input: Record<string, unknown>): Promise<{ url: string | null }>;
      };
    };
    billingPortal: {
      sessions: {
        create(input: Record<string, unknown>): Promise<{ url: string }>;
      };
    };
    webhooks: {
      constructEvent(body: string, signature: string, secret: string): any;
    };
  }
}

declare module "@supabase/ssr" {
  export function createBrowserClient(url: string, anonKey: string): any;
  export function createServerClient(
    url: string,
    anonKey: string,
    options: Record<string, unknown>,
  ): any;
}

declare module "@supabase/supabase-js" {
  export function createClient(url: string, key: string, options?: Record<string, unknown>): any;
}
