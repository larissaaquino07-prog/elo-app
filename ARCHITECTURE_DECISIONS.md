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
