# ROADMAP.md

Phased delivery plan. Durations are relative working sessions for a solo developer using Claude Code, not corporate-team estimates — treat them as sequencing guidance, not deadlines. Each phase has an explicit exit criteria; a phase is not "done" until its criteria are met, per Principle 5 (quality over quantity).

Implements the confirmed stack: **React Native + Expo, TypeScript, MVVM + Clean Architecture, `expo-sqlite` + Supabase** — see `ARCHITECTURE.md`. **The architecture was formally reviewed and frozen on 2026-08-06** (`ARCHITECTURE_DECISIONS.md`); the plan below reflects that review's required and recommended changes, **plus the 2026-08-07 client platform migration from native Swift to React Native + Expo** (ADR-019–024, `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md`, `RN_EXPO_MIGRATION_PLAN.md`) — the phase structure and sequencing logic are unchanged by that migration; only the technology named in each phase's bullets is updated.

---

## Phase 0 — Foundations & Project Setup
**Goal:** Stand up the real project and resolve everything that would otherwise stall Phase 1.

- ✅ Done (2026-08-06) — Remove the existing Expo/React Native scaffold from the repository — it belonged to an unrelated, discontinued project and is not migrated. See `MIGRATION_PLAN.md` for the execution report.
- Create a fresh Expo project (React Native + TypeScript, strict mode), with Domain + Data packaged as monorepo workspace packages (`@coach/domain`, `@coach/data`) from the start (ADR-021).
- Set up the MVVM + Clean Architecture module structure (Presentation / Domain / Data), including Repository interfaces (not just Engine interfaces) so Presentation never touches `expo-sqlite` directly.
- Provision Supabase project (Postgres + `pgvector` + Auth + Edge Functions + Storage) and Anthropic + OpenAI API accounts.
- Define the Domain-layer provider interfaces (`ConversationEngine`, `VoiceEngine`, `MemoryExtractionEngine`) so D2's decoupling requirement is structural from the first commit; validate with a minimal second `ConversationEngine` adapter.
- Define the `expo-sqlite`/Drizzle local schema and the sync/conflict-resolution strategy, including idempotent upserts and per-device sync cursors (`ARCHITECTURE.md` §4).
- Set up CI (GitHub Actions) running unit tests on every push — no macOS runner required for this gate.
- Choose product name and original visual identity direction.
- Design the onboarding/first-session flow (CEFR-style level check, goals interview) that seeds long-term memory from zero.
- Confirm distribution mechanism (EAS Build + EAS Submit, ADR-019) — substantially de-risked versus the original Apple Developer Program + local-Xcode plan (`RISKS.md` R-07).

**Exit criteria:** Expo project + `@coach/domain`/`@coach/data` packages build and run on-device with the MVVM+Clean Architecture skeleton in place (Repository and Engine interfaces both present), Supabase + AI accounts provisioned, CI green, product name and onboarding flow spec finalized, distribution mechanism confirmed.

---

## Phase 1 — Core Text Coach (MVP)
**Goal:** A working conversational English coach, text-only, that already remembers — offline-capable from day one via `expo-sqlite`.

- Implement the Supabase Postgres schema (`ARCHITECTURE.md` §9.1), including indexes, `learner_profile`, `device_sync_state`, and `streaks` as a derived view.
- Implement matching `expo-sqlite`/Drizzle local models + `SyncCoordinator` (idempotent upserts, per-device watermark pull, conflict rules).
- Implement the Repository layer (`SessionRepository`, `MemoryRepository`) + mappers so Presentation never touches `expo-sqlite` or Supabase directly.
- Supabase Auth integration with `expo-secure-store`-backed session storage; app-level Face ID/Touch ID lock (`expo-local-authentication`) on iOS/Android.
- Onboarding flow (React Native + Expo Router) → creates the initial user profile, goals, topics, and seeds `learner_profile`, both locally and remotely.
- Session Orchestrator (backend) + `GroqConversationEngine` adapter (ADR-025, 2026-08-10 — replacing the originally-planned `ClaudeConversationEngine`).
- Text chat UI (MVVM: screens + Zustand stores), reading/writing through the Repository/Use Case layer only.
- Memory Extraction Job (server-side, Groq) → vocabulary, mistakes, topics, summary + embedding; transcript uploaded to object storage, never stored inline.
- Learner Profile Updater (incremental rollup summary, `ARCHITECTURE.md` §5.2) — a strong "knows me" baseline before any topic-specific retrieval runs.
- Weekly backup export job (Supabase + a secondary, user-owned location).
- Basic progress view (streak — derived from session history, not a synced field — session count, topics touched) via the Repository layer.

**Exit criteria:** Julia can have a real text conversation, close the app, come back the next day (with or without connectivity in between), and the coach visibly remembers the prior session without voice yet — on iPhone, Android, or the web/PWA companion surface.

---

## Phase 2 — Long-Term Memory Intelligence
**Goal:** Memory becomes genuinely useful, not just stored and synced.

- Integrate `pgvector` similarity search into the backend's context-building step.
- Mistake recurrence detection (increment `occurrences`, avoid duplicate rows for the same mistake).
- Vocabulary mastery state machine (introduced → practicing → mastered).
- Topic coverage map, surfaced in a screen backed by the `expo-sqlite` cache.

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
**Goal:** Speaking becomes the primary interaction mode (Principle 4), on top of a proven memory + adaptive foundation.

**Rewritten 2026-08-10 (ADR-026, zero-cost constraint) — inverted from the original iOS-primary plan:**

- Integrate the browser's native `SpeechRecognition`/`SpeechSynthesis` Web APIs on the **web/PWA target** — this is now the app's only voice-input path, seeded with memory context from the backend the same way the original Realtime plan was.
- `expo-speech` provides voice **output** on iOS/Android (Expo Go) — the coach can speak there even though it can't listen.
- No `@react-native-voice/voice`, no `react-native-webrtc`, no OpenAI Realtime API — all require either a paid API or a custom dev-client build this project isn't funding under the zero-cost constraint (`RISKS.md` R-07).
- Pronunciation mistake capture into structured memory (from the web `SpeechRecognition` path).
- **Conditional reversal**: if Julia ever lifts the zero-cost constraint, this phase reverts toward the original iOS-primary, Realtime-based design — `ARCHITECTURE_DECISIONS.md` ADR-026 for the full reasoning.

**Exit criteria:** A full session can happen by voice only, start to finish, on the web/PWA target, with the same memory continuity as text sessions; pronunciation issues show up in the mistakes table; iOS/Android sessions remain fully usable by text, with spoken coach output via `expo-speech`.

---

## Phase 5 — Premium Polish
**Goal:** Principle 6 — everything feels premium, and platform capabilities are put to use, not left on the table.

- Animation/transition pass across all screens via React Native Reanimated, per `DESIGN_SYSTEM.md` §6.
- Performance pass against the numeric targets in `NON_FUNCTIONAL_REQUIREMENTS.md` §1–3 (launch time, latency perception, offline resilience, background sync efficiency).
- Implement the full `DESIGN_SYSTEM.md` token set and component library (colors, typography, spacing, motion, haptics via `expo-haptics`).
- Native daily reminder/streak notifications via `expo-notifications` (iOS/Android).
- Accessibility pass against `DESIGN_SYSTEM.md` §11 / `NON_FUNCTIONAL_REQUIREMENTS.md` §7 — across VoiceOver, TalkBack, and web screen readers, a broader accessibility surface than the original iOS-only plan.
- Data export/delete flow (honors "nothing disappears without explicit permission" as a reversible action, across both Supabase and `expo-sqlite`).
- WidgetKit home-screen widget: **deferred to post-launch** (`PROJECT.md` §11, ADR-019 consequence) — it requires isolated native Swift code regardless of client framework; sequenced out of this phase so the cross-platform core isn't blocked by one iOS-only feature.

**Exit criteria:** Daily use feels effortless and polished end-to-end, meeting `NON_FUNCTIONAL_REQUIREMENTS.md` targets; no rough edges in core loops (start session, speak, review progress) on iOS/Android; the web/PWA companion surface is polished within its own, narrower scope; app is fully usable with a screen reader on every platform.

---

## Phase 6 — Continuous Improvement (ongoing, multi-year)
**Goal:** Sustain Principles 1 & 2 for years, not just at launch.

- Periodic review of memory schema as new needs emerge (e.g., new professional context, relocation, career change).
- Model/provider upgrades (Groq model updates, or a future paid-provider reversion — ADR-025 — if the zero-cost constraint ever lifts) without losing continuity — enabled structurally by the Domain-layer engine interfaces from Phase 0.
- Data retention/archival strategy maturation (raw transcript pruning policy, backups).
- Periodic evaluation of whether the backend's platform-agnostic contract still holds, in case a future dedicated desktop client is ever pursued — partially validated already, since the web/PWA companion surface proves the same reuse pattern in v1.
- Ongoing review of the learning-health indicators in `OBSERVABILITY.md` §9 (Fluency/Confidence trend, weak-topic resolution rate) — a flat trend despite consistent use is a cue to revisit `LEARNING_ENGINE.md`/`PROMPT_ENGINE.md`, not just to keep shipping features.
- Revisit the WidgetKit deferral (Phase 5) once the cross-platform core is stable.
- Recurring UX refinement based on real multi-month usage patterns.

**Exit criteria:** N/A — this phase does not close; it is the steady state the rest of the roadmap builds toward.

---

## Sequencing rationale

Voice is deliberately placed *after* memory and adaptive learning (Phase 4, not Phase 1) even though Principle 4 calls it the highest priority *capability*. Building it first would risk shipping a novelty voice demo with no memory behind it — directly against Principle 2 and 3. Text-first lets the hardest, most durable part of the system (memory + adaptivity, now doubly so with the `expo-sqlite` ↔ Supabase sync layer) get proven before adding the highest-complexity, most vendor-dependent component (real-time voice).

**Client platform note (2026-08-07):** this phase sequencing was originally designed around native Swift/SwiftUI and is unaffected by the subsequent migration to React Native + Expo (ADR-019) — the *reasoning* (memory before adaptivity before voice, design system before screens) was never platform-specific, and continues to hold exactly as written. What changed is the technology named in each phase's bullets, not the order or the reasoning behind it. See `ARCHITECTURE_DECISIONS.md`'s ADR-019–024 addendum for the full account of that migration.
