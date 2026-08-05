# TASKS.md

Prioritized backlog. IDs are `<Phase>-<Number>`. Priority: **P0** (blocks the phase), **P1** (needed for the phase's exit criteria), **P2** (valuable, can slip to a later phase without breaking the exit criteria).

This backlog implements the plan in `ROADMAP.md`; do not duplicate scheduling detail here — this file is *what*, `ROADMAP.md` is *when/why*. Reflects the confirmed native stack (Swift 6, SwiftUI, iOS 18+, SwiftData, Supabase, MVVM + Clean Architecture — `PROJECT.md` §8).

---

## Phase 0 — Foundations & Project Setup

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T0-01 | Remove Expo/React Native scaffold from the repository (unrelated project, not migrated) | P0 | — |
| T0-02 | Create fresh native Xcode project (Swift 6, SwiftUI, iOS 18+ deployment target) | P0 | T0-01 |
| T0-03 | Set up MVVM + Clean Architecture module structure (Presentation / Domain / Data) | P0 | T0-02 |
| T0-04 | Define Domain-layer provider protocols: `ConversationEngine`, `VoiceEngine`, `MemoryExtractionEngine` | P0 | T0-03 |
| T0-05 | Provision Supabase project (Postgres, `pgvector`, Auth, Edge Functions) | P0 | — |
| T0-06 | Provision Anthropic API + OpenAI API accounts/keys (backend-only, never in client) | P0 | — |
| T0-07 | Define SwiftData local schema + sync/conflict-resolution strategy (`ARCHITECTURE.md` §4) | P0 | T0-03, T0-05 |
| T0-08 | Choose product name + original visual identity direction | P0 | — |
| T0-09 | Design onboarding/first-session assessment flow (seeds memory from zero) | P0 | — |
| T0-10 | Decide iOS distribution mechanism for multi-year personal use (Apple Developer Program + TestFlight vs. alternatives) | P1 | — |
| T0-11 | Decide CEFR starting level input method (self-report vs. assessed via onboarding conversation) | P1 | T0-09 |
| T0-12 | Decide voice/accent preference (American vs. British English) | P2 | — |

---

## Phase 1 — Core Text Coach (MVP)

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T1-01 | Implement Supabase Postgres schema (`ARCHITECTURE.md` §9.1), including `updated_at` on all syncable tables | P0 | T0-05 |
| T1-02 | Implement SwiftData local models mirroring the schema (`ARCHITECTURE.md` §9.2) | P0 | T0-07, T1-01 |
| T1-03 | Implement `SyncCoordinator` (upload pending writes, pull remote changes, apply conflict rules, `BGTaskScheduler` background sync) | P0 | T1-02 |
| T1-04 | Supabase Auth integration + Keychain-backed session storage in the iOS app | P0 | T0-05 |
| T1-05 | Build onboarding flow (SwiftUI) → creates initial user profile, goals, topics locally and remotely | P0 | T0-09, T1-01, T1-02 |
| T1-06 | Implement backend Session Orchestrator Edge Function + `ClaudeConversationEngine` adapter | P0 | T0-04, T0-06, T1-01 |
| T1-07 | Build native SwiftUI text chat UI (MVVM), Domain-layer only access | P0 | T1-06 |
| T1-08 | Implement Memory Extraction Job (server-side Claude call → vocabulary/mistakes/topics/summary+embedding) | P0 | T1-01, T0-06 |
| T1-09 | Basic progress view (streak, session count, topics touched) from local SwiftData cache | P1 | T1-02 |
| T1-10 | Session history list (past conversations, searchable by date) | P2 | T1-01 |

**Exit gate:** matches `ROADMAP.md` Phase 1 exit criteria — coach references prior-session facts unprompted, with or without connectivity gaps in between.

---

## Phase 2 — Long-Term Memory Intelligence

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T2-01 | Integrate `pgvector` similarity search into the orchestrator's context-building step | P0 | T1-08 |
| T2-02 | Mistake recurrence detection (increment `occurrences`, avoid duplicate rows for same mistake) | P0 | T1-08 |
| T2-03 | Vocabulary mastery state machine (introduced → practicing → mastered) | P1 | T1-08 |
| T2-04 | Topic coverage map UI (SwiftUI, business vs. daily, status per topic) backed by SwiftData cache | P1 | T1-02 |
| T2-05 | In-app Q&A over memory ("what do I still struggle with?") using structured + semantic memory | P1 | T2-01, T2-02 |

---

## Phase 3 — Adaptive Learning Engine

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T3-01 | Implement priority-scoring scheduler (`ARCHITECTURE.md` §5.3) | P0 | T2-02, T2-03, T2-04 |
| T3-02 | Weekly HR scenario generator job (Claude-generated, non-repeating) | P0 | T3-01 |
| T3-03 | Daily English scenario rotation logic (maintains 30% weighting over rolling window) | P0 | T3-01 |
| T3-04 | Difficulty auto-adjustment based on mistake trend | P1 | T3-01 |
| T3-05 | "Why this lesson" transparency view (shows the scheduler's reasoning — supports trust for a years-long relationship) | P2 | T3-01 |

---

## Phase 4 — Voice Conversations

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T4-01 | Implement `OpenAIRealtimeVoiceEngine` adapter (primary voice path) | P0 | T0-04, T0-06, T0-12 |
| T4-02 | Session-seeding: pass memory snapshot + adaptive focus into the Realtime session instructions | P0 | T3-01, T4-01 |
| T4-03 | Implement native fallback `VoiceEngine` adapter (Speech framework + `AVSpeechSynthesizer`) | P0 | T0-04 |
| T4-04 | `AVFoundation` audio session management (recording/playback, interruption handling) | P0 | T4-01, T4-03 |
| T4-05 | Automatic fallback switch (Realtime unavailable → native path) without blocking a session | P0 | T4-01, T4-03 |
| T4-06 | Pronunciation mistake capture pipeline into `mistakes` table (Realtime path) | P1 | T4-01, T1-08 |
| T4-07 | Speaking-speed / confidence signal capture | P2 | T4-01 |
| T4-08 | Voice UI (SwiftUI — waveform/listening state, premium feel per Principle 6) | P1 | T4-01 |

---

## Phase 5 — Premium Polish

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T5-01 | Animation/transition pass across all SwiftUI screens | P1 | Phase 4 complete |
| T5-02 | Performance pass (launch time, streaming perceived latency, offline resilience, background sync efficiency) | P0 | Phase 4 complete |
| T5-03 | Final original visual identity implementation | P1 | T0-08 |
| T5-04 | WidgetKit home-screen widget (streak/progress) | P2 | T1-09 |
| T5-05 | Native `UserNotifications` tuned for motivation without nagging | P2 | T1-09 |
| T5-06 | Accessibility pass (VoiceOver, Dynamic Type) | P1 | Phase 4 complete |
| T5-07 | Data export/delete flow (honors "nothing disappears without explicit permission"; covers both Supabase and SwiftData) | P0 | T1-01, T1-02 |

---

## Phase 6 — Continuous Improvement (ongoing)

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T6-01 | Cost/usage monitoring dashboard (token spend per session/month) — directly supports D4's "avoid unnecessary calls" mandate | P1 | T1-06 |
| T6-02 | Model migration playbook (Claude/OpenAI version upgrades without breaking continuity), exercised via the Domain-layer engine protocols | P1 | T0-04 |
| T6-03 | Raw transcript retention/archival policy implementation | P2 | T1-01 |
| T6-04 | Periodic schema review process (new professional contexts, career changes) | P2 | — |
| T6-05 | Periodic review of backend API contract for future Web/Desktop client readiness | P2 | — |

---

## Backlog hygiene rule

No task is added directly to Phase 1+ without first checking it against the six Core Principles in `PROJECT.md` §4 — if a proposed feature doesn't clearly serve memory, adaptivity, personalization, speaking, quality, or premium feel, it does not belong in this backlog (Principle 5).
