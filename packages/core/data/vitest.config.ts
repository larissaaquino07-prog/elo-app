// Vitest config for @coach/data — packages/core/data has zero React Native
// dependencies (schema.ts et al. are pure TS over drizzle-orm), so plain
// Vitest is sufficient; no jest-expo/RN-mocking preset needed here. The
// unit-test-runner choice for the whole monorepo, including apps/mobile
// (which does need RN mocking), is confirmed formally at macro-stage 24 —
// this is a local, pragmatic choice for this package only, not a locked-in
// project-wide decision.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
  },
});
