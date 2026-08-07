# REPOSITORY_AUDIT.md

**Status: executed.** This audit's findings were carried out via `MIGRATION_PLAN.md` on 2026-08-06 — see that document §12 for the execution report. This file is kept unmodified from its original form as the historical pre-cleanup record; it describes the repository *before* cleanup, not its current state.

**Later the same day**, the client platform itself was migrated from native Swift/SwiftUI to React Native + Expo (`ARCHITECTURE_DECISIONS.md` ADR-019–024, `RN_EXPO_MIGRATION_PLAN.md`) — a separate, unrelated decision that does not reopen this audit's findings or its central conclusion (ADR-017: the pre-2026-08-06 fitness prototype remains fully independent and uninfluential, regardless of which client technology this project later adopts).

---

Final repository audit, requested to formalize the total independence of this project from the discontinued Expo/React Native fitness prototype that previously occupied this repository (`ARCHITECTURE_DECISIONS.md` ADR-001, extended by ADR-017 below). **This is a report only — no files have been removed and no code has been written.** Cleanup executes only after explicit approval, as a dedicated step before Phase 0 implementation begins (`TASKS.md` T0-01).

Classification legend:
- 🔴 **Remover imediatamente** — no technical or reference value to this project; remove in the cleanup pass.
- 🟡 **Manter temporariamente** — cannot or should not be removed yet for a stated operational reason, tracked with an explicit trigger for when it *can* be removed.
- 🟢 **Reaproveitar** — fully generic, technology-independent, and justified on its own technical merits (not proximity/convenience).

---

## 1. Source code (React Native / TypeScript)

| Path | Why it still exists | Impact on the new project | Classification |
|---|---|---|---|
| `App.tsx` | Root component of the discontinued Expo app | None if removed; if left, risks a future session mistaking it for live entry-point code | 🔴 |
| `index.ts` | Expo's `registerRootComponent` entry point | Irrelevant to an Xcode project (no `main.ts` equivalent in Swift) | 🔴 |
| `src/components/EloScoreCard.tsx` | Fitness "elo score" widget | Domain-specific (fitness scoring), zero relevance | 🔴 |
| `src/components/FriendActivityList.tsx` | Fitness social feed component | Domain-specific | 🔴 |
| `src/components/GoalProgress.tsx` | Fitness weekly-goal progress bar | Domain-specific | 🔴 |
| `src/components/Logo.tsx` | Old "elo" four-ring SVG brand mark | Old brand identity — `DESIGN_SYSTEM.md` defines an original, unrelated identity; keeping this risks visual contamination | 🔴 |
| `src/components/PaywallModal.tsx` | Fitness app's R$15/month freemium paywall UI | This project has no monetization/paywall (`PROJECT.md` §7 non-goals) | 🔴 |
| `src/components/PersonCard.tsx` | Workout-partner matching card | Domain-specific (social fitness matching) | 🔴 |
| `src/components/ScreenContainer.tsx` | Generic-looking layout wrapper, but React Native `View`-based | Not portable to SwiftUI; a native equivalent is trivial to write fresh and should be, so it matches `DESIGN_SYSTEM.md` §4 tokens natively rather than porting a foreign pattern | 🔴 |
| `src/components/SportSection.tsx` | Expandable per-sport section (running/gym/volleyball/swimming) | Domain-specific | 🔴 |
| `src/components/StatCard.tsx` | Fitness stat tile | Domain-specific | 🔴 |
| `src/components/Toast.tsx` | Generic-looking toast, but RN-specific implementation | Not portable; SwiftUI has its own idiomatic overlay/toast patterns | 🔴 |
| `src/components/Toggle.tsx` | Generic-looking switch, but RN-specific | Not portable; SwiftUI `Toggle` is native and free | 🔴 |
| `src/components/WeekChart.tsx` | Minutes-per-day fitness chart | Domain-specific | 🔴 |
| `src/components/WorkoutRow.tsx` | Workout list row | Domain-specific | 🔴 |
| `src/context/AppStateContext.tsx` | Global state: premium flag, paywall, toast, kudos, opt-ins | Domain- and monetization-specific; this project's state management is `AppContainer` + Repository/Use-Case pattern (`ARCHITECTURE.md` §2.3), an unrelated approach | 🔴 |
| `src/data/mockData.ts` | Mock workouts/people/leaderboard data | Domain-specific fixture data | 🔴 |
| `src/navigation/CustomTabBar.tsx` | Hand-built blurred tab bar | Explicitly superseded by ADR-016 (native `TabView` instead of custom nav) | 🔴 |
| `src/navigation/RootNavigator.tsx` | React Navigation tab/stack wiring for the 5 fitness screens | Domain- and framework-specific | 🔴 |
| `src/navigation/types.ts` | React Navigation route param types for fitness screens | Domain-specific | 🔴 |
| `src/screens/ConnectScreen.tsx` | Find-a-workout-partner screen | Domain-specific | 🔴 |
| `src/screens/HomeScreen.tsx` | Fitness home dashboard | Domain-specific | 🔴 |
| `src/screens/ProfileScreen.tsx` | Fitness profile + subscription screen | Domain-specific | 🔴 |
| `src/screens/RankingScreen.tsx` | Consistency leaderboard | Domain-specific | 🔴 |
| `src/screens/WorkoutsScreen.tsx` | Workout logging screen | Domain-specific | 🔴 |
| `src/theme/colors.ts` | Fitness dark palette + per-sport colors | `DESIGN_SYSTEM.md` §2 deliberately defines a distinct, unrelated palette; keeping this file risks accidental copy-paste reuse of the old hues | 🔴 |
| `src/theme/sports.ts` | Per-sport icon/color/label metadata | Domain-specific | 🔴 |
| `src/types.ts` | `Workout`, `FriendActivity`, `LeaderboardEntry`, etc. | Domain-specific data types, unrelated to `ARCHITECTURE.md` §9's entities | 🔴 |
| `src/utils/initials.ts` | Generic "get initials from a name" helper | The *logic* is trivial and technology-agnostic, but the *file* is TypeScript and cannot be imported into a Swift target — there is no mechanism to "reuse" it. Re-implementing a two-line function natively in Swift when needed is not meaningfully different from writing it fresh, so this doesn't qualify as reuse, just as a note that the concept was never proprietary to begin with | 🔴 |

**Total: 27 source files, all 🔴.** None can be *technically* reused regardless of genericity — TypeScript/React Native source cannot be imported into a Swift target. This is stated explicitly because "Reaproveitar" only applies where cross-language/cross-platform portability actually exists; UI/state *patterns* are excluded from consideration per your instruction that naming, conventions, and structure must not carry over either.

## 2. Assets

| Path | Why it still exists | Impact | Classification |
|---|---|---|---|
| `assets/icon.png` (1024×1024) | Verified by inspection: this is **Expo's own default template icon** (a generic blue chevron with construction guides), not custom "elo" branding | Zero brand value either way; wrong format for iOS besides (a native project uses an Xcode asset catalog with device-specific sizes, not a single loose PNG) | 🔴 |
| `assets/splash-icon.png` | Same Expo template default | Same as above | 🔴 |
| `assets/favicon.png` | Expo web-target favicon (this project has no web target) | N/A | 🔴 |
| `assets/android-icon-foreground.png` | Expo Android adaptive icon | N/A — no Android target, ever | 🔴 |
| `assets/android-icon-background.png` | Expo Android adaptive icon | N/A | 🔴 |
| `assets/android-icon-monochrome.png` | Expo Android adaptive icon | N/A | 🔴 |

**Total: 6 assets, all 🔴.** None are custom-designed for either the old or new project — they are unmodified Expo CLI template output, so there is no "old branding" being lost by removing them, only generic scaffolding.

## 3. Configuration & tooling

| Path | Why it still exists | Impact | Classification |
|---|---|---|---|
| `package.json` | npm manifest for the Expo/RN app | Node/npm has no role in a native Swift Package Manager project | 🔴 |
| `package-lock.json` | npm lockfile | Same | 🔴 |
| `tsconfig.json` | TypeScript compiler config | No TypeScript in the new project | 🔴 |
| `app.json` | Expo app config (bundle identity, dark-only `userInterfaceStyle`, Android adaptive icon refs) | Format is Expo-specific (no equivalent use in Xcode, which uses `Info.plist`/`project.pbxproj`/`.xcconfig`); also encodes the old dark-only theme decision that `DESIGN_SYSTEM.md` §12 explicitly reversed | 🔴 |
| `.gitignore` | Node/Expo-specific ignores (`node_modules/`, `.expo/`, Metro, generated `/ios` `/android`) | A Swift/Xcode project needs a different set (`.build/`, `DerivedData/`, `*.xcuserstate`, `xcuserdata/`, `.swiftpm/`) — the current file neither harms nor helps, but doesn't cover what the new project actually needs | 🔴 |
| `LICENSE` | **Not this project's license at all** — it's the unmodified MIT license template from `create-expo-app`, copyright "650 Industries, Inc. (aka Expo)" | Actively incorrect if left in place — it misrepresents copyright ownership of this repository's content | 🔴 |
| `AGENTS.md` | Contains: *"Expo HAS CHANGED — read the exact versioned docs at docs.expo.dev/versions/v57.0.0 before writing any code"* | **Highest-impact remnant in the audit.** This file is auto-loaded into every session via `CLAUDE.md`'s `@AGENTS.md` import — it currently actively instructs any future Claude Code session (including this one, and any future one) to treat this as an Expo project before writing code. This is the one item that doesn't just sit inertly in the repo — it directly steers future technical decisions, which is exactly what this ADR forbids | 🔴 (content must be replaced; the file itself, as an AGENTS.md convention, is fine to keep) |
| `.claude/settings.json` | Enables the `expo@claude-plugins-official` Claude Code plugin | Actively enables Expo-specific tooling/behavior in this session's harness for a project that no longer uses Expo | 🔴 (content should be reviewed/removed unless a native-iOS-equivalent plugin is deliberately chosen) |
| `CLAUDE.md` | One line: `@AGENTS.md` import | The import mechanism itself is generic and not old-project-specific — only the file it imports needs correcting | 🟢 (structure only; no change needed to this file itself once `AGENTS.md` is fixed) |

## 4. Non-file remnant: git history

| Item | Why it still exists | Impact | Classification |
|---|---|---|---|
| Commit `8cfc83d` ("Scaffold elo Expo/React Native app...") and everything it added | Original commit that created the fitness prototype in this repo | Inert — git history doesn't influence runtime behavior or future code, and rewriting history would require a force-push, would break the relationship with anything already fetched from `origin`, and risks losing legitimate provenance (including this entire documentation project's own commit trail, which lives on the same branch history) | 🟡 **Manter** — recommend *not* rewriting history. This is a deliberate exception to "remove everything": the risk of rewriting shared branch history outweighs the near-zero cost of an inert old commit sitting in the log. Revisit only if the repository is ever forked fresh specifically to start with clean history (not currently justified) |

## 5. What is *not* a remnant (confirmed clean)

For completeness — these were checked and found to carry no legacy influence:
- All 12 documentation files (`PROJECT.md` through `OBSERVABILITY.md`, `ROADMAP.md`, `TASKS.md`, `RISKS.md`, `ARCHITECTURE_DECISIONS.md`) were authored fresh for this project and already explicitly disclaim the old app where relevant.
- No `node_modules/` present on disk (never installed in this session).
- No CI/CD workflow files exist (`.github/workflows/` is absent) — nothing to audit there.
- No test files exist for the old app — nothing to audit there.

---

## 6. Dependency analysis (`package.json`)

| Dependency | Role in the old project | Disposition |
|---|---|---|
| `expo`, `expo-status-bar`, `expo-blur`, `expo-linear-gradient` | Expo SDK runtime + specific UI modules | 🔴 Remove — no Expo in a native project |
| `react`, `react-dom`, `react-native`, `react-native-web` | Core RN/React runtime | 🔴 Remove |
| `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens` | RN navigation/gesture infra | 🔴 Remove — SwiftUI provides safe-area handling and gestures natively |
| `react-native-svg` | SVG rendering (used for the old logo/progress ring) | 🔴 Remove — SwiftUI `Shape`/`Path` and SF Symbols cover this natively |
| `@react-navigation/native`, `@react-navigation/bottom-tabs` | Navigation | 🔴 Remove — superseded by native `TabView`/`NavigationStack` (ADR-016) |
| `lucide-react-native` | Icon set | 🔴 Remove — **replace with SF Symbols** (Apple's native, zero-dependency icon system), a strictly better fit for `DESIGN_SYSTEM.md`'s native-first philosophy |
| `@types/react`, `typescript` | TS tooling | 🔴 Remove |

**All 14 dependencies: remove. Zero are needed or substitutable 1:1** — an npm-to-Swift-Package-Manager mapping doesn't meaningfully exist here; the ecosystems don't overlap.

### What the new project actually needs (for context — already implied by `ARCHITECTURE.md`, not a new decision here)

Per the already-approved architecture, the dependency footprint is intentionally minimal:
- **Supabase Swift SDK** (Auth, Postgres/Realtime, Storage) — the one significant external Swift Package Manager dependency.
- Everything else is first-party Apple frameworks already specified in `ARCHITECTURE.md` §8/§10: SwiftUI, SwiftData, Speech, AVFoundation, LocalAuthentication, WidgetKit, UserNotifications, `OSLog`, `MetricKit` — zero external dependencies.
- **No Anthropic or OpenAI SDK is needed in the iOS app at all** — worth stating explicitly, since it's a direct consequence of `ARCHITECTURE.md` §3's "the client never talks to Claude or the Realtime API directly" rule: those calls live only in the backend (Supabase Edge Functions), so the client has no vendor AI SDK dependency to manage, update, or audit. This lean footprint is itself a `RISKS.md` R-04 (maintainability) win, not just a byproduct.

## 7. Proposed final repository structure

Illustrative — exact target/package names depend on the product name (`TASKS.md` T0-08, still open); `CoachApp`/`CoachKit` are placeholders consistent with the "Coach" codename already used throughout `PROJECT.md`.

```
/ (repo root)
├── README.md
├── LICENSE                         # new — correct copyright holder
├── .gitignore                      # Swift/Xcode-appropriate
├── PROJECT_BRIEF.md
├── PROJECT.md
├── ARCHITECTURE.md
├── ARCHITECTURE_DECISIONS.md
├── ROADMAP.md
├── TASKS.md
├── RISKS.md
├── PROMPT_ENGINE.md
├── LEARNING_ENGINE.md
├── DESIGN_SYSTEM.md
├── NON_FUNCTIONAL_REQUIREMENTS.md
├── OBSERVABILITY.md
├── REPOSITORY_AUDIT.md             # this file, kept as historical record
│
├── CoachApp.xcodeproj/              # or .xcworkspace if convenient
├── CoachApp/                        # iOS app target — Presentation layer only (ADR-006/013)
│   ├── CoachApp.swift               # @main App entry
│   ├── Composition/                 # AppContainer, composition root (ADR-012)
│   ├── Features/
│   │   ├── Onboarding/
│   │   ├── Coach/                   # text + voice conversation
│   │   ├── Progress/
│   │   ├── Memory/                  # searchable history/vocabulary
│   │   └── Profile/
│   ├── DesignSystem/                 # SwiftUI implementation of DESIGN_SYSTEM.md tokens/components
│   ├── Resources/
│   │   └── Assets.xcassets/          # app icon (freshly designed), color sets, generated fresh
│   └── Info.plist
│
├── CoachKit/                         # local Swift Package — Domain + Data (ADR-013)
│   ├── Package.swift
│   ├── Sources/CoachKit/
│   │   ├── Domain/
│   │   │   ├── Entities/
│   │   │   ├── UseCases/
│   │   │   └── Protocols/            # Repository + Engine protocols (ADR-006)
│   │   └── Data/
│   │       ├── SwiftData/
│   │       ├── Supabase/
│   │       ├── Mappers/
│   │       └── Sync/                 # SyncCoordinator
│   └── Tests/CoachKitTests/
│
├── CoachAppUITests/                  # XCUITest, critical flows only (ARCHITECTURE.md §12)
│
└── backend/                          # Supabase project source
    ├── supabase/
    │   ├── migrations/               # versioned SQL (ARCHITECTURE.md §4 migration strategy)
    │   └── functions/                # Edge Functions (Orchestrator, Memory Extraction, etc.)
    └── README.md
```

Nothing from the current tree survives into this structure unmodified — every directory above is created fresh in Phase 0 (`TASKS.md` T0-01–T0-07).

---

## 8. Recommendation

Proceed with a full 🔴 cleanup (27 source files, 6 assets, 7 config files) once approved, replace `AGENTS.md`'s content and review `.claude/settings.json` as the two highest-priority items (they actively steer future decisions, unlike inert files), leave git history untouched (🟡), and scaffold the structure in §7 as the first act of Phase 0. See `ARCHITECTURE_DECISIONS.md` ADR-017 for the formal decision record.
