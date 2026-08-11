// Supabase Auth session storage — ARCHITECTURE.md §7 ("expo-secure-store...
// Session security"), ADR-011's technology note, ADR-024's documented
// web/native asymmetry (no OS-level secure storage exists in a browser).
// Supabase's JS client defaults to `localStorage`, which doesn't exist in
// React Native — without an explicit storage adapter, session persistence
// silently fails on iOS/Android. This preempts the expo-secure-store
// adoption IMPLEMENTATION_PLAN.md macro-stage 15 otherwise owns, scoped
// narrowly to just this one use (the Supabase session token itself, task
// 5.5's "safe secret handling"), not a general secure-storage wrapper.
//
// Found empirically, not anticipated: `expo-secure-store`'s native module
// throws ("getValueWithKeyAsync is not a function") on the web platform —
// it has no web implementation at all. Since ADR-026 made web the primary
// voice surface (and a real interaction surface generally, not a rarely-
// used edge case), this can't be left unhandled the way a native-only
// dependency might once have been. Branches to `localStorage` on web — the
// accepted-weaker fallback ADR-024 already named — and `expo-secure-store`
// on iOS/Android.
//
// `expo-secure-store` is imported dynamically (`await import(...)`) inside
// each native-path method, not statically at the top of the file — found
// empirically that a static import breaks this file outside the Metro/RN
// runtime, even on the web branch that never touches it: ES module imports
// evaluate eagerly regardless of which branch ends up running, and
// `expo-secure-store` → `expo-modules-core`'s `requireNativeModule` pulls
// in `react-native` at import time, whose source uses Flow syntax Vitest's
// plain TS/Rolldown pipeline can't parse. Same class of problem — and same
// fix — as `dbFactory.ts`'s static `expo-sqlite` import in task 4.3.
//
// `typeof localStorage` (not `Platform.OS` from `react-native`) is the web/
// native signal, for the same reason: React Native Web runs in a real
// browser (`localStorage` exists); native iOS/Android via Hermes/JSC does
// not define it — and checking it doesn't require importing `react-native`
// at all.
const isWeb = typeof localStorage !== "undefined";

const webStorage = {
  getItem: async (key: string) => {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  },
};

const nativeStorage = {
  getItem: async (key: string) => {
    const SecureStore = await import("expo-secure-store");
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    const SecureStore = await import("expo-secure-store");
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    const SecureStore = await import("expo-secure-store");
    await SecureStore.deleteItemAsync(key);
  },
};

export const secureStoreAdapter = isWeb ? webStorage : nativeStorage;
