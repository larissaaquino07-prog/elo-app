# TASKS.md

Prioritized backlog. IDs are `<Phase>-<Number>`. Priority: **P0** (blocks the phase), **P1** (needed for the phase's exit criteria), **P2** (valuable, can slip to a later phase without breaking the exit criteria).

This backlog implements the plan in `ROADMAP.md`; do not duplicate scheduling detail here — this file is *what*, `ROADMAP.md` is *when/why*.

---

## Phase 0 — Foundations & Decisions

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T0-01 | Confirm or override decision D1 (reuse `elo-app` repo/stack vs. fresh repo) | P0 | — |
| T0-02 | Confirm or override decision D2 (Claude + OpenAI Realtime hybrid vs. alternative) | P0 | — |
| T0-03 | Confirm or override decision D3 (Supabase managed backend vs. local-first) | P0 | — |
| T0-04 | Confirm or override decision D4 (budget posture) | P1 | — |
| T0-05 | Choose product name + original visual identity direction | P0 | — |
| T0-06 | Design onboarding/first-session assessment flow (seeds memory from zero) | P0 | T0-01 |
| T0-07 | Provision Supabase project (Postgres, `pgvector`, Auth) | P0 | T0-03 |
| T0-08 | Provision Anthropic API + OpenAI API accounts/keys (stored server-side only) | P0 | T0-02 |
| T0-09 | Remove fitness-domain code from existing scaffold (`src/screens/*`, `mockData.ts`, `sports.ts`, fitness types); keep shell (nav, theme, base components) | P0 | T0-01 |
| T0-10 | Decide iOS distribution mechanism for multi-year personal use (Apple Developer Program + TestFlight vs. alternatives) | P1 | — |
| T0-11 | Decide CEFR starting level input method (self-report vs. assessed via onboarding conversation) | P1 | T0-06 |
| T0-12 | Decide voice/accent preference (American vs. British English) | P2 | — |

---

## Phase 1 — Core Text Coach (MVP)

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T1-01 | Implement Postgres schema from `ARCHITECTURE.md` §5 (users, sessions, vocabulary_items, mistakes, topics, goals, achievements, streaks) | P0 | T0-07 |
| T1-02 | Implement Supabase Auth + basic client login flow | P0 | T0-07 |
| T1-03 | Build onboarding flow UI + backend (creates initial user profile, goals, topics) | P0 | T0-06, T1-01 |
| T1-04 | Implement Session Orchestrator Edge Function (loads memory snapshot, calls Claude, streams response) | P0 | T0-08, T1-01 |
| T1-05 | Build text chat conversation UI (client) | P0 | T1-04 |
| T1-06 | Implement Memory Extraction Job (post-session Claude call → vocabulary/mistakes/topics/summary+embedding) | P0 | T1-01, T0-08 |
| T1-07 | Basic progress view: streak, session count, topics touched | P1 | T1-01 |
| T1-08 | Session history list (past conversations, searchable by date) | P2 | T1-01 |

**Exit gate:** matches `ROADMAP.md` Phase 1 exit criteria — coach references prior-session facts unprompted.

---

## Phase 2 — Long-Term Memory Intelligence

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T2-01 | Integrate `pgvector` similarity search into context-building step of orchestrator | P0 | T1-06 |
| T2-02 | Mistake recurrence detection (increment `occurrences`, avoid duplicate rows for same mistake) | P0 | T1-06 |
| T2-03 | Vocabulary mastery state machine (introduced → practicing → mastered, based on repeated correct usage) | P1 | T1-06 |
| T2-04 | Topic coverage map UI (business vs. daily, status per topic) | P1 | T1-01 |
| T2-05 | In-app Q&A over memory ("what do I still struggle with?") using structured + semantic memory | P1 | T2-01, T2-02 |

---

## Phase 3 — Adaptive Learning Engine

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T3-01 | Implement priority-scoring scheduler (`ARCHITECTURE.md` §3.3) | P0 | T2-02, T2-03, T2-04 |
| T3-02 | Weekly HR scenario generator job (Claude-generated, non-repeating) | P0 | T3-01 |
| T3-03 | Daily English scenario rotation logic (maintains 30% weighting over rolling window) | P0 | T3-01 |
| T3-04 | Difficulty auto-adjustment based on mistake trend | P1 | T3-01 |
| T3-05 | "Why this lesson" transparency view (shows the scheduler's reasoning — supports trust for a years-long relationship) | P2 | T3-01 |

---

## Phase 4 — Voice Conversations

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T4-01 | Integrate OpenAI Realtime API client SDK in Expo app | P0 | T0-08, T0-12 |
| T4-02 | Session-seeding: pass memory snapshot + adaptive focus into Realtime session instructions | P0 | T3-01, T4-01 |
| T4-03 | Pronunciation mistake capture pipeline into `mistakes` table | P1 | T4-01, T1-06 |
| T4-04 | Speaking-speed / confidence signal capture | P2 | T4-01 |
| T4-05 | Text-mode fallback if voice session fails mid-session | P0 | T4-01 |
| T4-06 | Voice UI (waveform/listening state, premium feel per Principle 6) | P1 | T4-01 |

---

## Phase 5 — Premium Polish

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T5-01 | Animation/transition pass across all screens | P1 | Phase 4 complete |
| T5-02 | Performance pass (startup time, streaming perceived latency, offline resilience) | P0 | Phase 4 complete |
| T5-03 | Final original visual identity implementation | P1 | T0-05 |
| T5-04 | Streak/reminder notifications tuned for motivation without nagging | P2 | T1-07 |
| T5-05 | Data export/delete flow (honors "nothing disappears without explicit permission" as a reversible action) | P0 | T1-01 |

---

## Phase 6 — Continuous Improvement (ongoing)

| ID | Task | Priority | Depends on |
|---|---|---|---|
| T6-01 | Cost/usage monitoring dashboard (token spend per session/month) | P1 | T1-04 |
| T6-02 | Model migration playbook (Claude/OpenAI version upgrades without breaking continuity) | P1 | — |
| T6-03 | Raw transcript retention/archival policy implementation | P2 | T1-01 |
| T6-04 | Periodic schema review process (new professional contexts, career changes) | P2 | — |

---

## Backlog hygiene rule

No task is added directly to Phase 1+ without first checking it against the six Core Principles in `PROJECT.md` §4 — if a proposed feature doesn't clearly serve memory, adaptivity, personalization, speaking, quality, or premium feel, it does not belong in this backlog (Principle 5).
