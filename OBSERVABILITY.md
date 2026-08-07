# OBSERVABILITY.md

Defines how the application's health is monitored — technical (logging, metrics, crashes, sync, AI calls) and pedagogical (learning indicators). Serves two purposes directly tied to earlier risk analysis: continuity for a solo maintainer (`RISKS.md` R-04) and real cost visibility under a moderate-but-efficiency-conscious budget (`RISKS.md` R-06, D4).

---

## 1. Principles

- **Operational, not surveillance.** Observability data serves debugging, cost control, and product-health insight — it is explicitly not the same category as the user's learning data. It is **not** covered by Principle 1's "never forget" guarantee and can be pruned (§11); conflating the two would be a privacy and a data-hygiene mistake.
- **No third-party analytics SDK.** At this scale (single user), a third-party analytics/event-tracking SDK (Firebase, Amplitude, etc.) adds a new vendor dependency and a new place sensitive-adjacent usage data could leak, for a benefit this project can already get in-house. Product analytics live in Supabase itself (§4). **One narrow, deliberate exception (2026-08-07, ADR-023):** a minimal Sentry React Native integration, scoped strictly to crash/error capture — not analytics, not session replay — since React Native has no zero-dependency native equivalent to Apple's `MetricKit`. This does not reopen the broader "no third-party analytics" decision; §5 states its exact scope.
- **Native tooling first, where it still exists.** Structured logging (§2) and the debug Health screen (§10) stay dependency-light by design, consistent with `ARCHITECTURE.md` §14's original decision — the one exception (crash reporting, above) is named explicitly rather than treated as an opening to add other third-party SDKs.
- **Never log sensitive content.** Raw transcript text and other conversation content are never written to logs, at any level — only metadata (IDs, durations, counts, error codes). This is a hard rule, not a preference, given the HR-sensitive nature of the content (`RISKS.md` R-09).

## 2. Logging

Structured log categories via a lightweight logging library (e.g. `react-native-logs` — the direct successor to `OSLog` in this stack), each with standard levels (`debug` / `info` / `error` / `fault`):

| Category | Examples logged | Never logs |
|---|---|---|
| `Sync` | Sync start/end, rows pushed/pulled, conflict resolutions, retry attempts | Row content |
| `AI` | Engine used, call duration, token counts, success/failure, fallback triggered | Prompt/response text |
| `Voice` | Session start/end, reconnect attempts, fallback engagement | Transcript content |
| `Auth` | Sign-in/out, session refresh, biometric lock events | Tokens themselves |
| `UI` | Non-fatal rendering/state errors | — |

Debug-level logs are compiled out of release builds; `info`/`error`/`fault` persist for on-device inspection during development and, for `error`/`fault` in the `Sync` and `AI` categories specifically, also forwarded to the backend (§5) so failures are visible without needing physical access to the device.

## 3. Metrics (technical)

Logged per relevant event, aggregated server-side for review:

- App launch time (cold/warm).
- Sync duration, success/failure rate, rows transferred.
- API latency per engine (Claude, OpenAI Realtime, native fallback) — p50/p95/p99.
- Token usage (input/output) and estimated cost, per call and rolled up per session/day/month.
- Prompt cache hit rate (validates `PROMPT_ENGINE.md` §9's cost strategy with real numbers, not assumption).
- Background task (`expo-background-task` on iOS/Android; best-effort on web, `ARCHITECTURE_DECISIONS.md` ADR-024) success/failure and completion latency.

## 4. Analytics (product usage)

A lightweight, in-house `usage_events` table in Supabase (not a third-party SDK, §1) — coarse, aggregate events only:
- Session started/completed (mode, category, duration).
- Feature used (progress view opened, memory search used, export requested).
- Onboarding step completed.

No per-tap event streams, no third-party identifiers, no content. This is enough to answer "is the app actually being used the way it's designed to be" without building a surveillance layer neither the product nor a single trusted user needs.

## 5. Crash reporting

- **Primary (2026-08-07, ADR-023):** a minimal Sentry React Native integration — crash reports, unhandled exceptions, launch metrics. Deliberately scoped to this alone: session replay, breadcrumb-based user-behavior tracking, and Sentry's broader analytics features are explicitly **not** enabled, keeping this exception narrow rather than a backdoor into the third-party-analytics decision §1 otherwise avoids. Crash payloads must never include transcript content or PII (`ARCHITECTURE.md` §7) — an explicit configuration requirement, not an assumption.
- **Supplement**: explicit error logging (§2, `error`/`fault` levels) from `catch` blocks in critical paths (`SyncCoordinator`, AI engine calls) sent to the backend immediately — crash-reporter payloads can be delayed, and a sync or AI-call failure needs faster visibility than that for a solo maintainer to act on.
- Crash-free session rate (`NON_FUNCTIONAL_REQUIREMENTS.md` §10) computed from these two sources combined.

## 6. Sync monitoring

- Pending-changes count surfaced live in the client UI (`DESIGN_SYSTEM.md` §8) — the user-facing view of sync health.
- `device_sync_state` (`ARCHITECTURE.md` §9.1) gives a server-side, per-device view of `last_synced_at` — useful once a second device exists, and as an early signal if a device stops syncing silently (possible uninstall, device loss, or a bug) — flag if any device's `last_synced_at` exceeds 7 days old while the account is otherwise active.
- Idempotency violations (a duplicate-key upsert conflict that *shouldn't* happen given ADR-007's design) are logged as `fault`-level — their presence at all would indicate a bug in the sync design, not routine operation.

## 7. AI call monitoring

Per call, logged (metadata only, §1): engine (`Claude` / `OpenAI Realtime` / native fallback), latency, tokens in/out, cost, outcome (success/failure/timeout), and whether a fallback was triggered. This feeds three things directly:
- The cost dashboard (`TASKS.md` T6-01) — real spend data against the D4 budget posture.
- Voice reliability signal — the fallback-engagement rate is itself a health indicator for `RISKS.md` R-01 (if fallback triggers often, the primary voice path needs attention, independent of whether any single session "worked").
- Provider-swap validation — comparative latency/cost/quality data across engines, useful evidence if `ARCHITECTURE_DECISIONS.md` ADR-002/ADR-005's swappability is ever exercised for real.

## 8. Performance indicators

Rolled up (dashboard, §10) against the numeric targets in `NON_FUNCTIONAL_REQUIREMENTS.md`:
- Latency percentiles (p50/p95/p99) per engine and per sync operation.
- Crash-free session rate.
- Background task completion rate.
- Battery/memory spot-checks (manual, platform-profiler-driven — Xcode Instruments on iOS, Android Studio Profiler on Android — not continuously instrumented in production, per §1's operational-not-surveillance principle and platform constraints on runtime battery introspection).

## 9. Learning indicators (product/pedagogical health — distinct from technical metrics)

Defined in `LEARNING_ENGINE.md` §11; monitored here as trends, not just point-in-time values:
- Fluency Score and Confidence Score trend (rising / flat / falling) over rolling 4-week windows.
- Weekly business/daily adherence percentage.
- Weak-topic resolution rate (how quickly flagged weak points move toward resolved).
- Streak length and grace-period usage.

**Meta-signal**: if Fluency/Confidence has been flat for 4+ consecutive weeks *despite* consistent session frequency, that's not a "Julia isn't trying" signal — it's a signal the adaptive engine itself (`LEARNING_ENGINE.md` §3/§10) may need tuning (difficulty miscalibrated, review load wrong, scenarios not actually varied enough). This distinction matters: these indicators monitor the *system's* effectiveness, not just the user's activity.

## 10. Dashboards

Given a solo maintainer and no operational team, heavyweight ops tooling (Grafana, Datadog, etc.) is not justified. Instead:
- A **dev-only, debug-build-flagged "Health" screen** in the app itself: last sync status, last successful extraction/profile-update job, this month's token spend, recent error log tail. Cheap, always available without separate infrastructure, gated behind a debug-only build flag (the React Native equivalent of the originally-planned `#if DEBUG`).
- A minimal backend view (SQL views over the metrics tables in §3/§6/§7) queryable directly in the Supabase dashboard — no custom BI tool needed at this scale.

## 11. Retention of observability data

Distinct from the user's learning data (retained per Principle 1's "never forget without explicit permission"): logs and technical metrics are operational and are pruned on a **90-day rolling window** by default. `usage_events` (§4) aggregates may be retained longer in summarized/rolled-up form (e.g., monthly totals) since they carry no content and are cheap to keep, but raw per-event rows follow the same 90-day window. This distinction is stated explicitly so it's never accidentally treated as part of the memory guarantee — deleting a 4-month-old sync log is not deleting a memory.

## 12. Relationship to other documents

- Implements the measurement side of every target in `NON_FUNCTIONAL_REQUIREMENTS.md`.
- `ARCHITECTURE.md` §14 states the tooling *choice* (structured logging + the scoped Sentry exception, ADR-023); this document is the detailed operational specification built on that choice.
- Feeds `RISKS.md` R-01, R-03, R-06, R-11, R-14 with the real data needed to know whether each risk's mitigation is actually working, not just designed.
