# NON_FUNCTIONAL_REQUIREMENTS.md

Measurable non-functional requirements (NFRs). Where `ARCHITECTURE.md` states a target descriptively, this document is the canonical numeric source — other documents should reference it rather than restate numbers. Targets marked *(provisional)* need validation against real device/usage data in the phase noted and may be revised; they are still binding acceptance criteria until revised, not placeholders to ignore.

**2026-08-06 platform migration note:** the numeric targets below are kept as the bar to measure against — they are **not** preemptively loosened just because the client platform changed from native Swift to React Native + Expo (`ARCHITECTURE_DECISIONS.md` ADR-019). This document's own established philosophy (measure, then decide, `IMPLEMENTATION_PLAN.md` macro-stage 25) argues against weakening a target on assumption; targets are revised only after real measurement says so. Measurement *tooling* references (Instruments, XCTest, XCUITest, MetricKit) are updated to their React Native/cross-platform equivalents throughout. Per §4/§6/§7's new platform-scoping notes: several targets apply fully on iOS/Android and are explicitly narrower on the web/PWA companion surface (`ARCHITECTURE_DECISIONS.md` ADR-024) — this is a deliberate scope decision, not an unmeasured gap.

---

## 1. Performance

| Requirement | Target | Measurement | Validated in |
|---|---|---|---|
| Cold launch to interactive | < 2s on a device ≤ 3 years old | Manual + platform profiler (Xcode Instruments on iOS, Android Studio Profiler on Android) | Phase 5 (T5-02) |
| Text conversation first-token latency | < 2s | Backend logging (`OBSERVABILITY.md` §7) | Phase 1 |
| Voice round-trip perceived latency | < 800ms | Client-side timing instrumentation | Phase 4 (T4-09) |
| Local list rendering (session/vocabulary history) | 60fps scroll, no dropped frames on lists up to 10,000 items | Platform profiler, paginated fetch (`ARCHITECTURE.md` §13) | Phase 5 |
| Sync of a normal daily delta (<50 changed rows) on Wi-Fi | < 5s | Backend/client sync logging | Phase 1 |
| Sync after a long offline period (paginated pull) | < 20s per 500 changed rows | Sync logging | Phase 1–2 |

## 2. Battery consumption *(provisional — requires real-device profiling; applies to iOS/Android — the web/PWA companion surface has no comparable battery-measurement concept)*

| Requirement | Target | Measurement |
|---|---|---|
| 30-minute voice session | ≤ 15% battery on a device with ≥80% battery health | Xcode Instruments Energy Log (iOS) / Android Studio Profiler, Phase 4 |
| Background sync (per day, typical usage) | ≤ 2% battery | Platform profiler, Phase 5 |
| Idle app in background | Negligible (no polling beyond `expo-background-task`'s conservative interval, `ARCHITECTURE.md` §13) | Platform profiler |

## 3. Memory consumption *(provisional)*

| Requirement | Target |
|---|---|
| Resident memory, typical text session | < 250MB |
| Resident memory, active voice session (includes audio buffers) | < 400MB |
| No unbounded growth over a long session (leak check) | Flat memory profile over a 30-minute platform-profiler run |

## 4. Availability

| Requirement | Target | Notes |
|---|---|---|
| Backend (Supabase) uptime | 99.5% monthly (internal target) | Inherits Supabase's own SLA; no multi-region failover — not justified for a single personal user under the moderate budget (D4) |
| Offline usability | 100% of core loop (start/continue a text or fallback-voice session, view cached progress) available with zero connectivity **on iOS/Android**; on web/PWA, text sessions and cached-progress viewing are offline-capable, voice fallback is not (no offline STT on web, `ARCHITECTURE_DECISIONS.md` ADR-024) | Native fallback (`ARCHITECTURE.md` §5.4), local cache (`ARCHITECTURE.md` §4) |
| Graceful degradation | No feature failure is ever a hard crash or blank screen — always a defined fallback or a clear, calm error state (`DESIGN_SYSTEM.md` §8) | |

## 5. Synchronization

| Requirement | Target |
|---|---|
| Data loss from a failed/interrupted sync | Zero (idempotent upserts, ADR-007) |
| Conflict visibility | 100% of server-timestamp-wins resolutions surface a non-blocking UI notice (`ARCHITECTURE.md` §4) — never silent |
| Background sync frequency | No more often than hourly via `expo-background-task` on iOS/Android, plus foreground/background lifecycle triggers; **web/PWA is best-effort only** (Service Worker `periodicSync`, Chrome-family, no guaranteed frequency — `ARCHITECTURE_DECISIONS.md` ADR-024) |
| Cross-device propagation (lightweight fields: streak, achievements) | < 10s when both devices are online, via Supabase Realtime |
| Recovery Point Objective (RPO) — independent, user-owned backup | ≤ 7 days (weekly export, `RISKS.md` R-03) |
| Recovery Point Objective — Supabase-side | Near-zero (point-in-time recovery) |

## 6. Security

| Requirement | Target |
|---|---|
| Data in transit | TLS 1.2+ everywhere (App Transport Security default, no exceptions) |
| Data at rest (server) | Supabase encryption at rest + Row Level Security on every table |
| Data at rest (device) | `expo-sqlite` store, OS-level file protection on iOS/Android; **web/PWA storage has no OS-level equivalent** — a documented, accepted asymmetry (`ARCHITECTURE.md` §7, `ARCHITECTURE_DECISIONS.md` ADR-024) |
| Secrets | Never present in the client bundle or `expo-secure-store` in plaintext beyond a short-lived session token; vendor API keys exist only in backend Edge Function secrets, rotated at least every 12 months |
| App-level access | Face ID/Touch ID gate on iOS/Android (`expo-local-authentication`), default re-lock after 5 minutes in background; **web uses a PIN/password fallback, no WebAuthn** (`ARCHITECTURE.md` §7, ADR-011, ADR-024) |
| Third-party AI data usage | Verified (not assumed) at implementation time that Anthropic/OpenAI API-tier traffic is excluded from model training |

## 7. Accessibility

| Requirement | Target |
|---|---|
| Screen-reader coverage | 100% of interactive elements have a meaningful label on VoiceOver (iOS), TalkBack (Android), and standard web screen readers; voice control announces its own state changes (`DESIGN_SYSTEM.md` §5.3/§11) |
| Font scaling | Fully supported up to the largest OS accessibility text size on every platform, no clipping/truncation |
| Color contrast | WCAG AA (≥4.5:1) on every text/background pair (`DESIGN_SYSTEM.md` §2) |
| Tap targets | ≥ 44×44pt everywhere |
| Reduce Motion | Every animation has a defined, non-degraded fallback |

## 8. Scalability

Validated against the horizon in `ARCHITECTURE.md` §11 — targets set well beyond realistic single-user, multi-year volume as a safety margin, not as an expected ceiling:

| Requirement | Target |
|---|---|
| Query performance (structured tables) | p95 < 200ms up to 10,000 sessions / 50,000 vocabulary items / 100,000 mistake records per user |
| Semantic search (`pgvector`) | p95 < 300ms with HNSW index, up to 10,000 session embeddings |
| Context package assembly (backend) | < 500ms server-side, independent of total history size (bounded by `PROMPT_ENGINE.md` §8 caps and `learner_profile`'s constant size, ADR-009) |
| Multi-device sync | No redesign required for a 2nd–3rd device (`ARCHITECTURE.md` §4, R-14 mitigated by design) |

## 9. Maximum response times (summary — canonical values, cross-referenced elsewhere)

| Interaction | Max acceptable |
|---|---|
| Text message send → first token | 2s |
| Voice: end of speech → coach's first audio | 800ms |
| App launch → interactive | 2s |
| Sync indicator → resolved | 5s (typical delta) |
| Screen navigation | Instant (Expo Router transitions, no network dependency for cached views) |

## 10. Quality targets

| Requirement | Target |
|---|---|
| Crash-free session rate | ≥ 99.5% (Sentry-tracked, crash/error scope only — `OBSERVABILITY.md` §5, `ARCHITECTURE_DECISIONS.md` ADR-023) |
| Background job success rate (extraction, profile update, backup) | ≥ 99% within 24h of the triggering event, with visible retry on failure |
| Correction accuracy (subjective, spot-checked) | No formal automated metric — validated by Julia's own judgment during Phase 1–4 use; if corrections consistently feel wrong, `PROMPT_ENGINE.md` is revised (governance, §14 there) |

## 11. Minimum test coverage

Consistent with `ARCHITECTURE.md` §12's testability philosophy (critical-path depth over exhaustive breadth, Principle 5):

| Layer | Target | Method |
|---|---|---|
| Domain (Use Cases, Entities, scheduler/spaced-repetition formulas) | ≥ 70% line coverage | Jest or Vitest (decide at `IMPLEMENTATION_PLAN.md` macro-stage 1 re-authoring), pure unit tests, mocked Repository/Engine interfaces |
| Data (Repositories, Mappers, SyncCoordinator) | ≥ 50% coverage | Jest/Vitest with an in-memory/temporary SQLite database |
| Presentation | No numeric target | Detox or Maestro (decide at macro-stage 1 re-authoring) on critical flows only: onboarding, start/end a session, voice fallback trigger, sync-conflict notice |
| CI gate | Unit + Data tests run on every push (T0-14); coverage regression (a drop below the targets above) fails CI once baseline is established. **No macOS runner required** for this gate — only the separate `eas build` step needs Apple's toolchain, and that runs on Expo's own cloud infrastructure. |

## 12. Relationship to other documents

- `ARCHITECTURE.md` describes *how* these targets are achieved (design); this document defines *what counts as met* (numbers).
- `DESIGN_SYSTEM.md` §11 and this document's §7 must stay in agreement — accessibility numbers live here, design treatment lives there.
- `OBSERVABILITY.md` defines how each of these targets is actually measured in production, on an ongoing basis, not just validated once per phase.
