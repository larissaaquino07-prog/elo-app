// Vitest config for @coach/data — packages/core/data has zero React Native
// dependencies (schema.ts et al. are pure TS over drizzle-orm), so plain
// Vitest is sufficient; no jest-expo/RN-mocking preset needed here. The
// unit-test-runner choice for the whole monorepo, including apps/mobile
// (which does need RN mocking), is confirmed formally at macro-stage 24 —
// this is a local, pragmatic choice for this package only, not a locked-in
// project-wide decision.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    alias: {
      // expo-secure-store's dependency chain (expo-modules-core ->
      // react-native, Flow syntax) can't be parsed by Vitest's Rolldown
      // transform — found empirically, see test/__mocks__/expo-secure-store.ts
      // for the full story. Only test code ever sees this stub; Metro/the
      // Expo runtime resolves the real package normally.
      "expo-secure-store": fileURLToPath(
        new URL("./test/__mocks__/expo-secure-store.ts", import.meta.url),
      ),
    },
  },
});
