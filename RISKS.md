# RISKS.md

Technical risks and mitigation strategies. Reviewed and updated as the project progresses — not a one-time document. Risk IDs are stable across revisions; do not renumber when closing a risk, mark it Resolved instead. Cross-references `ARCHITECTURE_DECISIONS.md` where a risk was closed by a specific ADR.

Likelihood/Impact scale: Low / Medium / High.

---

## R-01 — Voice architecture is unproven for this use case
**Likelihood:** Medium · **Impact:** High

The hybrid (Claude for reasoning/memory, OpenAI Realtime API for voice) is a reasonable default but untested for this exact pattern. Latency, cost, or context-injection quality may not meet the "feels premium" bar (Principle 6).

**Mitigation:** Voice sequenced last (`ROADMAP.md` Phase 4). Native fallback (`@react-native-voice/voice` + `expo-speech`, T4-03 — the React Native equivalents of the Speech framework + `AVSpeechSynthesizer`, per the 2026-08-07 client platform migration, ADR-019) degrades a Realtime failure to reduced richness rather than a blocked session, on iOS/Android. The 2026-08-06 review added concrete acceptance criteria — latency budgets (canonical values in `NON_FUNCTIONAL_REQUIREMENTS.md` §1/§9) and reconnect-before-fallback logic (`ARCHITECTURE.md` §5.4) — so this risk is now measurable, not just anticipated. Fallback-engagement rate is tracked as a health signal (`OBSERVABILITY.md` §7). On web, no offline voice fallback exists at all (`ARCHITECTURE_DECISIONS.md` ADR-024) — a wider risk surface than the original iOS-only design, accepted under the companion-surface framing.

---

## R-02 — Memory system complexity grows unbounded over years
**Likelihood:** High · **Impact:** Medium

"Remember everything" for years means memory keeps growing. Unmanaged, this risks slow queries, bloated context windows, and rising per-session cost.

**Mitigation:** Two-tier design plus, since the 2026-08-06 review, a **hierarchical `learner_profile`** (ADR-009) that keeps the default per-session context bounded regardless of total history size — the profile grows in richness, not in size. Raw transcripts excluded from the local cache and now also moved out of the hot `sessions` table into object storage (ADR-008, R-13).

---

## R-03 — Data loss requires an explicit backup strategy
**Likelihood:** Low · **Impact:** Critical

Principle 1 makes memory loss the worst possible failure mode. Two distinct loss scenarios exist: server-side (Supabase incident) and a local write made offline and not yet synced before device loss/reset.

**Mitigation — now concrete (was vague pre-review):**
- Supabase point-in-time recovery enabled (accepted cost under D4 — durability outranks this saving).
- A weekly scheduled export (structured JSON) to Supabase Storage **and** mirrored to a second, user-owned location (e.g. iCloud Drive), so a Supabase account-level incident is not a single point of failure.
- Idempotent upserts (ADR-007) mean a retried sync after an interruption cannot corrupt data via duplication.
- For the offline-pending-write window: sync eagerly on every foreground/background transition, with a visible "N changes waiting to sync" indicator so an unsynced state is never invisible.

**Status: Mitigated**, pending implementation in Phase 1.

---

## R-04 — Single point of failure: one user, one maintainer, AI-assisted development
**Likelihood:** Medium · **Impact:** High

There is no team. If Julia stops maintaining it, or the Claude Code-assisted workflow becomes unavailable, the product has no continuity plan.

**Mitigation:** Documentation (the full set, including `PROMPT_ENGINE.md`, `LEARNING_ENGINE.md`, `DESIGN_SYSTEM.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `OBSERVABILITY.md`) as the primary continuity mechanism — any future maintainer can resume from these files alone, including the reasoning behind each decision, not just the current state. Mainstream, well-documented frameworks only — this consideration directly informed the 2026-08-07 client platform migration itself (`ARCHITECTURE_DECISIONS.md` ADR-019): TypeScript/React Native's broader AI-coding-assistant proficiency and ecosystem depth serve this exact risk more directly than the original Swift stack would have, given no-macOS-access made that stack impossible to continue anyway. CI (T0-14) catches regressions automatically even without a reviewer, and — a genuine simplification from the migration — no longer needs a macOS runner for most of the suite. The in-app debug Health screen (`OBSERVABILITY.md` §10) gives a future maintainer a fast read on system state without needing separate ops tooling.

---

## R-05 — Vendor/model deprecation over a multi-year lifespan
**Likelihood:** High · **Impact:** Medium

Anthropic, OpenAI, and Supabase will all ship breaking changes and deprecate model versions over a multi-year period.

**Mitigation:** Structurally mitigated by the `ConversationEngine` / `VoiceEngine` / `MemoryExtractionEngine` Domain protocols (ADR-002, ADR-005) — a provider swap is a new Data-layer adapter. The review adds a further validation step: build a minimal second `ConversationEngine` adapter early (T0-13) specifically to prove the abstraction isn't leaky before the whole app depends on it.

---

## R-06 — Cost growth under a moderate-but-efficiency-conscious budget
**Likelihood:** Medium · **Impact:** Medium

D4 explicitly conditions the moderate budget on avoiding unnecessary API calls.

**Mitigation:** Usage/cost dashboard (T6-01) from Phase 1, fed by per-call instrumentation (T1-17, `OBSERVABILITY.md` §7). Concrete levers, all specified in `PROMPT_ENGINE.md` §9: prompt caching, right-sized model per job (cheaper tier for background extraction/profile-update jobs), hierarchical memory bounding context size regardless of history length (ADR-009), native voice fallback avoiding API cost entirely for degraded/offline sessions, and provider-swappability itself as a long-term cost lever.

---

## R-07 — iOS distribution for years-long personal use
**Likelihood:** Medium (was High before the 2026-08-07 client platform migration) · **Impact:** High

Distribution mechanism is confirmed in principle (T0-10) but the operational mitigation still needs setting up in Phase 0.

**Mitigation:** Apple Developer Program enrollment (unaffected by the migration — still required for App Store/TestFlight regardless of client framework) + **EAS Build/Submit** (`ARCHITECTURE_DECISIONS.md` ADR-019), which removes the local-macOS dependency the original Xcode-based plan required — a direct, substantial de-risking of this exact item, not just a technology swap. The underlying 90-day TestFlight build-expiry cycle is an Apple policy, unaffected by the migration, and still needs a recurring reminder or automated re-build/re-submit process (`IMPLEMENTATION_PLAN.md` macro-stage 26.6).

---

## R-08 — Cold-start conflicts with "no generic lessons" principle
**Likelihood:** High · **Impact:** Low-Medium

Principle 3 is literally impossible on day one with zero memory.

**Mitigation:** Dedicated onboarding/assessment flow (T0-09/T1-05) generates the first slice of personalized memory rather than teaching from a generic script.

---

## R-09 — Sensitive personal/professional data in transcripts
**Likelihood:** Medium · **Impact:** Medium

HR-scenario role-plays and real professional goals may reference sensitive workplace situations, across third-party APIs, Supabase, and (previously) the local cache.

**Mitigation:** API-tier data-usage policy verification, Supabase encryption + RLS, `expo-secure-store` + device-level data protection (iOS/Android — the React Native equivalents of the original Keychain + Data Protection plan, per the 2026-08-07 client platform migration). The review adds **app-level Face ID/Touch ID lock** (ADR-011, now via `expo-local-authentication`) as a further layer on iOS/Android, and confirms the local cache never holds raw transcripts (ADR-008 removes them from the sync payload entirely, not just from the local `expo-sqlite` model — they never leave Supabase Storage except on explicit on-demand read). On web, session storage is weaker by construction (no OS-level secure storage in a browser, `ARCHITECTURE_DECISIONS.md` ADR-024) — an accepted asymmetry under the companion-surface framing, not an oversight.

---

## R-10 — Existing repository domain mismatch
**Likelihood:** N/A (already occurred) · **Impact:** Low (caught and resolved)

**Status: Resolved.** The Expo/React Native fitness app is a separate, unrelated project (ADR-001/ADR-017). Note (2026-08-07): the client platform D1 originally chose (native Swift) has since itself been superseded by a *second*, unrelated React Native adoption (ADR-019) — this does not reopen R-10 or weaken its resolution; `ARCHITECTURE_DECISIONS.md`'s ADR-019–024 addendum states explicitly why "React Native is back" is not "the old project is back."

---

## R-11 — Local/remote sync integrity
**Likelihood:** Medium → **Low** (after review) · **Impact:** Medium

Offline-first local writes plus a remote source of truth risks silent conflict resolution, which would violate Principle 1 in a subtle way.

**Mitigation — strengthened by the 2026-08-06 review:**
- Append-only semantics for log-style tables eliminate most conflicts by construction.
- Server-timestamp-wins for mutable aggregates, paired with a non-blocking UI notice.
- **New:** idempotent upserts (ADR-007) close a gap the original design left open — a retried sync after an interruption could previously have created duplicate rows.
- **New:** `streaks` is now derived from `sessions`, not an independently synced field (ADR-007) — removes an entire conflict category rather than resolving it after the fact.
- **New:** per-device sync cursor (`device_sync_state`) prepares for a second device without redesigning the sync model later.

---

## R-12 — Strict-mode rigor from day one is a deliberate narrowing, not an oversight
**Likelihood:** Low · **Impact:** Low

*(Superseded content, 2026-08-07 client platform migration, ADR-019 — kept as R-12 per this document's no-renumbering rule.)* The original risk named targeting iOS 18+ only and adopting Swift 6 strict concurrency from day one as a deliberate compatibility narrowing. That specific technology no longer applies. **The identical reasoning now applies to TypeScript strict mode** (`ARCHITECTURE.md` §1): adopted fully from the first commit, not gradually, for the same underlying trade-off.

**Mitigation:** Accepted trade-off — single-user personal app, Julia controls her own devices. Paying the strict-mode rigor cost once, early, is cheaper than retrofitting it after voice/sync/background-job complexity lands — true regardless of which language expresses it.

---

## R-13 — Hot-table bloat from inline transcript storage (identified in the 2026-08-06 review)
**Likelihood:** High (if unaddressed) → **Resolved** · **Impact:** Medium

The original schema stored full transcripts inline on `sessions`, the table queried on every scheduler run and every progress view — a slow-building performance regression that would only become visible years into daily use, exactly the failure mode this project can least afford to discover late.

**Mitigation:** Transcripts moved to Supabase Storage, referenced by path (ADR-008). `sessions` stays lean regardless of transcript volume. **Status: Resolved by design**, pending Phase 1 implementation.

---

## R-14 — Multi-device readiness gap (identified in the 2026-08-06 review)
**Likelihood:** Medium · **Impact:** Medium

The original sync design implicitly assumed a single device; a future iPad or replacement iPhone had no defined cursor/ownership model.

**Mitigation:** `device_sync_state` table + local `SyncState` watermark (`ARCHITECTURE.md` §4) introduced now, before a second device exists, specifically so onboarding a second device later is additive rather than a sync redesign. **Status: Mitigated by design**, low urgency until a second device is actually in use.

---

## Review cadence

Re-read this document at the start of each Phase in `ROADMAP.md`, and after every future architecture review. Add new risks as they're identified during implementation rather than only at project start.
