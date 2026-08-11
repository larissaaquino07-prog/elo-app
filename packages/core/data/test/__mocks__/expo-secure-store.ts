// Test-only stub for expo-secure-store — aliased in vitest.config.ts.
//
// A dynamic `import("expo-secure-store")` inside secureStoreAdapter.ts's
// native-path methods (added to defer the real problem below) was not
// enough on its own: found empirically that @supabase/supabase-js's
// `createClient()` calls `storage.getItem(...)` internally during
// construction (checking for a persisted session), so the dynamic import
// still fires during the test run, just asynchronously — Vitest's
// Rolldown-based transform can't parse expo-secure-store's dependency
// chain (`expo-modules-core` -> `react-native`, Flow syntax) regardless of
// whether the import is static or dynamic; deferring *when* it runs
// doesn't change *whether* it can be parsed. Aliasing the whole package to
// this stub for tests is the actual fix — the real module is exercised for
// real by Metro/the Expo runtime, never by this test suite, which only
// needs `createSupabaseClient` to not throw while building a client.
export function getItemAsync(): Promise<string | null> {
  return Promise.resolve(null);
}

export function setItemAsync(): Promise<void> {
  return Promise.resolve();
}

export function deleteItemAsync(): Promise<void> {
  return Promise.resolve();
}
