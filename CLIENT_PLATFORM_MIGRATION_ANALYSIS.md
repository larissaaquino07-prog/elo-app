# CLIENT_PLATFORM_MIGRATION_ANALYSIS.md

**Status: analysis only — no decision has been implemented.** Requested after confirming there is no practical, continuous macOS access for this project: the target devices are an iPhone and a **Samsung (Windows) notebook**, permanently, for the whole project lifecycle. Under that constraint, native Swift/SwiftUI cannot satisfy the project's actual device requirements — it was never going to run on a Windows notebook regardless of macOS access. This document compares **React Native (Expo)** and **Flutter** as the two realistic cross-platform alternatives, evaluates impact on everything already decided, and ends with a recommendation. **Nothing in `ARCHITECTURE.md`, the ADRs, or `IMPLEMENTATION_PLAN.md` is changed by this document** — that happens only after the stack choice is confirmed.

---

## 1. What does *not* change, regardless of which stack is chosen

Stated up front because it's the most important fact in this analysis: the client framework was always the *most replaceable* layer of this architecture, by design. Everything below survives a client-framework change entirely unchanged, in both content and validity:

- **Backend**: Supabase (Postgres, `pgvector`, Auth, Storage, Edge Functions) — `ARCHITECTURE.md` §9.1's schema, RLS policies, and every Edge Function (`session-orchestrator`, `memory-extraction`, `learner-profile-updater`, `adaptive-scheduler`, etc.) run identically no matter what calls them.
- **`PROMPT_ENGINE.md`** — AI behavior, correction rules, context assembly — is entirely backend-side logic.
- **`LEARNING_ENGINE.md`** — SM-2, scoring formulas, CEFR progression — pure logic, portable to any language.
- **`DESIGN_SYSTEM.md`** — color/typography/spacing *values* and the design *philosophy* (§1's principles, §2's palette, §6's motion philosophy) carry over as a specification; only the SwiftUI-specific implementation syntax in a few spots needs re-authoring for the new UI toolkit.
- **`NON_FUNCTIONAL_REQUIREMENTS.md`, `OBSERVABILITY.md`** — the numeric targets and monitoring philosophy are framework-agnostic.
- **`ROADMAP.md`'s phases, `RISKS.md`'s risk register, `PROJECT.md`'s vision and principles** — untouched.
- **The Clean Architecture pattern itself** (Domain/Data/Presentation layering, Repository/Engine protocol abstraction, ADR-006's core rule) — this is a language-agnostic pattern, not a Swift-specific one. It is fully reproducible in TypeScript or Dart.

What changes is narrower than it might first appear: the client-side implementation language, the UI toolkit, the local persistence mechanism (SwiftData has no equivalent outside Apple platforms), and a handful of ADRs that were written assuming Swift specifically (detailed in §4).

## 2. The defining constraint

Per your clarification: **iPhone + a Samsung Windows notebook, no macOS anywhere in the project's lifecycle, permanently.** This is stricter than "no macOS *right now*" — it rules out native Swift/SwiftUI as a *destination*, not just as a *starting point*, since SwiftUI cannot run on Windows under any circumstance, cloud-built or not. This is why the earlier "development environment" question (§ previous turn) has resolved into a real architecture decision rather than a tooling workaround.

## 3. Dimension-by-dimension comparison

### 3.1 Compatibility with iPhone and a Windows notebook

| | React Native (Expo) | Flutter |
|---|---|---|
| iOS | Native compiled app via Expo/EAS. | Native compiled app. |
| Windows notebook | **No true native Windows target in Expo's supported workflow.** The realistic path is Expo's **web target** (`react-native-web`) — a responsive web app running in Edge/Chrome, optionally wrapped as a PWA. React Native for Windows exists (Microsoft-maintained) but is a separate, less mature project outside Expo's managed workflow, requiring you to eject or use bare workflow — meaningful added complexity. | **Officially, stably supported** as a first-party Flutter target since Flutter 3.0 (`flutter build windows`) — produces a real, installed, natively-compiled Windows desktop application, maintained by the same team that ships the mobile SDK, not a bolt-on. |

**This is the single most objectively lopsided dimension.** If "notebook Samsung" needs to be a genuinely installed, native-feeling Windows application, Flutter wins this outright — Expo's answer is "a very good web app," not a native Windows binary. If a well-built responsive web app is an acceptable (even preferable) experience for laptop use — plausible for this app's actual UI, which is conversational/dashboard-oriented, not graphics-intensive — the practical gap narrows substantially, and Expo's web target is genuinely excellent, one-codebase, and requires no additional framework/toolchain beyond what mobile already uses.

### 3.2 Voice integration

Both frameworks lack first-party voice/WebRTC support and rely on community packages for the OpenAI Realtime API's WebRTC transport:

- **RN**: `react-native-webrtc` (mature, widely used, community-maintained — not Meta-owned) + `expo-audio`/`expo-av` for capture/playback. Web target: native browser `getUserMedia`/WebRTC APIs — actually *more* mature here since it's just standard browser tech, no plugin needed at all for the web/notebook side.
- **Flutter**: `flutter_webrtc` (mature, actively maintained, explicit Windows desktop support) + `record`/`just_audio`. Desktop audio plugin support is generally more consistent across Flutter's official targets, since plugin authors treat Windows as a first-class target more often than RN plugin authors treat RN-for-Windows.

**Roughly even on mobile; Flutter has a real edge for voice specifically on the Windows notebook** (native desktop WebRTC via `flutter_webrtc`, vs. RN's web-target relying on the browser tab being the thing capturing audio — which does work, but is a different experience than an installed app with system-level mic access).

### 3.3 Local persistence

SwiftData has no equivalent outside Apple platforms; both alternatives replace it with a SQL-based offline-first library:

- **RN**: WatermelonDB (built specifically for offline-first, sync-heavy apps — a strong conceptual match for `ARCHITECTURE.md` §4's sync design) or `expo-sqlite` (raw SQLite, more manual). WatermelonDB in particular is a well-regarded choice for exactly this project's shape (local cache + remote sync + conflict resolution).
- **Flutter**: `drift` (formerly Moor — a mature, type-safe, compile-time-checked SQL layer with reactive streams; probably the closest spiritual successor to SwiftData's compile-time-safety value proposition) or `isar` (fast, but a smaller maintaining team, less certain long-term trajectory).

**Roughly even, both ecosystems have excellent, mature options.** `drift`'s compile-time query checking is the closest match to what SwiftData's type safety offered; WatermelonDB's built-in sync primitives are the closest match to `ARCHITECTURE.md` §4's actual sync design (though the project's `SyncCoordinator` would still be custom logic regardless — neither library replaces ADR-007's idempotency/conflict rules, both just host the local data).

### 3.4 Synchronization

The sync design in `ARCHITECTURE.md` §4 (idempotent upsert, watermark pull, append-only vs. server-timestamp-wins conflict rules, derived streaks) is pure business logic with no Swift-specific mechanics — it is **equally implementable in TypeScript or Dart**, calling the same Supabase REST/Realtime API either way. Both ecosystems have official, mature Supabase SDKs:

- **RN**: `@supabase/supabase-js` — arguably the single most battle-tested Supabase client of all, since JS/web is Supabase's primary audience.
- **Flutter**: `supabase_flutter` — also official and solid, slightly smaller community than the JS SDK but well-maintained.

**A wash technically, with a slight maturity edge to the JS SDK** given its sheer install base.

### 3.5 Performance

- **RN**: with the New Architecture (Fabric + TurboModules + JSI, default since RN 0.76 / recent Expo SDKs), performance is close to native for most UI work — components ultimately render as real native platform views, bridged efficiently. Business logic still runs on a JS thread.
- **Flutter**: compiles to native ARM/x64 code via Dart AOT; renders every pixel itself through its own engine (Skia/Impeller) rather than mapping to native platform widgets. This tends to produce more *consistent* frame timing across platforms, especially for custom animations — relevant to `DESIGN_SYSTEM.md` §6's motion system and `NON_FUNCTIONAL_REQUIREMENTS.md` §1's 60fps target.

**Flutter has a defensible edge for animation/rendering consistency specifically.** For this app's actual surface — a conversational UI, dashboards, lists — the practical difference is smaller than it would be for a graphics-heavy or game-like app; RN's New Architecture is genuinely competitive for this app's shape.

### 3.6 User experience

- **RN**: many component libraries bridge to real native platform widgets, which can feel more "natively conventional" by default, at the cost of more per-platform divergence to manage if you want pixel-identical branding across iOS/Android/Web.
- **Flutter**: since it draws everything itself, the app looks **pixel-identical across every platform** — which is actually a strong fit for `DESIGN_SYSTEM.md`'s stated goal of one original, consistent visual identity (§1: "not derived from any existing app's UI"), since there's no native-widget look to diverge from or fight against. The trade-off: achieving iOS-specific platform *conventions* (not just look, but exact native gesture/transition physics) takes more deliberate effort with Flutter's Cupertino widgets, which approximate iOS rather than literally being iOS's UIKit.

Given `DESIGN_SYSTEM.md` already committed to an **original, non-native-mimicking identity** (explicitly not copying any existing app, `PROJECT_BRIEF.md`'s instruction), Flutter's "draws its own consistent UI everywhere" model arguably aligns *better* with that stated design philosophy than RN's more native-component-flavored default — the design system was never trying to look like stock iOS anyway.

### 3.7 Ease of long-term maintenance (solo, AI-assisted — `RISKS.md` R-04)

This is where the analysis has to be honest about something beyond pure technical merit: **TypeScript/JavaScript has dramatically broader AI-coding-assistant proficiency than Dart**, simply due to training-data volume and ecosystem size — this directly matters for a project whose stated continuity strategy (`RISKS.md` R-04) is "documentation + AI-assisted development, no team." Dart/Flutter assistance is good, but TypeScript/React Native assistance (including from Claude) is typically stronger and more consistently reliable, across a larger surface of libraries and edge cases.

Beyond AI assistance specifically: TypeScript has a vastly larger human hiring pool and Stack-Overflow-era community depth, which matters if this project ever needs outside help.

**RN/TypeScript has a real, material edge here.**

### 3.8 Integration with Supabase

Covered in §3.4 — both official, both mature. A wash.

### 3.9 Integration with AI (Claude, OpenAI Realtime)

Per `ARCHITECTURE.md` §3, **the client never talks to Claude or OpenAI directly** — all AI calls are backend-mediated through Supabase Edge Functions. This means the client's job is just consuming a streamed HTTP/WebSocket response, which both `fetch`+ReadableStream (JS) and `http`+Stream (Dart) handle equally well. **A wash** — the AI integration's real complexity already lives entirely in the backend, unaffected by this decision.

### 3.10 Reuse of the existing architecture

| Element | Reusable as-is? | Notes |
|---|---|---|
| Backend (Postgres, RLS, Edge Functions) | **100%** | Zero changes needed. |
| `PROMPT_ENGINE.md` / `LEARNING_ENGINE.md` specs | **100%** | Pure logic/prose specs, language-agnostic. |
| `DESIGN_SYSTEM.md` token *values* | **100%** | Colors, spacing, type scale carry over as data; only the SwiftUI code samples in the doc need re-expression. |
| Clean Architecture layering (Domain/Data/Presentation) | **Conceptually 100%, mechanically re-implemented** | TypeScript interfaces or Dart abstract classes replace Swift protocols; the *pattern* (ADR-006) is fully portable. |
| ADR-018's compiler-enforced Domain/Data boundary | **Weaker enforcement, same intent** | Swift's two-SPM-target trick (a true compile error on violation) has no exact equivalent; the closest analogs are separate npm/Dart packages in a monorepo (Nx/Turborepo for RN, Melos for Flutter) with a lint rule or package-boundary rule blocking the import — enforced at lint-time/CI, not compile-time. Achievable, slightly less airtight. |
| SwiftData persistence | **0% — fully replaced** | No cross-platform equivalent exists; this is the largest single piece of concrete (not conceptual) rework. |
| WidgetKit (home-screen widget, macro-stage 21) | **Partially — a real caveat worth flagging honestly** | iOS home-screen widgets still require native Swift/WidgetKit code as a platform-specific native module in *either* RN or Flutter — this feature doesn't become framework-agnostic just by switching; it becomes a small, isolated native-module island regardless of which cross-platform framework wins. Worth deciding whether this feature is worth that isolated native-Swift dependency, or cut/deferred. |
| ADR-016 (native `TabView`/`NavigationStack`) | **Superseded** | Its entire rationale (free accessibility/platform-convention behavior from SwiftUI specifically) doesn't transfer; a new navigation-library decision is needed either way (React Navigation for RN, or Flutter's `Navigator`/`go_router`). |

## 4. Impact on existing architecture documents (for when a decision is made — not executed now)

Confirmed scope of what a migration would touch, so the size of the follow-up work is visible before committing to it:

- **New ADR needed**, superseding ADR-001 (client platform choice) — the pattern this project has followed throughout: never edit history, add a new ADR that supersedes the old one.
- **ADR-003** (persistence: Supabase + SwiftData) needs a superseding decision for the local-cache mechanism (WatermelonDB/`drift`/etc., per whichever framework is chosen).
- **ADR-011** (biometric lock via `LocalAuthentication`) needs a superseding note pointing at the equivalent cross-platform plugin (`expo-local-authentication` or `local_auth`) — same capability, different package.
- **ADR-013** (separate Swift Package for future macOS reuse) — its *reasoning* (share Domain+Data across future platforms) is arguably strengthened, not weakened, by this pivot, since RN/Flutter's whole premise already delivers iOS+Android+Web(+Windows for Flutter) from one codebase — likely re-expressed rather than discarded.
- **ADR-016** (native `TabView`/`NavigationStack`) — superseded; a new navigation-library ADR is needed.
- **ADR-018** (two-SPM-target compiler enforcement) — superseded by whatever monorepo/lint-based enforcement mechanism is chosen for the replacement framework.
- **`ARCHITECTURE.md`** — client-layer sections (§1 platform target, §2's Swift-specific code samples, §9.2's SwiftData model sketch, native-framework table in §8) need rewriting; backend sections (§3–§7, §9.1, §10 backend rows) stay as-is.
- **`DESIGN_SYSTEM.md`** — token values stay; a handful of SwiftUI-specific implementation notes get re-expressed for the new UI toolkit.
- **`IMPLEMENTATION_PLAN.md`** — needs a substantial re-author of macro-stages 1–4 (project/package/persistence setup, entirely Swift/Xcode-specific as written) and every task's Execution Environment classification changes (most "macOS Required" tasks become achievable on Linux/Windows, since neither RN nor Flutter requires macOS to develop — only to *build the final iOS binary*, which cloud CI can handle, detailed in §5).
- **`REPOSITORY_AUDIT.md` / `MIGRATION_PLAN.md`** — remain valid historical records of the Expo-to-native migration that already happened; not rewritten, but worth an editorial note that the project is pivoting again, for anyone reading the history later.

This is a real but *bounded* amount of documentation rework — concentrated in `ARCHITECTURE.md` and `IMPLEMENTATION_PLAN.md`, with `PROJECT.md`, `PROMPT_ENGINE.md`, `LEARNING_ENGINE.md`, `RISKS.md`, `ROADMAP.md`, `TASKS.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, and `OBSERVABILITY.md` requiring little to no change.

## 5. A practical note that changes the "macOS access" problem's shape, not just its stack

Whichever cross-platform framework is chosen, **an iOS binary must still, at some point, be compiled by Apple's toolchain** — that fact doesn't go away. What changes is *where*:

- **Expo (RN)**: `eas build --platform ios` compiles the iOS binary on Expo's own cloud macOS build workers — no local Mac needed at any point, including for TestFlight submission (`eas submit`). This is a first-party, tightly integrated, officially documented workflow — arguably Expo's single most relevant feature for this project's exact constraint.
- **Flutter**: no equivalent first-party service from the Flutter team itself; third-party cloud CI (Codemagic, most commonly, explicitly markets "build iOS without a Mac"; GitHub Actions macOS runners are another option, already referenced in `IMPLEMENTATION_PLAN.md` macro-stage 24) fills this role, achievable but one more piece of third-party infrastructure to set up and depend on rather than a built-in framework feature.

Day-to-day development (writing code, hot-reload testing on a connected iPhone or the Android/web targets) needs no macOS in either framework — this only matters for the final "produce a signed iOS binary" step, which both can solve, one more natively than the other.

## 6. Recommendation

**React Native with Expo.**

Not because Flutter is technically weaker in general — §3.1 and §3.5 are real, legitimate points in Flutter's favor, and if "notebook Samsung" must be a true installed native Windows app rather than an excellent web app, that alone could reasonably flip this recommendation. But weighing everything against this specific project's actual priorities:

1. **`RISKS.md` R-04 (solo, AI-assisted, multi-year maintenance) is this project's most important non-functional constraint**, stated as a governing principle from the very first architecture review. TypeScript's AI-assistant proficiency and ecosystem depth advantage (§3.7) serves that principle more directly than any other single factor in this analysis — including this session's own ability to help build and maintain it well, for years, which is exactly what the project needs.
2. **EAS Build (§5) doesn't just work around the no-Mac constraint — it's a first-party, purpose-built solution to precisely this problem**, more integrated and lower-maintenance than assembling third-party CI for the same outcome.
3. **The Windows-notebook gap (§3.1) is real but not fatal** for this app's specific UI shape: a conversational coach, dashboards, and lists are exactly the kind of interface a well-built responsive web app handles gracefully — this isn't a graphics-intensive or offline-desktop-tool use case where "web app" would be a meaningfully degraded experience. Expo's web target reaching the notebook, alongside true native apps on iOS/Android, is a reasonable, low-risk way to satisfy "usable on iPhone and the Samsung notebook" as actually stated.
4. Every dimension not covered above (§3.3, §3.4, §3.8, §3.9) is a wash — neither framework has an edge, so they don't move this decision either way.

**The one condition under which this recommendation should flip to Flutter**: if, on reflection, "works on the notebook" specifically means "feels like an installed native Windows application" rather than "is fully usable via a well-built web page in the browser" — in that case, Flutter's official Windows desktop target (§3.1) is the more honest answer to the actual requirement, and the AI-assistance/EAS advantages of React Native, while real, would not be worth trading that off.

## 7. Next steps (not executed — awaiting your decision)

1. Confirm React Native + Expo (or flip to Flutter per §6's stated condition, or ask for a deeper look at any specific dimension).
2. Only then: author the superseding ADRs listed in §4, update `ARCHITECTURE.md`'s client-layer sections, re-author `IMPLEMENTATION_PLAN.md` macro-stages 1–4 and the Execution Environment classification project-wide, and note the pivot in `PROJECT.md`.
3. Only then: resume implementation from a new macro-stage 1, appropriate to the confirmed stack.

No architecture has been altered, no ADR has been superseded, and no code has been written as part of this analysis, per your instruction.
