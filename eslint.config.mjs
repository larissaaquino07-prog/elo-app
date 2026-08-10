// Domain/Data boundary enforcement — ARCHITECTURE.md §2.1, ADR-021.
//
// This is the *real* enforcement mechanism, not defense-in-depth: npm
// workspace hoisting puts every workspace package's symlink in the shared
// root node_modules, so a domain-layer file CAN resolve `@coach/data` (or
// any external package installed anywhere in the monorepo) with no error
// at the module-resolution/tsc level at all — confirmed empirically while
// building this (IMPLEMENTATION_PLAN.md macro-stage 3.2's own entry has the
// detail). ADR-021's "fails at module resolution" claim doesn't hold as
// built; this lint rule is what actually makes a violation fail.
import boundaries from "eslint-plugin-boundaries";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.expo/**",
      "**/dist/**",
      "**/web-build/**",
    ],
  },
  {
    files: ["packages/core/**/*.ts", "apps/mobile/**/*.{ts,tsx}"],
    plugins: { boundaries },
    languageOptions: {
      parser: tseslint.parser,
    },
    settings: {
      "boundaries/elements": [
        { type: "domain", pattern: "packages/core/domain/**" },
        { type: "data", pattern: "packages/core/data/**" },
        { type: "app", pattern: "apps/mobile/**" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          // Permissive by default: this rule exists to enforce ADR-021's
          // specific inward-dependency shape, not to allowlist every real
          // npm package apps/mobile or @coach/data legitimately need
          // (react-native, expo-router, eventually expo-sqlite/Supabase).
          // `default: "disallow"` was tried first and blocked those too —
          // wrong model, reverted.
          default: "allow",
          // Without this, the rule only checks relative-path ("local")
          // imports by default — a bare specifier like `@coach/data`
          // resolves through node_modules (a workspace symlink) and is
          // classified as "external" origin, silently skipped otherwise.
          // Confirmed empirically: the domain->data violation this rule
          // exists to catch was NOT flagged until this was set.
          checkAllOrigins: true,
          policies: [
            // Domain: zero runtime dependencies, full stop — catches
            // @coach/data, any real npm package, everything.
            {
              from: { element: { type: "domain" } },
              disallow: [{ to: { module: { origin: "external" } } }],
              message: "@coach/domain must have zero runtime dependencies (ADR-021).",
            },
            {
              from: { element: { type: "domain" } },
              disallow: [{ to: { element: { type: "app" } } }],
              message: "@coach/domain must not import apps/mobile (ADR-021).",
            },
            // Data must not import apps/mobile — dependencies point inward
            // (ARCHITECTURE.md §2). Nothing needed to *allow* data's own
            // real dependencies (expo-sqlite, Supabase, @coach/domain):
            // the permissive default already covers them.
            {
              from: { element: { type: "data" } },
              disallow: [{ to: { element: { type: "app" } } }],
              message: "@coach/data must not import apps/mobile (ARCHITECTURE.md §2).",
            },
          ],
        },
      ],
    },
  },
);
