# IMPLEMENTATION_PLAN.md

The technical execution plan for building the application, decomposed into 26 macro-stages and ~140 small, independent, verifiable tasks. This document is the **how and in what order**; `TASKS.md` remains the **what and priority** backlog.

**Status: implementation started.** Macro-stage 1, task 1.1 is done (`apps/mobile` exists and boots). Tasks 1.2–1.4 and every later task remain open — no task is marked complete beyond 1.1.

**Physical-device verification note (added at task 1.1):** this Claude Code Remote session runs in an ephemeral container with no network path to Julia's iPhone or notebook, so any completion criterion requiring an on-device check (e.g., "scan the QR code in Expo Go") is split into two layers going forward — agreed with Julia 2026-08-07: (1) everything automatable in-session (compiles, boots, type-checks, a headless-browser screenshot of the web target as a visual proxy) is verified here and the task is marked done on that basis; (2) the physical-device confirmation itself is deferred to Julia, done whenever practical, and does not block subsequent tasks. Each task below notes explicitly when this split applies.

**2026-08-07 — client platform migration to React Native + Expo (ADR-019–024).** This entire document was originally written against native Swift/SwiftUI. Per Julia's explicit instruction, it has been updated as follows, **not uniformly**:
- **Macro-stages 1–4** (project creation, folder structure, monorepo package setup, local persistence) are **fully rewritten**, task-by-task, for Expo/TypeScript/monorepo/`expo-sqlite` — reviewed with the same rigor as the original authoring pass.
- **Macro-stages 5–23 and 25** received a **mechanical technology-reference update** (SwiftUI→React Native, SwiftData→`expo-sqlite`, `CoachKit`→`@coach/domain`/`@coach/data`, XCTest/XCUITest→Jest/Detox-or-Maestro, Keychain→`expo-secure-store`, etc.) — file paths, package names, and the Execution Environment classification are updated, but each of these stages is flagged with a banner and should be **re-reviewed in full before work on it starts**, not treated as already re-verified line-by-line the way 1–4 have been.
- **Macro-stages 24 (Testing/CI) and 26 (Distribution)** are **substantially rewritten**, not just mechanically updated, because EAS Build changes their actual mechanics, not just their vocabulary.
- **Macro-stage 21 (Widgets)** gets special handling: WidgetKit has no cross-platform equivalent under any framework, so this stage is explicitly marked **deferred** and its Execution Environment classification is `Native Module Authoring (macOS)` — the one place in this entire plan where that label still applies, kept distinct from the general classification used everywhere else.

**Naming note:** `apps/mobile` (the Expo app) and `packages/core/domain` / `packages/core/data` (the monorepo workspace packages, jointly the successor to the working name `CoachKit`) are the naming conventions used throughout this rewrite, consistent with `ARCHITECTURE.md` §1/§2 and `RN_EXPO_MIGRATION_PLAN.md`.

---

## 0. Execution environments — rewritten for the React Native + Expo stack

The original Section 0 (2026-08-06, pre-migration) existed because native Swift/SwiftUI/SwiftData genuinely cannot be built or tested outside macOS, and this Claude Code Remote session runs on Linux. **That constraint is now almost entirely gone.** React Native + Expo development — writing TypeScript, running unit tests, running the Expo dev server, testing on a physical iPhone or Android device via Expo Go or a dev client over the same network/a tunnel — requires no macOS at any point. The three-way Linux/macOS split from the original plan is replaced by a simpler, mostly-moot distinction:

| Label | Meaning |
|---|---|
| **Any Environment** | The default for nearly every task in this plan now: writing code, running Jest/Vitest, running Drizzle/SQL migrations, running the Expo dev server, testing via Expo Go/a dev client on a physical device. No macOS, no special cloud dependency. |
| **EAS Cloud Build Required** | Tasks whose completion criterion is "a compiled, installable binary exists" (a dev-client build with custom native modules, a signed release build, a TestFlight upload). These route through Expo's own cloud macOS build workers (`eas build`/`eas submit`) — zero *local* macOS dependency, but real wall-clock time (a cloud build queue) and a dependency on Expo's service being reachable, worth flagging distinctly from an instant local task. |
| **Native Module Authoring (macOS)** | The one genuine remaining exception: writing/debugging actual native Swift code for a custom native module (the WidgetKit case, macro-stage 21) benefits materially from Xcode's tooling for iteration speed and debugging — the code could technically be hand-authored and built via EAS without ever opening Xcode, but doing so blind, without Xcode's native debugging tools, is real friction, not a myth. This is the only place in the whole plan this label is used. |

**This classification is dramatically simpler than the pre-migration one, and that simplification is itself one of this migration's real, practical benefits** — stated plainly here rather than left implicit, per `ARCHITECTURE_DECISIONS.md` ADR-019's justification.

## 1. How to use this document

Each task lists nine things: **Objetivo**, **Arquivos criados**, **Arquivos modificados**, **Dependências**, **Critérios de conclusão**, **Riscos**, **Estratégia de testes**, **Impacto na arquitetura**, **Execution Environment** (§0's new taxonomy). Tasks are intentionally small.

## 2. Mandatory development workflow

Applies identically to every task below:

1. **Implementar** — write the smallest change that satisfies the task's objective.
2. **Executar testes** — run the task's own test strategy plus the full existing suite. Nearly everything is runnable from any environment now (§0), removing the prior "can't even verify this here" blocker for most tasks.
3. **Revisar arquitetura** — task-level: does this change respect the Domain/Data boundary (ADR-006/ADR-021), the Repository/Engine interface pattern (ADR-005), and the relevant section of `ARCHITECTURE.md`? Macro-stage-level: a fuller pass at the end of each of the 26 stages.
4. **Atualizar documentação quando necessário.**
5. **Somente então iniciar a próxima etapa.**

## 3. Sequencing rationale

Unchanged in substance from the original plan — dependency order, not narrative order, still governs task sequencing:

- **1–4** establish the physical skeleton once.
- **5–8** establish the entire data-access story.
- **9–12** are the app's intelligence, built and fixture-tested before UI consumes them.
- **13–14** build the visual/structural shell once.
- **15–22** are wiring.
- **23** needs real data and UI to test against.
- **24–26** are validation and shipping, deliberately last.

**Practical consequence of the platform migration:** the original plan noted that macOS-Required tasks could proceed independently of Linux-Compatible ones. That's now moot — almost the entire plan is `Any Environment`, so sequencing is governed purely by dependency order, not by environment availability. This removes an entire category of scheduling complexity the original plan had to account for.

## 4. Traceability

Unchanged from the original plan — macro-stage-to-`ROADMAP.md`-phase and `TASKS.md`-ID mapping is a structural fact about the backlog, not the technology:

| Macro-stage | `ROADMAP.md` phase | Key `TASKS.md` IDs |
|---|---|---|
| 1–4 | Phase 0 | T0-01–T0-07, T0-13, T0-14 |
| 5–8 | Phase 0–1 | T0-05–T0-07, T1-01–T1-05 |
| 9 | Phase 1–2 | T1-08–T1-10, T2-01–T2-02, T2-05 |
| 10 | Phase 1 | T1-06, T1-07, T1-16, T1-17 |
| 11 | Phase 4 | T4-01–T4-09 |
| 12 | Phase 2–3 | T2-03, T2-06, T3-01–T3-05 |
| 13 | Phase 5 (pulled forward) | T5-03 |
| 14 | Phase 1 | — |
| 15 | Phase 1 | T0-09, T0-11, T1-06 |
| 16 | Phase 1 | T1-14 |
| 17 | Phase 1, 4 | T1-08, T4-02–T4-08, T5-09 |
| 18 | Phase 3 | T3-02, T3-03 |
| 19 | Phase 2–3 | T2-04, T2-05, T3-05, T5-11 |
| 20 | Phase 1, 5 | T1-12, T5-07 |
| 21 | Phase 5 (deferred, see banner above) | T5-04, T6-08 |
| 22 | Phase 5 | T5-05, T5-08 |
| 23 | Phase 1, ongoing | T1-13 |
| 24 | Phase 0, ongoing | T0-14 |
| 25 | Phase 5 | T5-01, T5-02, T5-06 |
| 26 | — | T0-10 |

---

# Macro-stage 1 — Criação do projeto Expo *(fully rewritten)*

**Goal:** a minimal, buildable Expo app skeleton establishing the physical root of the Presentation layer.
**Depends on:** nothing (repository is clean per `MIGRATION_PLAN.md`).

### 1.1 — Create the Expo project
- **Status: ✅ Done (2026-08-07), automated portion verified; physical-device confirmation pending Julia.**
- **Objetivo:** create `apps/mobile` via `npx create-expo-app` with the TypeScript template, inside a monorepo root (workspace tooling set up in macro-stage 3).
- **Criar:** `apps/mobile/app.json`, `apps/mobile/App.tsx` (or Expo Router's root layout, depending on the template chosen), `apps/mobile/assets/`.
- **Modificar:** —
- **Depende de:** —
- **Critérios de conclusão:** `npx expo start` runs; the app opens in Expo Go on a physical iPhone and Android device (scanned via QR code) or in a dev client, showing a placeholder screen.
- **Execução real:** `npx create-expo-app@latest apps/mobile --no-agents-md` (default template = Expo Router + TypeScript, current SDK 57 — chosen because it matches ADR-022 already, not because it was the only option; confirmed via the CLI's own `--help`, since `docs.expo.dev` itself is unreachable from this network). The default template's demo tab screens/components (`explore.tsx`, `app-tabs.*`, `animated-icon.*`, `web-badge.tsx`, `hint-row.tsx`, `external-link.tsx`) and their demo-only images (`react-logo*`, `expo-badge*`, `logo-glow.png`, `tutorial-web.png`, `tabIcons/`) were removed via Expo's own bundled `reset-project.js` (choosing "delete" over "move to /example") plus a follow-up asset sweep, per this task's own risk note. `apps/mobile` ships its own generated `.gitignore` (node_modules/.expo/dist covered independently of the repository root's), so no stray build artifacts are tracked.
- **Verificado nesta sessão (automatable layer):** `npx tsc --noEmit` — clean. `npx expo-doctor` — 18/20 checks pass; the 2 failures (`Check Expo config schema`, `Validate packages against React Native Directory`) are this network's egress proxy rejecting `docs.expo.dev`/schema-API hosts, not real project issues — confirmed by reading the raw error body. `npx expo start --web` — Metro bundles cleanly (858 modules), serves HTTP 200, and a headless-Chromium screenshot shows the expected placeholder text ("Edit src/app/index.tsx to edit this screen.") — the same headless-Chromium substitute agreed with Julia for this class of criterion.
- **Pendente (physical-device layer, Julia):** scanning the Expo Go QR code on the iPhone and Android device — not executable from this ephemeral, non-networked container. Practical path when she wants to do it: `npx expo start --tunnel` from a live session (a public URL Expo Go can reach regardless of network separation) or waiting for an EAS build once macro-stage 26 is reached. Not a blocker for 1.2–1.4.
- **Follow-up cleanup (2026-08-07, found in Julia's review of this task):** `expo-glass-effect`, `@expo/ui`, `expo-symbols`, and `expo-web-browser` were left in `package.json`'s `dependencies` by the demo-content removal above — nothing in `src/` imports any of them. Removed via `npm uninstall`. Nuance worth recording: only `expo-web-browser` was a genuinely standalone dependency (removing it also drops it from `node_modules`/the bundle); `expo-glass-effect`, `@expo/ui`, and `expo-symbols` are regular (non-peer, non-optional) dependencies of `expo-router` itself — confirmed via `npm ls --all` and reading `expo-router`'s own `package.json` — so they stay installed transitively regardless of our own manifest. Removing them from our top-level `dependencies` is still correct (we don't import them directly, and leaving them implied we did), it just doesn't reduce install/bundle size the way `expo-web-browser`'s removal does. Re-verified after the uninstall: `tsc --noEmit` clean, `expo start --web` bundles the same 858 modules and serves the identical placeholder screenshot. **Not yet addressed, flagged but out of this task's requested scope:** `expo-device` is in the same standalone-and-unused state as `expo-web-browser` was (confirmed via `npm ls`); `expo-font` is unused directly but, like the three above, is kept installed anyway as a real dependency of `expo` itself.
- **Riscos:** picking a template that scaffolds unwanted boilerplate (e.g., a tab-navigation demo with sample screens) — verify template choice explicitly, strip demo content immediately. *(Materialized and mitigated — see "Execução real" above.)*
- **Testes:** manual run on a physical device via Expo Go; nothing else automatable yet. *(Superseded in practice — see "Verificado nesta sessão" above; the manual device run is the one piece still outstanding.)*
- **Impacto na arquitetura:** establishes `ARCHITECTURE.md` §1's physical root.
- **Execution Environment: Any Environment.**

### 1.2 — Configure TypeScript strict mode
- **Objetivo:** `tsconfig.json` with `strict: true` and every strictness flag on (`noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, etc.) from the first commit.
- **Criar:** —
- **Modificar:** `apps/mobile/tsconfig.json`.
- **Depende de:** 1.1
- **Critérios de conclusão:** `tsc --noEmit` passes on the placeholder app; a deliberately-introduced type error (temporary, reverted after the check) fails the type check.
- **Riscos:** defaulting to Expo's non-strict base config — must be set explicitly (the direct successor to `RISKS.md` R-12's "pay the rigor cost once, early" stance).
- **Testes:** the deliberate-error check described above.
- **Impacto na arquitetura:** enforces the TypeScript-strict-mode equivalent of the original Swift 6 strict-concurrency decision.
- **Execution Environment: Any Environment.**

### 1.3 — Verify `.gitignore` against real generated paths
- **Objetivo:** confirm the Expo/RN `.gitignore` (already updated during the earlier repository migration, `MIGRATION_PLAN.md`) covers what Expo/EAS actually generates in practice (`.expo/`, `node_modules/`, EAS build artifacts, etc.).
- **Criar:** —
- **Modificar:** `.gitignore` (only if a gap is found).
- **Depende de:** 1.1
- **Critérios de conclusão:** `git status` after a dev-server run and a local build attempt shows zero untracked/dirty generated files.
- **Riscos:** low.
- **Testes:** manual `git status` check.
- **Impacto na arquitetura:** none.
- **Execution Environment: Any Environment.**

### 1.4 — Commit the empty, buildable project
- **Objetivo:** get a clean, working baseline into version control.
- **Criar:** the full project skeleton from 1.1–1.3.
- **Modificar:** —
- **Depende de:** 1.1–1.3
- **Critérios de conclusão:** pushed to the working branch; a fresh clone runs via `npx expo start` without manual setup beyond `npm install`.
- **Riscos:** accidentally committing `node_modules/` or `.expo/` — verify against 1.3.
- **Testes:** fresh-clone run test.
- **Impacto na arquitetura:** none.
- **Execution Environment: Any Environment.**

**Macro-stage exit criteria:** empty Expo app runs on a physical iOS and Android device via Expo Go, TypeScript strict mode verified on, committed and pushed.

---

# Macro-stage 2 — Configuração da estrutura de pastas e módulos *(fully rewritten)*

**Goal:** the Presentation-layer folder skeleton matching `ARCHITECTURE.md` §1/§2.
**Depends on:** macro-stage 1.

### 2.1 — Create the Presentation folder skeleton
- **Objetivo:** `apps/mobile/app/` (Expo Router routes), `apps/mobile/src/composition/`, `apps/mobile/src/features/{onboarding,coach,progress,memory,profile}/`, `apps/mobile/src/design-system/`.
- **Criar:** the folder groups, each with a minimal placeholder file carrying a one-line comment stating its purpose and pointing at the relevant `ARCHITECTURE.md`/`PROJECT.md` section.
- **Modificar:** —
- **Depende de:** 1.1
- **Critérios de conclusão:** structure matches `ARCHITECTURE.md` §1/§2's layout; `npx expo start` still runs with the new (near-empty) folders.
- **Riscos:** drifting from the documented structure "for convenience" — forbidden under ADR-017's continuing spirit even in a fully new codebase.
- **Testes:** dev-server run check.
- **Impacto na arquitetura:** physically instantiates the Presentation layout.
- **Execution Environment: Any Environment.**

### 2.2 — Establish the file-header convention
- **Objetivo:** a one-line file-header comment convention (pointer to the relevant architecture doc section), documented in `AGENTS.md`.
- **Criar:** —
- **Modificar:** `AGENTS.md` (append the convention; `AGENTS.md` was rewritten for Swift during the earlier migration and needs its own technology references corrected back to React Native/Expo as part of this same pass — tracked here rather than as a separate task, since it's a one-line fix alongside this one).
- **Depende de:** 2.1
- **Critérios de conclusão:** convention documented; `AGENTS.md` accurately reflects the current stack (React Native + Expo, not Swift); the placeholder files from 2.1 already follow the convention.
- **Riscos:** low.
- **Testes:** none (documentation task).
- **Impacto na arquitetura:** supports `RISKS.md` R-04 by making intent traceable file-by-file, and prevents `AGENTS.md` from steering a future session toward the wrong stack the way it once did toward Expo before the first migration (`REPOSITORY_AUDIT.md`'s original finding) — same failure mode, opposite direction, worth actively guarding against here.
- **Execution Environment: Any Environment.**

**Macro-stage exit criteria:** folder skeleton exists, matches documentation exactly, convention recorded, `AGENTS.md` corrected.

---

# Macro-stage 3 — Configuração do monorepo (`@coach/domain` / `@coach/data`) *(fully rewritten, was "Configuração do Swift Package `CoachKit`")*

**Goal:** the monorepo workspace packages hosting Domain + Data, enforcing the boundary ADR-021 specifies.
**Depends on:** macro-stage 1.

### 3.1 — Set up the monorepo workspace
- **Objetivo:** convert the repository root into a workspace root (npm or pnpm workspaces), with `apps/mobile` and `packages/core/domain`, `packages/core/data` as workspace members.
- **Criar:** root `package.json` (workspaces field), `packages/core/domain/package.json` (zero runtime dependencies), `packages/core/data/package.json` (depends on `@coach/domain`), placeholder `src/index.ts` in each.
- **Modificar:** `apps/mobile/package.json` (add `@coach/domain`/`@coach/data` as workspace dependencies).
- **Depende de:** macro-stage 1
- **Critérios de conclusão:** `npm install` (or `pnpm install`) resolves all three packages correctly; each package's own `tsc --noEmit` passes standalone.
- **Riscos:** workspace protocol misconfiguration causing a package to resolve from the npm registry instead of the local workspace — verify explicitly with a trivial exported symbol.
- **Testes:** the trivial-symbol resolution check described above.
- **Impacto na arquitetura:** physically instantiates ADR-013's goal and ADR-021's mechanism.
- **Execution Environment: Any Environment.**

### 3.2 — Verify the Domain/Data boundary is enforced
- **Objetivo:** prove ADR-021's actual point — that `@coach/domain` cannot import from `@coach/data` or any persistence/network SDK.
- **Criar:** a temporary, throwaway file inside `packages/core/domain` that attempts `import { createClient } from '@supabase/supabase-js'` (not yet a dependency of that package).
- **Modificar:** — (the throwaway file is deleted immediately after the check).
- **Depende de:** 3.1
- **Critérios de conclusão:** the throwaway import fails module resolution (package not in `packages/core/domain/package.json`'s dependencies); deleted, clean state restored.
- **Riscos:** none — this is itself a verification task.
- **Testes:** the resolution-failure check described above, done once.
- **Impacto na arquitetura:** confirms ADR-021 holds before anything depends on it.
- **Execution Environment: Any Environment.**

### 3.3 — Install the ESLint boundary rule
- **Objetivo:** `eslint-plugin-boundaries` (or an equivalent import-restriction rule) configured to flag any `packages/core/domain` file importing from `packages/core/data` or `apps/mobile`, as defense-in-depth alongside 3.2's dependency-graph enforcement.
- **Criar:** ESLint configuration for the boundary rule (root `.eslintrc` or per-package config).
- **Modificar:** —
- **Depende de:** 3.1
- **Critérios de conclusão:** a deliberately-introduced cross-boundary import (temporary) is flagged by `eslint`; reverted after the check.
- **Riscos:** an overly strict rule blocking legitimate imports (e.g., shared types) — tune the rule's scope carefully, test both a violation and a legitimate import.
- **Testes:** the deliberate-violation lint check, plus a legitimate-import sanity check.
- **Impacto na arquitetura:** the defense-in-depth half of ADR-021.
- **Execution Environment: Any Environment.**

### 3.4 — Add `@coach/domain`/`@coach/data` as dependencies of `apps/mobile`
- **Objetivo:** wire the packages into the Expo app.
- **Criar:** —
- **Modificar:** `apps/mobile/package.json`, a trivial `import` smoke line in the app root (removed once real usage exists in a later stage).
- **Depende de:** 3.1
- **Critérios de conclusão:** the Expo app builds/runs importing both packages without error.
- **Riscos:** Metro bundler (Expo's default bundler) not resolving monorepo workspace packages correctly — a known class of issue with monorepos + Metro; verify explicitly, configure `metro.config.js`'s `watchFolders`/`resolver` if needed.
- **Testes:** dev-server run + import smoke test.
- **Impacto na arquitetura:** connects Presentation to Domain/Data per `ARCHITECTURE.md` §2.
- **Execution Environment: Any Environment.**

### 3.5 — Establish internal folder structure within each package
- **Objetivo:** `packages/core/domain/src/{entities,use-cases,protocols}`, `packages/core/data/src/{sqlite,supabase,mappers,sync,security,ai-provider,notifications,audio}`.
- **Criar:** folder groups with placeholder files.
- **Modificar:** —
- **Depende de:** 3.1
- **Critérios de conclusão:** structure matches `ARCHITECTURE.md` §9's layering; every later macro-stage's file paths in this plan resolve into this structure.
- **Riscos:** low.
- **Testes:** build check.
- **Impacto na arquitetura:** finalizes the Data-layer subfolder plan referenced throughout the rest of this document.
- **Execution Environment: Any Environment.**

**Macro-stage exit criteria:** monorepo workspace exists with `@coach/domain`/`@coach/data` enforced (dependency graph + lint rule), linked into `apps/mobile`, internal structure in place.

---

# Macro-stage 4 — Configuração do `expo-sqlite` *(fully rewritten, was "Configuração do SwiftData")*

**Goal:** local persistence models, database connection, and migration mechanism per `ARCHITECTURE.md` §9.2/§4.
**Depends on:** macro-stage 3.

### 4.1 — Add `expo-sqlite` and Drizzle ORM
- **Objetivo:** install `expo-sqlite` and `drizzle-orm` (+ `drizzle-kit` for migrations) in `packages/core/data`.
- **Criar:** —
- **Modificar:** `packages/core/data/package.json`.
- **Depende de:** macro-stage 3
- **Critérios de conclusão:** both packages install and resolve correctly within the workspace.
- **Riscos:** Drizzle's Expo SQLite driver maturity, per `ARCHITECTURE.md` §15's flagged open item — do a short spike here specifically before committing further, not later.
- **Testes:** a trivial "open a database, run one query" smoke test.
- **Impacto na arquitetura:** implements ADR-020.
- **Execution Environment: Any Environment.**

### 4.2 — Define the Drizzle schema
- **Objetivo:** `CachedSession`, `CachedVocabularyItem`, `CachedMistake`, `CachedTopic`, `CachedGoal`, `SyncState` tables — matching `ARCHITECTURE.md` §9.2 field-for-field, each with a comment pointing at its Postgres counterpart table (§9.1).
- **Criar:** `packages/core/data/src/sqlite/schema.ts`.
- **Modificar:** —
- **Depende de:** 4.1
- **Critérios de conclusão:** schema compiles; a unit test creates, inserts, and fetches a row from an in-memory/temporary database successfully.
- **Riscos:** field drift from the Postgres schema — mitigated by the comment cross-reference and macro-stage 7's mapper tests.
- **Testes:** unit test against a temporary SQLite database (Drizzle supports in-memory/temp-file test databases).
- **Impacto na arquitetura:** implements the local half of `ARCHITECTURE.md` §9.2.
- **Execution Environment: Any Environment.**

### 4.3 — Set up the injectable database connection factory
- **Objetivo:** a factory producing a production (on-disk) or test (in-memory/temp-file) database connection, constructor-injectable — never a global singleton (ADR-012).
- **Criar:** `packages/core/data/src/sqlite/dbFactory.ts`.
- **Modificar:** —
- **Depende de:** 4.2
- **Critérios de conclusão:** app launches with the production connection; data survives a relaunch (manual on-device test); unit tests use the in-memory/temp variant with confirmed isolation between test runs.
- **Riscos:** `expo-sqlite`'s file-level protection defaults — verify explicitly against `NON_FUNCTIONAL_REQUIREMENTS.md` §6, don't assume a secure default.
- **Testes:** unit test (in-memory/temp); manual on-device relaunch-persistence test.
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §7's local data-protection requirement.
- **Execution Environment: Any Environment** for the code and unit tests; the on-device relaunch-persistence manual check needs a physical device or simulator/emulator, still zero macOS dependency (Android emulator or a physical iPhone via Expo Go both work from any host OS).

### 4.4 — Establish the schema migration mechanism
- **Objetivo:** Drizzle's migration-file mechanism (`drizzle-kit generate`), even for a single initial version, proven before real data depends on it.
- **Criar:** `packages/core/data/src/sqlite/migrations/` (generated), `drizzle.config.ts`.
- **Modificar:** 4.3's factory to run pending migrations on startup.
- **Depende de:** 4.2
- **Critérios de conclusão:** a one-time dry run — add a throwaway field, generate a migration, confirm existing data survives, then revert the throwaway field — passes.
- **Riscos:** deferring this "until it's actually needed" is precisely how migration debt accumulates — deliberately front-loaded, same reasoning as the original SwiftData-era task.
- **Testes:** the dry-run migration test described above.
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §4's migration strategy requirement.
- **Execution Environment: Any Environment.**

### 4.5 — Model-level unit test suite
- **Objetivo:** validate constraints (e.g. `localId` uniqueness, `syncStatus` enum values) for every table from 4.2.
- **Criar:** `packages/core/data/test/sqlite/*.test.ts`.
- **Modificar:** —
- **Depende de:** 4.2, 4.3
- **Critérios de conclusão:** all tests green; contributes to `NON_FUNCTIONAL_REQUIREMENTS.md` §11's Data-layer ≥50% coverage target.
- **Riscos:** low.
- **Testes:** as described, via Jest or Vitest.
- **Impacto na arquitetura:** establishes the coverage baseline for the Data layer.
- **Execution Environment: Any Environment.**

**Macro-stage exit criteria:** all local tables defined and tested, database connection injectable, migration mechanism proven with a real dry run.

---

# Macro-stages 5–23 and 25 — mechanically updated, pending full re-review

> ⚠️ **Every stage below received a technology-reference update (SwiftUI → React Native, SwiftData → `expo-sqlite`, `CoachKitDomain`/`CoachKitData` → `@coach/domain`/`@coach/data`, XCTest/XCUITest → Jest/Detox-or-Maestro, Keychain → `expo-secure-store`, LocalAuthentication → `expo-local-authentication`, AVFoundation → `expo-audio`, Speech framework → `@react-native-voice/voice`, AVSpeechSynthesizer → `expo-speech`, BGTaskScheduler → `expo-background-task`, UserNotifications → `expo-notifications`, Instruments → platform profiler, MetricKit → Sentry) and an Execution Environment reclassification (§0), but each stage should be re-reviewed in full — task boundaries, exact file paths, and package choices re-checked against `ARCHITECTURE.md`/`RN_EXPO_MIGRATION_PLAN.md` — before work on it actually starts, the same rigor macro-stages 1–4 already received. This is not a lower-quality plan, it's an explicitly staged review, consistent with Julia's instruction not to claim a review depth that hasn't actually happened yet.**

## Macro-stage 5 — Configuração do Supabase

Unaffected in substance by the client migration — this stage was always backend/infrastructure work (SQL, Edge Functions, Supabase console/CLI), and remains so. The one client-facing task (5.5, wiring the Supabase SDK into the client) is updated below; 5.1–5.4 are otherwise identical to the pre-migration version.

**Goal:** the backend is live, schema deployed, Auth/Storage configured, client SDK wired with safe secret handling.
**Depends on:** none (can run in parallel with macro-stages 1–4).

- **5.1** Provision the Supabase project, enable `pgvector`. *(Unaffected. Execution Environment: Any Environment.)*
- **5.2** Write and apply the initial schema migration (`ARCHITECTURE.md` §9.1 — tables, indexes, RLS). *(Unaffected. Execution Environment: Any Environment.)*
- **5.3** Configure Auth and Storage (test user, `transcripts/` bucket policy, positive/negative access tests). *(Unaffected. Execution Environment: Any Environment.)*
- **5.4** Scaffold the Edge Functions deploy pipeline with a trivial `hello` function. *(Unaffected. Execution Environment: Any Environment.)*
- **5.5 — Wire the Supabase JS SDK with safe secret handling.** **Objetivo:** add `@supabase/supabase-js` to `packages/core/data`, configure the client from Expo's environment-variable mechanism (`app.config.ts` + `.env` files, **not** committed) rather than a Swift `.xcconfig` file. **Criar:** `packages/core/data/src/supabase/supabaseClientFactory.ts`, `.env.example` (committed template). **Modificar:** `.gitignore` (confirm `.env` — not `.env.example` — is ignored). **Depende de:** 5.1, macro-stage 3. **Critérios de conclusão:** a debug run successfully calls the live project; `git status` after adding real secrets shows `.env` untracked. **Riscos:** the same highest-risk-in-this-stage accidental-secret-commit concern as the original task, now specifically about `.env` files rather than `.xcconfig` — Expo's public `EXPO_PUBLIC_*` env var prefix convention is a common source of accidental exposure (anything prefixed that way IS bundled into the client, by design) and needs explicit care: **only the Supabase anon key** (safe by Supabase's own design to be public) uses that prefix; nothing else does. **Testes:** manual connectivity smoke test; a unit test using a stubbed client. **Impacto na arquitetura:** implements `ARCHITECTURE.md` §7. **Execution Environment: Any Environment.**

**Macro-stage exit criteria:** unaffected — live Supabase project with full schema, RLS, Storage, Auth smoke-tested; client SDK wired with no secret committed.

## Macro-stage 6 — Sistema de autenticação

**Goal:** full sign-in → `expo-secure-store`-persisted session → biometric app-lock flow.
**Depends on:** macro-stage 5.5, macro-stage 3.

- **6.1** Define the `AuthRepository` interface in `packages/core/domain/src/protocols/AuthRepository.ts`, with a `MockAuthRepository` alongside for tests. *(Execution Environment: Any Environment.)*
- **6.2 — Implement `SupabaseAuthRepository` + `expo-secure-store` session storage.** Replaces the Swift `KeychainSessionStore`; `expo-secure-store` wraps Keychain on iOS, Keystore on Android — **no equivalent on web**, where the session uses a shorter-lived, browser-storage-backed token consistent with the companion-surface scope (ADR-024). **Criar:** `packages/core/data/src/supabase/SupabaseAuthRepository.ts`, `packages/core/data/src/security/secureSessionStore.ts` (platform-branching internally for the web case). **Execution Environment: Any Environment.**
- **6.3** Sign-in screen and Zustand store (the ViewModel-equivalent), depending only on `AuthRepository`. File: `apps/mobile/src/features/onboarding/SignInScreen.tsx` + `useSignInStore.ts`. *(Execution Environment: Any Environment.)*
- **6.4 — App-level biometric lock.** `expo-local-authentication` (iOS/Android) replaces `LocalAuthentication`; **web uses a PIN/password fallback, explicitly not WebAuthn** (ADR-024) — this sub-decision (the web fallback UI) needs its own small design pass, not previously needed under the iOS-only plan. **Criar:** `apps/mobile/src/composition/AppLockCoordinator.ts`. *(Execution Environment: Any Environment for iOS/Android; the web PIN fallback is also Any Environment, just a different code path.)*
- **6.5** Wire `AuthRepository` into `container.ts` (the composition root, ADR-012's TypeScript expression). *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected in substance — full sign-in → persisted-session → biometric-gated flow (iOS/Android) or PIN-gated flow (web) works end-to-end, unit-tested where feasible.

## Macro-stage 7 — Camada de persistência

**Goal:** the Repository layer — unaffected in design, `expo-sqlite`/Drizzle replaces SwiftData throughout.
**Depends on:** macro-stage 4, macro-stage 5.5.

- **7.1** Pure Domain entities (`Session`, `VocabularyItem`, `Mistake`, `Topic`, `Goal`) as framework-free TypeScript types/interfaces in `packages/core/domain/src/entities/`. *(Execution Environment: Any Environment.)*
- **7.2** Repository interfaces (`SessionRepository`, `VocabularyRepository`, `MistakeRepository`, `TopicRepository`, `GoalRepository`), pagination-from-day-one per `ARCHITECTURE_DECISIONS.md` §12's principle. *(Execution Environment: Any Environment.)*
- **7.3** Mappers (Drizzle row ↔ Domain entity ↔ Supabase DTO), round-trip-tested. `packages/core/data/src/mappers/`. *(Execution Environment: Any Environment.)*
- **7.4 — Concrete Repositories.** `DefaultSessionRepository` etc., deciding SQLite-fast-path vs. Supabase fetch internally — the same critical grep-gate applies: **no `expo-sqlite`/Drizzle or Supabase import outside `packages/core/data`**, now enforced by both the workspace-package boundary (3.1–3.3) *and* a grep, doubly protected versus the original single-mechanism (Swift compiler) guarantee. **Execution Environment: Any Environment.**
- **7.5** Wire Repositories into `container.ts`. *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected — full Repository layer implemented and unit-tested; zero direct `expo-sqlite`/Supabase imports in `apps/mobile`, verified by grep.

## Macro-stage 8 — Camada de sincronização

**Goal:** `SyncCoordinator` — unaffected in design (ADR-007 is entirely storage-engine-agnostic); `expo-background-task` replaces `BGTaskScheduler`.
**Depends on:** macro-stage 7.

- **8.1** `SyncCoordinating` interface. *(Execution Environment: Any Environment.)*
- **8.2** Idempotent upload path — **the single most important test in this stage remains unchanged**: an interrupted-then-retried upload must not create a duplicate row (ADR-007). *(Execution Environment: Any Environment.)*
- **8.3** Watermark pull path with conflict rules — same non-negotiable test: a "server has a newer value" scenario must both overwrite locally *and* queue a visible conflict notice. *(Execution Environment: Any Environment.)*
- **8.4** Derived `streaks` accessor on `SessionRepository`, plus the same grep-gate (no independent write path to a streak field anywhere). *(Execution Environment: Any Environment.)*
- **8.5 — Background sync scheduling.** `expo-background-task` (iOS/Android) replaces `BGTaskScheduler`; **web is best-effort only** (Service Worker `periodicSync`, Chrome-family, no guaranteed frequency — ADR-024), a genuine platform gap the original iOS-only plan didn't need to address. **Criar:** `apps/mobile/src/composition/backgroundSyncScheduler.ts`. **Execution Environment: Any Environment** for the code; verifying it fires needs a physical device/emulator, still no macOS dependency.
- **8.6** Minimal sync status indicator component. *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected — full bidirectional sync working end-to-end against the live Supabase project; idempotency and conflict-notice behavior proven by tests; background scheduling verified on iOS/Android, best-effort behavior accepted on web.

## Macro-stage 9 — Memory Engine

Entirely backend (Edge Functions) except 9.4 — **unaffected in substance** by the client migration.

- **9.1** Memory Extraction Edge Function. *(Execution Environment: Any Environment.)*
- **9.2** Learner Profile Updater Edge Function. *(Execution Environment: Any Environment.)*
- **9.3** Hybrid semantic retrieval helper. *(Execution Environment: Any Environment.)*
- **9.4** Client `SearchMemoryUseCase` (Domain) + Data-layer adapter — same structure as before, TypeScript instead of Swift. *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected — full backend memory pipeline proven end-to-end against fixtures.

## Macro-stage 10 — AI Provider

Entirely unaffected in design; the client-side adapters (10.3–10.7) are TypeScript instead of Swift, calling the exact same backend endpoints.

- **10.1** Provider-neutral Domain interfaces and types (`ConversationEngine`, `MemoryExtractionEngine`, `SessionContext`, `ConversationChunk`) — no vendor SDK types crossing the boundary. *(Execution Environment: Any Environment.)*
- **10.2** Session Orchestrator Edge Function — unaffected. *(Execution Environment: Any Environment.)*
- **10.3** `ClaudeConversationEngine` client adapter, exposing an `AsyncIterable<ConversationChunk>` (TypeScript's equivalent of Swift's `AsyncStream`) — same grep-gate (no Anthropic SDK dependency client-side). *(Execution Environment: Any Environment.)*
- **10.4** Second reference `ConversationEngine` adapter (LSP validation, `TASKS.md` T0-13) — same swap-and-rebuild exercise, now a `container.ts` edit instead of an `AppContainer.swift` edit. *(Execution Environment: Any Environment.)*
- **10.5** `MemoryExtractionEngine` client adapter. *(Execution Environment: Any Environment.)*
- **10.6 — Cost/usage instrumentation.** Backend-side logging (10.2) is unaffected; client-side logging (10.3) now uses the `react-native-logs`-based logger from `OBSERVABILITY.md` §2 instead of `OSLog`. *(Execution Environment: Any Environment for both halves — this was previously a genuine environment split; it no longer is, since neither half needs macOS anymore.)*
- **10.7** Wire engines into `container.ts`. *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected — text conversation works end-to-end; provider-swap validated; cost logging in place.

## Macro-stage 11 — Voice Engine

The stage most affected by the migration at the *implementation* level, though its *design* (primary + fallback + reconnection) is unchanged.

- **11.1** `VoiceEngine` interface + voice-state types, matching `DESIGN_SYSTEM.md` §5.3's state list exactly. *(Execution Environment: Any Environment.)*
- **11.2** Ephemeral Realtime token issuance Edge Function — unaffected. *(Execution Environment: Any Environment.)*
- **11.3 — `OpenAIRealtimeVoiceEngine` client adapter.** `react-native-webrtc` replaces raw AVFoundation-level WebRTC handling (the original plan built this more from scratch against Apple's lower-level APIs; `react-native-webrtc` is a more complete off-the-shelf package, arguably *less* implementation work than the original Swift plan assumed). **`RISKS.md` R-01 still applies in full** — this remains the least-proven part of the architecture, latency budget still measured, not assumed. **Execution Environment: Any Environment** for writing the code; **measuring real device latency needs a physical iPhone/Android device**, still no macOS dependency (a meaningful change from the original plan, which implicitly assumed an iOS Simulator/device reachable only from a Mac).
- **11.4 — Native fallback `VoiceEngine` adapter.** `@react-native-voice/voice` (wraps the native Speech framework/`SpeechRecognizer` under the hood) + `expo-speech` replace the Speech framework + `AVSpeechSynthesizer` — iOS/Android only, **no offline fallback exists on web** (ADR-024), an explicit platform gap the original iOS-only plan didn't have to state. **Execution Environment: Any Environment** for the code; the offline airplane-mode smoke test needs a physical device.
- **11.5** Reconnection-before-fallback coordination (`VoiceEngineCoordinator`) — same state-machine design, same fake-clock unit-testing approach. *(Execution Environment: Any Environment.)*
- **11.6** Interruption handling via `expo-audio`'s audio-session APIs (the RN equivalent of `AVAudioSession` notifications). *(Execution Environment: Any Environment for the code; the real-interruption manual test needs a physical device.)*
- **11.7** Pronunciation mistake capture pipeline — unaffected in design. *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected in substance — full voice loop works on iOS/Android; fallback and reconnection proven under simulated failure; latency measured against budget. Voice is explicitly out of scope for web (ADR-024), a narrowing from the original plan's implicit iOS-only assumption to an explicit, documented one.

## Macro-stage 12 — Learning Engine

Almost entirely backend/pure-algorithm — **the least affected macro-stage in the whole plan**, since `LEARNING_ENGINE.md`'s formulas were always language-agnostic.

- **12.1 — SM-2 spaced repetition.** Now implemented in `packages/core/domain/src/learning/spacedRepetition.ts` instead of Swift — the exact same worked-example table-driven tests apply verbatim, just written in TypeScript. *(Execution Environment: Any Environment.)*
- **12.2–12.6** Adaptive scheduler, CEFR progression, weak-point detection, Fluency/Confidence scoring, recommendation system — all backend Edge Functions, entirely unaffected. *(Execution Environment: Any Environment.)*
- **12.7** Client `GetAdaptiveFocusUseCase` — Domain-layer, framework-free, unaffected in design. *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected — every formula implemented and tested against `LEARNING_ENGINE.md`'s own worked examples.

## Macro-stage 13 — Design System

Implements `DESIGN_SYSTEM.md`'s already-updated (this same pass) token set and component library.

- **13.1** Color tokens — as React Native `Colors.ts` constants (or a theming library's token format) instead of an Xcode Asset Catalog, both light/dark values, same WCAG AA contrast-check requirement. *(Execution Environment: Any Environment.)*
- **13.2** Typography tokens — a `Typography.ts` mapping to React Native `Text` styles with font-scale support, replacing the `Font`/Dynamic Type mapping. *(Execution Environment: Any Environment.)*
- **13.3** Spacing tokens — unaffected in substance, a TypeScript constants file instead of a Swift one. *(Execution Environment: Any Environment.)*
- **13.4** Core component library (Buttons, Cards, Inputs, Toast) as React Native components with Storybook or a similar preview tool (replacing SwiftUI Previews) — same accessibility-label-presence check per component. *(Execution Environment: Any Environment.)*
- **13.5** Navigation shell via Expo Router (`ARCHITECTURE_DECISIONS.md` ADR-022), replacing native `TabView`/`NavigationStack`. *(Execution Environment: Any Environment.)*
- **13.6** Motion tokens via React Native Reanimated, with `AccessibilityInfo.isReduceMotionEnabled()` fallbacks (replacing `UIAccessibility.isReduceMotionEnabled`). *(Execution Environment: Any Environment.)*
- **13.7** Haptic feedback helper via `expo-haptics` (replacing `UIFeedbackGenerator`); no-op on web. *(Execution Environment: Any Environment for the code; verifying haptics fire needs a physical device — haptics don't work in Simulator/emulator, this constraint is unchanged from the original plan.)*

**Macro-stage exit criteria:** unaffected — full token set and component library implemented, previewable, accessibility-verified in both appearance modes, on every target platform (a broader scope than the original iOS-only verification).

## Macro-stage 14 — Navegação

- **14.1** Route/destination types, matching Expo Router's file-based route structure. *(Execution Environment: Any Environment.)*
- **14.2** A thin navigation-coordination layer on top of Expo Router where typed, cross-cutting navigation logic benefits from one (Expo Router's file-based routing handles most of this natively, reducing how much custom coordinator code is actually needed versus the original SwiftUI `NavigationCoordinator` plan). *(Execution Environment: Any Environment.)*
- **14.3** First-run routing logic (unauthenticated → sign-in → onboarding → main tabs; returning → biometric/PIN lock → main tabs). *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected — navigation graph and first-run routing logic in place and tested.

## Macro-stage 15 — Onboarding

- **15.1** Finalize the calibration flow structure — unaffected, a planning task. *(Execution Environment: Any Environment.)*
- **15.2** Onboarding screens + Zustand store, reusing `ConversationEngine` in calibration mode — same first-true-end-to-end-proof significance as the original plan. *(Execution Environment: Any Environment.)*
- **15.3** CEFR estimate derivation — unaffected in design. *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected — a brand-new account completes onboarding end-to-end, seeding real memory data, on any target platform.

## Macro-stage 16 — Tela inicial

- **16.1** Home screen + Zustand store, offline-resilience-tested. *(Execution Environment: Any Environment.)*
- **16.2** "Start session" routing via Expo Router. *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected.

## Macro-stage 17 — Conversação

- **17.1** Text conversation screen + store + `StartSessionUseCase` — same large-history pagination performance requirement. *(Execution Environment: Any Environment.)*
- **17.2** Voice session screen (iOS/Android only, per macro-stage 11's scope) — wires `VoiceEngineCoordinator`, renders the voice state machine. *(Execution Environment: Any Environment for the code; real voice testing needs a physical device.)*
- **17.3** Session-end wiring (`EndSessionUseCase` triggers sync + extraction). *(Execution Environment: Any Environment.)*
- **17.4** Post-session recap screen. *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected on iOS/Android; on web, text conversation works end-to-end per the companion-surface scope, voice is out of scope (ADR-024).

## Macro-stage 18 — Exercícios

- **18.1** Scenario picker, non-repetition-tested. *(Execution Environment: Any Environment.)*
- **18.2** "Practice this mistake" targeted mode. *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected.

## Macro-stage 19 — Estatísticas

- **19.1–19.6** Progress dashboard, topic coverage, memory tab (vocabulary/mistakes/session history), in-app Q&A, "why this lesson," practice heatmap — all screens + stores, unaffected in design, large-fixture-dataset performance requirements unchanged. *(Execution Environment: Any Environment throughout.)*

**Macro-stage exit criteria:** unaffected — full progress/memory surface implemented, reading only through Repositories, performant at scale on every target platform.

## Macro-stage 20 — Configurações

- **20.1–20.2** Profile, goal management screens. *(Execution Environment: Any Environment.)*
- **20.3 — Data export/delete flow.** Same partial-delete failure mode explicitly tested (one store cleared, the other not) — now `Supabase + expo-sqlite`, not `Supabase + SwiftData`. *(Execution Environment: Any Environment.)*
- **20.4** App-lock settings (biometric timeout on iOS/Android, PIN settings on web). *(Execution Environment: Any Environment.)*
- **20.5** Sync status detail view. *(Execution Environment: Any Environment.)*
- **20.6** Debug Health screen, gated behind a debug-build flag (React Native's equivalent of `#if DEBUG` — typically `__DEV__` or an EAS build-profile-based flag). *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected — full settings surface implemented; export/delete proven to fully clear both stores; debug Health screen functional.

## Macro-stage 21 — Widgets *(special handling — deferred, distinct Execution Environment label)*

> **This entire macro-stage is deferred to post-launch** (`ARCHITECTURE_DECISIONS.md` ADR-019 consequence, `TASKS.md` T5-04/T6-08). WidgetKit has no cross-platform equivalent under any framework — this is an iOS platform fact, not a gap in React Native specifically. Every task below is classified **`Native Module Authoring (macOS)`**, the one place in this entire plan that label is used, kept explicitly distinct from `Any Environment`/`EAS Cloud Build Required` because writing and debugging the actual native Swift/WidgetKit code genuinely benefits from Xcode's tooling, unlike everything else in this plan.

- **21.1** Widget Extension target (native Swift/WidgetKit, added via an Expo config plugin so it survives `expo prebuild`), sharing a minimal data snapshot from `@coach/domain`'s types where feasible (most of the widget's own code is unavoidably native Swift, not shared TypeScript). **Execution Environment: Native Module Authoring (macOS).**
- **21.2** Timeline provider reading a minimal, read-only App-Group-backed snapshot written by the Expo app after each sync. **Execution Environment: Native Module Authoring (macOS)** for the widget-side code; the Expo-app-side snapshot writer (calling a small native module bridge) is `Any Environment` to write but needs a macOS-built dev client to actually test end-to-end, functionally similar to the widget task itself.
- **21.3** Widget accessibility/appearance verification. **Execution Environment: Native Module Authoring (macOS)** (requires building and running the native extension to verify).

**Macro-stage exit criteria (when eventually undertaken, post-launch):** unaffected in substance from the original plan — widget installable, shows real data, accessible, both appearance modes correct.

## Macro-stage 22 — Notificações

- **22.1 — Contextual permission request.** `expo-notifications`' permission API replaces `UserNotifications`'; same "ask after first session, not on launch" timing rule. *(Execution Environment: Any Environment.)*
- **22.2 — Streak-reminder scheduling.** `expo-notifications`' local scheduling replaces the original design; same fire/cancel-on-completion test requirement. **Web push has a different, more limited delivery model and is not required for v1** (a new, explicit scoping note the original iOS-only plan didn't need). *(Execution Environment: Any Environment.)*
- **22.3** Notification settings screen. *(Execution Environment: Any Environment.)*

**Macro-stage exit criteria:** unaffected on iOS/Android; web notifications explicitly out of v1 scope.

## Macro-stage 23 — Backup e restauração

Entirely backend/infrastructure except the "confirm the app functions against restored data" half of 23.4 — **almost entirely unaffected** by the client migration.

- **23.1** Weekly scheduled export job. *(Execution Environment: Any Environment.)*
- **23.2** Secondary, user-owned mirror mechanism — the Split classification from the original plan (server-side vs. client-side mechanism, still an open decision per `RN_EXPO_MIGRATION_PLAN.md`'s Regra-10-style flagged choice) simplifies: **both a server-side mechanism (Edge Function emailing a link) and a client-side mechanism (an in-app "save backup" action) are now `Any Environment`** — the prior "macOS Required for the client-side option" concern no longer applies. *(Execution Environment: Any Environment, either way.)*
- **23.3** Supabase PITR verification. *(Execution Environment: Any Environment.)*
- **23.4 — Restore-path drill.** **Still explicitly mandatory, not optional** — the classic "untested backup" failure mode this plan guards against by naming the task, unchanged reasoning from the original. The Supabase-side restore is `Any Environment`; confirming the app functions against restored data now needs only a physical device or emulator/simulator, not specifically a Mac. *(Execution Environment: Any Environment for both halves — a genuine simplification from the original Split classification.)*

**Macro-stage exit criteria:** unaffected — backup is a proven, drilled capability, `RISKS.md` R-03 resolved only after 23.4 passes.

## Macro-stage 25 — Otimização

Same measure-then-fix philosophy; tooling updated.

- **25.1–25.5** Launch-time, memory, battery, list/scroll, and sync performance profiling — via Xcode Instruments (iOS)/Android Studio Profiler (Android) instead of Instruments alone; same numeric targets from `NON_FUNCTIONAL_REQUIREMENTS.md`, same "measure, don't assume" discipline. **Execution Environment: Any Environment** for setting up and running most measurements (Android Studio Profiler runs on Linux/Windows/Mac); **iOS-specific profiling via Xcode Instruments is the one exception in this range that benefits from macOS access**, though EAS Build's own build logs and simpler in-app timing instrumentation can substitute for a first pass without it.
- **25.6** Address findings — open-ended, content depends on 25.1–25.5's results. *(Execution Environment: Any Environment, per-finding.)*

**Macro-stage exit criteria:** unaffected — every target measured on real hardware, met or explicitly revised with documented rationale.

---

# Macro-stage 24 — Testes *(substantially rewritten — EAS changes the actual mechanics, not just vocabulary)*

**Goal:** the cross-cutting testing infrastructure — CI, coverage gates, critical-flow coverage.
**Depends on:** having real tests to run (as early as after macro-stage 4).

### 24.1 — Stand up CI
- **Objetivo:** GitHub Actions building and running the Jest/Vitest suite (`packages/core/domain`, `packages/core/data`) and, where set up, Detox/Maestro E2E tests on every push (`TASKS.md` T0-14).
- **Criar:** `.github/workflows/ci.yml`.
- **Modificar:** —
- **Depende de:** any macro-stage with real tests to run.
- **Critérios de conclusão:** a deliberately broken test fails the CI run visibly; a passing state is green.
- **Riscos:** low.
- **Testes:** the deliberate-break check.
- **Impacto na arquitetura:** implements `RISKS.md` R-04's automated-regression-safety-net mitigation.
- **Execution Environment: Any Environment.** **This is the single biggest mechanical simplification in the entire distribution/testing story**: the original Swift-era plan required a macOS GitHub Actions runner for essentially every CI job. React Native's unit/integration test suite runs on a standard Linux runner — no macOS runner needed for this gate at all, a direct cost and speed win (macOS runners are slower to provision and more expensive on GitHub Actions than Linux runners).

### 24.2 — Coverage measurement and gate
- **Objetivo:** measure real coverage; gate CI at the measured baseline, ratcheting toward `NON_FUNCTIONAL_REQUIREMENTS.md` §11's targets.
- **Criar:** —
- **Modificar:** `ci.yml` (coverage step, e.g. via Jest's built-in coverage or `c8`/Vitest coverage).
- **Depende de:** 24.1
- **Critérios de conclusão:** coverage report generated every run; gate fails a coverage-reducing PR.
- **Riscos:** setting an unmet aspirational gate — avoided by gating on the measured baseline.
- **Testes:** the gate itself, exercised once via a deliberately coverage-reducing test PR.
- **Impacto na arquitetura:** operationalizes `NON_FUNCTIONAL_REQUIREMENTS.md` §11.
- **Execution Environment: Any Environment.**

### 24.3 — E2E testing tool selection and setup
- **Objetivo:** choose between Detox and Maestro (both viable, decide via a short spike — Detox is more deeply integrated/faster but requires more setup including, notably, **a macOS machine for its iOS test-runner compilation step specifically**; Maestro is simpler to set up, works from any host OS including Linux/Windows since it drives already-built apps via a device-agnostic protocol rather than compiling test binaries itself) and set up the chosen tool.
- **Criar:** E2E test configuration (`.detoxrc.js` or Maestro flow files).
- **Modificar:** —
- **Depende de:** macro-stage 1
- **Critérios de conclusão:** a trivial "app launches, shows the placeholder screen" E2E test passes.
- **Riscos:** **this is the one place in the testing story where the tool choice has a real environment implication** — if Detox is chosen, its iOS test-runner setup specifically needs macOS (distinct from EAS Build's cloud solution, since Detox drives a local test run, not a cloud build); Maestro avoids this entirely. Flagged explicitly so the choice is made with this trade-off visible, not discovered later.
- **Testes:** the trivial E2E test itself.
- **Impacto na arquitetura:** determines whether macro-stage 24.4's critical-flow tests can run entirely from Any Environment or specifically need macOS for their iOS leg.
- **Execution Environment: Any Environment if Maestro is chosen; partially macOS-dependent (for the iOS leg specifically) if Detox is chosen** — this decision should be made with Julia's stated "no macOS access" constraint explicitly in mind, making Maestro the likely better default absent a specific reason to prefer Detox.

### 24.4 — Critical-flow coverage audit
- **Objetivo:** cross-check every named critical flow from `NON_FUNCTIONAL_REQUIREMENTS.md` §11 against actually-existing E2E tests, closing any gap.
- **Criar:** any missing E2E test.
- **Modificar:** —
- **Depende de:** macro-stage 6, 8, 11, 15, 17, 24.3
- **Critérios de conclusão:** every named flow has a passing E2E test.
- **Riscos:** a flow assumed covered but actually missed.
- **Testes:** the audit itself.
- **Impacto na arquitetura:** closes the loop on `NON_FUNCTIONAL_REQUIREMENTS.md` §11's critical-flow policy.
- **Execution Environment:** per 24.3's tool choice.

### 24.5 — Full on-device regression pass
- **Objetivo:** run the entire suite, plus a manual walkthrough of every major flow, on a real physical device (iOS and Android), once, before macro-stage 25.
- **Criar:** —
- **Modificar:** —
- **Depende de:** 24.1–24.4
- **Critérios de conclusão:** clean pass, no simulator/emulator-only-masked issues found.
- **Riscos:** device-specific behavior (audio, biometrics, background tasks) surfacing only now — expected, not alarming.
- **Testes:** the full pass itself.
- **Impacto na arquitetura:** the final verification gate before macro-stage 25.
- **Execution Environment: Any Environment** — testing on a physical iPhone reachable via Expo Go/a dev client needs no Mac; this is a direct, meaningful change from the original plan, which implicitly required a Mac-connected device or Simulator for this exact task.

**Macro-stage exit criteria:** CI green (Linux runner, no macOS needed), coverage at or above targets, all named critical flows covered, one clean on-device regression pass complete.

---

# Macro-stage 26 — Preparação para distribuição *(substantially rewritten — EAS Build changes the entire mechanics)*

**Goal:** iOS (and Android) distribution resolved and executed via EAS, resolving `RISKS.md` R-07 and `TASKS.md` T0-10 far more directly than the original Xcode-based plan could.
**Depends on:** macro-stage 25.

### 26.1 — Apple Developer Program enrollment
- **Objetivo:** account-level enrollment — unaffected by the platform migration; still required for any App Store/TestFlight distribution regardless of client framework.
- **Critérios de conclusão:** active enrollment confirmed.
- **Execution Environment: Any Environment** (a browser-based account action).

### 26.2 — Configure `eas.json` and app identifiers
- **Objetivo:** define EAS build profiles (development, preview, production) and register the app's bundle identifier — the point where `TASKS.md` T0-08's product-name decision becomes a hard blocker, same as the original plan's App Store Connect record creation.
- **Criar:** `eas.json`, updates to `app.json`/`app.config.ts` (bundle identifier, app name, icon, splash screen).
- **Depende de:** 26.1, a chosen product name.
- **Critérios de conclusão:** `eas build:configure` completes successfully.
- **Riscos:** discovering the desired bundle identifier or app name is taken — have alternatives ready.
- **Execution Environment: Any Environment.**

### 26.3 — First EAS Build (development/preview profile)
- **Objetivo:** produce a real, installable build via `eas build --platform ios --profile preview` (and the Android equivalent) — Expo's cloud macOS workers handle the actual Xcode compile step, invisibly, with zero local macOS involvement.
- **Criar:** —
- **Depende de:** 26.2
- **Critérios de conclusão:** the build completes in Expo's cloud queue and produces an installable artifact (an `.ipa`/`.apk`, or a link for `expo install` on a registered test device).
- **Riscos:** this is the point where any custom native module (the deferred WidgetKit extension aside, since that's not in scope yet) would first surface a build-configuration issue — expect at least one iteration here even with a clean codebase, a normal part of a first cloud-build setup, not a sign of a broken plan.
- **Testes:** the build itself, plus an install-and-launch smoke test on a physical device.
- **Impacto na arquitetura:** the first real-world validation that "no local Mac needed" (ADR-019's central justification) actually holds.
- **Execution Environment: EAS Cloud Build Required.**

### 26.4 — Code signing via EAS
- **Objetivo:** let EAS manage iOS code signing automatically (`eas credentials`), the direct cloud-based equivalent of the original plan's local Xcode automatic-signing choice, and consistent with `RISKS.md` R-04's maintainability bias (less manual certificate/profile management for a solo maintainer).
- **Depende de:** 26.1
- **Critérios de conclusão:** subsequent builds sign correctly without manual certificate handling.
- **Execution Environment: EAS Cloud Build Required** (the signing happens as part of the cloud build process).

### 26.5 — TestFlight build upload via EAS Submit
- **Objetivo:** `eas submit --platform ios`, uploading the production-profile build directly to TestFlight from Expo's cloud infrastructure — no local Xcode Organizer step, no local Mac, at any point in this entire pipeline.
- **Depende de:** 26.3 (production profile), 26.4
- **Critérios de conclusão:** Julia receives and successfully installs the build on her actual iPhone via TestFlight — **still the single most meaningful validation in this entire plan**, unchanged in importance from the original design, now reached via a meaningfully shorter, Mac-free path.
- **Riscos:** the same "does it actually work on the real device" risk as the original plan — a build that passes every check up to this point but fails to install or run on Julia's actual phone would still invalidate everything before it.
- **Testes:** the real-device install and smoke-use itself.
- **Execution Environment: EAS Cloud Build Required.**

### 26.6 — Build-renewal process
- **Objetivo:** a running mitigation for the 90-day TestFlight build-expiry cycle (`RISKS.md` R-07) — **this specific risk is unaffected by the platform migration**; TestFlight's 90-day expiry is an Apple policy, not a consequence of the original Xcode-based build process, so it still needs an active mitigation, not just a documented one.
- **Criar:** a calendar reminder or an automated check (e.g., a scheduled Routine triggering `eas build` + `eas submit` automatically, itself now a realistic option since the whole pipeline is scriptable and Mac-free — a genuine new capability the original plan's local-Xcode-archive process couldn't offer as cleanly).
- **Critérios de conclusão:** a real, scheduled, confirmed-active reminder or automation exists.
- **Riscos:** unchanged from the original plan — an easy-to-overlook failure mode, still requiring an actual running process, not just documentation.
- **Execution Environment: Any Environment** for setting up the reminder/automation; **EAS Cloud Build Required** each time it actually fires and produces a new build.

### 26.7 — Final documentation pass
- **Objetivo:** update `ROADMAP.md`/`TASKS.md` marking completed phases, refresh `RISKS.md` statuses against real outcomes (R-01 voice latency, R-03 backup drill, R-07 distribution).
- **Modificar:** `ROADMAP.md`, `TASKS.md`, `RISKS.md`.
- **Depende de:** every prior macro-stage.
- **Critérios de conclusão:** documentation accurately reflects the shipped state, no stale "pending" language left anywhere — same discipline as `MIGRATION_PLAN.md` §12.3's original example.
- **Execution Environment: Any Environment.**

**Macro-stage exit criteria:** a real build, installed on Julia's real iPhone via TestFlight, built and submitted entirely through EAS with zero local macOS involvement at any step — the concrete, realized payoff of ADR-019's central justification for this entire migration.

---

## 5. What this document does not cover

Unchanged from the original: content quality tuning for `PROMPT_ENGINE.md`/`LEARNING_ENGINE.md`/`DESIGN_SYSTEM.md`'s exact values, and exact effort/time estimates per task.

## 6. Related documents

Implements the architecture in `ARCHITECTURE.md`/`ARCHITECTURE_DECISIONS.md` (ADR-001–024), the behavior specs in `PROMPT_ENGINE.md`/`LEARNING_ENGINE.md`, the visual spec in `DESIGN_SYSTEM.md`, the measurable targets in `NON_FUNCTIONAL_REQUIREMENTS.md`, the monitoring design in `OBSERVABILITY.md`, and the full stack-migration analysis in `RN_EXPO_MIGRATION_PLAN.md`. Extends `ROADMAP.md`'s phases and `TASKS.md`'s backlog to task-level, ordered granularity. Builds on the clean repository state confirmed in `MIGRATION_PLAN.md` §12.
