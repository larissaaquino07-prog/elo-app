// IMPLEMENTATION_PLAN.md task 5.5's own required "unit test using a stubbed
// client" — no network call (this session's egress policy blocks the real
// project domain outright; see this task's own IMPLEMENTATION_PLAN.md entry
// for the live-connectivity check that *did* run, from inside apps/mobile).
// This test proves the factory builds a correctly-configured client from
// arbitrary inputs, independent of any real project existing.
import { describe, expect, it } from "vitest";
import { createSupabaseClient } from "../../src/supabase/supabaseClientFactory";

describe("createSupabaseClient", () => {
  it("builds a client against the given URL and key, not a hardcoded one", () => {
    const client = createSupabaseClient(
      "https://stub-project.supabase.co",
      "stub-anon-key",
    );
    // supabase-js exposes the resolved URL on the client's REST helper —
    // confirms the factory actually used the parameters, not some baked-in
    // default (ADR-012: constructor injection, never a global singleton).
    expect(client.supabaseUrl).toBe("https://stub-project.supabase.co");
    expect(client.supabaseKey).toBe("stub-anon-key");
  });

  it("returns a distinct client instance per call (no shared singleton)", () => {
    const clientA = createSupabaseClient("https://a.supabase.co", "key-a");
    const clientB = createSupabaseClient("https://b.supabase.co", "key-b");
    expect(clientA).not.toBe(clientB);
    expect(clientA.supabaseUrl).not.toBe(clientB.supabaseUrl);
  });
});
