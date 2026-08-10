# React Native + Expo / TypeScript

This project targets iOS (primary), Android, and Web/PWA using React Native +
Expo and TypeScript (strict mode). Before writing or modifying code, consult
current Expo/React Native documentation rather than relying on prior training
knowledge — Expo SDK APIs, React Native's New Architecture behavior, and
library compatibility can change significantly between versions:

- Expo SDK: https://docs.expo.dev/ (check the exact current SDK version before assuming API shape)
- React Native: https://reactnative.dev/docs/getting-started
- Expo Router: https://docs.expo.dev/router/introduction/
- TypeScript: https://www.typescriptlang.org/docs/

Before any structural or architectural decision, read `ARCHITECTURE.md` and
`ARCHITECTURE_DECISIONS.md` — the architecture is frozen (see ADR list); do
not deviate from an approved ADR without recording a new one that supersedes
it. Note: this project's client platform changed twice (Expo/React Native →
native Swift/SwiftUI → React Native + Expo again, ADR-001, ADR-019) for
unrelated reasons each time — see `ARCHITECTURE_DECISIONS.md`'s ADR-019–024
addendum before assuming anything about "the old app" based on this
repository's history; the current React Native adoption (2026-08-07) has no
relationship to the discontinued pre-2026-08-06 prototype (ADR-017).

## File-header convention

Every source file under `apps/mobile/` and `packages/core/` opens with a
one-line comment stating the file's purpose and pointing at the
`ARCHITECTURE.md`/`PROJECT.md`/other canonical-doc section it implements —
so any file's *reason for existing* is traceable without archaeology
(`RISKS.md` R-04, continuity for a solo maintainer):

```typescript
// Coach conversation screen — ARCHITECTURE.md §5.1, DESIGN_SYSTEM.md §5.3/5.4
```

For a not-yet-implemented placeholder, the comment states what belongs there
and cites the same doc section, so the folder skeleton itself documents the
plan rather than sitting silently empty.
