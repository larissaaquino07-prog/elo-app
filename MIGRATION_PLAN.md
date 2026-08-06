# MIGRATION_PLAN.md

Migration/cleanup plan for the repository, requested as a final safety step before executing `REPOSITORY_AUDIT.md`'s conclusions and ADR-017. **This document is a plan only — no file has been removed, adapted, or created on disk as a result of it.** Execution begins only after explicit approval, per your instruction.

---

## 1. Scope and method

`REPOSITORY_AUDIT.md` covered visible source/config/asset files. This pass re-scans specifically for hidden files and infrastructure categories that audit didn't enumerate individually: `.github/`, `.gitattributes`, `.editorconfig`, `.vscode/`, CI/CD workflows, Dependabot config, `CODEOWNERS`, custom git hooks, `.npmrc`/`.nvmrc`, `.env*`, linter/formatter configs, and IDE settings.

**Result: none of the above exist in this repository.** Confirmed by explicit filesystem checks, not by omission:

| Checked for | Found? |
|---|---|
| `.github/` (workflows, `ISSUE_TEMPLATE`, `PULL_REQUEST_TEMPLATE`, `dependabot.yml`) | No |
| `.gitattributes` | No |
| `.editorconfig` | No |
| `.vscode/` | No |
| `.idea/` | No |
| `.npmrc`, `.nvmrc` | No |
| `.env`, `.env.example`, `.env.local` | No |
| `.eslintrc*`, `.prettierrc*`, `.eslintignore`, `.prettierignore` | No |
| `.huskyrc`, `.husky/` | No |
| `Dockerfile`, `.dockerignore` | No |
| `CODEOWNERS`, `CONTRIBUTING.md`, `CHANGELOG.md` | No |
| Custom git hooks (`.git/hooks/*` beyond the default `.sample` files) | No |
| `node_modules/` on disk | No (never installed in this environment) |

So the full set of items requiring a decision is exactly what `REPOSITORY_AUDIT.md` already found, plus two things that audit didn't explicitly address and are resolved here: **(a)** whether any *currently absent* generic infra file should be introduced now, and **(b)** the repository's branch topology, which matters for rollback (§9).

### 1.1 A relevant discovery: the default branch

`git remote show origin` reports the repository's **default branch is `claude/expo-react-native-project-uf82dc`** — the branch that contains *only* the original Expo scaffold commit (`8cfc83d`) and nothing else. This working branch (`claude/project-analysis-planning-bmwq6l`) branched from that same commit and has since added every documentation file on top of it, but has not modified or deleted any of the original files yet.

This is not an action item — I will not touch the default branch, per the session's branch constraints — but it is directly relevant to §9 (rollback): **the default branch is, right now, a complete, untouched, independent copy of the old project.** No cleanup step in this plan can put that copy at risk, since it happens on a different branch entirely.

---

## 2. Final repository inventory — decision per item

Legend: **Manter** (keep, unchanged) · **Adaptar** (keep the file/mechanism, change its content) · **Remover** (delete, no replacement) · **Substituir** (delete, replace with a new equivalent at the same path).

### 2.1 Documentation (all authored fresh for this project)

| Path | Decision | Justification |
|---|---|---|
| `README.md`, `PROJECT.md`, `ARCHITECTURE.md`, `ARCHITECTURE_DECISIONS.md`, `ROADMAP.md`, `TASKS.md`, `RISKS.md`, `PROMPT_ENGINE.md`, `LEARNING_ENGINE.md`, `DESIGN_SYSTEM.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `OBSERVABILITY.md`, `REPOSITORY_AUDIT.md` | **Manter** | Written for this project, already free of legacy influence (verified during the 2026-08-06 consistency pass) |
| `MIGRATION_PLAN.md` (this file) | **Manter** (new) | Created by this task |

### 2.2 Legacy application code (Expo/React Native)

| Path | Decision | Justification |
|---|---|---|
| `App.tsx`, `index.ts` | **Remover** | Entry points for a runtime (Expo/RN) not used by this project; no native-Swift equivalent exists at these paths — the new entry point (`CoachApp.swift`) is a Phase 0 deliverable, not a rename of these |
| `src/` (27 files — components, context, data, navigation, screens, theme, types, utils) | **Remover** | Confirmed in `REPOSITORY_AUDIT.md` §1: 100% fitness-domain or React-Native-specific; none portable into a Swift target regardless of genericity |
| `assets/*.png` (6 files) | **Remover** | Confirmed in `REPOSITORY_AUDIT.md` §2: unmodified Expo CLI template icons, zero brand value, wrong format for an iOS asset catalog |

### 2.3 Project manifests / tooling (Node/Expo-specific)

| Path | Decision | Justification |
|---|---|---|
| `package.json`, `package-lock.json` | **Remover** | npm has no role in a Swift Package Manager project; the SPM equivalent (`Package.swift` / `Package.resolved`) is created fresh in Phase 0, not derived from these |
| `tsconfig.json` | **Remover** | No TypeScript in the new project |
| `app.json` | **Remover** | Expo-specific format with no Xcode equivalent (`Info.plist`/`project.pbxproj` serve this role); also encodes the old dark-only theme, already superseded by `DESIGN_SYSTEM.md` §12 |

### 2.4 Git & repo infrastructure

| Path | Decision | Justification |
|---|---|---|
| `.gitignore` | **Substituir** | The *mechanism* (ignore build artifacts/local state) is universally needed; the *content* (`node_modules/`, `.expo/`, Metro, generated `/ios` `/android`) is 100% Node/Expo-specific and covers none of what a Swift/Xcode project actually generates. New content proposed in §5.1 |
| `LICENSE` | **Substituir, pending your decision** | Current content is literally wrong for this repository — it's the unmodified MIT template from `create-expo-app`, copyright "650 Industries, Inc. (aka Expo)." It cannot be kept as-is under any interpretation. What replaces it is a product decision, not a technical one — see §5.2 for both options prepared |
| `.gitattributes` | N/A — doesn't exist | Confirmed absent (§1). Not required for a single-contributor Xcode project; not introducing one preemptively (nothing to normalize yet — no line-ending-sensitive files beyond docs, which are already LF via this environment) |

### 2.5 Claude Code / AI-tooling configuration

| Path | Decision | Justification |
|---|---|---|
| `CLAUDE.md` | **Manter** | Content is just `@AGENTS.md` — a generic, technology-agnostic import mechanism. Nothing to change here once `AGENTS.md` itself is fixed |
| `AGENTS.md` | **Adaptar** | This is the single highest-impact item in the whole audit (`REPOSITORY_AUDIT.md` §3) — it is *actively* instructing every session to read Expo's docs before writing code. The **mechanism** (a short, always-loaded file priming sessions with the current framework's authoritative docs before coding) is exactly the kind of generic, valuable practice worth keeping — it should point at Apple's Swift/SwiftUI/SwiftData docs instead. New content proposed in §5.3 |
| `.claude/settings.json` | **Adaptar** | Currently enables the `expo@claude-plugins-official` plugin. I searched the plugin catalog for a Swift/Xcode/iOS equivalent (`SearchPlugins`, 2026-08-06) — **none exists**. The file's mechanism (declaring enabled plugins) is fine to keep; its content should drop the Expo plugin now and stay empty until an iOS-relevant plugin appears. New content proposed in §5.4 |

---

## 3. Generic files worth introducing now (your item 4 — checked even though they don't exist yet)

Per your instruction to check for anything generic and useful "mesmo não pertencendo ao antigo aplicativo," I evaluated each common category:

| Candidate | Recommendation | Reasoning |
|---|---|---|
| `.editorconfig` | **Introduce now** (proposed content in §5.5) | Fully stack-agnostic, zero risk, immediately useful for the 14 Markdown docs already in the repo and for the Swift files that will follow — this is exactly the kind of file that shouldn't wait for Phase 0 |
| CI workflow (`.github/workflows/*.yml`) | **Do not introduce yet — deferred to Phase 0, already tracked as `TASKS.md` T0-14** | A workflow file with nothing real to build/test would be either non-functional or a placeholder that immediately goes stale; CI belongs right after the Xcode project + test target exist, not before |
| `CODEOWNERS`, `CONTRIBUTING.md` | **Not needed** | Single maintainer, personal-use project, no external contributors (`PROJECT.md` §7 non-goals) — these exist to coordinate multiple people, which doesn't apply here. Revisit only if that ever changes |
| Formal commit-message convention document | **Not needed as a separate file** | The commit history already follows a consistent, descriptive style (body + rationale + trailer); formalizing it into a policy document is coordination overhead this solo project doesn't need. If this becomes a multi-contributor project later, worth revisiting |
| `.gitattributes` | **Not needed yet** | No binary-diff or line-ending-sensitive file types currently in the repo beyond what git already handles correctly; revisit once Xcode project files (which sometimes benefit from merge=union or -diff attributes) exist in Phase 0 |
| SwiftLint/SwiftFormat config | **Deferred to Phase 0** | Meaningless without Swift source to lint; belongs with the Xcode project's initial setup (T0-02/T0-03), not this cleanup pass |

---

## 4. Recommended order of changes

Sequenced to fail safe — each step is independently revertible, and destructive steps come only after non-destructive ones are verified:

1. **Checkpoint.** ~~Tag the current commit before any change, pushed to origin.~~ **Executed with a substitution, documented here:** an annotated tag (`legacy-expo-final`) was created locally, but `git push origin legacy-expo-final` was rejected by the environment's git proxy with **HTTP 403** (an organization policy restriction — this session's push credentials are scoped to the designated branch ref only, not to creating new tag refs on the remote). Per the proxy's own guidance ("do not retry or route around it — report the blocked host"), this was not retried or worked around; it was reported to Julia, who approved the following as the **official checkpoint** in place of a remote tag:
   - **Commit `84c9101`** ("Add MIGRATION_PLAN.md...") — already pushed to `origin/claude/project-analysis-planning-bmwq6l`, permanently reachable by hash as long as history isn't rewritten (it won't be).
   - **The repository's default branch, `claude/expo-react-native-project-uf82dc`** (§1.1) — an already-pushed, untouched, independent copy of the pre-cleanup project.

   The local-only tag was deleted (`git tag -d legacy-expo-final`) rather than left behind, since it wasn't pushed and would otherwise be a misleading artifact — the two mechanisms above are the sole official checkpoint of record.
2. **Adapt infrastructure files** (non-destructive — these are edits, not deletions, and every one has a working previous state to fall back to mid-review): `.gitignore`, `AGENTS.md`, `.claude/settings.json`, and the `LICENSE` decision (§5.2, pending your input).
3. **Introduce `.editorconfig`** (purely additive).
4. **Commit step 2–3 as one logical commit** ("Adapt repository infrastructure for native iOS project") — reviewable independently of the removal step that follows.
5. **Remove legacy application code**, leaves-first to keep the diff easy to reason about: `assets/` → `src/` → `App.tsx`, `index.ts` → `package.json`, `package-lock.json`, `tsconfig.json`, `app.json`.
6. **Commit step 5 as one logical commit** ("Remove discontinued Expo/React Native prototype, per ADR-017") — kept separate from step 4 so either can be reverted independently if needed.
7. **Verify.** Confirm the working tree now contains exactly the "files kept" list in §7 — no stray files, nothing referencing removed paths (e.g., grep the surviving Markdown for accidental links to `src/` or `App.tsx`).
8. **Push** to this working branch only (`claude/project-analysis-planning-bmwq6l`) — never to the default branch, per standing constraints.
9. **Phase 0 begins separately**, as its own future work (`TASKS.md` T0-01 onward) — not part of this cleanup's commits, so "removed the old project" and "started the new one" remain distinguishable in history.

---

## 5. Proposed new content (preview only — not yet written to disk)

### 5.1 `.gitignore` (replaces current content)

```
# Xcode
build/
DerivedData/
*.xcuserstate
*.xcscmblueprint
xcuserdata/
.build/
.swiftpm/xcode/package.xcworkspace/xcuserdata/

# macOS
.DS_Store

# Secrets / local-only config
.env
.env.local
*.xcconfig.local

# CI/release artifacts
*.ipa
*.dSYM
*.dSYM.zip
```

Note: `Package.resolved` is deliberately **not** listed — it should be committed for reproducible builds, the same principle `package-lock.json` served for the old project (continuity of a sound practice, not of the tool itself).

### 5.2 `LICENSE` — two options, your call

**Option A — Remove entirely (recommended default).** This is private, personal-use software with no plan for public distribution (`PROJECT_BRIEF.md` §"Target: Personal Use"). A LICENSE file's purpose is to grant rights to people who might otherwise have none — there's no audience for that grant here, and an absent LICENSE on a private repo is the normal, unambiguous state for personal software.

**Option B — Replace with an explicit proprietary notice**, if you'd rather the ownership be unambiguous even in a private repo:
```
Copyright (c) 2026 Julia. All rights reserved.

This software and associated documentation are private and proprietary.
No license is granted for use, copying, modification, or distribution.
```

I'll implement whichever you choose at execution time; defaulting to Option A if you don't specify.

### 5.3 `AGENTS.md` (replaces current content)

```
# Swift 6 / SwiftUI / iOS 18+

This project targets iOS 18+ using Swift 6 and SwiftUI. Before writing or
modifying code, consult current Apple documentation rather than relying on
prior training knowledge — API surface, concurrency rules, and SwiftData
behavior can differ across OS/language versions:

- SwiftUI: https://developer.apple.com/documentation/swiftui
- SwiftData: https://developer.apple.com/documentation/swiftdata
- Swift concurrency (Swift 6 strict mode): https://www.swift.org/documentation/concurrency/

Before any structural or architectural decision, read `ARCHITECTURE.md` and
`ARCHITECTURE_DECISIONS.md` — the architecture is frozen (see ADR list); do
not deviate from an approved ADR without recording a new one that supersedes it.
```

### 5.4 `.claude/settings.json` (replaces current content)

```json
{
  "enabledPlugins": {}
}
```

No Swift/Xcode/iOS-specific Claude Code plugin exists in the catalog as of 2026-08-06 (verified via `SearchPlugins`). Revisit if one becomes available later — this is a "nothing to enable yet" state, not a permanent decision.

### 5.5 `.editorconfig` (new file)

```
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

[*.md]
trim_trailing_whitespace = false
indent_size = 2

[*.{yml,yaml,json}]
indent_size = 2
```

`trim_trailing_whitespace = false` for Markdown preserves intentional trailing-double-space line breaks. `indent_size = 4` as the general default matches Xcode's own default for Swift; this can be revisited once real SwiftFormat/SwiftLint config exists in Phase 0.

---

## 6. Files that will be removed (final list — 39 total)

**Self-correction, in the interest of the same consistency this project has held itself to throughout:** `REPOSITORY_AUDIT.md` §1 stated "Total: 27 source files, all 🔴" for its source-code table, but that table's own rows (`App.tsx`, `index.ts`, plus all 27 files under `src/`) sum to **29**, not 27 — the summary line undercounted by exactly the 2 entry-point files. It doesn't change any classification (every one of the 29 is still 🔴), only the stated total. The authoritative count is the flat list immediately below, cross-checked directly against the filesystem for this document.

```
App.tsx
index.ts
package.json
package-lock.json
tsconfig.json
app.json
assets/android-icon-background.png
assets/android-icon-foreground.png
assets/android-icon-monochrome.png
assets/favicon.png
assets/icon.png
assets/splash-icon.png
src/components/EloScoreCard.tsx
src/components/FriendActivityList.tsx
src/components/GoalProgress.tsx
src/components/Logo.tsx
src/components/PaywallModal.tsx
src/components/PersonCard.tsx
src/components/ScreenContainer.tsx
src/components/SportSection.tsx
src/components/StatCard.tsx
src/components/Toast.tsx
src/components/Toggle.tsx
src/components/WeekChart.tsx
src/components/WorkoutRow.tsx
src/context/AppStateContext.tsx
src/data/mockData.ts
src/navigation/CustomTabBar.tsx
src/navigation/RootNavigator.tsx
src/navigation/types.ts
src/screens/ConnectScreen.tsx
src/screens/HomeScreen.tsx
src/screens/ProfileScreen.tsx
src/screens/RankingScreen.tsx
src/screens/WorkoutsScreen.tsx
src/theme/colors.ts
src/theme/sports.ts
src/types.ts
src/utils/initials.ts
```

39 files: 6 assets + 29 legacy application-code files (`App.tsx`, `index.ts`, all of `src/`) + 4 build manifests (`package.json`, `package-lock.json`, `tsconfig.json`, `app.json`). §2 tables are the authoritative per-item source; this is the flat list for the actual `git rm` pass.

## 7. Files that will be kept (final list)

```
README.md
PROJECT.md
ARCHITECTURE.md
ARCHITECTURE_DECISIONS.md
ROADMAP.md
TASKS.md
RISKS.md
PROMPT_ENGINE.md
LEARNING_ENGINE.md
DESIGN_SYSTEM.md
NON_FUNCTIONAL_REQUIREMENTS.md
OBSERVABILITY.md
REPOSITORY_AUDIT.md
MIGRATION_PLAN.md
CLAUDE.md
AGENTS.md            (content replaced, §5.3)
.claude/settings.json (content replaced, §5.4)
.gitignore            (content replaced, §5.1)
```

`LICENSE` is either removed (Option A) or kept-with-new-content (Option B) — pending your decision, §5.2.

## 8. Files that will be created

```
.editorconfig   (§5.5)
```

No application code or Xcode project files are created by this cleanup — that begins with `TASKS.md` T0-01/T0-02 as separate, later work.

---

## 9. Risks per step

| Step | Risk | Mitigation |
|---|---|---|
| 1. Checkpoint | Remote tag push blocked (403, environment policy) | Realized risk, not just a theoretical one — resolved by substituting commit `84c9101` + the default branch as the official checkpoint (approved by Julia); no cleanup step proceeded until this was settled |
| 2–4. Adapt infra files | Low: a typo in `.gitignore` or `AGENTS.md` content | Reviewed inline in this plan (§5) before being written; small, easily diffed files |
| 5–6. Remove legacy code | Medium *in general* for "delete a lot of files at once", but low *here* specifically | Every removed file was individually classified in `REPOSITORY_AUDIT.md` before this plan existed; nothing is removed on a guess. Split into its own commit (step 6), independently revertible from the infra changes |
| 7. Verify | Low: a stray reference to a removed path could be missed | Explicit grep-for-broken-references step before pushing |
| 8. Push | Low: pushing to the wrong branch | Constrained to the working branch only; default branch is never a valid push target for this task |
| LICENSE decision (§5.2) | Low, but a genuine open decision, not just a mechanical step | Deliberately not defaulted silently — flagged for your input, with a stated default if none is given |

No step in this plan touches anything outside this git repository (no deployed backend, no App Store presence, no external service yet exists) — so the blast radius of any mistake here is fully contained to files this plan already enumerates.

## 10. Rollback strategy

**Revised in execution** (remote tag push was blocked, §4 step 1) — two official layers, both already in place with no further action needed:

1. **`git checkout 84c9101`** (or `git revert` the cleanup commit(s) that follow it) on the working branch — since history is never rewritten, `84c9101` remains permanently reachable by hash, and reverting the cleanup commits restores every removed file exactly as it was, with a new commit recording the reversal (no force-push required).
2. **The repository's default branch** (`claude/expo-react-native-project-uf82dc`, §1.1) — an entirely independent, untouched, already-pushed copy of the old project that this plan never modifies. Even in a worst-case scenario on the working branch, this remains a complete fallback, unaffected by anything in this plan.

Both mechanisms were confirmed sufficient by Julia in place of a remote tag. Rollback is git-only and low-stakes: nothing has been deployed, distributed, or installed anywhere outside this repository at this stage of the project.

---

## 11. What happens after your approval

Once approved: execute §4 in order, using the exact content in §5 (with your LICENSE choice from §5.2), producing the file sets in §6/§7/§8. This remains a documentation/infrastructure change only — no application code is written as part of this cleanup; Phase 0 implementation starts as separate, subsequent work.
