# Personal AI English Coach

A premium, AI-powered personal English coach, built for daily use over many years — not a generic language-learning app, but a long-term, memory-driven relationship with an AI mentor. See `PROJECT.md` for the full vision.

## ⚠️ Repository status

**This repository is mid-pivot, cleanup pending approval.** The source tree currently still contains an unrelated Expo/React Native fitness-social prototype (`App.tsx`, `src/`, `package.json`, etc.) from a discontinued, fully independent earlier project. That code is **not** part of this project and must not influence any technical decision here — see `ARCHITECTURE_DECISIONS.md` ADR-001 and ADR-017. A complete, itemized removal plan for every legacy file is recorded in `REPOSITORY_AUDIT.md`; it executes as soon as Julia approves it, as the first act of Phase 0 (`TASKS.md` T0-01/T0-02). Until then, do not treat anything under `src/`, `App.tsx`, or the old `package.json` as reflecting current product direction — this `README.md` and the documents below are the source of truth.

**Documentation is complete; implementation has not started.** As of 2026-08-06, the full specification set below has been written, reviewed, and frozen. The next step is the approved cleanup in `REPOSITORY_AUDIT.md`, then Phase 0 of `ROADMAP.md`.

## Documentation index

Read in this order for full context:

1. `PROJECT_BRIEF.md` — original requirements, owner: Julia (source of truth for *what* and *why*)
2. `PROJECT.md` — consolidated vision, principles, confirmed architecture decisions
3. `ARCHITECTURE.md` — technical architecture: native iOS stack, Clean Architecture layering, data model, sync design
4. `ARCHITECTURE_DECISIONS.md` — ADRs (ADR-001–016) and the architecture review approval checklist
5. `PROMPT_ENGINE.md` — AI coach behavior, tone, correction rules, prompting/context strategy
6. `LEARNING_ENGINE.md` — pedagogical logic: spaced repetition, difficulty, fluency/confidence scoring, level progression
7. `DESIGN_SYSTEM.md` — visual identity, components, motion, accessibility
8. `NON_FUNCTIONAL_REQUIREMENTS.md` — measurable performance/security/accessibility/quality targets
9. `OBSERVABILITY.md` — logging, metrics, monitoring, learning-health indicators
10. `ROADMAP.md` — phased delivery plan
11. `TASKS.md` — prioritized backlog
12. `RISKS.md` — technical risks and mitigations
13. `REPOSITORY_AUDIT.md` — legacy-project remnant audit and approved cleanup plan

## Stack (target — not yet implemented)

Swift 6, SwiftUI, iOS 18+, SwiftData (local cache), Supabase (Postgres + `pgvector` + Auth + Edge Functions + Storage, source of truth), Anthropic Claude (reasoning/content), OpenAI Realtime API (voice), MVVM + Clean Architecture. Full rationale in `ARCHITECTURE.md` and `ARCHITECTURE_DECISIONS.md`.
