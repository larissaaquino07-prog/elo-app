# PROJECT.md

**Consolidated Project Vision**
Source of truth for requirements: `PROJECT_BRIEF.md` (v1.0, Draft, Owner: Julia).
This document translates that brief into an actionable product/engineering vision. It is a living document — when new requirements are added, this file is updated, not duplicated.

Working codename for this document set: **"Coach"** (no final product name has been chosen yet — see [Open items](#9-gaps-and-open-items)).

---

## 1. What this is

A premium, AI-powered personal English coach for iOS, built for a single user (Julia), designed to be used **daily, for years**, without ever losing history. It is not a generic language-learning app — it is a long-term relationship with an AI tutor that:

- remembers every mistake, word, and topic ever covered
- gets measurably smarter about the user with every session
- generates personalized lessons instead of static curricula
- prioritizes **speaking** over reading/writing/grammar drills
- splits focus **70% Business English / 30% Daily English**, weighted toward HR/multinational-corporate scenarios

## 2. Who it's for

Single user, HR professional, goal: fluency sufficient to work in multinational companies (meetings, interviews, presentations, negotiations, emails, cross-cultural small talk). Learning style: conversational, real-life simulation, speaking-first, grammar-through-usage, constant feedback, adaptive difficulty.

## 3. Success definition (from brief, verbatim intent)

The product succeeds if, through consistent use, Julia can:
- Participate confidently in meetings entirely in English
- Conduct job interviews in English
- Write professional emails without translation tools
- Communicate naturally with international coworkers
- Give presentations in English
- Travel internationally without communication problems
- Keep improving for years without switching platforms

This last point is an explicit **architecture constraint**, not just a UX goal: switching platforms must never be necessary, which means data portability and long-term maintainability are first-class requirements, not nice-to-haves.

## 4. Core principles (non-negotiable, from brief)

1. **Remember everything.** Nothing important is ever forgotten without explicit user action.
2. **Get smarter every day.** Every conversation improves future conversations.
3. **Always personalized.** No generic lessons, no random exercises.
4. **Speaking first.** Reading/writing/grammar support speaking, not the other way around.
5. **Quality over quantity.** Ten excellent exercises beat a hundred mediocre ones.
6. **Everything feels premium.** Animations, transitions, performance, design, voice, interactions.

These principles are used as the acceptance filter for every feature decision in `TASKS.md`.

## 5. Product philosophy

The AI is a mentor, not a school. Personality: patient, professional, friendly, motivating, honest, demanding when necessary, encouraging, supportive. It celebrates progress while naming weaknesses objectively. It never sounds robotic, never repeats identical phrasing, and adapts its own language complexity to the user's current level.

## 6. Feature pillars

| Pillar | Brief section | Summary |
|---|---|---|
| Long-Term Memory | §5 | Permanent record of vocabulary, expressions, corrections, grammar/pronunciation mistakes, sessions, speaking speed, confidence, streaks, goals, achievements, topics covered/mastered/to-review |
| Adaptive Learning | §6 | Continuously decides next topic, which mistakes need attention, when to raise/lower difficulty, when to review vs. challenge |
| Voice Conversations | §4, §9 | Primary interaction mode; natural, varied, level-appropriate AI voice |
| Business English (70%) | §7 | HR-centric: interviews, onboarding, policies, reports, recruitment, benefits, 1:1s, feedback, conflict resolution, performance reviews, HR analytics, presentations, global meetings, leadership talk |
| Daily English (30%) | §8 | Travel, restaurants, hotels, taxi, airport, shopping, movies, gym, friends, dating, family, healthcare, tech, weather |
| Long-Term Progress Tracking | §5, §6 | Visible evolution over months/years — mistakes resolved, vocabulary growth, level progression |

## 7. Explicit non-goals

- Not a multi-user or social product (no feed, no leaderboard, no friends system, no monetization).
- Not a general-subject tutor (no math, no test prep unrelated to English).
- Not a gamification-first app — engagement mechanics only in service of Principle 5 (quality over quantity), never as filler content.
- Not tied to any single AI vendor's brand identity or UI conventions — original visual design only (per user instructions).
- ~~Not cross-platform in v1 — iOS-only by deliberate choice~~ **Corrected 2026-08-07**: cross-platform (iOS + Android + Web/PWA) is now the v1 architecture, per the client platform migration in §8. iOS remains the primary, full-capability surface; Web is a deliberate companion surface (ADR-024), not full parity — see `ARCHITECTURE_DECISIONS.md` ADR-019/024.

## 8. Confirmed architecture decisions

The following decisions were open after the initial analysis pass and have since been **confirmed directly by Julia**. They now govern `ARCHITECTURE.md`, `ROADMAP.md`, and `TASKS.md` — they are no longer defaults subject to silent revision.

- **D1 — Client platform & codebase**: ~~The application is built as a fresh native iOS app using Swift 6 + SwiftUI, targeting iOS 18+~~ **Superseded 2026-08-07 (ADR-019):** the application is built with **React Native + Expo, TypeScript**, targeting **iOS (primary), Android, and Web/PWA (companion surface)**, with an **MVVM + Clean Architecture** structure (unchanged pattern, `ARCHITECTURE.md` §2). The native-Swift attempt is not a discarded mistake — it produced the entire architecture (data model, sync design, Memory/Learning/Prompt Engines) this migration preserves in full; only the client implementation technology changed, because the confirmed device requirements (iPhone **and** a Samsung Windows notebook, permanently, no macOS access ever) made SwiftUI structurally incompatible with the actual target, not just inconvenient. Full analysis: `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md`, `RN_EXPO_MIGRATION_PLAN.md`. The discontinued pre-2026-08-06 Expo fitness prototype remains completely unrelated and uninfluential on this decision (ADR-017, reaffirmed) — this is React Native chosen fresh on its own current merits, not a reversion.
- **D2 — AI engine**: Hybrid, decoupled by design. **Anthropic Claude** is the primary engine for conversation, explanations, corrections, and content/lesson generation. **OpenAI Realtime API** handles speech-to-text/text-to-speech for live voice conversation. The architecture must abstract both behind Domain-layer interfaces (not vendor SDKs called directly from feature code) specifically so either provider can be replaced later without touching business logic — see `ARCHITECTURE.md` §5. Unaffected by D1's supersession — this decision was always backend-side.
- **D3 — Memory & persistence**: **Supabase (Postgres)** is the authoritative backend and single source of truth for all long-term memory (history, progress, vocabulary, mistakes, statistics) — unchanged. ~~SwiftData provides local persistence~~ **Superseded 2026-08-07 (ADR-020):** **`expo-sqlite` + Drizzle ORM** provides local persistence on-device for caching and offline use, playing the exact same architectural role SwiftData was assigned. The app synchronizes automatically whenever connectivity is available; the local store is a durable cache and offline queue, never a competing source of truth.
- **D4 — Budget posture**: Moderate. Willing to pay for a high-quality experience, but the architecture must actively avoid unnecessary API calls (caching, batching, on-device alternatives where sensible) and must keep providers swappable so cheaper or better alternatives can be adopted later without a rewrite. Unaffected by D1's supersession.

Additional constraints set alongside these decisions:
- ~~Use native iOS frameworks wherever it makes sense~~ **Superseded 2026-08-07:** use Expo/React Native capabilities wherever they make sense: `@react-native-voice/voice` (speech recognition), `expo-audio` + `react-native-webrtc` (audio/realtime voice), `expo-speech` (local TTS fallback), `expo-notifications`, `expo-local-authentication`, `expo-secure-store`, and React Native's built-in accessibility props. WidgetKit-based home-screen widgets remain iOS-native-only and are deferred to post-launch (ADR-019 consequence) — see `ARCHITECTURE.md` §8 for the full mapping.
- The **backend must remain platform-agnostic** — this constraint is now validated rather than merely aspirational: the exact same backend served the native-Swift design and now serves React Native without any change, proving the principle within the same project rather than waiting for a hypothetical future client. Web/PWA is no longer a hypothetical future client — it ships in this same v1 (as a companion surface, ADR-024), sooner than originally planned.

## 9. Gaps and open items

Per the analysis mandate, the following remain **underspecified** and are tracked as open items rather than silently assumed:

- No initial-assessment / onboarding flow defined — "no generic lessons" conflicts with a true cold start (day 1, zero memory). Needs a first-session calibration flow (level check, goals interview) that itself becomes the seed of long-term memory.
- No stated CEFR level or starting proficiency for Julia.
- No voice/accent preference (American vs. British English) or speech-recognition tolerance for Portuguese-accented English.
- No retention/deletion policy detail beyond "nothing disappears without explicit permission" — needs a concrete data export/delete UX.
- No distribution mechanism confirmed for a personal iOS app used for years — **substantially de-risked 2026-08-07**: EAS Build/Submit removes the local-macOS dependency `RISKS.md` R-07 originally worried about, though the underlying 90-day TestFlight build-expiry cycle is unaffected by the platform migration and still needs a renewal process.
- Conflict-resolution policy for the local-cache ↔ Supabase sync is specified in full (`ARCHITECTURE.md` §4) — resolved, unaffected by the storage-engine change from SwiftData to `expo-sqlite`.
- No product name.
- **New (2026-08-07):** exact web/PWA capability-parity scope is decided in principle (companion surface, ADR-024) but the precise feature list available on web (which screens, whether text-only sessions are fully supported there) needs to be enumerated during `IMPLEMENTATION_PLAN.md`'s re-authoring, not left implicit.

These are captured as Phase 0 tasks in `TASKS.md` and as risks in `RISKS.md`.

## 10. Architecture status

The technical architecture underwent a full Principal-Architect-level review on **2026-08-06**, covering Clean Architecture/SOLID compliance, scalability to a multi-year/multi-device horizon, persistence, sync, AI provider independence, the memory engine, voice, security, performance, and testability. All required changes from that review are incorporated into `ARCHITECTURE.md`; every decision and its rationale is recorded in `ARCHITECTURE_DECISIONS.md`.

A follow-up specification pass, same day, produced five product-level documents (`PROMPT_ENGINE.md`, `LEARNING_ENGINE.md`, `DESIGN_SYSTEM.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `OBSERVABILITY.md`), closing the gap between "the architecture is sound" and "every behavior, formula, visual detail, and measurable target is specified."

**Client platform migration (2026-08-07):** an attempt to begin implementation surfaced that this project's actual device requirements (iPhone + a Samsung Windows notebook, permanently, no macOS access ever) were structurally incompatible with the native Swift/SwiftUI client platform decided above — not a tooling inconvenience, a platform fact (SwiftUI cannot run on Windows). After a comparative analysis (`CLIENT_PLATFORM_MIGRATION_ANALYSIS.md`) and a full technical migration plan (`RN_EXPO_MIGRATION_PLAN.md`), the client platform was changed to **React Native + Expo**, executed via ADR-019 through ADR-024 in `ARCHITECTURE_DECISIONS.md`. Every business/product-architecture document — `PROMPT_ENGINE.md`, `LEARNING_ENGINE.md`, the entire backend, the Postgres schema, the sync design (ADR-007) — required **zero changes**, having been deliberately built platform-agnostic from the original review. `ARCHITECTURE.md`'s client-layer sections, `DESIGN_SYSTEM.md`'s implementation notes, and `IMPLEMENTATION_PLAN.md`'s macro-stages 1–4 were updated accordingly. This is a technology substitution of the same architecture, explicitly **not** a new project and explicitly **not** a reversion to the discontinued Expo fitness prototype (ADR-017, reaffirmed in the ADR-019–024 addendum) — see `ARCHITECTURE_DECISIONS.md`'s addendum for the full reasoning on why those two things must not be conflated.

**This — the original specification pass (2026-08-06) plus the following day's platform migration (2026-08-07) — is considered the final documentation baseline before implementation begins.**

## 11. Candidate future features (post-v1, low priority)

Identified during the architecture review as valuable and consistent with the Core Principles, deliberately kept at low priority (Phase 5/6, `TASKS.md`) rather than pulled forward, to respect Principle 5 (quality over quantity) — the MVP loop (Phases 1–4) must be excellent before these are worth building:

- Proactive event-prep coaching ("I have an interview next Tuesday" → the coach adapts upcoming sessions toward it) — the adaptive scheduler already reserves an input for this (`ARCHITECTURE.md` §5.3, `LEARNING_ENGINE.md` §10); UI activation tracked as `TASKS.md` T6-06.
- Streak grace period, post-session recap, saved phrases/bookmarks, practice-history heatmap — small, high-warmth UX additions common to durable daily-habit apps, absent from the original brief; tracked as `TASKS.md` T5-08–T5-11.
- A future dedicated desktop/macOS client reusing the same `@coach/domain`/`@coach/data` workspace packages (`ARCHITECTURE.md` §6, ADR-013/ADR-021); evaluation tracked as `TASKS.md` T6-07. Partially achieved already: the web/PWA companion surface (ADR-024) already proves this reuse pattern in v1, ahead of schedule.
- WidgetKit home-screen widget (`TASKS.md` T5-04) — deferred to post-launch (2026-08-07, ADR-019 consequence): it requires isolated native Swift code regardless of client framework, an iOS-platform fact no cross-platform choice removes.

## 12. Related documents

Architecture & delivery:
- `ROADMAP.md` — phased delivery plan
- `TASKS.md` — prioritized backlog
- `ARCHITECTURE.md` — technical architecture and data model
- `ARCHITECTURE_DECISIONS.md` — architecture decision records (ADRs) and review approval checklist
- `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md` — React Native vs. Flutter comparison and recommendation that produced the D1 platform migration
- `RN_EXPO_MIGRATION_PLAN.md` — the full technical migration plan (stack decisions, ADR review, per-document plan) that D1's supersession executes
- `IMPLEMENTATION_PLAN.md` — detailed, task-by-task execution plan (26 macro-stages), the active guide for implementation
- `REPOSITORY_AUDIT.md` — full audit of legacy-project remnants and the approved cleanup plan (ADR-017)
- `MIGRATION_PLAN.md` — migration execution report confirming the clean repository state `IMPLEMENTATION_PLAN.md` builds on
- `RISKS.md` — technical risks and mitigations

Product specification (final pass, complements the architecture above):
- `PROMPT_ENGINE.md` — AI coach behavior, tone, correction rules, prompting strategy
- `LEARNING_ENGINE.md` — pedagogical logic: spaced repetition, difficulty, fluency/confidence
- `DESIGN_SYSTEM.md` — visual identity, components, accessibility
- `NON_FUNCTIONAL_REQUIREMENTS.md` — measurable performance/security/quality targets
- `OBSERVABILITY.md` — logging, metrics, monitoring, learning-health indicators
