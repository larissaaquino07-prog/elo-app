# ARCHITECTURE_DECISIONS.md

Architecture Decision Records (ADRs) for the personal AI English coach project. This is the **official reference for all technical decisions** — when a decision changes, add a new ADR that supersedes the old one; never silently edit history here (edit `ARCHITECTURE.md` for the current-state description, keep this file as the decision trail).

Format per decision: ID, Date, Problem, Alternatives Considered, Decision, Justification, Consequences, Future Impacts.

---

## ADR-001 — Client platform: native Swift/SwiftUI instead of Expo/React Native

**Date:** 2026-08-06
**Problem:** The repository originally held an unrelated Expo/React Native fitness app. A client platform had to be chosen for a premium, iOS-only, multi-year personal coaching app.
**Alternatives considered:**
1. Continue with the existing Expo/React Native scaffold (fastest start, cross-platform-ready).
2. Native Swift/SwiftUI (best iOS integration, no cross-platform reuse without a second codebase).
3. Flutter (cross-platform, but no deeper iOS-native integration than Expo, and less alignment with SwiftData requirement).
**Decision:** Native Swift 6 + SwiftUI, iOS 18+.
**Justification:** The brief prioritizes premium feel, deep system integration (voice, widgets, notifications), performance, and multi-year longevity over cross-platform reach — iOS is the only stated target. Julia explicitly requested SwiftData, which is only usable from native Swift.
**Consequences:** No code reuse with the old Expo scaffold (removed, not migrated); Android/Web require a separate future implementation against the same backend.
**Future impacts:** Backend must stay platform-agnostic (ADR-013) so a future non-iOS client isn't blocked by this choice.

---

## ADR-002 — Hybrid AI engine: Claude for reasoning, OpenAI Realtime for voice

**Date:** 2026-08-06
**Problem:** No single vendor today offers both best-in-class conversational reasoning/memory management and best-in-class low-latency voice-to-voice interaction.
**Alternatives considered:**
1. Single-vendor OpenAI (GPT + Realtime) — simpler integration, one vendor relationship.
2. Single-vendor Anthropic only — no mature native voice-to-voice offering at decision time.
3. Hybrid: Claude for text/reasoning/memory, OpenAI Realtime for voice.
**Decision:** Hybrid, explicitly decoupled behind Domain-layer protocols (`ConversationEngine`, `VoiceEngine`, `MemoryExtractionEngine`).
**Justification:** Uses each vendor's current strength; the decoupling requirement (Julia's explicit instruction) means the "hybrid" choice doesn't create long-term lock-in on either leg.
**Consequences:** Two vendor integrations and two billing relationships to manage instead of one; context must be explicitly handed from the Claude-owned memory layer into each Realtime session.
**Future impacts:** A provider swap on either leg is a new Data-layer adapter, not a rewrite (validated further by ADR-012's DI approach).

---

## ADR-003 — Persistence: Supabase as source of truth, SwiftData as offline cache

**Date:** 2026-08-06
**Problem:** "Remember everything for years" requires durable, backed-up storage; "works offline" requires a local store; these needs are in tension.
**Alternatives considered:**
1. Local-only (SwiftData/SQLite), manual export for backup — simplest, but weak durability and no future multi-device story.
2. Cloud-only (Supabase), no local cache — simplest sync story, but breaks offline use entirely.
3. Cloud source of truth (Supabase) + local cache/offline queue (SwiftData), synced automatically.
**Decision:** Option 3.
**Justification:** Matches Julia's explicit instruction; gives durability, backup, and future multi-device support from the cloud side while keeping the app fully usable offline via the local cache.
**Consequences:** Requires a real sync strategy (conflict resolution, idempotency, migrations) — non-trivial engineering surface, addressed in ADR-006/007/008.
**Future impacts:** Any future client (macOS, Web) can adopt the same source-of-truth model with its own local cache technology.

---

## ADR-004 — Budget posture: moderate, efficiency-conscious, provider-swappable

**Date:** 2026-08-06
**Problem:** Ongoing AI/voice API costs accumulate over years of daily use; some cost-aware design constraint was needed.
**Alternatives considered:**
1. No cost ceiling, optimize purely for quality.
2. Aggressive cost minimization, accept quality trade-offs.
3. Moderate: quality-first, but architecture actively avoids unnecessary calls and stays provider-swappable.
**Decision:** Option 3.
**Justification:** Julia is willing to pay for a high-quality experience but explicitly wants efficient architecture and the ability to switch providers if better/cheaper alternatives emerge.
**Consequences:** Requires cost observability (token/usage logging) and design-level cost levers (prompt caching, native voice fallback, hierarchical memory to bound context size) from Phase 1, not as an afterthought.
**Future impacts:** A cost dashboard (T6-01) becomes a first-class deliverable, not optional polish.

---

## ADR-005 — MVVM + Clean Architecture with explicit Domain-layer protocols

**Date:** 2026-08-06
**Problem:** A multi-year, solo-maintained codebase needs an architecture that stays changeable without full rewrites as requirements (AI providers, persistence, platforms) evolve.
**Alternatives considered:**
1. Simple MVVM only, no Clean Architecture layering — faster to start, but couples business logic directly to SwiftUI/SwiftData/vendor SDKs.
2. Full Clean Architecture + MVVM, with Domain-layer Repository and Engine protocols.
**Decision:** Option 2.
**Justification:** The project's own stated requirements (provider-swappable AI, "years of evolution," possible future platforms) are exactly the conditions Clean Architecture's inward-pointing dependency rule is designed for.
**Consequences:** More upfront structure (protocols, mappers, a composition root) than a quick MVVM-only build.
**Future impacts:** Directly enables ADR-002's decoupling requirement and ADR-013's cross-platform reuse.

> **2026-08-07 technology-note update (client platform migration to React Native + Expo, ADR-019):** the pattern stays fully valid — this decision is not superseded. "ViewModel" now refers to a Zustand store + custom hook rather than a Swift `@Observable` class; same role in the MVVM pattern, different syntax. See `RN_EXPO_MIGRATION_PLAN.md` §1.1.

---

## ADR-006 — Repository abstraction over SwiftData + Supabase (Architecture Review finding)

**Date:** 2026-08-06
**Problem:** The initial architecture draft had ViewModels reading from SwiftData directly "for instant offline UI," which leaks a persistence-framework detail into the Presentation layer — a Clean Architecture / DIP violation caught during the pre-implementation Architecture Review.
**Alternatives considered:**
1. Leave as-is (ViewModels → SwiftData directly) — less code, faster to ship.
2. Introduce `SessionRepository` / `MemoryRepository` protocols in Domain, implemented in Data to internally coordinate SwiftData + Supabase.
**Decision:** Option 2.
**Justification:** Without this fix, swapping or restructuring the local persistence layer later (e.g., adding a second local cache strategy, or a future platform's different local store) would require touching every ViewModel. The fix costs a thin protocol + mapper layer now.
**Consequences:** One additional abstraction layer to maintain; slightly more boilerplate per entity type.
**Future impacts:** Makes the Data layer swappable independently of Presentation — required for ADR-013 (macOS reuse) to actually hold.

> **2026-08-07 technology-note update (client platform migration to React Native + Expo, ADR-019):** the rule (Presentation never touches persistence directly) is unchanged and, if anything, more important in this stack — TypeScript/JavaScript makes it easier to accidentally reach past an abstraction than Swift's module system did. `SwiftData`/the Supabase Swift SDK become `expo-sqlite` (optionally + Drizzle ORM)/`@supabase/supabase-js`; the compile-time enforcement mechanism is replaced by ADR-021. See `RN_EXPO_MIGRATION_PLAN.md` §1.1/§3.

---

## ADR-007 — Sync conflict resolution: append-only by default, derived aggregates, idempotent upserts

**Date:** 2026-08-06
**Problem:** Offline-first local writes plus a remote source of truth risks silent conflict resolution (a change quietly lost), which would violate Principle 1.
**Alternatives considered:**
1. Generic last-write-wins on every field, including counters like streaks.
2. Operational-transform / CRDT-based merge — powerful but heavy engineering for a single/low-concurrency user.
3. Append-only tables where possible, server-timestamp-wins with a visible notice for mutable aggregates, and derive genuinely aggregate fields (streaks) from source data instead of storing them as independently mutable.
**Decision:** Option 3.
**Justification:** Most of this app's data (sessions, mistakes, vocabulary) is naturally append-only, which sidesteps conflicts by construction. The one clearly aggregate field (streak) is cheaper and safer to compute than to sync. CRDTs would be over-engineering for a single user with occasional two-device use.
**Consequences:** Requires `updated_at` on every syncable table and a documented rule set (now in `ARCHITECTURE.md` §4) rather than ad hoc per-field handling.
**Future impacts:** If true multi-device concurrent editing becomes common (e.g., simultaneous sessions on two devices), this may need revisiting toward a more sophisticated merge strategy — noted as an open item, not expected soon for a single user.

---

## ADR-008 — Raw transcripts stored in object storage, not inline in `sessions`

**Date:** 2026-08-06
**Problem:** Storing full conversation transcripts as a text column on the most frequently queried table (`sessions`) does not scale gracefully to years of daily voice conversations.
**Alternatives considered:**
1. Keep `transcript_raw` inline on `sessions` (original draft).
2. Move transcripts to Supabase Storage, referenced by a path column.
**Decision:** Option 2.
**Justification:** `sessions` is read on every scheduler run and every progress view; keeping it lean regardless of transcript volume avoids a slow, gradual performance regression that would otherwise only become visible years into daily use — exactly the failure mode a "used for many years" app cannot afford to discover late.
**Consequences:** Reading a full past transcript requires an extra fetch (acceptable — it's an on-demand, infrequent read).
**Future impacts:** None negative; this is a pure scalability improvement with no functional trade-off.

---

## ADR-009 — Hierarchical memory: `learner_profile` rollup in addition to per-session summaries

**Date:** 2026-08-06
**Problem:** A flat model — one summary + one embedding per session, retrieved fresh every time — degrades as the number of sessions grows into the thousands over years; context-building has to search/rank an ever-larger pile of small facts instead of starting from a strong, cheap baseline.
**Alternatives considered:**
1. Flat per-session summaries only (original draft) — simplest, degrades gracefully but not indefinitely.
2. Full hierarchical rollups (session → weekly → monthly → profile) from day one — most scalable, but meaningful over-engineering for year one, when there's barely any history to roll up.
3. A single continuously-updated `learner_profile` document (cheap incremental merge-update after each session) included in every context by default, with per-session retrieval reserved for targeted recall.
**Decision:** Option 3.
**Justification:** Captures most of the long-term-scale benefit (a bounded, cheap "who is this learner" baseline that doesn't grow linearly with session count) without building rollup infrastructure the project doesn't need yet.
**Consequences:** Requires a new backend job (Learner Profile Updater) and table; the profile's quality depends on the merge-update prompt being well-designed (a content risk, not an architectural one).
**Future impacts:** Weekly/monthly rollups remain a natural, additive next step if the single-profile approach ever proves insufficient — explicitly deferred, not rejected.

---

## ADR-010 — No certificate pinning

**Date:** 2026-08-06
**Problem:** Whether to add certificate pinning for API communications (Supabase, and indirectly Anthropic/OpenAI via the backend) as a hardening measure.
**Alternatives considered:**
1. Implement certificate pinning.
2. Rely on standard TLS / App Transport Security only.
**Decision:** Option 2 — no pinning.
**Justification:** The threat model (a personal app, reputable API providers, no adversarial distribution) does not justify pinning's operational cost — a missed certificate rotation silently breaks the app for a solo maintainer with no team to catch it quickly, which is a worse multi-year reliability risk than the marginal MITM protection pinning buys.
**Consequences:** Slightly weaker protection against a sophisticated network-level attacker; judged acceptable for this threat model.
**Future impacts:** Revisit only if the threat model changes materially (e.g., handling far more sensitive data, or evidence of targeted attacks).

---

## ADR-011 — App-level biometric lock (Face ID/Touch ID) as defense-in-depth

**Date:** 2026-08-06
**Problem:** Conversation content includes sensitive real workplace/HR context; a lost or momentarily unlocked phone shouldn't trivially expose years of personal coaching history.
**Alternatives considered:**
1. Rely solely on Supabase Auth session + device passcode (iOS default).
2. Add an app-level Face ID/Touch ID gate via `LocalAuthentication`, independent of the backend session.
**Decision:** Option 2.
**Justification:** Low implementation cost on native iOS, meaningfully raises the bar against casual access (e.g., someone picking up an unlocked phone), and fits the "premium, trustworthy" product feel.
**Consequences:** One extra native permission/UX flow to design (lock timeout behavior, fallback to passcode).
**Future impacts:** None negative; purely additive security.

> **2026-08-07 technology-note update (client platform migration to React Native + Expo, ADR-019):** the decision and its reasoning are unchanged and platform-agnostic; only the implementation API changes — `LocalAuthentication` → `expo-local-authentication` (iOS/Android). The web/PWA target has no biometric equivalent; that gap is a separate, new decision (ADR-024), not a change to this one. See `RN_EXPO_MIGRATION_PLAN.md` §1.3.

---

## ADR-012 — Dependency Injection: composition root + constructor injection, no DI framework

**Date:** 2026-08-06
**Problem:** The Clean Architecture layering (ADR-005/006) needs a consistent way to wire concrete implementations into protocol-typed dependencies.
**Alternatives considered:**
1. A third-party DI container/framework.
2. Property-wrapper-based injection (e.g., a custom `@Injected`).
3. A single `AppContainer` composition root, plain initializer injection throughout.
**Decision:** Option 3.
**Justification:** For a solo-maintained, multi-year codebase, explicit constructor injection is the most readable option for a future maintainer (including a future AI coding session with no memory of this one) — no hidden wiring, no framework-specific knowledge required to trace how any object was constructed.
**Consequences:** Slightly more manual wiring code in `AppContainer` as the object graph grows; judged an acceptable, very visible cost.
**Future impacts:** Keeps unit testing straightforward (mocks passed directly to initializers) — reinforces `ARCHITECTURE.md` §12.

> **2026-08-07 technology-note update (client platform migration to React Native + Expo, ADR-019):** the principle (no DI framework, one explicit composition root) is unchanged; the mechanism becomes a single TypeScript module (e.g. `container.ts`) instead of a Swift `AppContainer` class — same discipline, same future-maintainer-readability goal, different syntax. See `RN_EXPO_MIGRATION_PLAN.md` §1.1.

---

## ADR-013 — Domain + Data layers packaged as a separate Swift Package (`CoachKit`)

**Date:** 2026-08-06
**Problem:** The brief anticipates possible future macOS/Web/Desktop versions; the architecture should not require a rewrite of business logic to support that.
**Alternatives considered:**
1. Keep Domain + Data as regular folders inside the single iOS app target.
2. Extract Domain + Data into a separate Swift Package from the start, consumed by the iOS app target.
**Decision:** Option 2.
**Justification:** SwiftData and Swift concurrency both run unmodified on macOS, so a future macOS app could reuse this package entirely, needing only a new Presentation layer — this costs essentially nothing today (a package boundary) and removes a whole category of future rework.
**Consequences:** Slightly more Xcode project structure to set up in Phase 0 than a single-target app.
**Future impacts:** A future macOS client becomes a Presentation-layer-only project. Web/Android would still need their own implementation (different language/runtime) but face no redesign of the backend contract `CoachKit` already depends on.

---

## ADR-014 — Spaced repetition: SM-2-inspired algorithm, not a custom ML scheduler

**Date:** 2026-08-06
**Problem:** The Memory/Learning Engine needs a concrete algorithm to decide when vocabulary and mistakes come up for review (`LEARNING_ENGINE.md` §2).
**Alternatives considered:**
1. A custom ML-based scheduler (e.g., a learned model predicting optimal review timing).
2. A simplified SM-2 (SuperMemo 2) style algorithm — ease factor, interval, repetitions, updated from a quality score per exposure.
**Decision:** Option 2.
**Justification:** SM-2 is well-understood, cheap to compute, easy to reason about and debug, and proven at exactly this kind of task across decades of spaced-repetition tools. A learned scheduler needs training data this single-user app will never have enough of to outperform SM-2, and would be materially harder to maintain solo (`RISKS.md` R-04).
**Consequences:** Slightly less theoretically optimal than a fully personalized ML scheduler; judged an acceptable trade for simplicity and maintainability.
**Future impacts:** If usage data ever suggests SM-2's defaults are miscalibrated for this specific learner, the ease-factor formula's constants are tunable without a scheduler redesign.

---

## ADR-015 — Product analytics: in-house Supabase table, not a third-party SDK

**Date:** 2026-08-06
**Problem:** The app needs basic usage visibility (is it being used as designed) without adding unnecessary vendor surface or content-leak risk given HR-sensitive conversation context.
**Alternatives considered:**
1. A third-party analytics SDK (Firebase Analytics, Amplitude, Mixpanel, etc.).
2. A lightweight in-house `usage_events` table in the already-provisioned Supabase backend.
**Decision:** Option 2.
**Justification:** At single-user scale, a third-party SDK's benefit (dashboards, cohort analysis, cross-app benchmarking) is irrelevant, while its cost (new vendor dependency, new data-handling surface for arguably sensitive usage patterns, additional binary size/attack surface) is not. Supabase already holds the data; a small table achieves the same goal with less risk (`OBSERVABILITY.md` §1/§4).
**Consequences:** No off-the-shelf analytics dashboard UI; a minimal SQL view or debug screen (`OBSERVABILITY.md` §10) substitutes.
**Future impacts:** None negative; revisit only if this ever becomes a multi-user product (not a current goal, `PROJECT.md` §7).

---

## ADR-016 — Native `TabView`/`NavigationStack` instead of custom-built navigation components

**Date:** 2026-08-06
**Problem:** The discontinued Expo/React Native prototype (ADR-001) used a custom-built tab bar (blur effects, manual icon/active-state handling) because Expo/React Navigation doesn't give truly native tab bar behavior for free. The native rewrite needs a navigation approach decided explicitly rather than defaulted into.
**Alternatives considered:**
1. Replicate a custom-built tab bar/navigation stack in SwiftUI, matching the old prototype's bespoke look.
2. Use SwiftUI's native `TabView` and `NavigationStack` directly, styled via the `DESIGN_SYSTEM.md` token set but not structurally custom-built.
**Decision:** Option 2.
**Justification:** On native iOS, `TabView`/`NavigationStack` already provide correct accessibility (VoiceOver, Dynamic Type), platform-convention behavior, and automatic adaptation across iOS versions — a custom component would have to reimplement all of that for no functional gain, at ongoing maintenance cost to a solo maintainer (`RISKS.md` R-04).
**Consequences:** Slightly less bespoke visual control than a fully custom nav bar; mitigated by `DESIGN_SYSTEM.md`'s color/typography/motion tokens still applying fully within native components.
**Future impacts:** Directly reduces the surface `CoachKit`'s future macOS Presentation layer (ADR-013) would need to reinvent, since native navigation idioms differ by platform far less than custom components would.

---

## ADR-017 — Total independence from the discontinued fitness project (governance decision)

**Date:** 2026-08-06
**Problem:** ADR-001 established that the client platform would be native Swift/SwiftUI rather than the repository's pre-existing Expo/React Native fitness prototype. That was a *technology* decision. It left an open question ADR-001 didn't address: whether the old project's code, structure, conventions, or documentation may still inform *any* future decision (architecture, naming, folder layout, visual identity, data modeling, dependency choices) simply because it happens to occupy the same repository. `REPOSITORY_AUDIT.md` (2026-08-06) found one remnant — `AGENTS.md`'s Expo-specific guidance — that was still actively doing exactly that: steering live sessions toward Expo tooling before any code is written.
**Alternatives considered:**
1. Leave the matter implicit — trust that ADR-001's technology decision is sufficient signal not to reuse old-project patterns.
2. Formally and explicitly declare the old project fully independent, closed, and without influence over any future technical decision in this repository, of any kind — not limited to technology choice.
**Decision:** Option 2.
**Justification:** Option 1 already failed in practice — `AGENTS.md` was quietly steering sessions toward Expo despite ADR-001 having been decided weeks (in project time) earlier. An implicit boundary is not a boundary; an explicit one, recorded as an ADR and checked against a full audit (`REPOSITORY_AUDIT.md`), is. This decision is intentionally broader than "don't use the old tech stack" — it covers folder structure, naming, conventions, visual identity, data models, dependency choices, and documentation, none of which ADR-001 explicitly addressed on its own.
**Formal declaration:**
- The prior fitness application is a **completely independent, closed project** that happened to share this repository for historical reasons only.
- **No future technical decision in this repository may be influenced by the legacy code**, structure, naming, or conventions — including cases where a legacy pattern would be "convenient" to reuse.
- **Any reuse of anything from the legacy project must be justified on independent technical merit**, not on proximity or convenience — in practice, this has so far excluded everything (`REPOSITORY_AUDIT.md` §1 found zero source files that qualify, since TypeScript/React Native source cannot be imported into a Swift target regardless of how generic its logic is).
- This repository is to be treated, from this point forward, **as if it had just been created** for this project alone.
**Consequences:** A full cleanup pass (removing all 🔴-classified items in `REPOSITORY_AUDIT.md`) is required before Phase 0 implementation begins, rather than an incremental "delete files as we get to them" approach — the audit makes this a deliberate, complete, one-time act rather than an ongoing background risk.
**Future impacts:** Any future session, human or AI, that considers reusing anything from the pre-2026-08-06 repository history must find and cite a specific technical justification here or in a new ADR — "it's already there" is explicitly not sufficient grounds, by this decision.

---

## ADR-018 — `CoachKit` split into `CoachKitDomain` / `CoachKitData` Swift Package targets

**Date:** 2026-08-06
**Problem:** ADR-006 established that Presentation must depend on Domain-layer Repository/Engine protocols, never on SwiftData or the Supabase SDK directly. As originally sketched (`ARCHITECTURE.md` §2, `REPOSITORY_AUDIT.md` §7), `CoachKit` was a single Swift Package target with `Domain/` and `Data/` as folder conventions inside it — a real but *convention-only* boundary, checkable only by code review or a manual grep. While drafting `IMPLEMENTATION_PLAN.md`'s task-by-task breakdown, this was identified as weaker than it needed to be, at negligible cost to fix.
**Alternatives considered:**
1. Keep the single-target, folder-only split (as originally sketched) — simpler package setup, boundary enforced by convention/review only.
2. Split `CoachKit` into two library targets in the same package — `CoachKitDomain` (zero dependencies) and `CoachKitData` (depends on `CoachKitDomain`, SwiftData, and the Supabase SDK).
**Decision:** Option 2.
**Justification:** With two targets, `CoachKitDomain` simply cannot import SwiftData or the Supabase SDK — it isn't a dependency of that target, so a violation is a compile error, not a lint finding someone has to remember to check for. This directly upgrades ADR-006 (the review's top finding) from "enforced by convention" to "enforced by the compiler," at the cost of slightly more Swift Package Manager setup ceremony (two target declarations instead of one).
**Consequences:** `IMPLEMENTATION_PLAN.md` macro-stage 3 and every later macro-stage's Data-layer tasks are written against this two-target structure, not the original single-target sketch. `ARCHITECTURE.md` §6 is updated to match.
**Future impacts:** A future macOS Presentation layer (ADR-013) depends on both targets exactly as the iOS app does — no change to this boundary is needed to support it.

---

## ADR-019 — Client platform: React Native + Expo instead of native Swift/SwiftUI

**Date:** 2026-08-07
**Problem:** ADR-001 chose native Swift/SwiftUI on the premise of an iOS-only target. That premise no longer holds: the confirmed device requirements are an iPhone **and** a Samsung Windows notebook, permanently, for the whole project lifecycle, with no macOS access anywhere in that lifecycle. SwiftUI cannot run on Windows under any circumstance — this is not a tooling gap to work around, it's a platform fact that makes ADR-001's decision structurally incompatible with the actual requirement.
**Alternatives considered:**
1. Keep native Swift/SwiftUI for iOS only, find a separate solution for the Windows notebook (e.g., a second, entirely different codebase) — rejected outright: doubles the maintenance burden for a solo, AI-assisted project (`RISKS.md` R-04), the opposite of this project's stated priorities.
2. Flutter — evaluated in full in `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md`. Has official, stable native Windows desktop support (a genuine edge for the notebook requirement specifically) but weaker AI-coding-assistant proficiency (Dart vs. TypeScript) and no first-party no-Mac-needed iOS build pipeline equivalent to EAS Build.
3. React Native + Expo — evaluated in the same analysis. Windows coverage is web/PWA-based (React Native Web), not a true native desktop binary, but Julia confirmed this is fully acceptable given the notebook's role as a companion surface, not the primary device.
**Decision:** Option 3 — React Native + Expo.
**Justification:** Per `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md` §6: `RISKS.md` R-04 (solo, AI-assisted, multi-year maintenance) is this project's most important non-functional constraint, and TypeScript's AI-tooling depth and ecosystem size serve it more directly than Dart's would. EAS Build/Submit is a first-party, purpose-built solution to the "no Mac access" constraint, more integrated than assembling third-party cloud CI for Flutter. The Windows-notebook gap is real but not fatal for this app's actual UI shape (conversational, dashboard-oriented, not graphics-intensive) — confirmed explicitly acceptable by Julia.
**Consequences:** SwiftData, WidgetKit-as-a-first-class-feature, and every Swift-specific native-framework decision made under ADR-001 need replacement or deferral — the full scope is in `RN_EXPO_MIGRATION_PLAN.md`. Backend (Supabase, Edge Functions, the Postgres schema, `PROMPT_ENGINE.md`, `LEARNING_ENGINE.md`) is entirely unaffected, having been deliberately built platform-agnostic from the start (ADR-013's original reasoning, which turned out to matter sooner than expected).
**Future impacts:** Supersedes ADR-001. The platform-agnostic-backend principle is validated by this very migration being possible without touching the backend at all — strengthens rather than weakens the case for keeping that principle going forward.

---

## ADR-020 — Local persistence: `expo-sqlite` (+ Drizzle ORM) as the SwiftData replacement

**Date:** 2026-08-07
**Problem:** ADR-003 named SwiftData as the local cache engine specifically. SwiftData does not exist outside Apple platforms, so it cannot survive ADR-019's platform change; a replacement local storage engine is needed that preserves ADR-003's actual principle (Supabase as source of truth, local cache for offline use).
**Alternatives considered:**
1. `expo-sqlite` alone, raw SQL strings — Julia's explicitly named baseline technology; simplest, no additional dependency, but loses SwiftData's compile-time query/schema safety.
2. `expo-sqlite` + Drizzle ORM (`drizzle-orm`'s Expo SQLite driver) — adds a thin, type-safe query layer and a migration-file mechanism on top of the same engine.
3. WatermelonDB — a reactive, sync-oriented local database evaluated in `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md` §3.3 as a strong conceptual fit for offline-first sync, but not on Julia's named technology list.
**Decision:** Option 2 — `expo-sqlite` as the engine, Drizzle ORM as the query/schema layer on top of it.
**Justification:** `expo-sqlite` was explicitly specified. Drizzle is the closest available replacement for the type-safety value SwiftData provided (`ARCHITECTURE_DECISIONS.md` ADR-018's original motivation was partly about safety guarantees, not just boundary enforcement), and gives a concrete migration-file mechanism matching `ARCHITECTURE.md` §4's requirement — without displacing the explicitly chosen storage engine. Approved in `RN_EXPO_MIGRATION_PLAN.md` §1.2 Proposal A.
**Consequences:** The `SyncCoordinator` (idempotent upsert, watermark pull, conflict rules — ADR-007) is unaffected in design, hand-built on top of this engine exactly as it would have been on top of SwiftData; only the mapper layer's implementation details change. Drizzle's Expo SQLite support is younger than its Postgres/Node drivers — worth a short technical spike before full commitment, not a blind adopt.
**Future impacts:** Supersedes the local-cache-engine portion of ADR-003; ADR-003's "Supabase as source of truth" principle is otherwise unchanged and unsuperseded.

---

## ADR-021 — Domain/Data boundary enforcement: monorepo workspace packages + lint rules

**Date:** 2026-08-07
**Problem:** ADR-018 enforced the Domain/Data boundary via two Swift Package Manager targets, making a violation a true compiler error. That mechanism doesn't exist in a TypeScript/React Native project; a replacement enforcement strategy is needed, or ADR-006's core guarantee (Presentation never touches persistence directly) degrades back to convention-only, exactly what ADR-006 was written to fix in the first place.
**Alternatives considered:**
1. No formal enforcement, rely on code review discipline alone — rejected: this is precisely the state ADR-006 already found and fixed once; regressing to it defeats that finding.
2. A single package with folder-only `domain/`/`data/` separation, checked by a lint rule (`eslint-plugin-boundaries` or equivalent import-restriction rule) — lint-time enforcement, weaker than a compiler error but real and CI-checkable.
3. A monorepo with separate workspace packages (e.g. `packages/core` split into a dependency-free domain subpackage and a data subpackage with real `package.json` dependencies on SQLite/Supabase) plus the same lint rule — combines a real dependency-graph failure (a domain file literally cannot resolve an import to a package it doesn't depend on) with the lint rule as defense-in-depth.
**Decision:** Option 3.
**Justification:** Approved in `RN_EXPO_MIGRATION_PLAN.md` §1.2 Proposal C. A missing `package.json` dependency turns an accidental cross-boundary import into a real module-resolution failure, not just a style-guide violation — closer in spirit to ADR-018's compile-time guarantee than a lint rule alone would be, even though it's not a strict compiler error in the Swift sense. Also directly strengthens ADR-013's original goal (share Domain+Data across future platforms): a workspace package is consumable by any future Node-capable client with less platform-specific glue than Swift Package Manager ever offered.
**Consequences:** More monorepo tooling setup than a single-app-folder project (workspace configuration, possibly Turborepo for build orchestration if complexity grows) — a real, upfront cost, judged worthwhile for the same reason ADR-018 was.
**Future impacts:** Supersedes ADR-018. Updates ADR-013's mechanism (Swift Package → monorepo workspace package) without changing ADR-013's underlying goal, which this decision serves at least as well, arguably better.

---

## ADR-022 — Navigation: Expo Router

**Date:** 2026-08-07
**Problem:** ADR-016 chose native `TabView`/`NavigationStack` specifically for the free accessibility and platform-convention behavior SwiftUI provided. That reasoning is SwiftUI-specific and doesn't transfer to React Native; a navigation library decision is needed for the new stack.
**Alternatives considered:**
1. React Navigation directly (the library the discontinued Expo fitness prototype used, and the library Expo Router itself is built on) — mature, flexible, but requires more manual setup and doesn't give typed, file-based routes.
2. A custom-built navigation layer, matching ADR-016's spirit of "build exactly what the design needs" — rejected for the same reason ADR-016 itself rejected a custom-built nav bar: reimplementing accessibility/platform-convention behavior that a maintained library already provides is ongoing cost with no functional gain, especially costly for a solo maintainer (`RISKS.md` R-04).
3. Expo Router — file-based routing (routes are source files, not a manually maintained tree), built on React Navigation, actively maintained by the Expo team, with typed-route support in recent SDKs.
**Decision:** Option 3.
**Justification:** Closest available equivalent to ADR-016's actual values (low custom-maintenance surface, strong out-of-the-box accessibility/convention behavior, active first-party maintenance) within the React Native ecosystem. File-based routing is also a natural fit for Expo Router's own tooling (deep linking, universal links across iOS/Android/Web) with no extra configuration.
**Consequences:** The four-tab structure from `DESIGN_SYSTEM.md` §5.4 (Coach, Progress, Memory, Profile) is expressed as a file-based route group instead of a SwiftUI `TabView` declaration — same visible structure, different authoring mechanism. Explicit note: this specifically does **not** reuse the discontinued fitness prototype's React Navigation setup (ADR-017) — Expo Router is chosen fresh, on its own current technical merits, for this project's own navigation structure.
**Future impacts:** Supersedes ADR-016.

---

## ADR-023 — Crash reporting: minimal Sentry React Native integration, scoped to crashes/errors only

**Date:** 2026-08-07
**Problem:** `OBSERVABILITY.md` §5 named `MetricKit` — an Apple-only, zero-dependency, on-device diagnostics framework — as the primary crash-reporting mechanism. No equivalent exists across iOS+Android+Web from the React Native/Expo team itself; some crash-visibility mechanism is still needed for a solo maintainer (`RISKS.md` R-04) to know when and why the app fails in the field.
**Alternatives considered:**
1. A hand-rolled error boundary + manual log-shipping to the existing Supabase `usage_events`-style table — zero new dependency, consistent with `OBSERVABILITY.md` §1's "no third-party analytics SDK" principle, but loses native crash-stack-trace symbolication, a meaningful diagnostic loss.
2. Expo's own error-reporting-adjacent tooling — thinner and less mature than dedicated crash-reporting SDKs.
3. A minimal Sentry React Native integration, deliberately scoped to crash/error capture only — explicitly not session replay, not full product analytics.
**Decision:** Option 3.
**Justification:** Approved explicitly by Julia in response to `RN_EXPO_MIGRATION_PLAN.md` §1.2 Proposal D, precisely because this is the one proposal in that document that adds a new third-party dependency in a category (`OBSERVABILITY.md`/ADR-015) this project had previously and deliberately avoided — the scope is drawn narrowly (crash/error only) specifically to not conflict with ADR-015's actual decision (in-house `usage_events` analytics, which stays as-is, unaffected).
**Consequences:** One new third-party SDK dependency, the first of its kind in this project's client-side stack. Symbolication/source-map upload needs to be part of the EAS Build pipeline (a new build-step consideration for `IMPLEMENTATION_PLAN.md`'s distribution macro-stage).
**Future impacts:** Does not supersede ADR-015 — narrows its scope explicitly rather than reopening the broader question of third-party analytics, which remains decided against.

---

## ADR-024 — Web/PWA capability-parity scope: companion-surface framing

**Date:** 2026-08-07
**Problem:** The web/PWA target (serving the Samsung notebook, per ADR-019) has no equivalent for several native capabilities the iOS/Android targets have: Keychain-equivalent secure storage, biometric authentication, reliable background sync, and offline speech recognition. Left undecided, this risks either silently degraded behavior nobody planned for, or wasted effort chasing partial/fragile web equivalents (e.g., WebAuthn for biometrics) for marginal benefit.
**Alternatives considered:**
1. Pursue full capability parity on web (WebAuthn for biometrics, Service Worker `periodicSync` for background tasks, cloud-based STT for offline-equivalent voice) — rejected: WebAuthn specifically requires user-managed passkeys/security keys, a materially different and heavier UX than native biometrics, disproportionate effort for a secondary surface; Service Worker background sync is Chrome-family-only and best-effort at best; cloud STT isn't actually offline, defeating the fallback's purpose.
2. Treat the web/PWA target as a **companion surface** — progress review, learning history, and text-based sessions — while the iPhone remains the primary, full-capability surface (voice, biometric app-lock, reliable background sync).
**Decision:** Option 2.
**Justification:** Explicitly confirmed by Julia: "notebook como superfície complementar (revisão de progresso, histórico, sessões de texto), não paridade total. iPhone continua com a experiência completa (voz, biometria, sync em background). Sem WebAuthn." Matches `PROJECT_BRIEF.md`'s original framing of a personal coach used daily, most plausibly on the phone, and avoids disproportionate engineering effort for a secondary surface.
**Consequences:** `NON_FUNCTIONAL_REQUIREMENTS.md` and `ARCHITECTURE.md` need explicit per-platform scoping wherever a target previously assumed uniform capability (biometric lock timeout, background sync frequency, voice availability). The web app-lock, if any, uses a PIN/password fallback rather than biometrics.
**Future impacts:** Revisit only if the web/PWA surface's role in the product changes materially (e.g., if the notebook becomes a primary rather than companion device) — not expected under the current product framing.

---

## Approval Checklist — 2026-08-06 Architecture Review

Status ahead of freezing the architecture for Phase 0 implementation.

### ✅ Approved as-is
- D1: Native Swift 6 / SwiftUI / iOS 18+ client platform
- D2: Hybrid AI engine (Claude + OpenAI Realtime), decoupled via protocols
- D4: Moderate, efficiency-conscious budget posture
- Overall roadmap sequencing (memory/adaptivity before voice)
- Non-goals (no multi-user, no gamification-first, no cross-platform in v1)
- Supabase Edge Functions as the backend (no need for a dedicated server yet)
- No certificate pinning (ADR-010)

### 🔴 Required changes (blocking — now incorporated into `ARCHITECTURE.md`)
- Add Repository protocol abstraction in Domain; Presentation must never touch SwiftData directly (ADR-006)
- Idempotent sync (upsert by stable client-generated UUID), not bare inserts (ADR-007)
- Move `transcript_raw` out of `sessions` into object storage (ADR-008)
- Add per-device sync cursor / `device_sync_state` for multi-device readiness (`ARCHITECTURE.md` §4)
- Add `pgvector` HNSW index on session embeddings (`ARCHITECTURE.md` §9.1)
- Make backup/restore concrete: Supabase PITR + a secondary, user-owned weekly export (`ARCHITECTURE.md` §4)
- Define explicit schema migration strategy (SwiftData `VersionedSchema` + versioned Postgres migrations) (`ARCHITECTURE.md` §4)
- Derive `streaks` from `sessions` instead of syncing it as an independently mutable field (ADR-007)

### 🟡 Recommended changes (non-blocking, now incorporated)
- Hierarchical memory via `learner_profile` (ADR-009)
- Face ID/Touch ID app-lock (ADR-011)
- Lightweight `SessionCompletedEvent` domain event (`ARCHITECTURE.md` §2.4) — optional, can ship without it in Phase 1
- Explicit Use Case enumeration (`ARCHITECTURE.md` §2.2)
- A second reference `ConversationEngine` adapter built early to validate the abstraction isn't just theoretical (`TASKS.md` T0-13)
- Hybrid Realtime-subscription + pull sync for low-latency cross-device fields (`ARCHITECTURE.md` §4)
- Explicit latency budgets as acceptance criteria (`ARCHITECTURE.md` §5.4)
- UX additions: streak grace period, post-session recap, saved phrases, practice-history heatmap, proactive event-prep coaching, offline-mode indicator (`TASKS.md` Phase 5/6)
- `CoachKit` Swift Package extraction for future macOS reuse (ADR-013)
- CI (GitHub Actions) running unit tests on every push (`TASKS.md` T0-14)

### ⚪ Can remain as-is
- MVVM + Clean Architecture high-level layering (sound; only needed the repository fix above)
- iOS 18+ / Swift 6 strict concurrency choice (`RISKS.md` R-12 — intentional trade-off)
- Defensive per-user Row Level Security despite single-user v1 scope

**Outcome: architecture approved and frozen for Phase 0**, conditional on the required changes above — all of which are now reflected in `ARCHITECTURE.md`, `RISKS.md`, and `TASKS.md`. No further architecture review is needed before implementation begins unless a future decision changes one of the ADRs above (in which case, add a new ADR that supersedes it — do not edit history).

---

## Addendum — 2026-08-06 Specification Pass (same day, following architecture approval)

With the architecture approved, Julia requested a final refinement pass to bring the project to professional-specification completeness before implementation. This produced ADR-014 through ADR-016 above, plus five new canonical documents:

- `PROMPT_ENGINE.md` — AI coach behavior and prompting strategy
- `LEARNING_ENGINE.md` — pedagogical formulas (spaced repetition, difficulty, fluency/confidence, level progression)
- `DESIGN_SYSTEM.md` — visual identity and component specification
- `NON_FUNCTIONAL_REQUIREMENTS.md` — measurable performance/security/quality/accessibility targets
- `OBSERVABILITY.md` — logging, metrics, monitoring, and learning-health indicators

A consistency pass was performed across all prior documents to remove duplication: `ARCHITECTURE.md` no longer restates formulas (`LEARNING_ENGINE.md`), latency/coverage numbers (`NON_FUNCTIONAL_REQUIREMENTS.md`), or observability detail (`OBSERVABILITY.md`) that now live in their dedicated canonical documents — it points to them instead. One genuine inconsistency was found and fixed in the process: `ARCHITECTURE.md` §5.3 referenced "(§11)" for the proactive-event-prep feature, which — read within `ARCHITECTURE.md` itself — pointed at the wrong section (Scalability, not a features list); corrected to explicitly cite `PROJECT.md` §11, where that feature is actually described.

**This addendum, combined with the original review above, marks the full documentation set (`PROJECT.md`, `PROJECT_BRIEF.md`, `ARCHITECTURE.md`, `ARCHITECTURE_DECISIONS.md`, `ROADMAP.md`, `TASKS.md`, `RISKS.md`, `PROMPT_ENGINE.md`, `LEARNING_ENGINE.md`, `DESIGN_SYSTEM.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `OBSERVABILITY.md`) as the final baseline before implementation begins.**

---

## Addendum — 2026-08-07 Client Platform Migration (React Native + Expo)

After the architecture was frozen and `IMPLEMENTATION_PLAN.md` was written against native Swift/SwiftUI, an attempt to begin macro-stage 1 surfaced a fact that changed the client-platform decision itself: this Claude Code Remote session (and every environment then available) runs on Linux, with no Xcode, Swift toolchain, or iOS Simulator. Julia clarified the actual, permanent constraint: an iPhone **and** a Samsung Windows notebook, with no macOS access anywhere in the project's lifecycle — not a temporary tooling gap, a structural incompatibility with ADR-001's premise, since SwiftUI cannot run on Windows under any circumstance.

Two analysis documents preceded this addendum:
- `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md` — compared React Native (Expo) and Flutter across ten dimensions and recommended React Native + Expo, primarily on `RISKS.md` R-04 (AI-assisted maintainability) and EAS Build's first-party no-Mac-needed iOS pipeline.
- `RN_EXPO_MIGRATION_PLAN.md` — the full technical migration plan: every mandated technology decision (§1.1), the component-replacement mapping for every Swift-specific capability (§1.3), five proposed architectural improvements presented for approval rather than auto-implemented (§1.2), the complete ADR-by-ADR review this addendum's new ADRs (019–024) execute, and the per-document migration plan (§5) that `PROJECT.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `OBSERVABILITY.md`, `ROADMAP.md`, `TASKS.md`, `IMPLEMENTATION_PLAN.md`, and `README.md` are updated against in this same pass.

**This is explicitly a technology substitution of the existing architecture, not a new project and not a reversion to the discontinued Expo fitness prototype (ADR-017).** ADR-017 remains fully valid and is reaffirmed here, not superseded: its declaration that the prior project is "completely independent, closed, and without influence over any future technical decision" holds exactly as written, and applies with undiminished force to this second pivot. React Native is being adopted now on its own current technical merits, evaluated fresh in `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md` against this project's actual requirements — not because the discontinued prototype once used it. None of that prototype's code, folder structure, component patterns, naming, navigation setup (React Navigation, superseded here by Expo Router per ADR-022, chosen independently), dependencies, or data model is reused, referenced, or considered "valid again" by this decision. Every new ADR in this addendum (019–024) states its own alternatives and justification from this project's current documentation and requirements alone, per ADR-017's standing rule that "it's already there" — true of the old prototype's RN usage as much as anything else in that discarded history — is not sufficient grounds for reuse.

**Confirmed technology decisions (ADR-019 through ADR-024):**
- ADR-019 — React Native + Expo as the client platform, superseding ADR-001.
- ADR-020 — `expo-sqlite` + Drizzle ORM as the local persistence engine, superseding ADR-003's local-cache portion.
- ADR-021 — Monorepo workspace packages + lint-enforced boundary, superseding ADR-018 and updating ADR-013's mechanism.
- ADR-022 — Expo Router for navigation, superseding ADR-016.
- ADR-023 — A minimal, crash-only Sentry React Native integration, narrowing (not superseding) ADR-015.
- ADR-024 — Web/PWA as a companion surface, not full capability parity with iOS — a new decision with no predecessor.

ADR-005, ADR-006, ADR-011, and ADR-012 received technology-note updates in place (their actual decisions never depended on the Apple ecosystem specifically) rather than being superseded. WidgetKit (`TASKS.md` T5-04) is deferred to post-launch, not cut — it requires isolated native Swift code regardless of client framework, an iOS-platform fact no cross-platform choice changes.

**This addendum, together with the ADRs above, is the governing record for the ongoing per-document migration** carried out immediately after it in this same work session — see each updated document's own note pointing back here for its specific changes.
