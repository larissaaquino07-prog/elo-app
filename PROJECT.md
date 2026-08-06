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
- Not cross-platform in v1 — iOS-only by deliberate choice (see §8, D1), not a limitation to be worked around.

## 8. Confirmed architecture decisions

The following decisions were open after the initial analysis pass and have since been **confirmed directly by Julia**. They now govern `ARCHITECTURE.md`, `ROADMAP.md`, and `TASKS.md` — they are no longer defaults subject to silent revision.

- **D1 — Client platform & codebase**: The application is built as a **fresh native iOS app** using **Swift 6 + SwiftUI, targeting iOS 18+**, with an **MVVM + Clean Architecture** structure. The prior Expo/React Native scaffold that existed in this repository is a **separate, unrelated project** and does not constrain or seed the new architecture in any way — it is removed, not migrated, at the start of implementation. The repository is reorganized from zero around the native project.
- **D2 — AI engine**: Hybrid, decoupled by design. **Anthropic Claude** is the primary engine for conversation, explanations, corrections, and content/lesson generation. **OpenAI Realtime API** handles speech-to-text/text-to-speech for live voice conversation. The architecture must abstract both behind Domain-layer protocols (not vendor SDKs called directly from feature code) specifically so either provider can be replaced later without touching business logic — see `ARCHITECTURE.md` §5.
- **D3 — Memory & persistence**: **Supabase (Postgres)** is the authoritative backend and single source of truth for all long-term memory (history, progress, vocabulary, mistakes, statistics). **SwiftData** provides local persistence on-device for caching and offline use. The app synchronizes automatically whenever connectivity is available; SwiftData is a durable cache and offline queue, never a competing source of truth.
- **D4 — Budget posture**: Moderate. Willing to pay for a high-quality experience, but the architecture must actively avoid unnecessary API calls (caching, batching, on-device alternatives where sensible) and must keep providers swappable so cheaper or better alternatives can be adopted later without a rewrite.

Additional constraints set alongside these decisions:
- Use native iOS frameworks wherever it makes sense: **Speech framework** (speech recognition), **AVFoundation** (audio), **AVSpeechSynthesizer** (local TTS fallback), **WidgetKit** (widgets), native **UserNotifications**, and iOS accessibility features.
- The **backend must remain platform-agnostic** — iOS is the first and only client in v1, but the backend/data model must not assume an iOS-only client, so a future Web/Desktop client can be built against the same backend and the same data without duplication or migration.

## 9. Gaps and open items

Per the analysis mandate, the following remain **underspecified** and are tracked as open items rather than silently assumed:

- No initial-assessment / onboarding flow defined — "no generic lessons" conflicts with a true cold start (day 1, zero memory). Needs a first-session calibration flow (level check, goals interview) that itself becomes the seed of long-term memory.
- No stated CEFR level or starting proficiency for Julia.
- No voice/accent preference (American vs. British English) or speech-recognition tolerance for Portuguese-accented English.
- No retention/deletion policy detail beyond "nothing disappears without explicit permission" — needs a concrete data export/delete UX.
- No distribution mechanism confirmed for a personal iOS app used for years (Apple Developer Program + TestFlight has real constraints — see `RISKS.md` R-07).
- No conflict-resolution policy detail for the SwiftData ↔ Supabase sync beyond "sync automatically" — needs an explicit strategy (see `ARCHITECTURE.md` §4).
- No product name.

These are captured as Phase 0 tasks in `TASKS.md` and as risks in `RISKS.md`.

## 10. Architecture status

The technical architecture underwent a full Principal-Architect-level review on **2026-08-06**, covering Clean Architecture/SOLID compliance, scalability to a multi-year/multi-device horizon, persistence, sync, AI provider independence, the memory engine, voice, security, performance, and testability. All required changes from that review are incorporated into `ARCHITECTURE.md`; every decision and its rationale is recorded in `ARCHITECTURE_DECISIONS.md` (ADR-001 through ADR-017, the last of which formalizes the repository's total independence from the discontinued legacy project — executed via `MIGRATION_PLAN.md`). **The architecture is frozen** — implementation (Phase 0 in `ROADMAP.md`) can proceed without a further architecture gate, unless a future decision supersedes one of the recorded ADRs.

A follow-up specification pass, same day, produced the five product-level documents listed in §12 (`PROMPT_ENGINE.md`, `LEARNING_ENGINE.md`, `DESIGN_SYSTEM.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `OBSERVABILITY.md`), closing the gap between "the architecture is sound" and "every behavior, formula, visual detail, and measurable target is specified." **This is considered the final documentation baseline before implementation begins.**

## 11. Candidate future features (post-v1, low priority)

Identified during the architecture review as valuable and consistent with the Core Principles, deliberately kept at low priority (Phase 5/6, `TASKS.md`) rather than pulled forward, to respect Principle 5 (quality over quantity) — the MVP loop (Phases 1–4) must be excellent before these are worth building:

- Proactive event-prep coaching ("I have an interview next Tuesday" → the coach adapts upcoming sessions toward it) — the adaptive scheduler already reserves an input for this (`ARCHITECTURE.md` §5.3, `LEARNING_ENGINE.md` §10); UI activation tracked as `TASKS.md` T6-06.
- Streak grace period, post-session recap, saved phrases/bookmarks, practice-history heatmap — small, high-warmth UX additions common to durable daily-habit apps, absent from the original brief; tracked as `TASKS.md` T5-08–T5-11.
- A future macOS client reusing the same `CoachKit` Domain/Data package (`ARCHITECTURE.md` §6, ADR-013); evaluation tracked as `TASKS.md` T6-07.

## 12. Related documents

Architecture & delivery:
- `ROADMAP.md` — phased delivery plan
- `TASKS.md` — prioritized backlog
- `ARCHITECTURE.md` — technical architecture and data model
- `ARCHITECTURE_DECISIONS.md` — architecture decision records (ADRs) and review approval checklist
- `REPOSITORY_AUDIT.md` — full audit of legacy-project remnants and the approved cleanup plan (ADR-017)
- `RISKS.md` — technical risks and mitigations

Product specification (final pass, complements the architecture above):
- `PROMPT_ENGINE.md` — AI coach behavior, tone, correction rules, prompting strategy
- `LEARNING_ENGINE.md` — pedagogical logic: spaced repetition, difficulty, fluency/confidence
- `DESIGN_SYSTEM.md` — visual identity, components, accessibility
- `NON_FUNCTIONAL_REQUIREMENTS.md` — measurable performance/security/quality targets
- `OBSERVABILITY.md` — logging, metrics, monitoring, learning-health indicators
