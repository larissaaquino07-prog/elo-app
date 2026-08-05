# PROJECT.md

**Consolidated Project Vision**
Source of truth for requirements: `PROJECT_BRIEF.md` (v1.0, Draft, Owner: Julia).
This document translates that brief into an actionable product/engineering vision. It is a living document — when new requirements are added, this file is updated, not duplicated.

Working codename for this document set: **"Coach"** (no final product name has been chosen yet — see [Open Decision D1](#open-decisions)).

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

## 8. Key architecture decisions made in this pass

Because several implementation-critical decisions were left open in the brief and the user was unavailable to confirm them synchronously, the following defaults were adopted as a tech lead would on a solo project — each is reversible and documented with rationale in `ARCHITECTURE.md` / `RISKS.md`:

- **D1 — Codebase reuse**: The existing `elo-app` repository (a Expo/React Native/TypeScript fitness-social app, unrelated in *domain* to this brief) is **pivoted**: its technical stack (Expo SDK 57, React Navigation, TypeScript) is kept as the foundation; all fitness-domain code (`src/screens`, `src/data/mockData.ts`, fitness types, README) is treated as legacy scaffolding to be removed in Phase 1. Product name is still undecided — see Open Decisions.
- **D2 — AI engine**: Hybrid. **Anthropic Claude** for reasoning, memory management, lesson/scenario generation, and mistake analysis (text-first, tool-using backend). **OpenAI Realtime API** for the low-latency spoken conversation loop, since it is currently the most mature option for natural voice-to-voice interaction. Claude-generated context (memory, lesson plan, corrections) is injected into the Realtime session as instructions/context rather than the Realtime model owning long-term memory itself.
- **D3 — Memory storage**: **Supabase (managed Postgres)** as source of truth, using `pgvector` for semantic memory (conversation embeddings) alongside structured relational tables for precise tracking (vocabulary, mistakes, sessions, goals). Chosen over local-only SQLite because "remember everything for years" implies durability, backup, and future multi-device continuity beyond what a single iPhone can guarantee.
- **D4 — Budget**: No hard cost ceiling assumed; architecture optimizes for experience quality (voice latency, model quality) over minimizing API spend, since this is a daily-use, multi-year personal tool. Cost is still tracked (see `ARCHITECTURE.md` §Observability) so it can be revisited if it becomes a real constraint.

**These are working defaults, not final decisions.** Julia should confirm or override D1–D4 before Phase 1 implementation begins; each is tracked as a task in `TASKS.md` (T0-01 to T0-04).

## 9. Gaps and contradictions identified in the brief

Per the analysis mandate, the following were found to be **underspecified** (not contradictory, but decision-blocking) and are tracked as open items rather than silently assumed:

- No initial-assessment / onboarding flow defined — "no generic lessons" conflicts with a true cold start (day 1, zero memory). Needs a first-session calibration flow (level check, goals interview) that itself becomes the seed of long-term memory.
- No stated CEFR level or starting proficiency for Julia.
- No voice/accent preference (American vs. British English) or speech-recognition tolerance for Portuguese-accented English.
- No retention/deletion policy detail beyond "nothing disappears without explicit permission" — needs a concrete data export/delete UX.
- No distribution mechanism specified for a personal iOS app used for years (Apple Developer Program + TestFlight has real constraints — see `RISKS.md` R-07).
- No multi-device / device-loss continuity requirement stated, despite an implicit "years of history" expectation.
- No product name.

These are captured as Phase 0 tasks in `TASKS.md` and as risks in `RISKS.md`.

## 10. Related documents

- `ROADMAP.md` — phased delivery plan
- `TASKS.md` — prioritized backlog
- `ARCHITECTURE.md` — technical architecture and data model
- `RISKS.md` — technical risks and mitigations
