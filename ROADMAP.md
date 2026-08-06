# ROADMAP.md

Phased delivery plan. Durations are relative working sessions for a solo developer using Claude Code, not corporate-team estimates — treat them as sequencing guidance, not deadlines. Each phase has an explicit exit criteria; a phase is not "done" until its criteria are met, per Principle 5 (quality over quantity).

Implements the confirmed stack: native iOS (Swift 6, SwiftUI, iOS 18+, MVVM + Clean Architecture, SwiftData + Supabase) — see `ARCHITECTURE.md`. **The architecture was formally reviewed and frozen on 2026-08-06** (`ARCHITECTURE_DECISIONS.md`); the plan below already reflects that review's required and recommended changes.

---

## Phase 0 — Foundations & Project Setup
**Goal:** Stand up the real, native project and resolve everything that would otherwise stall Phase 1.

- Remove the existing Expo/React Native scaffold from the repository — it belonged to an unrelated project and is not migrated.
- Create a fresh native Xcode project (Swift 6, SwiftUI, iOS 18+ deployment target), with Domain + Data packaged as a separate Swift Package (`CoachKit`) from the start.
- Set up the MVVM + Clean Architecture module structure (Presentation / Domain / Data), including Repository protocols (not just Engine protocols) so Presentation never touches SwiftData directly.
- Provision Supabase project (Postgres + `pgvector` + Auth + Edge Functions + Storage) and Anthropic + OpenAI API accounts.
- Define the Domain-layer provider protocols (`ConversationEngine`, `VoiceEngine`, `MemoryExtractionEngine`) so D2's decoupling requirement is structural from the first commit; validate with a minimal second `ConversationEngine` adapter.
- Define the SwiftData local schema and the sync/conflict-resolution strategy, including idempotent upserts and per-device sync cursors (`ARCHITECTURE.md` §4).
- Set up CI (GitHub Actions) running unit tests on every push.
- Choose product name and original visual identity direction.
- Design the onboarding/first-session flow (CEFR-style level check, goals interview) that seeds long-term memory from zero.
- Decide iOS distribution mechanism (Apple Developer Program + TestFlight vs. alternatives) — see `RISKS.md` R-07.

**Exit criteria:** Native Xcode project + `CoachKit` package build and run on-device with the MVVM+Clean Architecture skeleton in place (Repository and Engine protocols both present), Supabase + AI accounts provisioned, CI green, product name and onboarding flow spec finalized, distribution mechanism chosen.

---

## Phase 1 — Core Text Coach (MVP)
**Goal:** A working conversational English coach, text-only, that already remembers — offline-capable from day one via SwiftData.

- Implement the Supabase Postgres schema (`ARCHITECTURE.md` §9.1), including indexes, `learner_profile`, `device_sync_state`, and `streaks` as a derived view.
- Implement matching SwiftData local models + `SyncCoordinator` (idempotent upserts, per-device watermark pull, conflict rules).
- Implement the Repository layer (`SessionRepository`, `MemoryRepository`) + mappers so Presentation never touches SwiftData or Supabase directly.
- Supabase Auth integration with Keychain-backed session storage; app-level Face ID/Touch ID lock.
- Onboarding flow (SwiftUI) → creates the initial user profile, goals, topics, and seeds `learner_profile`, both locally and remotely.
- Session Orchestrator (backend) + `ClaudeConversationEngine` adapter.
- Native SwiftUI text chat UI (MVVM), reading/writing through the Repository/Use Case layer only.
- Memory Extraction Job (server-side, Claude) → vocabulary, mistakes, topics, summary + embedding; transcript uploaded to object storage, never stored inline.
- Learner Profile Updater (incremental rollup summary, `ARCHITECTURE.md` §5.2) — a strong "knows me" baseline before any topic-specific retrieval runs.
- Weekly backup export job (Supabase + a secondary, user-owned location).
- Basic progress view (streak — derived from session history, not a synced field — session count, topics touched) via the Repository layer.

**Exit criteria:** Julia can have a real text conversation, close the app, come back the next day (with or without connectivity in between), and the coach visibly remembers the prior session without voice yet.

---

## Phase 2 — Long-Term Memory Intelligence
**Goal:** Memory becomes genuinely useful, not just stored and synced.

- Integrate `pgvector` similarity search into the backend's context-building step.
- Mistake recurrence detection (increment `occurrences`, avoid duplicate rows for the same mistake).
- Vocabulary mastery state machine (introduced → practicing → mastered).
- Topic coverage map, surfaced in a native SwiftUI view backed by the SwiftData cache.

**Exit criteria:** The coach can answer, from the app itself, questions like "what do I still struggle with?" or "what have we covered about performance reviews?" using real stored data, online or offline (against the last-synced cache).

---

## Phase 3 — Adaptive Learning Engine
**Goal:** The coach decides what to study next, not the user.

- Implement the priority-scoring scheduler (`ARCHITECTURE.md` §5.3).
- Weekly HR scenario generator (fresh, non-repeating business role-plays).
- Daily English scenario rotation (30% weighting maintained automatically).
- Difficulty auto-adjustment based on mistake frequency/resolution trend.

**Exit criteria:** Julia stops choosing lesson topics manually; the app proposes what to work on each session, and the 70/30 business/daily balance holds over a rolling multi-week window.

---

## Phase 4 — Voice Conversations
**Goal:** Speaking becomes the primary interaction mode (Principle 4), on top of a proven memory + adaptive foundation, with native continuity when offline.

- Integrate OpenAI Realtime API (primary voice engine) via `VoiceEngine`, seeded with memory context from the backend.
- Integrate Speech framework (on-device recognition) + `AVSpeechSynthesizer` as the offline/fallback voice path.
- `AVFoundation`-based audio session management (recording/playback, interruption handling).
- Pronunciation mistake capture into structured memory (Realtime path).
- Automatic fallback switch when the Realtime session is unavailable — never blocks a study session.

**Exit criteria:** A full session can happen by voice only, start to finish, with the same memory continuity as text sessions; pronunciation issues show up in the mistakes table; losing connectivity mid-flow degrades gracefully to the native fallback instead of failing.

---

## Phase 5 — Premium Polish
**Goal:** Principle 6 — everything feels premium, and native platform capabilities are put to use, not left on the table.

- Animation/transition pass across all SwiftUI screens, per `DESIGN_SYSTEM.md` §6.
- Performance pass against the numeric targets in `NON_FUNCTIONAL_REQUIREMENTS.md` §1–3 (launch time, latency perception, offline resilience, background sync efficiency).
- Implement the full `DESIGN_SYSTEM.md` token set and component library (colors, typography, spacing, motion, haptics).
- WidgetKit home-screen widget (streak/progress).
- Native `UserNotifications` tuned for motivation without nagging.
- Accessibility pass against `DESIGN_SYSTEM.md` §11 / `NON_FUNCTIONAL_REQUIREMENTS.md` §7.
- Data export/delete flow (honors "nothing disappears without explicit permission" as a reversible action, across both Supabase and SwiftData).

**Exit criteria:** Daily use feels effortless and polished end-to-end, meeting `NON_FUNCTIONAL_REQUIREMENTS.md` targets; no rough edges in core loops (start session, speak, review progress); app is fully usable with VoiceOver.

---

## Phase 6 — Continuous Improvement (ongoing, multi-year)
**Goal:** Sustain Principles 1 & 2 for years, not just at launch.

- Periodic review of memory schema as new needs emerge (e.g., new professional context, relocation, career change).
- Model upgrades (Claude/OpenAI model version migrations) without losing continuity — enabled structurally by the Domain-layer engine protocols from Phase 0.
- Data retention/archival strategy maturation (raw transcript pruning policy, backups).
- Periodic evaluation of whether the backend's platform-agnostic contract still holds, in case a Web/Desktop client is ever pursued.
- Ongoing review of the learning-health indicators in `OBSERVABILITY.md` §9 (Fluency/Confidence trend, weak-topic resolution rate) — a flat trend despite consistent use is a cue to revisit `LEARNING_ENGINE.md`/`PROMPT_ENGINE.md`, not just to keep shipping features.
- Recurring UX refinement based on real multi-month usage patterns.

**Exit criteria:** N/A — this phase does not close; it is the steady state the rest of the roadmap builds toward.

---

## Sequencing rationale

Voice is deliberately placed *after* memory and adaptive learning (Phase 4, not Phase 1) even though Principle 4 calls it the highest priority *capability*. Building it first would risk shipping a novelty voice demo with no memory behind it — directly against Principle 2 and 3. Text-first lets the hardest, most durable part of the system (memory + adaptivity, now doubly so with the SwiftData ↔ Supabase sync layer) get proven before adding the highest-complexity, most vendor-dependent component (real-time voice).

Going fully native (D1) from Phase 0 — rather than starting on the old Expo scaffold and migrating later — avoids ever building throwaway work: nothing from Phase 1 onward needs to be rewritten when native capabilities (Speech framework, widgets, notifications) are introduced in later phases, because the architecture was built to use them from the start.
