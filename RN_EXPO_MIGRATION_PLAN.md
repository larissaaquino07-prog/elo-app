# RN_EXPO_MIGRATION_PLAN.md

**Status: analysis and proposal only. No document has been modified, no ADR has been changed, no code has been written.** This is the complete technical impact analysis, ADR-by-ADR review, and per-document migration plan requested after confirming React Native + Expo as the definitive client platform decision (`CLIENT_PLATFORM_MIGRATION_ANALYSIS.md`). Everything below is presented for approval; execution begins only after you confirm.

---

## 0. Framing: this is a technology substitution, not a new project

Per your instruction, this is **not** a greenfield restart and **not** a reversion to the discontinued Expo fitness prototype (ADR-001, ADR-017). Three separate things are easy to conflate and must stay distinct:

1. **The business/product architecture** (`PROJECT.md`, `PROMPT_ENGINE.md`, `LEARNING_ENGINE.md`, the data model, the sync design, the Clean Architecture pattern) — untouched by this migration. It was never Swift-specific to begin with; it was designed to be implementable in any client technology, which is exactly what's being exercised now.
2. **The native-Swift implementation plan** (`ARCHITECTURE.md`'s client-layer sections, `IMPLEMENTATION_PLAN.md`'s macro-stages 1–4/6–22/25–26) — superseded by this migration. This is real, substantial rework, scoped precisely in §6.
3. **The discontinued fitness prototype** (pre-2026-08-06 history, `REPOSITORY_AUDIT.md`/`MIGRATION_PLAN.md`'s subject) — remains permanently discarded. Nothing from it — not its code, its folder structure, its React Navigation usage, its component patterns, its naming, its data model, its dependencies — becomes "valid again" just because this project is using React Native a second time, for entirely different reasons (a Windows-notebook requirement that didn't exist when that prototype was built, and a from-scratch architecture that prototype never had). §5 makes this explicit as a new decision to register, precisely because it's the point most likely to be misread otherwise.

---

## 1. Technology stack decisions

Evaluated against every technology you listed as mandatory consideration, plus the explicit component-replacement questions.

### 1.1 Core stack

| Technology | Decision | Rationale |
|---|---|---|
| **React Native + Expo** | Adopt, latest stable SDK at implementation time (verify against `docs.expo.dev` when macro-stage 1 actually starts — SDK numbers move fast; do not hardcode a version in this analysis that will be stale by execution time). | Confirmed in `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md`. |
| **TypeScript** | Adopt, `strict: true` and all strictness flags on (`noImplicitAny`, `strictNullChecks`, etc.) from the first commit. | Direct spiritual continuation of the Swift 6 strict-concurrency stance (`RISKS.md` R-12's "pay the rigor cost once, early" principle) — TypeScript strict mode is this project's equivalent discipline in the new stack. |
| **Expo Router** | Adopt as the navigation foundation, used idiomatically (file-based routes as the source of truth), superseding ADR-016. | Official, actively developed, built on React Navigation, gives typed routes in recent SDKs — closest available equivalent to the accessibility/platform-convention benefits ADR-016 valued in native `NavigationStack`, without a custom-built nav layer. |
| **Expo SQLite** | Adopt as the local storage **engine**, replacing SwiftData. | Your explicit instruction. Note precisely what this does and doesn't give you: `expo-sqlite` is a raw SQLite binding, not an offline-sync framework — the custom `SyncCoordinator` (idempotent upsert, watermark pull, conflict rules, ADR-007) is still hand-built logic on top of it, exactly as it would have been on top of SwiftData. Nothing about ADR-007's design changes; only the storage engine underneath it does. |
| **Supabase** (`@supabase/supabase-js`) | Unchanged. | Official JS SDK, arguably the most battle-tested Supabase client of all given JS/web is Supabase's primary audience — a strict upgrade in SDK maturity versus the Swift SDK this was originally scoped against. |
| **Edge Functions** | Unchanged. | Entirely backend, zero client-framework dependency by design (`ARCHITECTURE.md` §3). |
| **React Query (TanStack Query)** | Adopt, scoped specifically to the **Data-layer repository implementations' remote-fetch paths** — never consumed directly by Presentation. | Gives read-through caching/staleness/refetch semantics for the "fetch from Supabase" half of each Repository, at zero cost to ADR-006 (Presentation still only sees Repository protocols; React Query is an implementation detail inside `DefaultSessionRepository` etc., same as SwiftData's fast-path/remote-fallback logic was). It does **not** replace `SyncCoordinator` — React Query solves "cache and refetch," not "offline write queue with idempotency and conflict resolution," which stays custom. |
| **Zustand** | Adopt for Presentation-layer, ephemeral UI state (voice session state machine, form state, in-flight sync-status binding). | The direct role SwiftUI's `@Observable` ViewModel state played — small, unopinionated, no boilerplate, keeps MVVM's spirit (ADR-005) alive: a Zustand store *is* the ViewModel in this stack. Server/business data does **not** live in Zustand — that's React Query's (caching) and the Repository/Use Case layer's (source of truth) job, keeping the layering ADR-006 established intact. |
| **React Native Reanimated** | Adopt for `DESIGN_SYSTEM.md` §6's motion tokens. | The de facto standard for UI-thread-driven, performant RN animation — necessary for voice-state transitions and message-appearance motion to hit the 60fps target (`NON_FUNCTIONAL_REQUIREMENTS.md` §1) rather than running on the JS thread and janking under load. |
| **React Native Gesture Handler** | Adopt. | Standard, effectively required pairing with Reanimated and Expo Router's gesture-driven transitions; also needed for any future swipe/long-press interactions (e.g., a bookmark gesture on a message). |
| **React Native Skia** | Adopt **selectively**, not as a blanket dependency — specifically for the voice-input waveform visualization, where real-time audio-reactive custom rendering genuinely benefits from Skia's performance model. Everything else visual (progress rings, icons, static shapes) uses `react-native-svg`, which is lighter-weight and sufficient. | Directly answers "only if it really adds value" — a full Skia adoption for every graphic would be a heavier dependency than this app's actual visual needs justify (most of `DESIGN_SYSTEM.md` §5's components are simple shapes/gradients `react-native-svg` handles natively), consistent with `RISKS.md` R-04's lean-dependency-footprint bias. The waveform is the one place Skia's edge is real, not decorative. |
| **Expo Notifications** | Adopt for iOS/Android. **Web/PWA gap, flagged in §3.** | Official, direct replacement for `UserNotifications`. |
| **Expo Secure Store** | Adopt for iOS/Android. **Web/PWA gap, flagged in §3.** | Official, direct replacement for Keychain — wraps Keychain on iOS, Keystore on Android. |
| **Expo Audio** (`expo-audio`) | Adopt for local playback/recording (fallback TTS output, simple audio needs). **Not sufficient alone for the Realtime API's low-latency duplex transport — see `react-native-webrtc` below.** | Official successor to `expo-av`'s audio APIs. |
| **Expo Speech** (`expo-speech`) | Adopt, replacing `AVSpeechSynthesizer` for the native TTS fallback path (`ARCHITECTURE.md` §5.4). | Official, direct, wraps `AVSpeechSynthesizer` on iOS and Android's TTS engine — no community package needed, a strict simplification versus the original plan. |
| **EAS Build / EAS Submit** | Adopt as the iOS (and Android) build/distribution pipeline, superseding the entire Xcode-based macro-stage 26. | The single most load-bearing decision in this whole migration for your stated constraint — compiles a signed iOS binary and submits to TestFlight from Expo's own cloud macOS workers, no local Mac at any point. First-party, not third-party CI assembled by hand. |
| **React Native Web** | Adopt as the mechanism that produces the notebook-facing build from the same codebase. | Confirmed acceptable per your instruction that a web/PWA experience satisfies the notebook requirement. |
| **PWA** | Adopt: web app manifest + service worker for installability and basic offline shell caching, built on top of the React Native Web export. | Gives the notebook experience an "installed app" feel (icon, standalone window, offline app-shell) without needing a true native Windows binary — the middle ground between "just a browser tab" and Flutter's native Windows target, sufficient for this app's non-graphics-intensive UI per `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md` §6. |

### 1.2 Not on your list, evaluated because they're directly relevant — flagged for approval, not adopted automatically

Per your instruction to surface, not silently implement, anything I'd propose beyond what's already decided:

**Proposal A — Drizzle ORM on top of `expo-sqlite`.**
- **Decision proposed:** use `drizzle-orm`'s Expo SQLite driver as a thin, type-safe query layer over `expo-sqlite`, rather than hand-written SQL strings.
- **Benefits:** compile-time-checked queries and schema, plus a migration-file mechanism — the closest available replacement for the type-safety value SwiftData (and `drift`, evaluated for the Flutter path) offered. Directly serves `ARCHITECTURE.md` §4's migration-strategy requirement (currently written for SwiftData's `VersionedSchema`).
- **Riscos:** one more dependency in the Data layer; Drizzle's Expo SQLite support, while real and used in production by others, is younger than its Node/Postgres drivers — worth a short spike before fully committing, not a blind adopt.
- **Impact:** localized entirely to `CoachKitData`'s (or its RN-equivalent module's) SwiftData-replacement files — no ripple into Domain or Presentation, since Repositories already abstract this away per ADR-006.
- **Compatibility:** strictly additive to the already-decided `expo-sqlite` choice — Drizzle sits on top of it, doesn't replace it.

**Proposal B — React Query used only inside Repositories (already stated as a decision above, restated here as the specific boundary rule worth confirming explicitly).**
- Already folded into §1.1's table as a decision, not a proposal, since it's a direct, low-risk application of an already-approved pattern (ADR-006). Flagged here only so it isn't missed as "a new library added without discussion."

**Proposal C — Monorepo workspace structure to replace ADR-018's SPM-target compiler enforcement.**
- **Decision proposed:** a single repository with workspace packages (pnpm or npm workspaces; Turborepo optional if build-orchestration complexity grows) — e.g. `packages/core` (Domain + Data, framework-free/React-Native-free where Domain is concerned) and `apps/mobile` (the Expo app, Presentation). An ESLint rule (`eslint-plugin-boundaries` or an equivalent import-restriction rule) enforces that `packages/core`'s Domain code cannot import anything from a Data-only module, and that `apps/mobile` cannot import SQLite/Supabase types directly.
- **Benefits:** closest available reproduction of ADR-018's intent; also directly serves ADR-013's original goal (share Domain+Data across future platforms) — arguably better now, since a workspace package is consumable by a future Node-based backend tool, a future Electron/Tauri desktop wrapper, or Web/Android, all from one package, with less platform-specific glue than SPM ever offered.
- **Riscos:** ESLint-enforced boundaries are lint-time, not compile-time — a violation is caught in CI/pre-commit, not by the TypeScript compiler itself, a strictly weaker guarantee than Swift's two-target trick. Mitigable by *also* making `packages/core`'s domain subpackage genuinely dependency-free in `package.json` (no SQLite/Supabase package listed as a dependency at all), which turns "imports a symbol that doesn't exist" into a real, if less elegant, build failure — a hybrid enforcement, not pure convention.
- **Impact:** this is the direct replacement for ADR-018, needed regardless of any other choice in this document.
- **Compatibility:** required, not optional, if ADR-006/018's core guarantee is to mean anything in the new stack.

**Proposal D — Crash reporting tool for `OBSERVABILITY.md` §5.**
- **Problem:** `MetricKit` (Apple-only, zero-dependency, on-device) has no equivalent in RN — there is no first-party, zero-dependency crash-reporting mechanism across iOS+Android+Web from the RN/Expo team itself.
- **Decision proposed:** a minimal Sentry React Native integration, scoped **only** to crash/error reporting (not session replay, not full product analytics) — kept consistent with `OBSERVABILITY.md` §1's "no third-party analytics SDK" principle by explicitly *not* using Sentry's broader analytics features, only its crash capture.
- **Alternatives considered:** (a) a hand-rolled error boundary + manual log-shipping to the existing Supabase `usage_events`-style table (zero new dependency, but loses native crash-stack-trace symbolication, a meaningful diagnostic loss for a solo maintainer per `RISKS.md` R-04); (b) Expo's own `expo-error-reporting`-adjacent tooling (thinner, less mature than Sentry's RN SDK).
- **Riscos:** a new third-party dependency, a decision `ADR-015` deliberately avoided for analytics — this proposal draws the line at crash reporting specifically (a different problem: "did it crash and why," not "what did the user do"), but the distinction is worth your explicit sign-off since it's adding exactly the kind of dependency ADR-015 was written to avoid, in a different context.
- **Impact:** `OBSERVABILITY.md` §5, `ARCHITECTURE.md` §14.
- **Compatibility:** does not conflict with ADR-015's actual decision (in-house `usage_events` analytics) — narrows to crash reporting only.

**Proposal E — WidgetKit feature disposition.**
- **Problem:** confirmed in `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md` §3.10 — the iOS home-screen widget (`TASKS.md` T5-04) requires isolated native Swift/WidgetKit code regardless of RN or Flutter. This doesn't go away with any cross-platform choice; it's an iOS platform fact.
- **Decision proposed:** defer the widget feature past initial launch (it's already P2 in `TASKS.md`), revisit once the core app is shipped and stable, at which point a small, isolated native module (via an Expo config plugin) can be added without destabilizing the cross-platform core. **Not** proposing to cut it permanently — just sequencing it after the rest of the app, since it's the one feature that would otherwise reintroduce a "need Xcode for this one thing" dependency into an otherwise Mac-independent workflow.
- **Riscos:** none from deferring; the risk would be *not* flagging this honestly and letting it surface as a surprise mid-project.
- **Impact:** `TASKS.md`/`ROADMAP.md`/`IMPLEMENTATION_PLAN.md`'s widget-related items get a sequencing note, not a deletion.
- **Compatibility:** fully compatible — this is a scheduling decision, not an architecture one.

### 1.3 Component replacement mapping (your explicit request)

| Swift/Apple component | RN/Expo replacement | Platform coverage | Notes |
|---|---|---|---|
| **SwiftData** | `expo-sqlite` (+ proposed Drizzle ORM, §1.2 Proposal A) | iOS, Android, Web (via `expo-sqlite`'s web/WASM support, or a web-specific fallback — verify current `expo-sqlite` web maturity at implementation time) | Sync logic (ADR-007) unchanged, hand-built regardless of engine. |
| **WidgetKit** | No cross-platform equivalent exists; isolated native Swift extension needed regardless of framework | iOS only | §1.2 Proposal E — deferred, not cut. |
| **AVFoundation** | `expo-audio` (local playback/recording) + `react-native-webrtc` (Realtime API's low-latency duplex transport) | iOS, Android, Web (WebRTC is native to browsers — arguably *more* mature on web than on RN-for-Windows would have been) | Split responsibility, same as flagged in the RN-vs-Flutter analysis. |
| **Speech framework** (on-device STT, native fallback) | `@react-native-voice/voice` (community package wrapping native iOS Speech framework / Android `SpeechRecognizer` under the hood) | iOS, Android; **no offline STT equivalent on web** | Worth being precise about: this still *uses* Apple's Speech framework on iOS, just via a community bridge instead of code you write directly — not a capability loss, a packaging change. The web gap is real (browsers have `SpeechRecognition` but it's typically cloud-backed, not offline) — the offline-fallback promise (`ARCHITECTURE.md` §5.4) is therefore iOS/Android-only in practice; on web, fallback degrades to text-only rather than voice-offline, a fact worth stating plainly rather than implying full parity. |
| **AVSpeechSynthesizer** | `expo-speech` | iOS, Android, Web (browsers have native `SpeechSynthesis` API; `expo-speech`'s web support should be verified at implementation time) | Official, direct. |
| **Keychain** | `expo-secure-store` | iOS, Android; **no OS-level secure enclave on web** | §2's new decision needed — browsers have no Keychain equivalent; typical fallback is encrypted storage in IndexedDB/localStorage, weaker than native secure storage by construction, not by implementation quality. |
| **Background Tasks (`BGTaskScheduler`)** | `expo-background-task` | iOS, Android; **web limited to Service Worker `periodicSync`, Chrome-family only, best-effort** | Background sync on the notebook/web target will be foreground-triggered-only in practice for most browsers — a real, platform-inherent limitation, not an implementation gap. |
| **LocalAuthentication** | `expo-local-authentication` | iOS, Android; **no biometric equivalent on web** (WebAuthn exists but is a materially different, heavier mechanism, not a drop-in) | §2's new decision needed — web app-lock likely needs a PIN/password fallback instead of biometrics, or the app-lock feature is scoped iOS/Android-only. |

## 2. New decisions this migration surfaces (beyond straight technology swaps)

These aren't "what replaces X" questions — they're genuinely new trade-offs the web/PWA target introduces, presented for your decision, not resolved here:

- **Web/PWA capability gaps (SecureStore, LocalAuthentication, Background Tasks, offline Speech) need an explicit, documented per-platform behavior**, not silent degradation. Proposed default: the notebook/web experience is framed as a **companion surface** (review progress, type longer reflective sessions, read history) rather than a full parity target for voice/biometric/background features — the iPhone remains the primary, full-capability surface. This matches `PROJECT_BRIEF.md`'s original framing (a personal coach used "daily," most plausibly on the phone) and avoids over-promising what a browser tab can actually deliver. **Needs your confirmation** — the alternative is investing real effort chasing partial/fragile web equivalents (e.g., WebAuthn for biometrics) for marginal benefit.
- **Web/PWA scope moves from "future, backend already ready for it" (original `ARCHITECTURE.md` §6/§11 framing) to "present, v1-required."** This is a bigger deal than it sounds: `ARCHITECTURE.md` was written assuming iOS ships first and a Web client is a *possible future* built later against an already-ready backend. Now, Web ships in the **same v1**, from the same codebase, on day one. This doesn't invalidate anything — it's the payoff of the platform-agnostic-backend decision working out sooner than planned — but every document that said "Web: future, out of scope for v1" needs that line corrected, not just softened.

## 3. Full ADR-by-ADR review

Per your rule: nothing removed without justification; only ADRs whose decision specifically depended on the Apple ecosystem get updated/superseded.

| ADR | Decision | Disposition | Why |
|---|---|---|---|
| ADR-001 | Native Swift/SwiftUI instead of Expo/RN | **Superseded** | Its decision is being directly reversed — needs a new ADR (proposed ADR-019) referencing both `CLIENT_PLATFORM_MIGRATION_ANALYSIS.md` and this document. |
| ADR-002 | Hybrid AI engine (Claude + OpenAI Realtime) | **Still valid, unchanged** | Backend/vendor decision, zero client-framework dependency. |
| ADR-003 | Persistence: Supabase source of truth + SwiftData local cache | **Superseded (local-cache portion only)** | The "Supabase as source of truth, local cache for offline" *principle* stands; the *engine* (SwiftData) doesn't exist in this stack — needs a new ADR (proposed ADR-020: `expo-sqlite`, optionally + Drizzle) restating the same principle. |
| ADR-004 | Budget posture: moderate, efficiency-conscious | **Still valid, unchanged** | Not stack-dependent. |
| ADR-005 | MVVM + Clean Architecture with Domain-layer protocols | **Still valid, needs a technology note, not a new ADR** | The pattern is language-agnostic; "ViewModel" now means a Zustand store + hook rather than an `@Observable` class — same role, different syntax. Recorded as an update note on the existing ADR, not a supersession. |
| ADR-006 | Repository abstraction over SwiftData + Supabase | **Still valid, needs a technology note** | The rule (Presentation never touches persistence directly) is exactly as important in this stack — arguably more so, since TypeScript/JS makes it *easier* to accidentally reach past an abstraction than Swift's stricter module system did. Technology names update; the decision doesn't change. |
| ADR-007 | Sync conflict resolution (append-only, derived aggregates, idempotent upserts) | **Still valid, unchanged** | The strongest possible example of a Swift-independent decision — pure business logic, zero language dependency. |
| ADR-008 | Raw transcripts in object storage, not inline | **Still valid, unchanged** | Backend/schema decision. |
| ADR-009 | Hierarchical memory (`learner_profile` rollup) | **Still valid, unchanged** | Backend decision. |
| ADR-010 | No certificate pinning | **Still valid, unchanged** | The reasoning (threat model doesn't justify pinning's maintenance cost) applies identically regardless of client stack. |
| ADR-011 | App-level biometric lock via `LocalAuthentication` | **Needs a technology-note update, not a supersession** | Per your rule ("update only what depended on Apple specifically"): the *decision* (add a biometric app-lock as defense-in-depth) is platform-agnostic in its reasoning; only the *implementation API* (`LocalAuthentication` → `expo-local-authentication`) is Apple-specific. Web's lack of a biometric equivalent is a **new** decision (§2), not a change to this ADR's original reasoning. |
| ADR-012 | Dependency Injection: composition root, no framework | **Still valid, needs a technology note** | The principle (no DI framework, one explicit composition root, readable by a future maintainer) translates directly to a single TypeScript module — same decision, different syntax. |
| ADR-013 | `CoachKit` as a separate Swift Package for future macOS reuse | **Superseded** | The SPM mechanism doesn't exist in this stack; needs a new ADR (proposed, folded into ADR-021 alongside ADR-018's replacement) for the monorepo-workspace equivalent. The underlying *goal* (share Domain+Data across future platforms) is not just preserved but strengthened, per §1.2 Proposal C. |
| ADR-014 | Spaced repetition: SM-2-inspired algorithm | **Still valid, unchanged** | Pure algorithm, already proven language-agnostic (it was always going to be re-implemented in whatever language sat in `CoachKitDomain`/its successor). |
| ADR-015 | In-house analytics (Supabase table, not third-party SDK) | **Still valid, unchanged** | Backend-side decision; §1.2 Proposal D's crash-reporting proposal is deliberately scoped to avoid conflicting with this ADR's actual reasoning. |
| ADR-016 | Native `TabView`/`NavigationStack` over custom nav | **Superseded** | Its entire rationale (free accessibility/platform-convention behavior specifically from SwiftUI) doesn't transfer — needs a new ADR (proposed ADR-022: Expo Router). |
| ADR-017 | Total independence from the discontinued fitness project | **Still valid — and needs an explicit addendum, not a supersession** | This is the one ADR this migration could most easily be *misread* as contradicting (RN is back!) — it needs a clarifying addendum stating explicitly that adopting RN+Expo now, for documented reasons entirely unrelated to that old project, does not reactivate anything ADR-017 declared discarded. Proposed as §5's "new decision to register," using the same addendum pattern already established in this file (see the 2026-08-06 Specification Pass addendum). |
| ADR-018 | `CoachKit` split into `CoachKitDomain`/`CoachKitData` targets | **Superseded** | The Swift-Package-target compiler-enforcement mechanism has no direct equivalent; needs a new ADR (proposed ADR-021: monorepo workspace packages + lint-enforced boundary, §1.2 Proposal C). |

**Summary: 9 unchanged, 3 need a technology-note update only (no new ADR), 5 superseded (4 needing new ADRs: 019/020/021/022; ADR-017 needing an addendum, not a new number), 1 new cross-cutting decision area not yet an ADR (§2's web-platform-parity scope) pending your confirmation before being written up formally.**

## 4. Proposed new/updated ADR numbers (for your approval — not yet written into `ARCHITECTURE_DECISIONS.md`)

| Proposed ID | Title | Supersedes |
|---|---|---|
| ADR-019 | Client platform: React Native + Expo instead of native Swift/SwiftUI | ADR-001 |
| ADR-020 | Local persistence: `expo-sqlite` (optionally + Drizzle ORM) as the SwiftData replacement | ADR-003 (local-cache portion) |
| ADR-021 | Domain/Data boundary enforcement: monorepo workspace packages + lint rules | ADR-018; also updates ADR-013's mechanism |
| ADR-022 | Navigation: Expo Router | ADR-016 |
| ADR-017 addendum | Reaffirms total independence from the discontinued project despite RN's return | — (addendum, not a new ID) |
| ADR-023 (proposed, pending your sign-off on §1.2 Proposal D specifically) | Crash reporting: minimal Sentry RN integration, scoped narrowly | — (new decision, no predecessor) |
| ADR-024 (proposed) | Web/PWA capability-parity scope: companion-surface framing for SecureStore/LocalAuthentication/Background Tasks gaps | — (new decision, §2) |

ADR-005, ADR-006, ADR-011, ADR-012 receive **technology-note updates appended to their existing entries** (consistent with how this project has always avoided rewriting ADR history) — not new IDs, since their actual decisions don't change.

## 5. Per-document migration plan

For each document you listed: what stays valid, what needs updating, what should be removed, what new decisions need registering. **No document is modified by this plan — this is the plan for the next step, pending your approval.**

### PROJECT_BRIEF.md
- **Valid:** 100%, unchanged. Julia's original requirements never mentioned a client technology.
- **Update:** none.
- **Remove:** nothing.
- **New decisions:** none — this document doesn't record technical decisions.

### PROJECT.md
- **Valid:** the vision (§1), core principles (§4), product philosophy (§5), feature pillars (§6), non-goals (§7, except the "not cross-platform in v1" line, which is now factually wrong and needs correcting rather than just updating), success criteria (§3).
- **Update:** §8's D1 entry (client platform) needs rewriting to state RN+Expo and reference the two analysis documents; §9's gap list gains the web-parity items from §2; §10 needs a new dated entry for this second pivot, explicitly cross-referencing ADR-017's addendum so a future reader immediately understands this isn't a reversion; §11's `CoachKit` mention needs rewording to the monorepo-package equivalent; §12's document index needs both new analysis documents added.
- **Remove:** the "not cross-platform in v1" line in §7 (superseded by §2's finding that Web ships in the same v1 now).
- **New decisions to register:** pointer to ADR-019 as the governing decision.

### ARCHITECTURE.md
- **Valid:** §5.1 (orchestration), §5.2 (Memory Engine), §5.3 (Adaptive learning), §6's core reasoning (backend stays platform-agnostic — proven true sooner than expected), §9.1 (Postgres schema, fully unchanged), §9.3 (object storage design).
- **Update:** §1 (platform target — full rewrite for RN/Expo/TS/iOS+Android+Web), §2 (architecture pattern — keep the layering, rewrite code samples and the boundary-enforcement mechanism per ADR-021), §3 (diagram — swap client-box contents), §4 (local persistence — SwiftData specifics → `expo-sqlite`/Drizzle specifics, sync rules unchanged), §5.4 (voice layer — swap AVFoundation/Speech-framework references for the RN equivalents from §1.3), §6 (CoachKit reference → monorepo package name; note the "web ships now, not later" correction), §7 (Keychain → SecureStore, plus the new web-gap note), §8 (full replace: native-framework table → RN/Expo capability table), §9.2 (SwiftData model sketch → `expo-sqlite`/Drizzle schema sketch), §10 (tech stack summary — client rows rewritten, backend rows untouched), §11 (scalability — "future macOS/Web client" row corrected to reflect Web as present-scope), §12 (testability — XCTest/XCUITest → Jest/Vitest + Detox or Maestro), §13 (performance — same principles, RN-specific implementation notes), §14 (observability — crash-reporting tool per §1.2 Proposal D), §15 (open decisions — add the stack-specific ones from this document).
- **Remove:** nothing wholesale — every section keeps its structural role, content is replaced within sections, not deleted.
- **New decisions to register:** ADR-019 through ADR-022, ADR-023/024 pending sign-off.

### ARCHITECTURE_DECISIONS.md
- **Valid:** every ADR's historical record (§3 of this document) — none rewritten, per this project's own standing rule.
- **Update:** ADR-005, 006, 011, 012 get appended technology-note updates.
- **Remove:** nothing — ADRs are never deleted in this project, only superseded.
- **New decisions to register:** ADR-019, 020, 021, 022 as new entries; ADR-017 gets a new addendum (not a new number); ADR-023/024 pending your sign-off on §1.2/§2 first.

### PROMPT_ENGINE.md
- **Valid:** 100%. Entirely AI-behavior/backend-context-assembly content; contains zero client-framework references.
- **Update:** none identified.
- **Remove:** nothing.
- **New decisions:** none.

### LEARNING_ENGINE.md
- **Valid:** 100%. Pure algorithms and backend logic; zero Swift references.
- **Update:** none identified.
- **Remove:** nothing.
- **New decisions:** none.

### DESIGN_SYSTEM.md
- **Valid:** §1 (principles), §2 (color token *values*), §3 (typography *scale*, though the code mapping needs updating), §4 (spacing scale), the *content* of §5 (component inventory), §9 (achievements tone), §10 (motion philosophy).
- **Update:** §3 (Dynamic Type → React Native's font-scaling equivalent, plus explicit Android font-scale support now that Android is realistically in scope — a small bonus this migration surfaces), §5.4 (native nav shell → Expo Router, referencing ADR-022), §6 (motion tokens implemented via Reanimated instead of native SwiftUI animation), §7 (`UIFeedbackGenerator` → `expo-haptics`), §11 (VoiceOver/Dynamic Type → add explicit Android TalkBack/font-scale parity language; add a note on the web target's more limited accessibility ceiling per §2), §12 (light/dark mode mechanism: `useColorScheme()` hook vs. iOS semantic asset catalogs).
- **Remove:** nothing.
- **New decisions to register:** the Skia-scoping decision (§1.1), pointer to ADR-022.

### NON_FUNCTIONAL_REQUIREMENTS.md
- **Valid:** the numeric targets themselves (§1–§10) — kept as the bar to measure against, not preemptively loosened just because the stack changed; this project's own precedent (macro-stage 25's "measure, then decide" philosophy) argues against weakening targets on assumption.
- **Update:** §11 (test coverage tooling: XCTest/XCUITest → Jest/Vitest + Detox or Maestro); explicit per-platform scoping note added wherever a target assumes a capability the web target doesn't have (background sync frequency, biometric lock timeout) per §2's companion-surface framing.
- **Remove:** nothing.
- **New decisions to register:** the web-platform-parity scope from §2, once confirmed.

### OBSERVABILITY.md
- **Valid:** §1 (principles, including "no third-party analytics SDK" — still the governing rule §1.2 Proposal D is deliberately designed not to violate), §4 (in-house `usage_events` approach), §6/§7/§9/§11 (sync/AI-call/learning-indicator monitoring — all backend-observable, framework-agnostic).
- **Update:** §2 (logging — `OSLog` has no equivalent; needs a proposed replacement, e.g. `react-native-logs` + the same backend-shipping pattern already designed), §5 (crash reporting — `MetricKit` replacement per §1.2 Proposal D, pending your sign-off), §10 (debug Health screen — same concept, RN dev-build implementation instead of `#if DEBUG` SwiftUI).
- **Remove:** nothing.
- **New decisions to register:** ADR-023 (crash reporting), pending approval.

### ROADMAP.md
- **Valid:** the phase structure (0–6) and sequencing rationale — memory/adaptivity before voice, design system before screens — none of that logic was Swift-specific.
- **Update:** Phase 0's bullet list (Xcode project → Expo project setup); any phase text mentioning SwiftData/SwiftUI/Xcode by name.
- **Remove:** nothing.
- **New decisions to register:** pointer to this migration's governing ADRs.

### TASKS.md
- **Valid:** the overall structure (phases, priorities, ID scheme) and the vast majority of task *descriptions*, which describe outcomes ("implement the priority-scoring scheduler") rather than Swift mechanics.
- **Update:** T0-01–T0-07 (Xcode/SPM/SwiftData-specific setup tasks → Expo/monorepo/`expo-sqlite` equivalents), T0-13 (second reference adapter — concept unchanged, mechanism updates), any task explicitly naming Swift-only APIs (Keychain, LocalAuthentication, WidgetKit, BGTaskScheduler — rename to the RN/Expo equivalents per §1.3), the widget-related tasks get the deferral note from §1.2 Proposal E.
- **Remove:** nothing.
- **New decisions to register:** none beyond what's already listed elsewhere.

### IMPLEMENTATION_PLAN.md
- **Valid:** the macro-stage *sequencing rationale* (§3 of that document) — the dependency-ordering logic (skeleton → data layer → intelligence → design system → screens → hardening → distribution) holds regardless of client framework.
- **Update — the largest single piece of rework in this whole migration:** macro-stages 1–4 need full re-authoring (Expo project init instead of Xcode project creation; monorepo/workspace setup instead of the `CoachKitDomain`/`CoachKitData` SPM split; `expo-sqlite`/Drizzle instead of SwiftData). Macro-stages 6–22 keep their task breakdown and dependencies largely intact but need every file path and technology reference updated (SwiftUI → RN components, `AppContainer.swift` → a TS composition module, etc.). Macro-stage 24 (CI) simplifies (no macOS-runner requirement for most of it, since RN development itself doesn't need macOS — only `eas build`'s cloud step does, and that's Expo's own infrastructure, not a GitHub Actions macOS runner). Macro-stage 26 (distribution) is substantially simplified around EAS Build/Submit.
- **Section 0 (Execution Environment classification) needs a near-total rework**, not just a relabeling: the entire premise (most work is "macOS Required") flips — nearly all development becomes achievable on Linux/Windows, with **macOS involvement reduced to essentially zero**, since EAS Build removes even the final compile step from requiring a local Mac. This is one of this migration's most consequential *practical* benefits and deserves to be stated plainly, not buried in a table update.
- **Remove:** macro-stages/tasks that were purely about Swift-specific mechanics with no RN equivalent need either replacement (most cases) or explicit removal with justification (e.g., ADR-018's "verify the compile-time boundary" task becomes a lint-rule verification task, not a deletion — the *intent* survives even where the *mechanism* doesn't).
- **New decisions to register:** every proposed ADR from §4.

### MIGRATION_PLAN.md
- **Valid:** 100%, as history. This document records the Expo-fitness-prototype cleanup migration that already happened and is factually accurate about that event.
- **Update:** none to its content — optionally, a short addendum note (matching the pattern already used elsewhere in this project) marking that a second, unrelated pivot occurred later, purely for a future reader's orientation. Low priority, your call.
- **Remove:** nothing — this is exactly the kind of history this project has committed to never rewriting.
- **New decisions:** none; this document doesn't govern the new stack, it documents a past event.

### REPOSITORY_AUDIT.md
- **Valid:** 100%, as history, same reasoning as `MIGRATION_PLAN.md`.
- **Update:** none required; same optional addendum consideration.
- **Remove:** nothing.
- **New decisions:** none.

### README.md
- **Valid:** the overall structure and most of the documentation index.
- **Update:** the "Stack (target)" section needs rewriting for RN/Expo/TS; the documentation index needs both new analysis documents added; the "Repository status" section needs a note about this second, in-progress pivot.
- **Remove:** nothing.
- **New decisions:** none beyond pointing at the governing ADRs.

## 6. What's genuinely settled vs. what needs your explicit sign-off before I touch anything

**Settled by your message and §1.1 (ready to execute once you approve proceeding):** React Native + Expo, TypeScript, Expo Router, `expo-sqlite`, Supabase/Edge Functions unchanged, React Query (scoped to Repositories), Zustand, Reanimated, Gesture Handler, Skia (scoped to the voice waveform only), Expo Notifications/SecureStore/Audio/Speech (native platforms), EAS Build, React Native Web, PWA.

**Needs your explicit decision before being written into any document (§1.2, §2):**
1. Drizzle ORM on top of `expo-sqlite` — adopt, or stay with raw SQL?
2. Monorepo workspace structure + lint-enforced boundary as ADR-018's replacement — confirm this approach, or propose an alternative?
3. Crash-reporting tool (minimal Sentry RN vs. a hand-rolled log-shipping approach vs. something else) — this is the one proposal that adds a new third-party dependency in a category this project previously avoided (ADR-015's spirit), so it deserves explicit sign-off rather than a default.
4. WidgetKit: defer past initial launch (proposed), or handle differently?
5. Web/PWA capability-parity scope: confirm the "companion surface, not full parity" framing for SecureStore/LocalAuthentication/Background Tasks/offline Speech, or do you want a different target (e.g., investing in WebAuthn for web biometrics, or scoping web out of certain features entirely)?

Once these five points are resolved, I'll write the actual document updates per §5's plan, and only then would implementation (a fresh macro-stage 1, appropriate to this stack) begin — per your instruction, none of that happens in this pass.
