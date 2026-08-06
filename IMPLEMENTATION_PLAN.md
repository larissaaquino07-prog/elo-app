# IMPLEMENTATION_PLAN.md

The technical execution plan for building the application, decomposed into 26 macro-stages and ~140 small, independent, verifiable tasks. This document is the **how and in what order**; `TASKS.md` remains the **what and priority** backlog — task IDs here (e.g. `10.4`) cross-reference `TASKS.md` IDs (e.g. `T0-13`) wherever they map directly, rather than duplicating that document's content.

**Status: planning only.** No Xcode project exists yet, no code has been written. This document is the guide for all implementation work that follows, starting only when explicitly directed.

**Naming note:** `CoachApp` (iOS app target) and `CoachKit` (local Swift Package) are working names, consistent with `PROJECT.md`'s "Coach" codename and `REPOSITORY_AUDIT.md` §7's proposed structure — the product name itself (`TASKS.md` T0-08) is still open and is a purely mechanical rename whenever decided, blocking nothing in this plan except macro-stage 26.2 specifically.

---

## 1. How to use this document

Each task lists exactly eight things, per your instruction: **Objetivo**, **Arquivos criados**, **Arquivos modificados**, **Dependências**, **Critérios de conclusão**, **Riscos**, **Estratégia de testes**, **Impacto na arquitetura**. Tasks are intentionally small — most should take a single focused work session. A task with a vague or multi-day "critério de conclusão" is a sign it should be split further before starting, not a sign to relax the criterion.

## 2. Mandatory development workflow

Applies identically to **every single task** below, without exception. It is stated once here rather than repeated 140 times, but it is not optional for any of them:

1. **Implementar** — write the smallest change that satisfies the task's objective.
2. **Executar testes** — run the task's own test strategy (below) plus the full existing suite (regression), not just the new code in isolation.
3. **Revisar arquitetura** — two tiers:
   - **Task-level (every task):** does this change respect the Domain/Data boundary (ADR-006/ADR-018), the Repository/Engine protocol pattern (ADR-005), and the relevant section of `ARCHITECTURE.md`? A one-line self-check, not a formal review.
   - **Macro-stage-level (at the end of each of the 26 stages):** a fuller pass against `ARCHITECTURE.md`, `ARCHITECTURE_DECISIONS.md`, and this plan's stated "Impacto na arquitetura" notes for that stage — close enough in spirit to the 2026-08-06 Architecture Review to catch drift before it compounds, but scoped to just the stage that closed.
4. **Atualizar documentação quando necessário** — if a task changes a decision, a formula, a target number, or a file path this document or another canonical doc (`ARCHITECTURE.md`, `LEARNING_ENGINE.md`, `PROMPT_ENGINE.md`, `DESIGN_SYSTEM.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `OBSERVABILITY.md`, `RISKS.md`) states, update that document in the same work session — not "later." A new decision not already covered by an existing ADR gets a new one, per the standing rule in `ARCHITECTURE_DECISIONS.md`.
5. **Somente então iniciar a próxima etapa** — a task is not "basically done"; it is done when steps 1–4 are all complete, or it isn't started as a foundation for the next one.

## 3. Sequencing rationale (why this order minimizes rework)

The 26 macro-stages follow dependency order, not narrative/feature order — each stage is buildable only once everything it depends on exists, and nothing later requires reopening an earlier stage:

- **1–4 (project, structure, package, persistence)** establish the physical skeleton once. Every later stage builds inside it; none of them redefine it.
- **5–8 (Supabase, auth, persistence/repository layer, sync)** establish the entire data-access story — by the end of stage 8, every later feature reads and writes through Repositories and never touches SwiftData/Supabase directly, so no later stage ever needs to "go back and fix" a direct-access shortcut.
- **9–12 (Memory Engine, AI Provider, Voice Engine, Learning Engine)** are the app's actual intelligence, built and fixture-tested against the data layer from 5–8, entirely before any real UI consumes them — this mirrors `ROADMAP.md`'s text-before-voice, memory-before-adaptive sequencing rationale at a finer grain, and means the hardest, most vendor-dependent code (voice, stage 11) is validated against a stable foundation, not a moving one.
- **13–14 (Design System, Navigation)** build the visual/structural shell once, so stages 15–22's screens are assembled from finished parts instead of each screen reinventing a button or a nav pattern.
- **15–22 (feature screens)** are now just wiring — Domain/Data/Intelligence/Design/Navigation all already exist, so each screen stage is small and low-risk by construction, not by luck.
- **23 (backup/restore)** comes after real data exists to back up and a real UI to notice a restore worked — testing it earlier would be testing against fixtures, not the real system.
- **24–26 (tests, optimization, distribution)** are validation and shipping — deliberately last, since optimizing or distributing an incomplete app wastes the effort when a later stage's design changes invalidate it.

## 4. Traceability

| Macro-stage | `ROADMAP.md` phase | Key `TASKS.md` IDs |
|---|---|---|
| 1–4 | Phase 0 | T0-01–T0-07, T0-13, T0-14 |
| 5–8 | Phase 0–1 | T0-05–T0-07, T1-01–T1-05 |
| 9 | Phase 1–2 | T1-08–T1-10, T2-01–T2-02, T2-05 |
| 10 | Phase 1 | T1-06, T1-07, T1-16, T1-17 |
| 11 | Phase 4 | T4-01–T4-09 |
| 12 | Phase 2–3 | T2-03, T2-06, T3-01–T3-05 |
| 13 | Phase 5 (pulled forward — see note below) | T5-03 |
| 14 | Phase 1 | — |
| 15 | Phase 1 | T0-09, T0-11, T1-06 |
| 16 | Phase 1 | T1-14 |
| 17 | Phase 1, 4 | T1-08, T4-02–T4-08, T5-09 |
| 18 | Phase 3 | T3-02, T3-03 |
| 19 | Phase 2–3 | T2-04, T2-05, T3-05, T5-11 |
| 20 | Phase 1, 5 | T1-12, T5-07 |
| 21 | Phase 5 | T5-04 |
| 22 | Phase 5 | T5-05, T5-08 |
| 23 | Phase 1 (backup job), ongoing | T1-13 |
| 24 | Phase 0, ongoing | T0-14 |
| 25 | Phase 5 | T5-01, T5-02, T5-06 |
| 26 | — | T0-10 |

**Note on stage 13 (Design System):** `ROADMAP.md` places full design-system implementation in Phase 5 ("Premium Polish"), assuming screens are built first with placeholder styling and polished later. This plan instead builds the token/component library **before** any screen (stage 13, before stages 15–22), so every screen is correct-by-construction from its first commit instead of needing a later pass to retrofit `DESIGN_SYSTEM.md` compliance. This is a deliberate, beneficial deviation from `ROADMAP.md`'s phase-level sequencing at the finer task grain this document operates at — `ROADMAP.md`'s phases remain valid as milestones; this plan is more precise about intra-phase ordering. No conflict, no doc update needed beyond this note.

---

# Macro-stage 1 — Criação do projeto Xcode

**Goal:** a minimal, buildable native app skeleton establishing the physical root of the Presentation layer.
**Depends on:** nothing (repository is clean per `MIGRATION_PLAN.md`).

### 1.1 — Create the Xcode project
- **Objetivo:** create `CoachApp`, SwiftUI App lifecycle, no Core Data/CloudKit template options selected.
- **Criar:** `CoachApp.xcodeproj/`, `CoachApp/CoachApp.swift`, `CoachApp/Assets.xcassets` (default), `CoachApp/Info.plist`.
- **Modificar:** —
- **Depende de:** —
- **Critérios de conclusão:** project opens in Xcode; builds and runs on an iOS 18 simulator showing a placeholder view.
- **Riscos:** picking a wrong template (e.g. UIKit lifecycle, or a data-persistence template that scaffolds Core Data) — verify template choice explicitly before generating.
- **Testes:** manual build + run; nothing automatable yet.
- **Impacto na arquitetura:** establishes `ARCHITECTURE.md` §1's physical root.

### 1.2 — Configure Swift 6 strict concurrency and deployment target
- **Objetivo:** set Swift language mode to Swift 6 (Complete concurrency checking) and deployment target to iOS 18.0 explicitly, not by assumption.
- **Criar:** —
- **Modificar:** `CoachApp.xcodeproj/project.pbxproj` (build settings).
- **Depende de:** 1.1
- **Critérios de conclusão:** build settings inspector confirms both values; a deliberately-introduced data race (temporary, reverted after the check) fails to compile.
- **Riscos:** Xcode defaulting to "Minimal" or "Targeted" concurrency checking instead of "Complete" — must be set explicitly (`RISKS.md` R-12).
- **Testes:** the deliberate-violation compile check described above (one-time, not permanent).
- **Impacto na arquitetura:** enforces the intentional trade-off recorded in `RISKS.md` R-12.

### 1.3 — Verify `.gitignore` against real generated paths
- **Objetivo:** confirm the Swift/Xcode `.gitignore` written during migration actually covers what Xcode generates in practice.
- **Criar:** —
- **Modificar:** `.gitignore` (only if a gap is found).
- **Depende de:** 1.1
- **Critérios de conclusão:** `git status` after a full build shows zero untracked/dirty Xcode-generated files.
- **Riscos:** low.
- **Testes:** manual `git status` check post-build.
- **Impacto na arquitetura:** none.

### 1.4 — Commit the empty, buildable project
- **Objetivo:** get a clean, working baseline into version control before any real code exists.
- **Criar:** the full project skeleton from 1.1–1.3.
- **Modificar:** —
- **Depende de:** 1.1–1.3
- **Critérios de conclusão:** pushed to the working branch; a fresh clone builds without manual setup steps.
- **Riscos:** accidentally committing derived/user-state files — verify against 1.3 before committing.
- **Testes:** fresh-clone build test.
- **Impacto na arquitetura:** none.

**Macro-stage exit criteria:** empty app builds and runs on an iOS 18 simulator, Swift 6 strict concurrency verified on, committed and pushed.

---

# Macro-stage 2 — Configuração da estrutura de pastas e módulos

**Goal:** the Presentation-layer folder skeleton matching `ARCHITECTURE.md` §2 / `REPOSITORY_AUDIT.md` §7 exactly.
**Depends on:** macro-stage 1.

### 2.1 — Create the Presentation folder skeleton
- **Objetivo:** `Composition/`, `Features/{Onboarding,Coach,Progress,Memory,Profile}/`, `DesignSystem/`, `Resources/` groups inside `CoachApp/`.
- **Criar:** the folder groups, each with a minimal placeholder file carrying a one-line doc comment stating its purpose and pointing at the relevant `ARCHITECTURE.md`/`PROJECT.md` section.
- **Modificar:** —
- **Depende de:** 1.1
- **Critérios de conclusão:** structure matches `REPOSITORY_AUDIT.md` §7's tree exactly; build still succeeds with the new (near-empty) groups.
- **Riscos:** drifting from the documented structure "for convenience" — this is exactly what ADR-017 forbids doing based on legacy convenience, and applies equally to inventing new convenience-based structure now.
- **Testes:** build check.
- **Impacto na arquitetura:** physically instantiates `ARCHITECTURE.md` §2's Presentation layout.

### 2.2 — Establish the file-header convention
- **Objetivo:** a one-line file-header comment convention (pointer to the relevant architecture doc section) applied project-wide, documented so it's followed consistently by any future contributor, human or AI.
- **Criar:** —
- **Modificar:** `AGENTS.md` (append the convention as a short, permanent note).
- **Depende de:** 2.1
- **Critérios de conclusão:** convention documented; the placeholder files from 2.1 already follow it.
- **Riscos:** low — mainly a discipline/consistency risk if skipped, not a functional one.
- **Testes:** none (documentation task).
- **Impacto na arquitetura:** supports `RISKS.md` R-04 (continuity) by making intent traceable file-by-file.

**Macro-stage exit criteria:** folder skeleton exists, matches documentation exactly, convention recorded.

---

# Macro-stage 3 — Configuração do Swift Package `CoachKit`

**Goal:** the local package hosting Domain + Data, split into two compiler-enforced targets per ADR-018.
**Depends on:** macro-stage 1.

### 3.1 — Create the `CoachKit` package with two targets
- **Objetivo:** `Package.swift` declaring `CoachKitDomain` (zero dependencies) and `CoachKitData` (depends on `CoachKitDomain`), platform `.iOS(.v18)`.
- **Criar:** `CoachKit/Package.swift`, `CoachKit/Sources/CoachKitDomain/` (placeholder), `CoachKit/Sources/CoachKitData/` (placeholder), `CoachKit/Tests/CoachKitDomainTests/`, `CoachKit/Tests/CoachKitDataTests/` (placeholders).
- **Modificar:** —
- **Depende de:** macro-stage 1
- **Critérios de conclusão:** `swift build` and `swift test` succeed standalone (0 tests, green); platform version matches the app target exactly.
- **Riscos:** platform-version drift between `Package.swift` and the app target's deployment target — cross-check explicitly.
- **Testes:** `swift test` (empty, green).
- **Impacto na arquitetura:** physically instantiates ADR-013 and ADR-018.

### 3.2 — Verify the Domain/Data boundary is compiler-enforced
- **Objetivo:** prove ADR-018's actual point — that `CoachKitDomain` cannot import SwiftData or the Supabase SDK.
- **Criar:** a temporary, throwaway file inside `CoachKitDomain` that attempts `import SwiftData`.
- **Modificar:** — (the throwaway file is deleted immediately after the check).
- **Depende de:** 3.1
- **Critérios de conclusão:** the throwaway import fails to compile (no such dependency); deleted, clean build restored.
- **Riscos:** none — this is itself a risk-reduction/verification task.
- **Testes:** the compile-failure check described above, done once, not kept as a permanent test.
- **Impacto na arquitetura:** confirms ADR-018 holds before anything depends on it.

### 3.3 — Add `CoachKit` as a local package dependency of `CoachApp`
- **Objetivo:** wire the package into the app target.
- **Criar:** —
- **Modificar:** `CoachApp.xcodeproj/project.pbxproj` (package reference), `CoachApp/CoachApp.swift` (a trivial `import CoachKitDomain` smoke line, removed once real usage exists in a later stage).
- **Depende de:** 3.1
- **Critérios de conclusão:** app target builds importing both `CoachKitDomain` and `CoachKitData`; static linking confirmed (not accidentally dynamic — checked against launch-time expectations later in macro-stage 25).
- **Riscos:** dynamic-framework embedding regressing launch time — default to Xcode's automatic (static) choice, revisit only if macro-stage 25 measurements show a problem.
- **Testes:** build + run smoke test.
- **Impacto na arquitetura:** connects Presentation to Domain/Data per `ARCHITECTURE.md` §2.

### 3.4 — Establish internal folder structure within each target
- **Objetivo:** `CoachKitDomain/{Entities,UseCases,Protocols}`, `CoachKitData/{SwiftData,Supabase,Mappers,Sync,Security,AIProvider,Notifications,Audio}`.
- **Criar:** folder groups with placeholder files (per 2.1's convention).
- **Modificar:** —
- **Depende de:** 3.1
- **Critérios de conclusão:** structure matches `ARCHITECTURE.md` §9's layering; every later macro-stage's file paths in this plan resolve into this structure without ad hoc new top-level folders.
- **Riscos:** low.
- **Testes:** build check.
- **Impacto na arquitetura:** finalizes the physical Data-layer subfolder plan referenced throughout the rest of this document.

**Macro-stage exit criteria:** `CoachKit` exists as two compiler-enforced targets, linked into `CoachApp`, internal structure in place, boundary verified.

---

# Macro-stage 4 — Configuração do SwiftData

**Goal:** local persistence models, container, and migration mechanism per `ARCHITECTURE.md` §9.2/§4.
**Depends on:** macro-stage 3.

### 4.1 — Define SwiftData `@Model` classes
- **Objetivo:** `CachedSession`, `CachedVocabularyItem`, `CachedMistake`, `CachedTopic`, `CachedGoal`, `SyncState` — matching `ARCHITECTURE.md` §9.2 field-for-field, each with a doc-comment pointing at its Postgres counterpart table (§9.1).
- **Criar:** `CoachKitData/SwiftData/Models/*.swift` (one file per model).
- **Modificar:** —
- **Depende de:** macro-stage 3
- **Critérios de conclusão:** each model compiles; a unit test creates, inserts, and fetches an instance from an in-memory container successfully.
- **Riscos:** field drift from the Postgres schema — mitigated by the doc-comment cross-reference and by macro-stage 7's mapper tests, which will fail loudly on mismatch.
- **Testes:** XCTest with in-memory `ModelContainer` (`ARCHITECTURE.md` §12) per model.
- **Impacto na arquitetura:** implements the local half of `ARCHITECTURE.md` §9.2.

### 4.2 — Set up the injectable `ModelContainer`
- **Objetivo:** a factory producing a production (on-disk, Data-Protected) or test (in-memory) container, constructor-injectable — never a global singleton (ADR-012).
- **Criar:** `CoachKitData/SwiftData/PersistenceContainerFactory.swift`.
- **Modificar:** —
- **Depende de:** 4.1
- **Critérios de conclusão:** app launches with the production container; data survives a relaunch (manual on-device test); unit tests use the in-memory variant with confirmed isolation between test runs.
- **Riscos:** omitting the explicit Data Protection file-protection level (defaults may not match `NON_FUNCTIONAL_REQUIREMENTS.md` §6) — set explicitly, don't rely on the platform default.
- **Testes:** unit test (in-memory); manual on-device relaunch-persistence test.
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §7's local Data Protection requirement.

### 4.3 — Establish the schema migration mechanism
- **Objetivo:** `VersionedSchema` + `SchemaMigrationPlan` skeleton, even for a single initial version, so the mechanism is proven before real data ever depends on it.
- **Criar:** `CoachKitData/SwiftData/SchemaV1.swift`, `CoachKitData/SwiftData/MigrationPlan.swift`.
- **Modificar:** 4.2's factory to reference the versioned schema.
- **Depende de:** 4.1
- **Critérios de conclusão:** a one-time dry run — add a throwaway field, write a migration step, confirm existing data survives the migration, then revert the throwaway field — passes.
- **Riscos:** deferring this "until it's actually needed" is precisely how migration debt accumulates (`ARCHITECTURE.md` §4) — deliberately front-loaded.
- **Testes:** the dry-run migration test described above.
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §4's migration strategy requirement.

### 4.4 — Model-level unit test suite
- **Objetivo:** validate constraints (e.g. `localID` uniqueness, `syncStatus` enum round-trip) for every model from 4.1.
- **Criar:** `CoachKit/Tests/CoachKitDataTests/SwiftData/*Tests.swift`.
- **Modificar:** —
- **Depende de:** 4.1, 4.2
- **Critérios de conclusão:** all tests green; this stage's coverage contributes to the `NON_FUNCTIONAL_REQUIREMENTS.md` §11 Data-layer ≥50% target (tracked from here, CI-enforced once macro-stage 24 stands up CI).
- **Riscos:** low.
- **Testes:** as described.
- **Impacto na arquitetura:** establishes the coverage baseline for the Data layer.

**Macro-stage exit criteria:** all local models defined and tested, container injectable and Data-Protected, migration mechanism proven with a real dry run.

---

# Macro-stage 5 — Configuração do Supabase

**Goal:** the backend is live, schema deployed, Auth/Storage configured, client SDK wired with safe secret handling.
**Depends on:** none (can run in parallel with macro-stages 1–4).

### 5.1 — Provision the Supabase project
- **Objetivo:** create the project, enable the `pgvector` extension, capture the project URL and anon key.
- **Criar:** — (external/cloud action).
- **Modificar:** —
- **Depende de:** —
- **Critérios de conclusão:** project reachable; `pgvector` confirmed enabled via the SQL editor.
- **Riscos:** forgetting to enable `pgvector` before the first migration references `vector(1536)` columns — sequenced first explicitly to avoid this.
- **Testes:** a sanity `select 1` query.
- **Impacto na arquitetura:** stands up `ARCHITECTURE.md` §9.1's home.

### 5.2 — Write and apply the initial schema migration
- **Objetivo:** implement `ARCHITECTURE.md` §9.1 in full — all tables, indexes (including HNSW on `summary_embedding`), the `streaks` view, and RLS policies (explicitly commented as single-user-permissive for now, per `ARCHITECTURE.md` §7).
- **Criar:** `backend/supabase/migrations/0001_initial_schema.sql` (split into multiple numbered files if that proves cleaner during writing).
- **Modificar:** —
- **Depende de:** 5.1
- **Critérios de conclusão:** migration applies cleanly to a fresh project; every table/index from §9.1 present; a positive (authenticated) and a negative (anonymous/other-user) RLS test both behave correctly.
- **Riscos:** an overly permissive or overly restrictive RLS policy — both tested explicitly, not just the happy path.
- **Testes:** apply-and-smoke-query against a staging project; explicit RLS positive/negative test.
- **Impacto na arquitetura:** the schema becomes real, not just documented.

### 5.3 — Configure Auth and Storage
- **Objetivo:** email/password (or magic-link) Auth; a `transcripts/` Storage bucket with per-user access policy.
- **Criar:** `backend/supabase/migrations/0002_storage_and_auth_policy.sql` (or console-configured + documented here).
- **Modificar:** —
- **Depende de:** 5.1
- **Critérios de conclusão:** a manually created test user can authenticate; that user can upload/read their own file under `transcripts/{user_id}/`; a different/anonymous identity is confirmed denied.
- **Riscos:** the same permissive-policy risk as 5.2 — tested the same explicit way.
- **Testes:** manual Auth + Storage smoke test (positive and negative case).
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §9.3's object-storage design.

### 5.4 — Scaffold the Edge Functions deploy pipeline
- **Objetivo:** prove the deploy mechanism with a trivial function before any real orchestration logic exists.
- **Criar:** `backend/supabase/functions/hello/index.ts`.
- **Modificar:** —
- **Depende de:** 5.1
- **Critérios de conclusão:** function deploys via the Supabase CLI and responds to an HTTPS call.
- **Riscos:** none significant — deliberately de-risks the deploy path early.
- **Testes:** `curl` the deployed endpoint, expect `200`.
- **Impacto na arquitetura:** de-risks macro-stages 9–11's backend dependency.

### 5.5 — Wire the Supabase Swift SDK with safe secret handling
- **Objetivo:** add the SDK to `CoachKitData`, configure the client from a non-committed config file.
- **Criar:** `CoachKitData/Supabase/SupabaseClientFactory.swift`, `Secrets.xcconfig.example` (committed template).
- **Modificar:** `.gitignore` (confirm/adjust the pattern to exactly match `Secrets.xcconfig`, the real, untracked file).
- **Depende de:** 5.1, macro-stage 3
- **Critérios de conclusão:** a debug build successfully calls the live project (e.g. a trivial authenticated query); `git status` after adding real secrets shows `Secrets.xcconfig` as untracked, `Secrets.xcconfig.example` as tracked.
- **Riscos:** **highest risk in this macro-stage** — an accidental secret commit. Mitigated by the template/gitignore split and an explicit `git status` check as part of this task's completion criteria, not an afterthought.
- **Testes:** manual connectivity smoke test; a unit test using a stubbed client (CI never touches the real network).
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §7's "no secrets in the client bundle beyond a short-lived session token" — the anon key is public-safe by Supabase design, but this task still avoids hardcoding it in source for hygiene and easy rotation.

**Macro-stage exit criteria:** live Supabase project with full schema, RLS, Storage, Auth all smoke-tested (positive and negative cases); client SDK wired with no secret ever committed; deploy pipeline proven.

---

# Macro-stage 6 — Sistema de autenticação

**Goal:** full sign-in → Keychain-persisted session → biometric app-lock flow.
**Depends on:** macro-stage 5.5, macro-stage 3.

### 6.1 — Define the `AuthRepository` protocol
- **Objetivo:** `signIn`, `signOut`, `currentSession`, `refreshSession` — framework-free.
- **Criar:** `CoachKitDomain/Protocols/AuthRepository.swift`, a `MockAuthRepository` alongside it in the test target for later ViewModel tests.
- **Modificar:** —
- **Depende de:** macro-stage 3
- **Critérios de conclusão:** compiles with zero framework imports.
- **Riscos:** none.
- **Testes:** N/A (protocol only).
- **Impacto na arquitetura:** implements ADR-006's Repository pattern for Auth specifically.

### 6.2 — Implement `SupabaseAuthRepository` + Keychain session storage
- **Objetivo:** wrap the Supabase Auth client; persist the session token in the iOS Keychain, never `UserDefaults`.
- **Criar:** `CoachKitData/Supabase/SupabaseAuthRepository.swift`, `CoachKitData/Security/KeychainSessionStore.swift`.
- **Modificar:** —
- **Depende de:** 6.1, 5.5
- **Critérios de conclusão:** sign-in with a real test account succeeds; app relaunch restores the session without re-prompting; sign-out clears the Keychain entry (verified by inspecting Keychain state, not just UI behavior).
- **Riscos:** a debugging shortcut leaking the token into `UserDefaults` or logs — explicit code-review checkpoint before this task is considered done.
- **Testes:** unit test with a mocked Keychain wrapper (CI never touches the real Keychain); manual on-device test of the real flow.
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §7's Keychain requirement.

### 6.3 — Sign-in screen and ViewModel
- **Objetivo:** minimal sign-in UI, `SignInViewModel` depending only on `AuthRepository`.
- **Criar:** `CoachApp/Features/Onboarding/SignInView.swift`, `SignInViewModel.swift`.
- **Modificar:** —
- **Depende de:** 6.2
- **Critérios de conclusão:** end-to-end sign-in works on-device/simulator; ViewModel is unit-testable with `MockAuthRepository`, no SwiftUI or network involved in that test.
- **Riscos:** low.
- **Testes:** ViewModel unit test (idle → loading → signedIn/error transitions); one XCUITest for the happy path (`NON_FUNCTIONAL_REQUIREMENTS.md` §11 critical-flow policy).
- **Impacto na arquitetura:** first real Presentation-consumes-Domain-only example — a template for every later screen.

### 6.4 — App-level biometric lock
- **Objetivo:** Face ID/Touch ID gate independent of the Supabase session, default 5-minute re-lock timeout (`NON_FUNCTIONAL_REQUIREMENTS.md` §6).
- **Criar:** `CoachApp/Composition/AppLockCoordinator.swift`.
- **Modificar:** `CoachApp.swift` (wire the lock overlay).
- **Depende de:** 6.3
- **Critérios de conclusão:** backgrounding >5 minutes then foregrounding requires biometrics (or system passcode fallback on non-biometric devices); a clearly marked, debug-build-only bypass exists for development iteration and is verified absent from release builds.
- **Riscos:** the debug bypass accidentally shipping — explicit build-configuration check as part of this task's completion criteria.
- **Testes:** manual (biometrics aren't meaningfully unit-testable); a unit test for the timeout-calculation logic in isolation.
- **Impacto na arquitetura:** implements ADR-011.

### 6.5 — Wire `AuthRepository` into `AppContainer`
- **Objetivo:** composition-root wiring, no direct instantiation elsewhere.
- **Criar:** —
- **Modificar:** `CoachApp/Composition/AppContainer.swift` (created here if it doesn't already minimally exist from 3.3).
- **Depende de:** 6.2
- **Critérios de conclusão:** a grep for `SupabaseAuthRepository(` outside `AppContainer.swift` returns nothing.
- **Riscos:** low.
- **Testes:** the grep check above.
- **Impacto na arquitetura:** implements ADR-012.

**Macro-stage exit criteria:** full sign-in → persisted-session → biometric-gated flow works end-to-end on-device; unit-tested where feasible; one XCUITest covers the critical path.

---

# Macro-stage 7 — Camada de persistência

**Goal:** the Repository layer — the single access path for all local+remote data, closing ADR-006's original gap for real, everywhere, not just in Auth.
**Depends on:** macro-stage 4, macro-stage 5.5.

### 7.1 — Define pure Domain Entities
- **Objetivo:** `Session`, `VocabularyItem`, `Mistake`, `Topic`, `Goal` — framework-free Swift structs.
- **Criar:** `CoachKitDomain/Entities/*.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 3
- **Critérios de conclusão:** compiles, zero framework imports.
- **Riscos:** none.
- **Testes:** N/A (plain data types); exercised indirectly by every test that follows.
- **Impacto na arquitetura:** the Domain-side counterpart to macro-stage 4's SwiftData models and `ARCHITECTURE.md` §9.1's Postgres schema.

### 7.2 — Define Repository protocols
- **Objetivo:** `SessionRepository`, `VocabularyRepository`, `MistakeRepository`, `TopicRepository`, `GoalRepository` — split by entity (ISP, per `ARCHITECTURE_DECISIONS.md` §2.4's SOLID assessment) rather than one fat `MemoryRepository`.
- **Criar:** `CoachKitDomain/Protocols/*Repository.swift`, matching mocks in the test target.
- **Modificar:** —
- **Depende de:** 7.1
- **Critérios de conclusão:** compiles, zero framework imports; each protocol includes pagination/filtering parameters from the start (per `ARCHITECTURE_DECISIONS.md` §12's "design for eventual scope" principle), even where Phase-1 UI doesn't use them yet.
- **Riscos:** under-specifying a protocol now and needing a breaking signature change later — mitigated by the pagination-from-day-one rule just stated.
- **Testes:** N/A (protocols only).
- **Impacto na arquitetura:** the concrete implementation of ADR-006.

### 7.3 — Implement Mappers
- **Objetivo:** SwiftData model ↔ Domain entity ↔ Supabase DTO, one mapper type per entity.
- **Criar:** `CoachKitData/Mappers/*.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 4, 7.1
- **Critérios de conclusão:** round-trip unit test (Domain → SwiftData → Domain, and Domain → DTO → Domain) is lossless for every field.
- **Riscos:** silent field drops on one direction of the mapping — the round-trip test is specifically designed to catch this.
- **Testes:** round-trip unit tests per entity.
- **Impacto na arquitetura:** isolates schema-shape knowledge to exactly one place per entity, per `ARCHITECTURE.md` §2.1.

### 7.4 — Implement concrete Repositories
- **Objetivo:** `DefaultSessionRepository` etc., each internally deciding SwiftData-fast-path vs. remote fetch, per `ARCHITECTURE.md` §2.1's own example.
- **Criar:** `CoachKitData/Repositories/*.swift`.
- **Modificar:** —
- **Depende de:** 7.2, 7.3, macro-stage 4, macro-stage 5.5
- **Critérios de conclusão:** unit test fetches/saves through a repository using an in-memory SwiftData container plus a stubbed Supabase client — zero SwiftUI/UIKit involvement anywhere in the test.
- **Riscos:** **this is the task most likely to reintroduce the original ADR-006 violation if rushed.** Explicit gate: a grep for `import SwiftData` or the Supabase SDK import outside `CoachKitData` must return nothing — checked as part of this task's completion, not left to eventual code review.
- **Testes:** per-repository unit tests (in-memory container + mock remote); contributes to `NON_FUNCTIONAL_REQUIREMENTS.md` §11's Data-layer coverage target.
- **Impacto na arquitetura:** this is ADR-006, fully realized — the review's top finding, closed for real.

### 7.5 — Wire Repositories into `AppContainer`
- **Objetivo:** composition-root wiring.
- **Criar:** —
- **Modificar:** `AppContainer.swift`.
- **Depende de:** 7.4
- **Critérios de conclusão:** no direct repository instantiation anywhere outside `AppContainer`.
- **Riscos:** low.
- **Testes:** grep check, as in 6.5.
- **Impacto na arquitetura:** ADR-012 applied consistently.

**Macro-stage exit criteria:** full Repository layer implemented and unit-tested; Presentation has zero direct SwiftData/Supabase imports anywhere in the codebase, verified by an explicit grep gate, not assumed.

---

# Macro-stage 8 — Camada de sincronização

**Goal:** `SyncCoordinator` — idempotent upload, watermark-based pull, conflict rules, derived streaks, background scheduling.
**Depends on:** macro-stage 7.

### 8.1 — Define `SyncCoordinating` and pending-changes exposure
- **Objetivo:** the Domain-facing sync contract.
- **Criar:** `CoachKitDomain/Protocols/SyncCoordinating.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 7
- **Critérios de conclusão:** compiles, framework-free.
- **Riscos:** none.
- **Testes:** N/A.
- **Impacto na arquitetura:** the Domain-side counterpart to `ARCHITECTURE.md` §4.

### 8.2 — Implement the upload path (idempotent)
- **Objetivo:** upsert `pendingUpload`-flagged local records to Supabase keyed by `localID`; retry-with-backoff on failure.
- **Criar:** `CoachKitData/Sync/SyncUploader.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 7
- **Critérios de conclusão:** a unit test simulating an interrupted-then-retried upload confirms **no duplicate remote row is created** — the single most important test in this macro-stage, directly validating ADR-007.
- **Riscos:** this is exactly the failure mode ADR-007 exists to prevent — tested explicitly, not assumed correct by code inspection alone.
- **Testes:** the interrupted-retry unit test described above, plus a normal-path upload test.
- **Impacto na arquitetura:** implements ADR-007's idempotency requirement.

### 8.3 — Implement the pull path (watermark, paginated, conflict-aware)
- **Objetivo:** fetch remote changes since the local watermark, paginated; apply append-only-insert vs. server-timestamp-wins rules; queue a non-blocking conflict notice when a local value is superseded.
- **Criar:** `CoachKitData/Sync/SyncPuller.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 7
- **Critérios de conclusão:** a unit test with a seeded "server has a newer value" scenario confirms the local value is overwritten **and** a conflict notice is queued — a silent overwrite is a test failure, not an acceptable outcome.
- **Riscos:** silent conflict resolution (the exact failure mode `RISKS.md` R-11 names) — tested explicitly.
- **Testes:** conflict-scenario unit test; a long-offline-period pagination test (many changed rows).
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §4's conflict rules.

### 8.4 — Implement derived `streaks`
- **Objetivo:** streak values computed from `sessions`, never independently stored/synced.
- **Criar:** the client-side query logic (or a call into the Postgres view from 5.2, depending on which is cleaner once 5.2 is written).
- **Modificar:** `SessionRepository` (expose a `currentStreak()`/`longestStreak()` accessor).
- **Depende de:** 5.2, macro-stage 7
- **Critérios de conclusão:** unit test matches a hand-computed expectation from a seeded `sessions` fixture; **a grep for any write path to a `streaks` table/field anywhere in the codebase returns nothing** — enforcing ADR-007's "derived, not synced" rule structurally, not just by test.
- **Riscos:** someone adding a "quick" mutable streak field later out of convenience — the grep check exists specifically to catch this at any future point, not just now.
- **Testes:** the hand-computed unit test and the grep check above.
- **Impacto na arquitetura:** implements ADR-007's derived-value design.

### 8.5 — Background sync scheduling
- **Objetivo:** `BGTaskScheduler` registration + foreground/background lifecycle triggers, conservative interval (hourly+, `ARCHITECTURE.md` §13).
- **Criar:** `CoachApp/Composition/BackgroundSyncScheduler.swift`.
- **Modificar:** `CoachApp.swift` (register task identifiers), `Info.plist` (`BGTaskSchedulerPermittedIdentifiers`).
- **Depende de:** 8.2, 8.3
- **Critérios de conclusão:** Xcode's background-task debug simulation confirms the task fires and triggers a sync.
- **Riscos:** an interval too aggressive for battery (`NON_FUNCTIONAL_REQUIREMENTS.md` §2) — set conservatively per the architecture's stated design, validated for real in macro-stage 25.
- **Testes:** manual background-task simulation.
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §13's battery-conscious sync scheduling.

### 8.6 — Minimal sync status indicator
- **Objetivo:** a functional (not yet fully styled) pending-changes/"syncing…" affordance, per `DESIGN_SYSTEM.md` §8 — full visual polish deferred to macro-stage 13.
- **Criar:** a small reusable `SyncStatusIndicator` view.
- **Modificar:** —
- **Depende de:** 8.1
- **Critérios de conclusão:** shows a non-zero pending count when one exists; updates when sync completes.
- **Riscos:** low.
- **Testes:** ViewModel-level unit test on the pending-count binding.
- **Impacto na arquitetura:** the first visible evidence that sync conflicts are "never silent" (`RISKS.md` R-11).

**Macro-stage exit criteria:** full bidirectional sync working end-to-end on-device against the live Supabase project; idempotency and conflict-notice behavior proven by tests (not just designed); background scheduling verified.

---

# Macro-stage 9 — Memory Engine

**Goal:** the backend memory pipeline — extraction, learner-profile rollup, hybrid semantic retrieval — proven against fixtures.
**Depends on:** macro-stage 5, macro-stage 7 (schema/repositories to write into); partially depends forward on macro-stage 10 for the actual LLM call (noted per-task).

### 9.1 — Memory Extraction Edge Function
- **Objetivo:** given an uploaded transcript, extract vocabulary/mistakes/topic-coverage/summary+embedding and write to Postgres, per `ARCHITECTURE.md` §5.2.
- **Criar:** `backend/supabase/functions/memory-extraction/index.ts`.
- **Modificar:** —
- **Depende de:** macro-stage 5; the LLM call itself is stubbed/mocked until macro-stage 10 lands, then completed (noted explicitly here rather than blocking this task entirely on a later stage).
- **Critérios de conclusão:** given a fixture transcript, produces correctly-shaped rows in `vocabulary_items`/`mistakes`/`topics` and a valid `summary_embedding`.
- **Riscos:** extraction *quality* is a content risk owned by `PROMPT_ENGINE.md`, not re-litigated here — this task's risk surface is structural (row shape), not content.
- **Testes:** integration test against a staging Supabase project with a fixture transcript, asserting row shapes.
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §5.2's extraction job.

### 9.2 — Learner Profile Updater Edge Function
- **Objetivo:** incremental merge-update of `learner_profile` (ADR-009), not a regenerate-from-scratch.
- **Criar:** `backend/supabase/functions/learner-profile-updater/index.ts`.
- **Modificar:** —
- **Depende de:** 9.1
- **Critérios de conclusão:** two sequential fixture sessions produce a `version` increment and a summary referencing facts from both sessions, not just the latest one.
- **Riscos:** a naive implementation that overwrites instead of merges — the two-session fixture test is designed specifically to catch this.
- **Testes:** integration test, two-session fixture sequence.
- **Impacto na arquitetura:** implements ADR-009's hierarchical memory design.

### 9.3 — Hybrid semantic retrieval
- **Objetivo:** filter-then-rank `pgvector` query (category/recency filter first, then similarity), reusable across the Session Orchestrator and future memory-search UI.
- **Criar:** `backend/supabase/functions/_shared/memory-retrieval.ts`.
- **Modificar:** —
- **Depende de:** 5.2 (HNSW index), 9.1
- **Critérios de conclusão:** given a fixture set of embedded sessions, a topic query returns correctly filtered-then-ranked results.
- **Riscos:** pure vector search without the filter step (imprecise, slower at scale) — explicitly tested against the filter-then-rank behavior, not just "returns something."
- **Testes:** unit test with fixture vectors and known expected ranking.
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §5.2's hybrid retrieval design.

### 9.4 — Client-side `SearchMemoryUseCase`
- **Objetivo:** Domain use case + a minimal Data-layer call to a memory-search backend endpoint — groundwork; full UI lands in macro-stage 19.
- **Criar:** `CoachKitDomain/UseCases/SearchMemoryUseCase.swift`, a corresponding Data-layer adapter.
- **Modificar:** —
- **Depende de:** 9.3, macro-stage 7
- **Critérios de conclusão:** unit test with a mocked backend response returns correctly-shaped Domain entities.
- **Riscos:** low.
- **Testes:** unit test as described.
- **Impacto na arquitetura:** first client-side consumer of the Memory Engine, template for macro-stage 19's UI.

**Macro-stage exit criteria:** the full backend memory pipeline (extraction, profile update, retrieval) proven end-to-end against fixtures; client-side use case ready for later UI.

---

# Macro-stage 10 — AI Provider

**Goal:** `ConversationEngine`/`MemoryExtractionEngine` abstraction, Claude adapter, and a second reference adapter validating the abstraction isn't leaky (`TASKS.md` T0-13).
**Depends on:** macro-stage 9, macro-stage 6 (caller identity).

### 10.1 — Define provider-neutral Domain protocols and types
- **Objetivo:** `ConversationEngine`, `MemoryExtractionEngine` protocols and pure types `SessionContext`, `ConversationChunk`, `MemoryUpdate` — no vendor SDK types crossing this boundary, per `PROMPT_ENGINE.md` §7's hard rule.
- **Criar:** `CoachKitDomain/Protocols/ConversationEngine.swift`, `MemoryExtractionEngine.swift`, `CoachKitDomain/Entities/SessionContext.swift`, `ConversationChunk.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 3
- **Critérios de conclusão:** compiles, zero framework/vendor imports.
- **Riscos:** a vendor-specific field leaking into `SessionContext` "just this once" — reviewed against `PROMPT_ENGINE.md` §7 explicitly at this task's architecture-review step.
- **Testes:** N/A (protocols/types only).
- **Impacto na arquitetura:** the concrete implementation of ADR-002/ADR-005's decoupling requirement.

### 10.2 — Session Orchestrator Edge Function
- **Objetivo:** assemble the context package exactly per `PROMPT_ENGINE.md` §7–8 (persona/rules, `learner_profile`, adaptive focus, retrieved memories, recent turns — all token-capped), call Claude, stream the response.
- **Criar:** `backend/supabase/functions/session-orchestrator/index.ts`.
- **Modificar:** —
- **Depende de:** macro-stage 9, macro-stage 6
- **Critérios de conclusão:** a fixture request produces a context package matching `PROMPT_ENGINE.md` §13's template structure; a live call returns a coherent streamed response; an oversized fixture (more mistakes/vocab than the caps allow) confirms the caps are actually enforced, not just documented.
- **Riscos:** token-budget creep as fixtures grow — the oversized-fixture test exists specifically to catch this before it becomes a real cost problem (`RISKS.md` R-06).
- **Testes:** unit test on context assembly (pure function, testable without hitting Claude) plus the cap-enforcement test; a manual/integration smoke test for the live call.
- **Impacto na arquitetura:** implements `PROMPT_ENGINE.md` §7–9 and `ARCHITECTURE.md` §5.1.

### 10.3 — `ClaudeConversationEngine` client adapter
- **Objetivo:** calls the Session Orchestrator endpoint (never Claude directly, per `ARCHITECTURE.md` §3), exposes `AsyncStream<ConversationChunk>`.
- **Criar:** `CoachKitData/AIProvider/ClaudeConversationEngine.swift`.
- **Modificar:** —
- **Depende de:** 10.1, 10.2
- **Critérios de conclusão:** unit test with a mocked HTTP/stream response confirms correct chunk decoding; a grep confirms no Anthropic SDK dependency anywhere in `CoachApp` or `CoachKitData`'s client-facing code (only the backend talks to Claude).
- **Riscos:** low, given the grep check.
- **Testes:** unit test with a mocked stream; the grep check.
- **Impacto na arquitetura:** implements the "client never calls Claude directly" rule concretely.

### 10.4 — Second reference `ConversationEngine` adapter (LSP validation)
- **Objetivo:** implement a minimal alternative adapter purely to prove the protocol boundary holds (`TASKS.md` T0-13, ADR-005's LSP assessment).
- **Criar:** `CoachKitData/AIProvider/DebugEchoConversationEngine.swift` (a trivial canned/echo adapter — not a shipped feature).
- **Modificar:** `AppContainer.swift` (temporarily swap engines to prove the point).
- **Depende de:** 10.1
- **Critérios de conclusão:** swapping between the two adapters in `AppContainer` requires **zero changes** to any ViewModel or Use Case — this is the actual test.
- **Riscos:** none — this task exists to reduce risk elsewhere.
- **Testes:** the swap-and-rebuild exercise, done once and recorded as passed in this plan's stage sign-off (not a permanent CI test, since the debug adapter isn't shipped).
- **Impacto na arquitetura:** upgrades ADR-005's LSP assessment from "untested until a second adapter exists" (as originally flagged in `ARCHITECTURE_DECISIONS.md` §2.4) to verified.

### 10.5 — `MemoryExtractionEngine` client adapter
- **Objetivo:** thin client-side trigger/monitor for the backend-driven extraction job (macro-stage 9 does the real work).
- **Criar:** `CoachKitData/AIProvider/BackendMemoryExtractionEngine.swift`.
- **Modificar:** —
- **Depende de:** 9.1, 10.1
- **Critérios de conclusão:** triggering extraction from the client results in a queued/completed job status observable from the client.
- **Riscos:** low.
- **Testes:** unit test with a mocked backend response.
- **Impacto na arquitetura:** completes the Engine-protocol trio from `ARCHITECTURE.md` §2.

### 10.6 — Cost/usage instrumentation
- **Objetivo:** log engine, latency, tokens, cost, outcome, fallback-flag on every AI call, per `OBSERVABILITY.md` §7.
- **Criar:** `CoachKitData/AIProvider/AICallLogger.swift`.
- **Modificar:** 10.2 (backend), 10.3 (client) to emit log events.
- **Depende de:** 10.2, 10.3
- **Critérios de conclusão:** a live call produces a structured log entry with every required field.
- **Riscos:** low.
- **Testes:** unit test on the logging structure/fields; manual verification of a live entry.
- **Impacto na arquitetura:** implements `OBSERVABILITY.md` §7, feeds the future cost dashboard (macro-stage 20.6) and `RISKS.md` R-06's mitigation.

### 10.7 — Wire engines into `AppContainer`
- **Objetivo:** composition-root wiring, `ClaudeConversationEngine` as the real default (10.4's adapter removed or debug-gated).
- **Criar:** —
- **Modificar:** `AppContainer.swift`.
- **Depende de:** 10.3, 10.4, 10.5
- **Critérios de conclusão:** production build uses only the real adapters.
- **Riscos:** the debug adapter accidentally shipping — verified against build configuration.
- **Testes:** build-configuration check.
- **Impacto na arquitetura:** ADR-012 applied.

**Macro-stage exit criteria:** text conversation works end-to-end (client → backend orchestrator → Claude → streamed back); provider-swap validated via the second adapter; cost logging in place.

---

# Macro-stage 11 — Voice Engine

**Goal:** OpenAI Realtime primary path + native Speech/AVSpeechSynthesizer fallback, with reconnection and interruption handling, per `ARCHITECTURE.md` §5.4.
**Depends on:** macro-stage 9, macro-stage 10.

### 11.1 — Define `VoiceEngine` protocol and voice-state types
- **Objetivo:** framework-free protocol + state enum (idle/listening/thinking/speaking/reconnecting), matching `DESIGN_SYSTEM.md` §5.3's state list exactly.
- **Criar:** `CoachKitDomain/Protocols/VoiceEngine.swift`, `CoachKitDomain/Entities/VoiceState.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 3
- **Critérios de conclusão:** compiles, zero framework imports; state names match the design spec exactly (avoids a naming mismatch surfacing only when macro-stage 13/17 build the UI).
- **Riscos:** low.
- **Testes:** N/A (types only).
- **Impacto na arquitetura:** the Domain contract both the primary and fallback engines conform to.

### 11.2 — Ephemeral Realtime token issuance
- **Objetivo:** backend endpoint issuing short-lived OpenAI Realtime tokens, seeded with `learner_profile` + adaptive focus, never exposing the raw OpenAI key client-side.
- **Criar:** `backend/supabase/functions/voice-session-token/index.ts`.
- **Modificar:** —
- **Depende de:** macro-stage 9, 10.2
- **Critérios de conclusão:** token issuance works, expires appropriately, and is scoped (cannot be reused for unrelated OpenAI endpoints).
- **Riscos:** an overly broad token scope — tested by attempting an out-of-scope call and confirming denial.
- **Testes:** integration test (issue, use, expire, out-of-scope-denial).
- **Impacto na arquitetura:** implements the "client never holds a raw vendor key" rule for the voice provider.

### 11.3 — `OpenAIRealtimeVoiceEngine` client adapter
- **Objetivo:** audio capture/playback via AVFoundation, streaming session to OpenAI Realtime using the backend-issued token.
- **Criar:** `CoachKitData/AIProvider/OpenAIRealtimeVoiceEngine.swift`, `CoachKitData/Audio/AudioSessionManager.swift`.
- **Modificar:** —
- **Depende de:** 11.1, 11.2
- **Critérios de conclusão:** a live voice round-trip works end-to-end on-device; measured latency logged against the `NON_FUNCTIONAL_REQUIREMENTS.md` §1/§9 budget (met or not — measured either way, per macro-stage 25's philosophy).
- **Riscos:** **`RISKS.md` R-01 — the least-proven part of the whole architecture.** A latency miss on the first pass is expected, not a plan failure; budget real iteration time here rather than treating this as a one-shot task.
- **Testes:** manual on-device latency measurement (not meaningfully unit-testable); `AudioSessionManager`'s interruption-handling logic unit-tested in isolation with mocked `AVAudioSession` notifications.
- **Impacto na arquitetura:** implements the primary voice path of `ARCHITECTURE.md` §5.4.

### 11.4 — Native fallback `VoiceEngine` adapter
- **Objetivo:** `Speech` framework recognition + `AVSpeechSynthesizer` output, using last-cached context, working fully offline.
- **Criar:** `CoachKitData/AIProvider/NativeFallbackVoiceEngine.swift`.
- **Modificar:** —
- **Depende de:** 11.1
- **Critérios de conclusão:** works in airplane mode (manual test); produces a usable, if less rich, conversational turn.
- **Riscos:** low — this task itself is a risk-reduction measure for 11.3.
- **Testes:** manual offline smoke test; unit test for the transcript-to-response glue logic (mocking the Speech/AVSpeechSynthesizer calls themselves, which aren't practically unit-testable).
- **Impacto na arquitetura:** implements the fallback path of `ARCHITECTURE.md` §5.4, a benefit unique to the native platform choice (D1).

### 11.5 — Reconnection-before-fallback coordination
- **Objetivo:** short backoff retry on a Realtime drop, then automatic switch to the native fallback, exposed to Presentation as a single `VoiceEngine`-conforming facade.
- **Criar:** `CoachKitData/AIProvider/VoiceEngineCoordinator.swift`.
- **Modificar:** —
- **Depende de:** 11.3, 11.4
- **Critérios de conclusão:** a simulated network drop (Network Link Conditioner, or manual airplane-mode-mid-call) results in an automatic, session-preserving fallback switch, not a hard failure.
- **Riscos:** genuinely tricky coordination logic — allocate real test time, not a rubber-stamp pass.
- **Testes:** unit tests for the state-machine transitions (drop → retry → retry-exhausted → fallback) using a fake clock and mock engines; manual on-device test for the real-world case.
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §5.4's reconnection-before-fallback design.

### 11.6 — Interruption handling
- **Objetivo:** pause and persist partial transcript immediately on `AVAudioSession` interruption (phone call, Siri, etc.).
- **Criar:** —
- **Modificar:** `AudioSessionManager.swift`.
- **Depende de:** 11.3
- **Critérios de conclusão:** a real triggered interruption mid-session (manual test — simulate an incoming call) results in no data loss and a graceful resume.
- **Riscos:** low, but high-value if missed (a mid-sentence data loss directly contradicts Principle 1).
- **Testes:** manual interruption test.
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §5.4's interruption-handling requirement.

### 11.7 — Pronunciation mistake capture
- **Objetivo:** feed Realtime-path pronunciation signals into the `mistakes` table.
- **Criar:** —
- **Modificar:** `OpenAIRealtimeVoiceEngine.swift` (emit signals), `MistakeRepository` consumer wiring.
- **Depende de:** 11.3, macro-stage 7, macro-stage 9
- **Critérios de conclusão:** a fixture voice session with a known mispronunciation produces a corresponding `mistakes` row.
- **Riscos:** low.
- **Testes:** integration test with a fixture audio/transcript.
- **Impacto na arquitetura:** closes the loop from `ARCHITECTURE.md` §5.4 back into the Memory Engine.

**Macro-stage exit criteria:** full voice conversation loop works; fallback and reconnection proven under simulated failure; latency measured against budget (met or explicitly tracked as a gap, per `RISKS.md` R-01's acknowledged iteration need).

---

# Macro-stage 12 — Learning Engine

**Goal:** implement every `LEARNING_ENGINE.md` formula and verify each against the document's own worked examples.
**Depends on:** macro-stage 7, macro-stage 9, macro-stage 11 (for scoring signals).

### 12.1 — SM-2 spaced repetition
- **Objetivo:** pure, framework-free implementation of `LEARNING_ENGINE.md` §2.
- **Criar:** `CoachKitDomain/Learning/SpacedRepetition.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 3
- **Critérios de conclusão:** table-driven unit tests reproduce §2's worked examples exactly (a q=5 sequence, a q<3 reset, the 1.3 ease-factor floor).
- **Riscos:** low — this is pure math, the most testable task in the whole plan.
- **Testes:** exhaustive table-driven tests, targeting near-100% coverage for this file specifically.
- **Impacto na arquitetura:** the canonical, tested implementation `ARCHITECTURE.md` §5.3 and `PROMPT_ENGINE.md` §5 both reference.

### 12.2 — Adaptive priority scheduler
- **Objetivo:** `priority(topic)` (`ARCHITECTURE.md` §5.3 / `LEARNING_ENGINE.md` §3) as a backend function, with a client-visible explanation payload for the "why this lesson" view (macro-stage 19.5).
- **Criar:** `backend/supabase/functions/adaptive-scheduler/index.ts`.
- **Modificar:** —
- **Depende de:** 12.1, macro-stage 7, macro-stage 9
- **Critérios de conclusão:** a fixture account state produces output matching a hand-computed expectation.
- **Riscos:** formula drift from `LEARNING_ENGINE.md` §3's documented weights — the hand-computed test is the guard against this.
- **Testes:** integration test against fixture data.
- **Impacto na arquitetura:** implements the scheduler `ARCHITECTURE.md` §5.3 describes at the design level.

### 12.3 — CEFR level progression
- **Objetivo:** promotion-criteria evaluation (weekly) + soft-demotion logic, per `LEARNING_ENGINE.md` §4.
- **Criar:** `backend/supabase/functions/level-progression/index.ts`.
- **Modificar:** —
- **Depende de:** 12.2
- **Critérios de conclusão:** fixture scenarios for promotion-eligible and not-eligible accounts produce correct outcomes; a soft-demotion scenario is confirmed to **never** mutate `cefr_level` directly (grep/assertion check, matching the "soft, not formal" rule exactly).
- **Riscos:** an implementation shortcut that mutates `cefr_level` on demotion "just this once" — explicitly guarded against.
- **Testes:** fixture-scenario integration tests, both directions.
- **Impacto na arquitetura:** implements `LEARNING_ENGINE.md` §4's state machine.

### 12.4 — Weak-point detection and clustering
- **Objetivo:** recurring-mistake flagging and macro-topic sub-tag clustering, per `LEARNING_ENGINE.md` §5.
- **Criar:** part of 12.2's scheduler function or a dedicated shared helper, decided during implementation based on what's cleanest.
- **Modificar:** —
- **Depende de:** 12.2, macro-stage 9
- **Critérios de conclusão:** a fixture with 3+ mistakes sharing a sub-tag produces a flagged macro-topic weak point even without a matching `topics` row.
- **Riscos:** low.
- **Testes:** fixture-based integration test.
- **Impacto na arquitetura:** implements `LEARNING_ENGINE.md` §5.

### 12.5 — Fluency and Confidence Score computation
- **Objetivo:** composite, EMA-smoothed scores per `LEARNING_ENGINE.md` §8/§9.
- **Criar:** `backend/supabase/functions/_shared/scoring.ts`.
- **Modificar:** —
- **Depende de:** macro-stage 11 (transcript timing signals), macro-stage 9
- **Critérios de conclusão:** fixture session data produces scores matching a hand-computed expectation; a multi-session fixture sequence confirms EMA smoothing behaves as specified (one outlier session doesn't whipsaw the trend).
- **Riscos:** formula drift from the documented weights — guarded by the hand-computed test, same pattern as 12.2.
- **Testes:** table-driven unit tests using §8/§9's exact weighting formulas.
- **Impacto na arquitetura:** implements `LEARNING_ENGINE.md` §8/§9 for real.

### 12.6 — Recommendation system
- **Objetivo:** priority-ordered surfacing logic (event prep > weak topic > review backlog > plateau > milestone), per `LEARNING_ENGINE.md` §10.
- **Criar:** part of the scheduler function, or a dedicated `recommendation.ts` helper.
- **Modificar:** —
- **Depende de:** 12.2–12.5
- **Critérios de conclusão:** fixture scenarios for each priority tier produce the expected top recommendation, including an explicit tie-break case.
- **Riscos:** low.
- **Testes:** fixture-scenario integration tests, one per tier plus the tie-break case.
- **Impacto na arquitetura:** implements `LEARNING_ENGINE.md` §10.

### 12.7 — Client `GetAdaptiveFocusUseCase`
- **Objetivo:** consumes the backend scheduler/recommendation output.
- **Criar:** `CoachKitDomain/UseCases/GetAdaptiveFocusUseCase.swift`.
- **Modificar:** —
- **Depende de:** 12.2, 12.6, macro-stage 7
- **Critérios de conclusão:** unit test with a mocked backend response returns correctly-shaped Domain data, including the reserved `upcomingEvent` parameter (`ARCHITECTURE.md` §5.3) even though no UI sets it yet.
- **Riscos:** low.
- **Testes:** unit test as described.
- **Impacto na arquitetura:** the client-side entry point every screen in macro-stages 16–19 will use.

**Macro-stage exit criteria:** every `LEARNING_ENGINE.md` formula implemented and tested against the document's own worked examples — the spec becomes verified behavior, not just prose.

---

# Macro-stage 13 — Design System

**Goal:** implement `DESIGN_SYSTEM.md`'s token set and component library — built once, consumed by every screen from macro-stage 15 onward (see §3's sequencing note on why this comes before screens rather than after, per `ROADMAP.md` Phase 5's original placement).
**Depends on:** macro-stage 2.

### 13.1 — Color tokens
- **Objetivo:** Asset Catalog color sets for every `DESIGN_SYSTEM.md` §2 token, light and dark values both.
- **Criar:** `CoachApp/Resources/Assets.xcassets/Colors/*.colorset`.
- **Modificar:** —
- **Depende de:** macro-stage 2
- **Critérios de conclusão:** a contrast check (manual or a small XCTest computing contrast ratios from the asset values) confirms WCAG AA on every text/background pair, both modes (`NON_FUNCTIONAL_REQUIREMENTS.md` §7).
- **Riscos:** a token passing in one mode but not the other — checked explicitly for both, not just the default.
- **Testes:** the contrast-ratio check described above.
- **Impacto na arquitetura:** implements `DESIGN_SYSTEM.md` §2 for real.

### 13.2 — Typography tokens
- **Objetivo:** `Font` extension mapping `DESIGN_SYSTEM.md` §3's style table to Dynamic-Type-aware text styles.
- **Criar:** `CoachApp/DesignSystem/Typography.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 2
- **Critérios de conclusão:** manual visual check at the AX5 Dynamic Type size confirms nothing clips (`NON_FUNCTIONAL_REQUIREMENTS.md` §7).
- **Riscos:** low.
- **Testes:** manual AX5 check.
- **Impacto na arquitetura:** implements `DESIGN_SYSTEM.md` §3.

### 13.3 — Spacing tokens
- **Objetivo:** the 4pt-scale spacing constants from `DESIGN_SYSTEM.md` §4.
- **Criar:** `CoachApp/DesignSystem/Spacing.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 2
- **Critérios de conclusão:** compiles, used consistently (spot-checked in 13.4's components).
- **Riscos:** low.
- **Testes:** N/A (constants).
- **Impacto na arquitetura:** implements `DESIGN_SYSTEM.md` §4.

### 13.4 — Core component library
- **Objetivo:** Button variants, Card variants, text/voice inputs, Toggle wrapper, Toast/notice — per `DESIGN_SYSTEM.md` §5.
- **Criar:** `CoachApp/DesignSystem/Components/*.swift`.
- **Modificar:** —
- **Depende de:** 13.1–13.3
- **Critérios de conclusão:** each component has a SwiftUI preview covering light/dark × default/AX5 Dynamic Type × relevant states (success/warning where applicable); every interactive component has a VoiceOver label present (spot-checked).
- **Riscos:** a component technically working but missing an accessibility label — checked per component, not just for the screen it first appears on.
- **Testes:** preview-based manual visual review; accessibility-label presence check per component.
- **Impacto na arquitetura:** implements `DESIGN_SYSTEM.md` §5, the shared vocabulary every later screen is built from.

### 13.5 — Native navigation shell
- **Objetivo:** `TabView`/`NavigationStack` (ADR-016), four tabs: Coach, Progress, Memory, Profile.
- **Criar:** `CoachApp/Composition/RootTabView.swift`.
- **Modificar:** —
- **Depende de:** 13.4
- **Critérios de conclusão:** tab switching works; VoiceOver announces tab labels correctly.
- **Riscos:** low.
- **Testes:** manual VoiceOver check.
- **Impacto na arquitetura:** implements `DESIGN_SYSTEM.md` §5.4 / ADR-016.

### 13.6 — Motion tokens with Reduce Motion fallbacks
- **Objetivo:** reusable animation modifiers per `DESIGN_SYSTEM.md` §6, each respecting `UIAccessibility.isReduceMotionEnabled`.
- **Criar:** `CoachApp/DesignSystem/Motion.swift`.
- **Modificar:** —
- **Depende de:** —
- **Critérios de conclusão:** toggling Reduce Motion in the simulator's accessibility settings visibly changes the fallback behavior (manual test, per modifier).
- **Riscos:** a modifier that "forgets" the Reduce Motion check — spot-checked per modifier at this task's completion, not assumed.
- **Testes:** the manual toggle check above, once per modifier.
- **Impacto na arquitetura:** implements `DESIGN_SYSTEM.md` §6/§11.

### 13.7 — Haptic feedback helper
- **Objetivo:** the light/success/warning/selection haptic categories from `DESIGN_SYSTEM.md` §7.
- **Criar:** `CoachApp/DesignSystem/Haptics.swift`.
- **Modificar:** —
- **Depende de:** —
- **Critérios de conclusão:** manual on-device check confirms each category fires distinctly and respects system haptics-off settings.
- **Riscos:** low.
- **Testes:** manual on-device check.
- **Impacto na arquitetura:** implements `DESIGN_SYSTEM.md` §7.

**Macro-stage exit criteria:** full token set and component library implemented, previewable, accessibility-verified in both appearance modes; native nav shell in place.

---

# Macro-stage 14 — Navegação

**Goal:** the routing/state layer connecting the tab shell to feature screens and handling first-run entry logic.
**Depends on:** macro-stage 13, macro-stage 6.

### 14.1 — Define route/destination types
- **Objetivo:** `AppRoute`/`Destination` enums per feature — Presentation-only, not a Domain concern.
- **Criar:** `CoachApp/Composition/Navigation/AppRoute.swift`.
- **Modificar:** —
- **Depende de:** 13.5
- **Critérios de conclusão:** compiles, covers every screen anticipated in macro-stages 15–22 (even if those screens don't exist yet — this is a namespace, not implementation).
- **Riscos:** low.
- **Testes:** N/A (types only).
- **Impacto na arquitetura:** none beyond Presentation-layer organization.

### 14.2 — Navigation coordinator
- **Objetivo:** central (or per-tab) coordinator wrapping `NavigationStack` path bindings, avoiding hard-coded view-to-view navigation calls.
- **Criar:** `CoachApp/Composition/Navigation/NavigationCoordinator.swift`.
- **Modificar:** —
- **Depende de:** 13.5, 14.1
- **Critérios de conclusão:** a unit test drives the coordinator through a sequence of pushes/pops and asserts the resulting path — no SwiftUI runtime needed.
- **Riscos:** low.
- **Testes:** the unit test described above.
- **Impacto na arquitetura:** keeps navigation testable and decoupled from individual views.

### 14.3 — First-run routing logic
- **Objetivo:** unauthenticated → sign-in → onboarding → main tabs; returning user → biometric lock → main tabs.
- **Criar:** —
- **Modificar:** `CoachApp.swift` / `RootTabView.swift`.
- **Depende de:** macro-stage 6, 14.2
- **Critérios de conclusão:** manual test of all three entry states (fresh install, session-expired-returning, authenticated-returning) routes correctly.
- **Riscos:** an edge case (e.g. expired session detected mid-navigation) routing incorrectly — tested explicitly as its own case, not folded into the two obvious ones.
- **Testes:** manual test of all three (plus the expired-mid-navigation edge case).
- **Impacto na arquitetura:** ties macro-stage 6's auth flow to the rest of the app for the first time.

**Macro-stage exit criteria:** navigation graph and first-run routing logic in place and tested, ready for real screens.

---

# Macro-stage 15 — Onboarding

**Goal:** the first-session calibration flow that seeds `learner_profile`/CEFR estimate from zero, resolving `RISKS.md` R-08.
**Depends on:** macro-stage 10, macro-stage 13, macro-stage 14.

### 15.1 — Finalize the calibration flow structure
- **Objetivo:** confirm/finalize the exact conversation structure (welcome → goals interview → level-calibration mini-conversation → summary) if not already fully settled by earlier planning (`TASKS.md` T0-09/T0-11).
- **Criar:** — (a short internal spec note if genuinely still open; otherwise this task closes immediately by reference to existing planning).
- **Modificar:** —
- **Depende de:** —
- **Critérios de conclusão:** a concrete, step-by-step flow exists to build screens against.
- **Riscos:** proceeding to 15.2 with an under-specified flow — this task exists specifically to prevent that.
- **Testes:** N/A (planning task).
- **Impacto na arquitetura:** none.

### 15.2 — Onboarding screens and ViewModel
- **Objetivo:** implement the flow from 15.1, reusing `ConversationEngine` in a "calibration mode."
- **Criar:** `CoachApp/Features/Onboarding/*.swift` (welcome, goals interview, calibration, completion).
- **Modificar:** —
- **Depende de:** 15.1, macro-stage 10, macro-stage 13, macro-stage 14
- **Critérios de conclusão:** completing onboarding creates a `users` row, an initial `learner_profile`, and at least one `goals` row, both locally and remotely — the first true end-to-end verification of macro-stages 7/8/9/10 working together through a real UI.
- **Riscos:** any gap in the chain (repository, sync, memory extraction) surfaces here first — treat a failure in this task as a signal to revisit the specific earlier macro-stage, not as an onboarding-specific bug to patch locally.
- **Testes:** ViewModel unit tests per step (mocked engine/repositories); one XCUITest for the full happy path (`NON_FUNCTIONAL_REQUIREMENTS.md` §11 critical flow).
- **Impacto na arquitetura:** the first real, full-stack proof that the architecture works end-to-end.

### 15.3 — CEFR estimate derivation
- **Objetivo:** derive an initial `cefr_level` from the calibration conversation, feeding `LEARNING_ENGINE.md` §4.
- **Criar:** —
- **Modificar:** the calibration completion step (15.2) to call into the level-derivation logic.
- **Depende de:** 15.2, macro-stage 12
- **Critérios de conclusão:** a fixture calibration transcript produces a plausible CEFR estimate — spot-checked, not exact-matched, since this is inherently judgment-based content, not a formula.
- **Riscos:** over-testing an inherently fuzzy judgment as if it were deterministic — explicitly scoped as spot-check, not assertion-based, testing.
- **Testes:** spot-check against 2–3 fixture transcripts of known, differing levels.
- **Impacto na arquitetura:** seeds `LEARNING_ENGINE.md` §4's state machine with a real starting value.

**Macro-stage exit criteria:** a brand-new account completes onboarding end-to-end on-device, seeding real memory data — `RISKS.md` R-08 resolved in practice, not just in design.

---

# Macro-stage 16 — Tela inicial

**Goal:** the returning-user landing screen — streak, quick-start CTA, today's focus.
**Depends on:** macro-stage 8, macro-stage 12, macro-stage 13, macro-stage 14.

### 16.1 — Home screen and ViewModel
- **Objetivo:** derived streak (8.4), today's adaptive focus (12.7), recent session count, via Use Cases only.
- **Criar:** `CoachApp/Features/Progress/HomeView.swift`, `HomeViewModel.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 8, macro-stage 12, macro-stage 13, macro-stage 14
- **Critérios de conclusão:** correct data for a seeded test account on-device; renders correctly offline from cached data (`NON_FUNCTIONAL_REQUIREMENTS.md` §4).
- **Riscos:** an offline-first assumption silently broken (e.g. a view accidentally requiring a live network call) — tested explicitly in airplane mode.
- **Testes:** ViewModel unit tests (mocked use cases); one XCUITest for render + offline render; explicit airplane-mode manual check.
- **Impacto na arquitetura:** the first screen exercising the full read path through Repositories at UI scale.

### 16.2 — "Start session" routing
- **Objetivo:** the home screen's primary CTA, carrying adaptive-focus context into the Coach flow.
- **Criar:** —
- **Modificar:** `HomeView.swift`, `NavigationCoordinator` (14.2).
- **Depende de:** 16.1, macro-stage 14
- **Critérios de conclusão:** tapping the CTA navigates into a session pre-seeded with today's focus.
- **Riscos:** low.
- **Testes:** XCUITest for the navigation.
- **Impacto na arquitetura:** connects Home to Coach for the first time.

**Macro-stage exit criteria:** home screen live, correct and offline-resilient, a real entry point into a session.

---

# Macro-stage 17 — Conversação

**Goal:** the core text + voice conversation UI — the app's primary interaction surface.
**Depends on:** macro-stage 10, macro-stage 11, macro-stage 13, macro-stage 14.

### 17.1 — Text conversation screen and ViewModel
- **Objetivo:** starts a session via `StartSessionUseCase`, streams `ConversationChunk`s, renders corrections per `PROMPT_ENGINE.md` §3's format.
- **Criar:** `CoachApp/Features/Coach/ConversationViewModel.swift`, `ConversationView.swift`, `CoachKitDomain/UseCases/StartSessionUseCase.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 10, macro-stage 13, macro-stage 14
- **Critérios de conclusão:** a full text conversation works on-device against the live backend; message list scrolls at 60fps even with a long, paginated history (`NON_FUNCTIONAL_REQUIREMENTS.md` §1).
- **Riscos:** loading full history eagerly instead of paginated — tested explicitly with a large fixture history.
- **Testes:** ViewModel unit tests (mocked engine — streaming accumulation, error handling); one XCUITest ("send a message, see a response"); a large-history scroll-performance check.
- **Impacto na arquitetura:** the primary Domain-through-Presentation flow for the app's central feature.

### 17.2 — Voice session screen
- **Objetivo:** wires `VoiceEngineCoordinator` (11.5), renders the voice state machine via `DESIGN_SYSTEM.md` §5.3's component.
- **Criar:** `CoachApp/Features/Coach/VoiceSessionView.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 11, 17.1, macro-stage 13.4
- **Critérios de conclusão:** full voice session works on-device; VoiceOver announces every state change (`NON_FUNCTIONAL_REQUIREMENTS.md` §7, `DESIGN_SYSTEM.md` §11).
- **Riscos:** VoiceOver announcements missing on a state transition — spot-checked per transition, not just on initial state.
- **Testes:** manual voice test; manual VoiceOver check per state transition; ViewModel state-machine unit tests with a mocked `VoiceEngine`.
- **Impacto na arquitetura:** the UI realization of `ARCHITECTURE.md` §5.4.

### 17.3 — Session-end wiring
- **Objetivo:** `EndSessionUseCase` triggers sync (macro-stage 8) and Memory Extraction enqueue (macro-stage 9), via `SessionCompletedEvent` if implemented (`ARCHITECTURE.md` §2.4, optional) or direct calls otherwise.
- **Criar:** `CoachKitDomain/UseCases/EndSessionUseCase.swift`.
- **Modificar:** `ConversationViewModel.swift`, `VoiceSessionView`'s ViewModel.
- **Depende de:** 17.1, 17.2, macro-stage 8, macro-stage 9
- **Critérios de conclusão:** ending a session (text or voice) reliably enqueues extraction and appears in the sync-pending count until uploaded.
- **Riscos:** a session ending without triggering extraction (silent data loss of the session's learning value) — tested explicitly, since this would be a Principle-1-violating bug.
- **Testes:** integration test confirming both triggers fire on session end.
- **Impacto na arquitetura:** closes the loop from a live conversation back into the Memory Engine.

### 17.4 — Post-session recap screen
- **Objetivo:** "what we covered today" (`TASKS.md` T5-09), pulled forward here as the natural conversation-flow endpoint.
- **Criar:** `CoachApp/Features/Coach/SessionRecapView.swift`.
- **Modificar:** —
- **Depende de:** 17.3
- **Critérios de conclusão:** shown immediately after a session ends, summarizing what was covered/corrected.
- **Riscos:** low.
- **Testes:** ViewModel unit test; XCUITest for the recap appearing post-session.
- **Impacto na arquitetura:** none beyond UI.

**Macro-stage exit criteria:** the primary use case of the entire application — a real conversation, text or voice, that gets remembered — works end-to-end on-device.

---

# Macro-stage 18 — Exercícios

**Goal:** scenario-driven practice (weekly HR scenario, daily rotation) and a targeted "practice this mistake" mode — both conversation-embedded, never isolated drills (Principle 3/4).
**Depends on:** macro-stage 12, macro-stage 17.

### 18.1 — Scenario picker
- **Objetivo:** surfaces the backend-generated weekly/daily scenario as a selectable session starter.
- **Criar:** `CoachKitDomain/UseCases/GetScenarioUseCase.swift`, `CoachApp/Features/Coach/ScenarioPickerView.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 12, macro-stage 17
- **Critérios de conclusão:** a fixture account sees a non-repeating scenario matching the current adaptive focus.
- **Riscos:** scenario repetition (violating `PROMPT_ENGINE.md` §6's non-repetition rule) — tested with a multi-week fixture sequence.
- **Testes:** ViewModel unit test with fixture scenario sequences, asserting non-repetition.
- **Impacto na arquitetura:** the UI surface for `ARCHITECTURE.md` §5.1's weekly generator.

### 18.2 — "Practice this mistake" targeted mode
- **Objetivo:** starts a session pre-seeded with a specific due-for-review item, still conversation-embedded per `PROMPT_ENGINE.md` §5.
- **Criar:** `CoachApp/Features/Memory/PracticeThisView.swift`.
- **Modificar:** —
- **Depende de:** 18.1, macro-stage 19 (memory list UI, entry point)
- **Critérios de conclusão:** selecting a due item and starting practice produces a session whose adaptive focus matches that specific item.
- **Riscos:** the entry point reintroducing an isolated-drill UI pattern by accident — reviewed against `PROMPT_ENGINE.md` §5's "no isolated drills" rule explicitly.
- **Testes:** ViewModel unit test confirming correct focus pass-through; XCUITest for the selection → session-start flow.
- **Impacto na arquitetura:** connects `LEARNING_ENGINE.md` §6's review mechanism to a real, principle-respecting UI.

**Macro-stage exit criteria:** both scenario-driven and targeted-review practice are reachable and functioning, both still conversation-embedded.

---

# Macro-stage 19 — Estatísticas

**Goal:** the Progress dashboard and Memory tab — trends, coverage, searchable history, semantic Q&A.
**Depends on:** macro-stage 7, macro-stage 9, macro-stage 12, macro-stage 13.

### 19.1 — Progress dashboard
- **Objetivo:** streak, Fluency/Confidence trend, weekly business/daily adherence.
- **Criar:** `CoachApp/Features/Progress/ProgressDashboardView.swift`, `ProgressViewModel.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 12, macro-stage 13
- **Critérios de conclusão:** correct values on-device for a seeded fixture account; visual tone matches `DESIGN_SYSTEM.md` §5.2's "no chart-junk" principle (design review, not automatable).
- **Riscos:** low.
- **Testes:** ViewModel unit tests; manual design review.
- **Impacto na arquitetura:** the primary UI consumer of `LEARNING_ENGINE.md` §8/§9's scores.

### 19.2 — Topic coverage map
- **Objetivo:** business vs. daily, status per topic.
- **Criar:** `CoachApp/Features/Progress/TopicCoverageView.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 7, macro-stage 12
- **Critérios de conclusão:** correct coverage state for a seeded fixture account.
- **Riscos:** low.
- **Testes:** ViewModel unit test.
- **Impacto na arquitetura:** none beyond UI.

### 19.3 — Memory tab: vocabulary, mistakes, session history
- **Objetivo:** paginated lists; session history lazy-loads full transcript on demand (`ARCHITECTURE.md` §13).
- **Criar:** `CoachApp/Features/Memory/VocabularyListView.swift`, `MistakesListView.swift`, `SessionHistoryView.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 7
- **Critérios de conclusão:** session history scrolls at 60fps with a large fixture dataset (`NON_FUNCTIONAL_REQUIREMENTS.md` §1); tapping a session lazy-loads its transcript, confirmed by not prefetching in a network-inspector check.
- **Riscos:** accidental eager-loading of transcripts for the whole list — tested explicitly, not assumed from the design.
- **Testes:** large-fixture scroll-performance test; network-call-count check confirming lazy loading.
- **Impacto na arquitetura:** validates `ARCHITECTURE.md` §13's performance design at real UI scale for the first time.

### 19.4 — In-app memory Q&A
- **Objetivo:** "what do I still struggle with?" using `SearchMemoryUseCase` (9.4).
- **Criar:** `CoachApp/Features/Memory/MemorySearchView.swift`.
- **Modificar:** —
- **Depende de:** 9.4, 19.3
- **Critérios de conclusão:** a fixture query returns relevant, correctly-ranked results on-device.
- **Riscos:** low.
- **Testes:** ViewModel unit test with a mocked search response.
- **Impacto na arquitetura:** the UI realization of `ARCHITECTURE.md` §5.2's semantic retrieval.

### 19.5 — "Why this lesson" transparency view
- **Objetivo:** surfaces `LEARNING_ENGINE.md` §10's recommendation reasoning.
- **Criar:** `CoachApp/Features/Progress/WhyThisLessonView.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 12.6
- **Critérios de conclusão:** shows the actual reasoning tier (event prep / weak topic / review backlog / plateau / milestone) for a fixture account's current recommendation.
- **Riscos:** low.
- **Testes:** ViewModel unit test.
- **Impacto na arquitetura:** none beyond UI; supports long-term trust (`ARCHITECTURE_DECISIONS.md` §2.4's recommended-changes list).

### 19.6 — Practice-history heatmap
- **Objetivo:** calendar/heatmap of practice history (`TASKS.md` T5-11).
- **Criar:** `CoachApp/Features/Progress/PracticeHeatmapView.swift`.
- **Modificar:** —
- **Depende de:** 19.1
- **Critérios de conclusão:** correctly renders density for a seeded multi-month fixture account.
- **Riscos:** low.
- **Testes:** ViewModel unit test with a fixture date range.
- **Impacto na arquitetura:** none beyond UI.

**Macro-stage exit criteria:** the full progress/memory data surface implemented, reading only through Repositories, performant at scale (validated with large fixtures, not a handful of records).

---

# Macro-stage 20 — Configurações

**Goal:** profile, goals, privacy/data controls, app-lock settings, sync status, debug Health screen.
**Depends on:** macro-stage 7, macro-stage 8, macro-stage 13.

### 20.1 — Profile screen
- **Objetivo:** name, professional role, primary goal, read-only CEFR estimate.
- **Criar:** `CoachApp/Features/Profile/ProfileView.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 7, macro-stage 13
- **Critérios de conclusão:** correct data on-device for a seeded account.
- **Riscos:** low.
- **Testes:** ViewModel unit test.
- **Impacto na arquitetura:** none beyond UI.

### 20.2 — Goal management
- **Objetivo:** create/edit/complete `goals`.
- **Criar:** `CoachApp/Features/Profile/GoalsView.swift`.
- **Modificar:** —
- **Depende de:** 20.1
- **Critérios de conclusão:** create/edit/complete all persist correctly (local + synced).
- **Riscos:** low.
- **Testes:** ViewModel unit test; one integration test for the full CRUD cycle.
- **Impacto na arquitetura:** none beyond UI.

### 20.3 — Data export/delete flow
- **Objetivo:** full export (Supabase + SwiftData) to a shareable file; delete with explicit multi-step confirmation, propagating to both stores (`TASKS.md` T5-07).
- **Criar:** `CoachKitDomain/UseCases/ExportUserDataUseCase.swift`, `DeleteUserDataUseCase.swift`, `CoachApp/Features/Profile/DataControlsView.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 7, macro-stage 8
- **Critérios de conclusão:** export produces a complete, valid JSON covering every table; delete followed by a fresh sync pull confirms nothing remains server-side **and** nothing remains in the local SwiftData store.
- **Riscos:** **a partial delete — one store cleared, the other not** — tested explicitly as its own failure mode, not just the happy path, since this is the most likely real-world way this feature fails silently.
- **Testes:** integration test exercising full export then full delete, asserting both stores end empty.
- **Impacto na arquitetura:** implements the "nothing disappears without explicit permission, but when it does, it's real" reversibility guarantee end-to-end.

### 20.4 — App-lock settings
- **Objetivo:** timeout duration, on/off, surfaced in Profile.
- **Criar:** `CoachApp/Features/Profile/AppLockSettingsView.swift`.
- **Modificar:** `AppLockCoordinator` (6.4) to read the preference.
- **Depende de:** macro-stage 6.4
- **Critérios de conclusão:** changing the setting visibly changes lock behavior.
- **Riscos:** low.
- **Testes:** manual check.
- **Impacto na arquitetura:** none beyond UI.

### 20.5 — Sync status detail view
- **Objetivo:** full pending-changes list, last-synced timestamp, manual "sync now."
- **Criar:** `CoachApp/Features/Profile/SyncStatusView.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 8
- **Critérios de conclusão:** manual sync trigger works and reflects real-time status.
- **Riscos:** low.
- **Testes:** manual check.
- **Impacto na arquitetura:** the full user-facing counterpart to `RISKS.md` R-11's "never silent" requirement.

### 20.6 — Debug Health screen
- **Objetivo:** last sync/extraction status, this month's token spend, recent error log tail (`OBSERVABILITY.md` §10), gated `#if DEBUG`.
- **Criar:** `CoachApp/Features/Profile/DebugHealthView.swift`.
- **Modificar:** —
- **Depende de:** macro-stage 10.6, macro-stage 8
- **Critérios de conclusão:** shows real, current data on a debug build; confirmed absent from a release build.
- **Riscos:** the screen accidentally shipping in release — checked against build configuration explicitly.
- **Testes:** build-configuration check (debug vs. release).
- **Impacto na arquitetura:** implements `OBSERVABILITY.md` §10's debug tooling choice.

**Macro-stage exit criteria:** full settings surface implemented; export/delete proven to fully clear both stores under an explicit partial-failure test; debug Health screen gives at-a-glance system state.

---

# Macro-stage 21 — Widgets

**Goal:** WidgetKit home-screen widget (streak/progress), `TASKS.md` T5-04.
**Depends on:** macro-stage 3, macro-stage 8.

### 21.1 — Widget Extension target
- **Objetivo:** new `CoachWidget` target, sharing `CoachKitDomain` types via the existing local package.
- **Criar:** `CoachWidget/` (new Xcode target), `CoachWidget/CoachWidget.swift`.
- **Modificar:** project structure (new target + App Group entitlement).
- **Depende de:** macro-stage 3, macro-stage 8
- **Critérios de conclusão:** widget builds, appears in the widget gallery, shows placeholder data.
- **Riscos:** App Group misconfiguration blocking data sharing — verified explicitly before moving to 21.2.
- **Testes:** manual widget-gallery check.
- **Impacto na arquitetura:** the first non-`CoachApp` consumer of `CoachKit` — an early, low-stakes proof of the package boundary's reusability (a preview of what ADR-013's future macOS client will do).

### 21.2 — Timeline provider and shared snapshot
- **Objetivo:** widget reads the latest cached streak/progress via a minimal, read-only App-Group-backed snapshot (not the full SwiftData store), written by the app after each sync.
- **Criar:** `CoachWidget/StreakTimelineProvider.swift`, a shared snapshot writer in `CoachApp` (invoked post-sync).
- **Modificar:** `SyncCoordinator`'s completion path (8.2/8.3) to trigger the snapshot write.
- **Depende de:** 21.1, macro-stage 8
- **Critérios de conclusão:** completing a session in the app updates the widget within one refresh cycle (manual test — OS-throttled timing, not fully controllable).
- **Riscos:** over-promising real-time widget updates — the completion criterion explicitly acknowledges OS-throttled refresh, documented honestly rather than treated as a bug if not instant.
- **Testes:** manual on-device test, accepting OS-typical refresh latency.
- **Impacto na arquitetura:** none beyond the App Group data-sharing boundary.

### 21.3 — Widget accessibility and appearance verification
- **Objetivo:** confirm `DESIGN_SYSTEM.md` §11/§12 (accessibility, light/dark) apply to the widget too.
- **Criar:** —
- **Modificar:** —
- **Depende de:** 21.2
- **Critérios de conclusão:** widget correct in both appearance modes, VoiceOver-accessible.
- **Riscos:** low.
- **Testes:** manual check, both modes.
- **Impacto na arquitetura:** none.

**Macro-stage exit criteria:** widget installable, shows real (if slightly delayed) data, accessible, both appearance modes correct.

---

# Macro-stage 22 — Notificações

**Goal:** native `UserNotifications` for habit reinforcement, tone-appropriate and cancel-aware (`TASKS.md` T5-05).
**Depends on:** macro-stage 8, macro-stage 15 or 17 (first real usage to trigger the permission ask).

### 22.1 — Contextual permission request
- **Objetivo:** ask for notification permission after the first completed session, not on first launch.
- **Criar:** `CoachApp/Composition/NotificationPermissionCoordinator.swift`.
- **Modificar:** `EndSessionUseCase`'s call site (17.3) to trigger the ask at the right moment.
- **Depende de:** macro-stage 17
- **Critérios de conclusão:** permission prompt appears after (not before) the first session completes.
- **Riscos:** asking too early (before any value has been demonstrated) — explicitly avoided per the completion criterion.
- **Testes:** manual timing check.
- **Impacto na arquitetura:** none beyond UX sequencing.

### 22.2 — Streak-reminder scheduling
- **Objetivo:** a gentle nudge if no session by a certain time, cancelled if a session already happened that day — tone-reviewed against `DESIGN_SYSTEM.md` §1's "never nagging" mandate.
- **Criar:** `CoachKitData/Notifications/StreakReminderScheduler.swift`.
- **Modificar:** —
- **Depende de:** 22.1, macro-stage 8.4
- **Critérios de conclusão:** manual test confirms a reminder fires appropriately and is correctly cancelled when a session already happened — no redundant/duplicate reminder ever fires.
- **Riscos:** a duplicate or badly-timed reminder reading as nagging — explicitly tested for the cancellation case, not just the fire case.
- **Testes:** manual test, both the fire and the cancel-on-session-completed cases.
- **Impacto na arquitetura:** implements the habit-reinforcement design from `ROADMAP.md` Phase 5.

### 22.3 — Notification settings
- **Objetivo:** on/off control surfaced in Profile.
- **Criar:** —
- **Modificar:** `CoachApp/Features/Profile/` (add a notification settings section).
- **Depende de:** 22.1, macro-stage 20
- **Critérios de conclusão:** toggling off reliably stops future reminders.
- **Riscos:** low.
- **Testes:** manual check.
- **Impacto na arquitetura:** none beyond UI.

**Macro-stage exit criteria:** notifications work, are cancel-aware, tone-appropriate, and user-controllable.

---

# Macro-stage 23 — Backup e restauração

**Goal:** a proven, drilled backup/restore capability — not just a design intention (`ARCHITECTURE.md` §4, `RISKS.md` R-03).
**Depends on:** macro-stage 5, macro-stage 9.

### 23.1 — Weekly scheduled export job
- **Objetivo:** structured JSON export of every table, on a weekly schedule, to Supabase Storage.
- **Criar:** `backend/supabase/functions/weekly-backup-export/index.ts`, a `pg_cron`-enabling migration if that's the chosen scheduler.
- **Modificar:** —
- **Depende de:** macro-stage 5, macro-stage 9
- **Critérios de conclusão:** a manually-triggered run produces a complete, valid export covering every table.
- **Riscos:** an incomplete export (a table silently missed) — checked explicitly against the full table list from `ARCHITECTURE.md` §9.1, not assumed complete.
- **Testes:** integration test asserting every table is present in the export output.
- **Impacto na arquitetura:** implements `ARCHITECTURE.md` §4's backup design.

### 23.2 — Secondary, user-owned mirror
- **Objetivo:** finalize the specific mechanism (previously left as "e.g. iCloud Drive" in `ARCHITECTURE.md`/`NON_FUNCTIONAL_REQUIREMENTS.md`) for getting a backup copy into Julia's own hands without Supabase dashboard access.
- **Criar:** the chosen mechanism's implementation (e.g. a client-side "save backup to Files/iCloud Drive" action, or an emailed download link — decided during this task).
- **Modificar:** —
- **Depende de:** 23.1
- **Critérios de conclusão:** Julia can retrieve a backup copy through the chosen mechanism without needing Supabase dashboard access.
- **Riscos:** choosing a mechanism that's technically correct but impractical to actually use — validated by an actual retrieval attempt, not just "the code path exists."
- **Testes:** manual end-to-end retrieval test.
- **Impacto na arquitetura:** finalizes the open point from `ARCHITECTURE.md` §4/`RISKS.md` R-03.

### 23.3 — Supabase PITR verification
- **Objetivo:** confirm point-in-time recovery is active on the Supabase project (a console setting, not code).
- **Criar:** —
- **Modificar:** —
- **Depende de:** macro-stage 5
- **Critérios de conclusão:** PITR confirmed enabled and its retention window noted.
- **Riscos:** assuming it's on without checking — explicitly verified, not assumed.
- **Testes:** console verification.
- **Impacto na arquitetura:** confirms the D4 cost trade-off accepted in `ARCHITECTURE.md` §4 is actually in effect.

### 23.4 — Restore-path drill
- **Objetivo:** a deliberate, controlled restore of a test account from a backup export into a fresh/staging Supabase project, confirming the app functions correctly against the restored data.
- **Criar:** —
- **Modificar:** —
- **Depende de:** 23.1, 23.2
- **Critérios de conclusão:** the drill succeeds end-to-end; documented as a repeatable runbook, appended to `RISKS.md` R-03 as a "verified mitigation, runbook: ..." note.
- **Riscos:** **this task is the one most likely to be skipped under time pressure — it is explicitly mandatory, not optional.** An untested backup is not a real mitigation; this is a well-known real-world failure mode this plan deliberately guards against by naming it as its own task rather than assuming 23.1–23.3 are sufficient on their own.
- **Testes:** the drill itself is the test.
- **Impacto na arquitetura:** only after this task passes can `RISKS.md` R-03 be marked fully resolved.

**Macro-stage exit criteria:** backup is a proven, drilled capability. `RISKS.md` R-03 updated to reflect the verified outcome, not left as a designed-but-untested mitigation.

---

# Macro-stage 24 — Testes

**Goal:** the cross-cutting testing infrastructure that doesn't belong to any single feature — CI, coverage gates, and closing any remaining critical-flow gaps. (Per-feature testing has been embedded in every task above, per `NON_FUNCTIONAL_REQUIREMENTS.md` §11's philosophy — this stage is not "write tests now," it's "stand up the infrastructure and verify the whole.")
**Depends on:** having real tests to run (practically, this can be stood up as early as after macro-stage 4, and left running continuously through every later stage — placement here follows the user's requested macro-order, but earlier activation is explicitly a valid, even preferable, alternative, noted so a future implementer doesn't treat "stage 24" as a hard floor).

### 24.1 — Stand up CI
- **Objetivo:** GitHub Actions (macOS runner) building and running `CoachKitDomainTests`, `CoachKitDataTests`, and `CoachAppUITests` on every push (`TASKS.md` T0-14).
- **Criar:** `.github/workflows/ci.yml`.
- **Modificar:** —
- **Depende de:** any macro-stage with real tests to run (as early as macro-stage 4, in practice).
- **Critérios de conclusão:** a deliberately broken test fails the CI run visibly; a passing state is green.
- **Riscos:** low.
- **Testes:** the deliberate-break check described above.
- **Impacto na arquitetura:** implements `RISKS.md` R-04's automated-regression-safety-net mitigation.

### 24.2 — Coverage measurement and gate
- **Objetivo:** measure real current coverage; set the CI gate at that measured baseline (not a fabricated number), ratcheting toward `NON_FUNCTIONAL_REQUIREMENTS.md` §11's Domain ≥70% / Data ≥50% targets over time.
- **Criar:** —
- **Modificar:** `ci.yml` (add a coverage step).
- **Depende de:** 24.1
- **Critérios de conclusão:** coverage report generated on every CI run; gate fails a PR that drops coverage below the current baseline.
- **Riscos:** setting an aspirational-but-unmet gate that immediately fails CI — avoided by gating on the measured baseline, not the target, then ratcheting.
- **Testes:** the gate itself, exercised by a deliberately coverage-reducing test PR (reverted after confirming the gate catches it).
- **Impacto na arquitetura:** operationalizes `NON_FUNCTIONAL_REQUIREMENTS.md` §11.

### 24.3 — Critical-flow coverage audit
- **Objetivo:** cross-check every named critical flow from `NON_FUNCTIONAL_REQUIREMENTS.md` §11 (onboarding, start/end session, voice fallback trigger, sync-conflict notice) against actually-existing XCUITests, closing any gap.
- **Criar:** any missing XCUITest.
- **Modificar:** —
- **Depende de:** macro-stage 6, 8, 11, 15, 17
- **Critérios de conclusão:** every named flow has a passing XCUITest; none rely on manual-only verification going forward.
- **Riscos:** a flow assumed covered by an earlier stage's task but actually missed — the explicit audit against the named list is designed to catch exactly this.
- **Testes:** the audit itself, plus any tests it adds.
- **Impacto na arquitetura:** closes the loop on `NON_FUNCTIONAL_REQUIREMENTS.md` §11's critical-flow policy.

### 24.4 — Full on-device regression pass
- **Objetivo:** run the entire suite, plus a manual walkthrough of every major flow, on a real device (not just simulator), once, before proceeding to optimization.
- **Criar:** —
- **Modificar:** —
- **Depende de:** 24.1–24.3
- **Critérios de conclusão:** clean pass, no simulator-only-masked issues found (e.g. real biometrics, real audio hardware, real background task behavior).
- **Riscos:** simulator/device behavioral differences (especially for macro-stage 6.4's Face ID, macro-stage 8.5's background tasks, macro-stage 11's audio) surfacing only now — treated as expected, not alarming, given this is exactly what this task exists to catch.
- **Testes:** the full pass itself.
- **Impacto na arquitetura:** the final verification gate before macro-stage 25.

**Macro-stage exit criteria:** CI green, coverage at or above `NON_FUNCTIONAL_REQUIREMENTS.md` §11 targets, all named critical flows covered, one clean on-device regression pass complete.

---

# Macro-stage 25 — Otimização

**Goal:** validate `NON_FUNCTIONAL_REQUIREMENTS.md` §1–3 (performance/battery/memory) with real measurement — a measure-then-fix stage, not a guess-and-tweak one.
**Depends on:** macro-stage 24 (a complete, correct app to measure).

### 25.1 — Launch-time profiling
- **Objetivo:** Instruments measurement against the <2s cold-launch target.
- **Criar:** —
- **Modificar:** whatever the profiling reveals needs lazy-loading (per `ARCHITECTURE.md` §13's design intent, verified rather than assumed).
- **Depende de:** macro-stage 24
- **Critérios de conclusão:** measured launch time recorded; target met, or a documented, justified gap if not (updating `NON_FUNCTIONAL_REQUIREMENTS.md`'s provisional-target note with the real number).
- **Riscos:** none beyond the possibility of missing the target — handled by 25.6.
- **Testes:** Instruments Time Profiler measurement.
- **Impacto na arquitetura:** validates or revises `ARCHITECTURE.md` §13's design.

### 25.2 — Memory profiling
- **Objetivo:** Instruments measurement for text (250MB) and voice (400MB) sessions against `NON_FUNCTIONAL_REQUIREMENTS.md` §3's targets; a 30-minute leak check.
- **Criar:** —
- **Modificar:** whatever leaks or excess retention the profiling finds.
- **Depende de:** macro-stage 24
- **Critérios de conclusão:** measured, flat memory profile over 30 minutes; targets met or a documented, justified gap.
- **Riscos:** none beyond the possibility of a real leak, which this task exists specifically to find.
- **Testes:** Instruments Allocations/Leaks measurement over a 30-minute session.
- **Impacto na arquitetura:** validates §3's provisional targets with real data.

### 25.3 — Battery profiling
- **Objetivo:** Instruments Energy Log for a 30-minute voice session and a day of background sync, against §2's targets.
- **Criar:** —
- **Modificar:** sync interval or audio-session configuration if the measurement reveals excess drain.
- **Depende de:** macro-stage 24
- **Critérios de conclusão:** measured energy impact recorded; targets met or a documented, justified gap.
- **Riscos:** §2's targets are explicitly marked provisional in `NON_FUNCTIONAL_REQUIREMENTS.md` — this task either confirms or revises them with real numbers, closing that provisional status.
- **Testes:** Instruments Energy Log measurement.
- **Impacto na arquitetura:** closes the provisional-target gap in `NON_FUNCTIONAL_REQUIREMENTS.md` §2.

### 25.4 — List/scroll performance at scale
- **Objetivo:** validate 60fps against a large fixture dataset (thousands of sessions/vocabulary items), not the small dev-time dataset used in earlier stages.
- **Criar:** a large synthetic fixture-data generator (test-only tooling).
- **Modificar:** whatever list view the measurement finds under-performing.
- **Depende de:** macro-stage 19, macro-stage 24
- **Critérios de conclusão:** 60fps maintained at the `NON_FUNCTIONAL_REQUIREMENTS.md` §8 scale targets (up to 10,000 sessions etc.).
- **Riscos:** a query or rendering path that was fine at dev-time scale but degrades at real scale — exactly what this task exists to catch before it ships.
- **Testes:** Instruments Core Animation/Hitches measurement against the large fixture.
- **Impacto na arquitetura:** validates `ARCHITECTURE.md` §11's scalability table with real measurement instead of design-time reasoning alone.

### 25.5 — Sync performance validation
- **Objetivo:** typical-delta sync <5s, large-backlog pull correctly paginated, against §5's targets.
- **Criar:** —
- **Modificar:** pagination size or batching if the measurement finds an issue.
- **Depende de:** macro-stage 8, macro-stage 24
- **Critérios de conclusão:** measured sync timing meets §5's targets or a documented, justified gap.
- **Riscos:** low, given macro-stage 8's tests already cover correctness — this task is specifically about timing, not correctness.
- **Testes:** timed sync test against typical and large-backlog fixtures.
- **Impacto na arquitetura:** validates `ARCHITECTURE.md` §4's design under load.

### 25.6 — Address findings
- **Objetivo:** an open-ended punch-list task whose content depends entirely on what 25.1–25.5 find.
- **Criar/Modificar:** whatever the findings require.
- **Depende de:** 25.1–25.5
- **Critérios de conclusão:** every finding either fixed and re-measured, or explicitly accepted with a documented rationale (updating `NON_FUNCTIONAL_REQUIREMENTS.md`'s provisional markers to confirmed/revised values either way) — never silently missed.
- **Riscos:** treating a missed target as acceptable without documenting why — explicitly disallowed; silence is not an acceptable outcome here.
- **Testes:** re-measurement after each fix.
- **Impacto na arquitetura:** the final tuning pass; may touch any layer depending on findings.

**Macro-stage exit criteria:** every `NON_FUNCTIONAL_REQUIREMENTS.md` §1–5 target measured on real hardware, met or explicitly revised with documented rationale — no target left as an unverified assumption.

---

# Macro-stage 26 — Preparação para distribuição

**Goal:** iOS distribution resolved and executed, resolving `RISKS.md` R-07 and `TASKS.md` T0-10.
**Depends on:** macro-stage 25.

### 26.1 — Apple Developer Program enrollment
- **Objetivo:** account-level enrollment (external action).
- **Criar/Modificar:** —
- **Depende de:** —
- **Critérios de conclusão:** active enrollment confirmed.
- **Riscos:** low, purely administrative.
- **Testes:** N/A.
- **Impacto na arquitetura:** resolves `TASKS.md` T0-10.

### 26.2 — App Store Connect app record
- **Objetivo:** bundle ID and app name registration — the point where `TASKS.md` T0-08's still-open product-name decision becomes a hard blocker, finally forcing resolution.
- **Criar/Modificar:** —
- **Depende de:** 26.1, a chosen product name
- **Critérios de conclusão:** app record created.
- **Riscos:** discovering the desired name is taken — have a short list of alternatives ready, not just one option.
- **Testes:** N/A.
- **Impacto na arquitetura:** resolves `TASKS.md` T0-08.

### 26.3 — Code signing setup
- **Objetivo:** automatic signing (simpler for a solo maintainer, per `RISKS.md` R-04's maintainability bias).
- **Criar/Modificar:** Xcode signing configuration.
- **Depende de:** 26.1
- **Critérios de conclusão:** archive builds successfully with valid signing.
- **Riscos:** low.
- **Testes:** a successful archive build.
- **Impacto na arquitetura:** none.

### 26.4 — TestFlight build upload
- **Objetivo:** archive, upload, internal testing group of one (Julia).
- **Criar/Modificar:** —
- **Depende de:** 26.2, 26.3
- **Critérios de conclusão:** Julia receives and successfully installs the build on her actual device.
- **Riscos:** the single most meaningful validation in this entire plan — a build that works in every simulator/CI check but fails to install or run on the real target device would invalidate the "done" status of everything before it.
- **Testes:** the real-device install and smoke-use itself.
- **Impacto na arquitetura:** none; final delivery validation.

### 26.5 — Build-expiry renewal process
- **Objetivo:** a running mitigation (not just a documented risk) for the 90-day TestFlight build-expiry cycle (`RISKS.md` R-07).
- **Criar:** a calendar reminder or an automated check (decided during this task).
- **Modificar:** —
- **Depende de:** 26.4
- **Critérios de conclusão:** a real, scheduled reminder exists and is confirmed to fire (not just "planned to be set up").
- **Riscos:** this exact risk (an easy-to-overlook failure mode, per `RISKS.md` R-07) is precisely why this task is not allowed to be "documented as a risk" without also being "mitigated as a running process."
- **Testes:** confirmation the reminder mechanism actually exists and is active.
- **Impacto na arquitetura:** operationalizes `RISKS.md` R-07's mitigation for real.

### 26.6 — Final documentation pass
- **Objetivo:** update `ROADMAP.md`/`TASKS.md` to mark completed phases, refresh `RISKS.md` statuses against real outcomes (R-01 voice latency, R-03 backup drill, R-07 distribution, and any others resolved by this plan's execution).
- **Criar:** —
- **Modificar:** `ROADMAP.md`, `TASKS.md`, `RISKS.md`.
- **Depende de:** every prior macro-stage
- **Critérios de conclusão:** documentation accurately reflects the shipped state of the app — no stale "pending" language left anywhere, matching the same discipline applied in `MIGRATION_PLAN.md` §12.3.
- **Riscos:** letting documentation drift from reality at the exact moment it matters most (ship time) — this task exists specifically to prevent that, mirroring the discipline already established for the migration.
- **Testes:** a documentation-consistency pass, same method as `MIGRATION_PLAN.md` §12.2's verification.
- **Impacto na arquitetura:** none; documentation closure.

**Macro-stage exit criteria:** a real build, installed on Julia's real device via TestFlight, with a sustainable renewal process in place — the point at which the app is, for the first time, actually usable daily, which is the entire purpose of the project (`PROJECT.md` §1).

---

## 5. What this document does not cover

- **Content quality tuning** for `PROMPT_ENGINE.md`'s actual prompts, `LEARNING_ENGINE.md`'s weight constants, or `DESIGN_SYSTEM.md`'s exact visual polish — this plan builds the *mechanisms* those documents specify and tests them structurally; iterating on the *quality* of AI responses, scoring accuracy, or visual taste is ongoing work referenced in `TASKS.md` Phase 6 and `ROADMAP.md`'s continuous-improvement phase, not a fixed set of tasks with a completion criterion.
- **Exact effort/time estimates per task** — deliberately omitted, consistent with `ROADMAP.md`'s existing stance that this is a solo, AI-assisted project where relative sequencing matters more than calendar estimates.

## 6. Related documents

Implements the architecture in `ARCHITECTURE.md`/`ARCHITECTURE_DECISIONS.md` (ADR-001–018), the behavior specs in `PROMPT_ENGINE.md`/`LEARNING_ENGINE.md`, the visual spec in `DESIGN_SYSTEM.md`, the measurable targets in `NON_FUNCTIONAL_REQUIREMENTS.md`, and the monitoring design in `OBSERVABILITY.md`. Extends `ROADMAP.md`'s phases and `TASKS.md`'s backlog to task-level, ordered granularity. Builds on the clean repository state confirmed in `MIGRATION_PLAN.md` §12.
