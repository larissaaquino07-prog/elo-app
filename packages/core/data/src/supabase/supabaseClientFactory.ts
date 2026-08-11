// Supabase client factory — ARCHITECTURE.md §7, IMPLEMENTATION_PLAN.md task
// 5.5, ADR-012 (constructor injection, never a global singleton). URL and
// anon key are parameters, not read from `process.env` here — matches
// dbFactory.ts's own pattern (5.5 mirrors 4.3), and keeps the actual
// EXPO_PUBLIC_* env var access at the composition root (src/composition/,
// apps/mobile), once that exists, rather than baked into this package.
//
// The anon/publishable key is safe to pass in plaintext — Supabase's own
// design protects data via Row Level Security (supabase/migrations/
// 0001_initial_schema.sql), not by keeping this key secret. Never pass a
// service_role/secret key here; that key must never exist in client code
// at all.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { secureStoreAdapter } from "./secureStoreAdapter";

export function createSupabaseClient(
  url: string,
  anonKey: string,
): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      storage: secureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}
