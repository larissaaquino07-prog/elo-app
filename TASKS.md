# TASKS.md

Prioritized backlog. IDs are `<Phase>-<Number>`. Priority: **P0** (blocks the phase), **P1** (needed for the phase's exit criteria), **P2** (valuable, can slip to a later phase without breaking the exit criteria).

This backlog implements `ROADMAP.md`, the frozen architecture in `ARCHITECTURE.md`/`ARCHITECTURE_DECISIONS.md`, and the product specification in `PROMPT_ENGINE.md`, `LEARNING_ENGINE.md`, `DESIGN_SYSTEM.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `OBSERVABILITY.md`. Updated 2026-08-06 (Architecture Review), again the same day (Specification Pass), and again on 2026-08-07 (client platform migration to React Native + Expo, ADR-019–024) — task IDs, priorities, and dependencies are unchanged by the platform migration; only the technology named in each task's description is updated.

---

## Phase 0 — Foundations & Project Setup

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T0-01 | ✅ Done (2026-08-06, `MIGRATION_PLAN.md`) — Remove Expo/React Native scaffold from the repository (unrelated project, not migrated) | P0 | — |
| T0-02 | Create fresh Expo project (React Native + TypeScript, strict mode) | P0 | T0-01 |
| T0-03 | Set up MVVM + Clean Architecture module structure, with Domain+Data as monorepo workspace packages (`@coach/domain`, `@coach/data`, ADR-021) | P0 | T0-02 |
| T0-04 | Define Domain-layer interfaces: `ConversationEngine`, `VoiceEngine`, `MemoryExtractionEngine`, `SessionRepository`, `MemoryRepository`, `SyncCoordinating` (ADR-005, ADR-006) | P0 | T0-03 |
| T0-05 | Provision Supabase project (Postgres, `pgvector`, Auth, Edge Functions, Storage) | P0 | — |
| T0-06 | Provision Anthropic API + OpenAI API accounts/keys (backend-only, stored as Edge Function secrets, rotation policy defined) | P0 | — |
| T0-07 | Define `expo-sqlite`/Drizzle local schema + sync/conflict-resolution strategy, including idempotent-upsert design and per-device cursor (`ARCHITECTURE.md` §4) | P0 | T0-03, T0-05 |
| T0-08 | Choose product name (visual identity direction already specified in `DESIGN_SYSTEM.md`; only the name remains open) | P0 | — |
| T0-09 | Design onboarding/first-session assessment flow (seeds memory from zero) | P0 | — |
| T0-10 | Confirm distribution mechanism (EAS Build + EAS Submit, ADR-019 — substantially de-risked versus the original Apple Developer Program + local-Xcode plan) | P1 | — |
| T0-11 | Decide CEFR starting level input method (self-report vs. assessed via onboarding conversation) | P1 | T0-09 |
| T0-12 | Decide voice/accent preference (American vs. British English); confirm single consistent voice/persona (`ARCHITECTURE.md` §5.4) | P2 | — |
| T0-13 | Build a minimal second `ConversationEngine` reference adapter to validate the provider-abstraction isn't leaky before the app depends on it (ADR-005 LSP check) | P1 | T0-04 |
| T0-14 | Set up CI (GitHub Actions) running the unit test suite on every push — no macOS runner required for this gate | P1 | T0-02 |
| T0-15 | Set up structured logging categories and conventions (`Sync`, `AI`, `Voice`, `Auth`, `UI`) per `OBSERVABILITY.md` §2, including the "never log content" rule | P1 | T0-02 |

**Exit criteria (updated):** Expo project + `@coach/domain`/`@coach/data` packages build and run on-device with the MVVM+Clean Architecture skeleton and Domain interfaces in place, Supabase + AI accounts provisioned, product name and onboarding flow spec finalized, distribution mechanism confirmed, CI green. **Architecture Review completed and frozen (`ARCHITECTURE_DECISIONS.md`)** — no further architecture sign-off gate before Phase 1 begins.

---

## Phase 1 — Core Text Coach (MVP)

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T1-01 | Implement Supabase Postgres schema (`ARCHITECTURE.md` §9.1): `updated_at` on every syncable table, indexes on `(user_id, started_at)` / `(user_id, resolved, type)` / `(user_id, mastery_level)`, HNSW index on `summary_embedding`, `transcript_storage_path` instead of inline transcript, `device_sync_state`, `learner_profile` tables, `streaks` as a derived view | P0 | T0-05 |
| T1-02 | Implement `expo-sqlite`/Drizzle local models mirroring the schema (`ARCHITECTURE.md` §9.2), excluding raw transcripts by design | P0 | T0-07, T1-01 |
| T1-03 | Implement `SyncCoordinator` behind `SyncCoordinating`: idempotent upsert by client-generated UUID, per-device watermark pull with pagination, `expo-background-task` background sync (iOS/Android) | P0 | T1-02 |
| T1-04 | Implement `DefaultSessionRepository` / `DefaultMemoryRepository` (Data layer) + mappers (`expo-sqlite` ↔ Domain ↔ Supabase DTO), so Presentation never imports `expo-sqlite` directly (ADR-006) | P0 | T1-01, T1-02 |
| T1-05 | Supabase Auth integration + `expo-secure-store`-backed session storage | P0 | T0-05 |
| T1-06 | Build onboarding flow (React Native + Expo Router) → creates initial user profile, goals, topics, and seeds `learner_profile` | P0 | T0-09, T1-04 |
| T1-07 | Implement backend Session Orchestrator Edge Function + `ClaudeConversationEngine` adapter | P0 | T0-04, T0-06, T1-01 |
| T1-08 | Build text chat UI (MVVM: screens + Zustand stores), Repository/Use-Case access only — no direct `expo-sqlite` or Supabase imports in Presentation | P0 | T1-07, T1-04 |
| T1-09 | Implement Memory Extraction Job (server-side Claude call → vocabulary/mistakes/topics/summary+embedding, transcript uploaded to Storage) | P0 | T1-01, T0-06 |
| T1-10 | Implement Learner Profile Updater job (incremental merge-update of `learner_profile` after each session, ADR-009) | P1 | T1-09 |
| T1-11 | Implement `SessionCompletedEvent` to decouple "session ended" from "trigger sync + extraction" (recommended, optional for MVP) | P2 | T1-08 |
| T1-12 | App-level Face ID/Touch ID lock (`expo-local-authentication`, ADR-011) on iOS/Android; PIN/password fallback on web (ADR-024) | P1 | T1-05 |
| T1-13 | Weekly backup job: structured export to Supabase Storage + mirrored to a second, user-owned location (`RISKS.md` R-03) | P0 | T1-01 |
| T1-14 | Basic progress view (streak from derived view, session count, topics touched) via `MemoryRepository` | P1 | T1-04 |
| T1-15 | Session history list (paginated via `SessionRepository.fetchRecent`), full transcript loaded on demand from Storage | P2 | T1-04 |
| T1-16 | Implement context package assembly (Persona/Rules → `learner_profile` → adaptive focus → retrieved memories → recent turns) per `PROMPT_ENGINE.md` §7–8, with token caps | P0 | T1-07, T1-10 |
| T1-17 | Instrument per-call AI usage logging (engine, latency, tokens, cost, outcome) per `OBSERVABILITY.md` §3/§7 — feeds T6-01 | P1 | T1-07, T0-15 |

**Exit gate:** matches `ROADMAP.md` Phase 1 exit criteria — coach references prior-session facts unprompted, with or without connectivity gaps in between, with no direct Presentation→`expo-sqlite`/Supabase coupling anywhere in the codebase.

---

## Phase 2 — Long-Term Memory Intelligence

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T2-01 | Integrate `pgvector` HNSW similarity search into the orchestrator's context-building step, hybrid filter-then-rank (category/recency first, then embedding) | P0 | T1-09 |
| T2-02 | Mistake recurrence detection (increment `occurrences`, avoid duplicate rows for same mistake) | P0 | T1-09 |
| T2-03 | Vocabulary mastery state machine (introduced → practicing → mastered) | P1 | T1-09 |
| T2-04 | Topic coverage map screen, business vs. daily, status per topic, via `MemoryRepository` | P1 | T1-04 |
| T2-05 | In-app Q&A over memory ("what do I still struggle with?") using `learner_profile` + structured + semantic memory | P1 | T2-01, T2-02, T1-10 |
| T2-06 | Implement the SM-2-inspired spaced repetition algorithm (ease factor, interval, quality score) per `LEARNING_ENGINE.md` §2, driving due-for-review selection | P0 | T2-02, T2-03 |

---

## Phase 3 — Adaptive Learning Engine

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T3-01 | Implement priority-scoring scheduler (`ARCHITECTURE.md` §5.3), including the reserved `upcoming_event_boost` term (defaults to 0) | P0 | T2-02, T2-03, T2-04 |
| T3-02 | Weekly HR scenario generator job (Claude-generated, non-repeating) | P0 | T3-01 |
| T3-03 | Daily English scenario rotation logic (maintains 30% weighting over rolling window) | P0 | T3-01 |
| T3-04 | Difficulty auto-adjustment based on mistake trend | P1 | T3-01 |
| T3-05 | "Why this lesson" transparency view (shows the scheduler's reasoning) | P2 | T3-01 |

---

## Phase 4 — Voice Conversations

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T4-01 | Implement `OpenAIRealtimeVoiceEngine` adapter (primary voice path) via `react-native-webrtc`, iOS/Android | P0 | T0-04, T0-06, T0-12 |
| T4-02 | Session-seeding: pass `learner_profile` + adaptive focus into the Realtime session instructions | P0 | T3-01, T4-01 |
| T4-03 | Implement native fallback `VoiceEngine` adapter (`@react-native-voice/voice` + `expo-speech`), iOS/Android | P0 | T0-04 |
| T4-04 | `expo-audio` audio session management (recording/playback, interruption handling — persist partial transcript immediately on interruption) | P0 | T4-01, T4-03 |
| T4-05 | Reconnection-before-fallback logic (short backoff retry on Realtime drop, then switch to native path) | P0 | T4-01, T4-03 |
| T4-06 | Pronunciation mistake capture pipeline into `mistakes` table (Realtime path) | P1 | T4-01, T1-09 |
| T4-07 | Speaking-speed / confidence signal capture | P2 | T4-01 |
| T4-08 | Voice UI (waveform via React Native Skia, listening state, offline-mode indicator, premium feel per Principle 6) | P1 | T4-01 |
| T4-09 | Enforce and measure the latency budgets defined in `NON_FUNCTIONAL_REQUIREMENTS.md` §1/§9 as CI/manual acceptance checks | P1 | T4-01 |

---

## Phase 5 — Premium Polish

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T5-01 | Animation/transition pass across all screens via React Native Reanimated | P1 | Phase 4 complete |
| T5-02 | Performance pass (launch time, streaming perceived latency, offline resilience, background sync efficiency) | P0 | Phase 4 complete |
| T5-03 | Implement the full `DESIGN_SYSTEM.md` token set and component library in React Native (colors, type, spacing, components, motion) | P1 | T0-08 |
| T5-04 | WidgetKit home-screen widget (streak/progress) — **deferred to post-launch** (isolated native Swift required regardless of client framework, ADR-019 consequence) | P2 | T1-14 |
| T5-05 | Native daily reminder/streak notifications via `expo-notifications` (iOS/Android), tuned for motivation without nagging | P2 | T1-14 |
| T5-06 | Accessibility pass against `DESIGN_SYSTEM.md` §11 and `NON_FUNCTIONAL_REQUIREMENTS.md` §7 (VoiceOver, TalkBack, web screen readers, font scaling, contrast, Reduce Motion) | P1 | Phase 4 complete |
| T5-07 | Data export/delete flow (Supabase + `expo-sqlite` + Storage) | P0 | T1-01, T1-02 |
| T5-08 | Streak grace period ("freeze") — missing a day doesn't reset progress punitively | P2 | T1-14 |
| T5-09 | Post-session recap screen ("what we covered today") | P1 | T1-08 |
| T5-10 | Saved phrases / bookmark a specific correction or expression | P2 | T1-08 |
| T5-11 | Practice-history heatmap/calendar view | P2 | T1-14 |

---

## Phase 6 — Continuous Improvement (ongoing)

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T6-01 | Cost/usage monitoring dashboard (token spend per session/month) | P1 | T1-07 |
| T6-02 | Model migration playbook (Claude/OpenAI version upgrades without breaking continuity), exercised via T0-13's second adapter | P1 | T0-04, T0-13 |
| T6-03 | Raw transcript retention/archival policy for Supabase Storage | P2 | T1-09 |
| T6-04 | Periodic schema review process (new professional contexts, career changes); evaluate weekly/monthly memory rollups if `learner_profile` alone proves insufficient (ADR-009) | P2 | T1-10 |
| T6-05 | Periodic review of backend API contract for future dedicated desktop client readiness — partially validated already by the web/PWA companion surface | P2 | — |
| T6-06 | Proactive event-prep coaching ("interview next Tuesday") — activate the reserved `upcoming_event_boost` scheduler input with real UI | P2 | T3-01 |
| T6-07 | Evaluate `@coach/domain`/`@coach/data` workspace packages for a future dedicated desktop Presentation-layer client (ADR-013/ADR-021) | P2 | — |
| T6-08 | Revisit the WidgetKit deferral (T5-04) once the cross-platform core is stable — build the isolated native Swift module | P2 | T5-04 |

---

## Backlog hygiene rule

No task is added directly to Phase 1+ without first checking it against the six Core Principles in `PROJECT.md` §4 — if a proposed feature doesn't clearly serve memory, adaptivity, personalization, speaking, quality, or premium feel, it does not belong in this backlog (Principle 5).
