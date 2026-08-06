# Personal AI English Coach

A premium, AI-powered personal English coach, built for daily use over many years — not a generic language-learning app, but a long-term, memory-driven relationship with an AI mentor. See `PROJECT.md` for the full vision.

## Repository status

**Clean and ready for Phase 0.** This repository originally shared history with an unrelated Expo/React Native fitness-social prototype (a fully independent, discontinued project — see `ARCHITECTURE_DECISIONS.md` ADR-001/ADR-017). That code has been fully removed per the approved `MIGRATION_PLAN.md`, executed 2026-08-06; the repository tree now contains exclusively this project's documentation and infrastructure — see `MIGRATION_PLAN.md` §12 for the execution report and the confirmed-clean repository structure. Nothing under a former `src/`, `App.tsx`, or `package.json` exists anymore; do not recreate anything based on the old project.

**Documentation is complete; implementation has not started.** As of 2026-08-06, the full specification set below has been written, reviewed, frozen, and the repository migrated to a clean state. The next step is Phase 0 of `ROADMAP.md` (creating the native Xcode project).

## Documentation index

Read in this order for full context:

1. `PROJECT_BRIEF.md` — original requirements, owner: Julia (source of truth for *what* and *why*)
2. `PROJECT.md` — consolidated vision, principles, confirmed architecture decisions
3. `ARCHITECTURE.md` — technical architecture: native iOS stack, Clean Architecture layering, data model, sync design
4. `ARCHITECTURE_DECISIONS.md` — ADRs (ADR-001–017) and the architecture review approval checklist
5. `PROMPT_ENGINE.md` — AI coach behavior, tone, correction rules, prompting/context strategy
6. `LEARNING_ENGINE.md` — pedagogical logic: spaced repetition, difficulty, fluency/confidence scoring, level progression
7. `DESIGN_SYSTEM.md` — visual identity, components, motion, accessibility
8. `NON_FUNCTIONAL_REQUIREMENTS.md` — measurable performance/security/accessibility/quality targets
9. `OBSERVABILITY.md` — logging, metrics, monitoring, learning-health indicators
10. `ROADMAP.md` — phased delivery plan
11. `TASKS.md` — prioritized backlog
12. `RISKS.md` — technical risks and mitigations
13. `REPOSITORY_AUDIT.md` — legacy-project remnant audit (historical record, pre-cleanup)
14. `MIGRATION_PLAN.md` — migration plan and execution report (historical record, cleanup complete)

## Stack (target — not yet implemented)

Swift 6, SwiftUI, iOS 18+, SwiftData (local cache), Supabase (Postgres + `pgvector` + Auth + Edge Functions + Storage, source of truth), Anthropic Claude (reasoning/content), OpenAI Realtime API (voice), MVVM + Clean Architecture. Full rationale in `ARCHITECTURE.md` and `ARCHITECTURE_DECISIONS.md`.
