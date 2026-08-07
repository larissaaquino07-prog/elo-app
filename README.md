# Personal AI English Coach

A premium, AI-powered personal English coach, built for daily use over many years — not a generic language-learning app, but a long-term, memory-driven relationship with an AI mentor. See `PROJECT.md` for the full vision.

## Repository status

**Clean and ready for Phase 0.** This repository originally shared history with an unrelated Expo/React Native fitness-social prototype (a fully independent, discontinued project — see `ARCHITECTURE_DECISIONS.md` ADR-001/ADR-017). That code was fully removed per the approved `MIGRATION_PLAN.md`, executed 2026-08-06; the repository tree contains exclusively this project's documentation and infrastructure — see `MIGRATION_PLAN.md` §12 for that execution report.

**Client platform migration (2026-08-07):** the client platform decided during the architecture review — native Swift/SwiftUI — was superseded before implementation began. The confirmed device requirements (an iPhone **and** a Samsung Windows notebook, permanently, with no macOS access anywhere in the project's lifecycle) made SwiftUI structurally incompatible with the actual target. The client platform is now **React Native + Expo (TypeScript)**, targeting iOS (primary), Android, and Web/PWA (companion surface). This is **not** a reversion to the discontinued Expo prototype mentioned above — it's React Native chosen fresh, on its own current technical merits, for a project whose entire business/product architecture (backend, data model, Memory/Learning/Prompt Engines) required zero changes to support it. Full account: `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md`, `RN_EXPO_MIGRATION_PLAN.md`, and `ARCHITECTURE_DECISIONS.md`'s ADR-019–024 addendum.

**Documentation is complete; implementation has not started.** The full specification set below has been written, reviewed, frozen, migrated once (repository cleanup) and migrated again (client platform). A detailed, task-by-task `IMPLEMENTATION_PLAN.md` covers all 26 macro-stages of the build, re-authored for the current stack. The next step is macro-stage 1 of that plan (creating the Expo project) — not yet started.

## Documentation index

Read in this order for full context:

1. `PROJECT_BRIEF.md` — original requirements, owner: Julia (source of truth for *what* and *why*)
2. `PROJECT.md` — consolidated vision, principles, confirmed architecture decisions
3. `ARCHITECTURE.md` — technical architecture: React Native + Expo client, Clean Architecture layering, data model, sync design
4. `ARCHITECTURE_DECISIONS.md` — ADRs (ADR-001–024) and the architecture review approval checklist
5. `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md` — React Native vs. Flutter comparison that produced the client platform migration
6. `RN_EXPO_MIGRATION_PLAN.md` — the full technical migration plan (stack decisions, ADR review, per-document plan)
7. `PROMPT_ENGINE.md` — AI coach behavior, tone, correction rules, prompting/context strategy
8. `LEARNING_ENGINE.md` — pedagogical logic: spaced repetition, difficulty, fluency/confidence scoring, level progression
9. `DESIGN_SYSTEM.md` — visual identity, components, motion, accessibility
10. `NON_FUNCTIONAL_REQUIREMENTS.md` — measurable performance/security/accessibility/quality targets
11. `OBSERVABILITY.md` — logging, metrics, monitoring, learning-health indicators
12. `ROADMAP.md` — phased delivery plan
13. `TASKS.md` — prioritized backlog
14. `RISKS.md` — technical risks and mitigations
15. `IMPLEMENTATION_PLAN.md` — detailed, task-by-task execution plan (26 macro-stages) — the active guide for all upcoming implementation work
16. `REPOSITORY_AUDIT.md` — legacy-project remnant audit (historical record, pre-cleanup)
17. `MIGRATION_PLAN.md` — repository cleanup plan and execution report (historical record)

## Stack (target — not yet implemented)

React Native + Expo, TypeScript (strict), Expo Router, `expo-sqlite` + Drizzle ORM (local cache), Supabase (Postgres + `pgvector` + Auth + Edge Functions + Storage, source of truth), Anthropic Claude (reasoning/content), OpenAI Realtime API (voice, iOS/Android), MVVM + Clean Architecture, monorepo workspace packages (`@coach/domain` / `@coach/data`), EAS Build/Submit (no local macOS dependency). iOS is the primary, full-capability surface; Android and Web/PWA are in scope for v1, with Web as a deliberate companion surface (progress review, history, text sessions — not full parity). Full rationale in `ARCHITECTURE.md` and `ARCHITECTURE_DECISIONS.md`.
