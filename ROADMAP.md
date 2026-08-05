# ROADMAP.md

Phased delivery plan. Durations are relative working sessions for a solo developer using Claude Code, not corporate-team estimates — treat them as sequencing guidance, not deadlines. Each phase has an explicit exit criteria; a phase is not "done" until its criteria are met, per Principle 5 (quality over quantity).

---

## Phase 0 — Foundations & Decisions
**Goal:** Resolve everything that blocks Phase 1 so implementation doesn't stall mid-build.

- Confirm/override architecture decisions D1–D4 (`PROJECT.md` §8).
- Choose product name and app identity (visual identity must be original — no copying existing apps).
- Design the onboarding/first-session flow (CEFR-style level check, goals interview) that seeds long-term memory from zero.
- Set up Supabase project (Postgres + `pgvector` + Auth) and Anthropic/OpenAI API accounts.
- Remove fitness-domain code from the existing `elo-app` scaffold; keep reusable shell (navigation, theming, base components).
- Decide iOS distribution mechanism (Apple Developer Program + TestFlight vs. alternatives) — see `RISKS.md` R-07.

**Exit criteria:** Product name set, Supabase + AI accounts provisioned, onboarding flow spec written, legacy fitness code removed, distribution mechanism chosen.

---

## Phase 1 — Core Text Coach (MVP)
**Goal:** A working conversational English coach, text-only, that already remembers.

- Implement data model (`ARCHITECTURE.md` §5) in Supabase.
- Build onboarding flow → creates initial `users` row + first `topics`/`goals`.
- Build text chat UI with Claude-backed conversation orchestration.
- Implement Memory Extraction Job (post-session → vocabulary, mistakes, topics, summary + embedding).
- Basic progress view (streak, sessions count, topics touched).

**Exit criteria:** Julia can have a real text conversation, close the app, come back the next day, and the coach visibly remembers the prior session (references a mistake or topic from before) without voice yet.

---

## Phase 2 — Long-Term Memory Intelligence
**Goal:** Memory becomes genuinely useful, not just stored.

- Semantic recall via `pgvector` similarity search integrated into session context building.
- Mistake tracking with recurrence detection and resolution status.
- Vocabulary mastery tracking (introduced → practicing → mastered).
- Topic coverage map (business vs. daily, mastered vs. to-review).

**Exit criteria:** The coach can answer, from the app itself, questions like "what do I still struggle with?" or "what have we covered about performance reviews?" using real stored data.

---

## Phase 3 — Adaptive Learning Engine
**Goal:** The coach decides what to study next, not the user.

- Implement the priority-scoring scheduler (`ARCHITECTURE.md` §3.3).
- Weekly HR scenario generator (fresh, non-repeating business role-plays).
- Daily English scenario rotation (30% weighting maintained automatically).
- Difficulty auto-adjustment based on mistake frequency/resolution trend.

**Exit criteria:** Julia stops choosing lesson topics manually; the app proposes what to work on each session, and the 70/30 business/daily balance holds over a rolling multi-week window.

---

## Phase 4 — Voice Conversations
**Goal:** Speaking becomes the primary interaction mode (Principle 4), on top of a proven memory + adaptive foundation.

- Integrate OpenAI Realtime API for live speech-to-speech sessions, seeded with memory context from Claude/Postgres.
- Pronunciation mistake capture into structured memory.
- Speaking-speed and confidence signal capture.
- Fallback to text mode if voice session fails (never blocks a study session).

**Exit criteria:** A full session can happen by voice only, start to finish, with the same memory continuity as text sessions, and pronunciation issues show up in the mistakes table.

---

## Phase 5 — Premium Polish
**Goal:** Principle 6 — everything feels premium.

- Animation/transition pass across all screens.
- Performance pass (startup time, streaming response latency perception, offline resilience).
- Visual identity finalization (original design system, no derivative UI).
- Notifications/streak reinforcement tuned to feel motivating, not naggy.

**Exit criteria:** Daily use feels effortless and polished end-to-end; no rough edges in core loops (start session, speak, review progress).

---

## Phase 6 — Continuous Improvement (ongoing, multi-year)
**Goal:** Sustain Principles 1 & 2 for years, not just at launch.

- Periodic review of memory schema as new needs emerge (e.g., new professional context, relocation, career change).
- Model upgrades (Claude/OpenAI model version migrations) without losing continuity — see `RISKS.md` R-05.
- Data retention/archival strategy maturation (raw transcript pruning policy, backups).
- Recurring UX refinement based on real multi-month usage patterns.

**Exit criteria:** N/A — this phase does not close; it is the steady state the rest of the roadmap builds toward.

---

## Sequencing rationale

Voice is deliberately placed *after* memory and adaptive learning (Phase 4, not Phase 1) even though Principle 4 calls it the highest priority *capability*. Building it first, in a survey of "what usually fails," would risk shipping a novelty voice demo with no memory behind it — directly against Principle 2 and 3. Text-first lets the hardest, most durable part of the system (memory + adaptivity) get proven before adding the highest-complexity, most vendor-dependent component (real-time voice).
