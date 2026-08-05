# RISKS.md

Technical risks and mitigation strategies. Reviewed and updated as the project progresses — not a one-time document. Risk IDs are stable across revisions; do not renumber when closing a risk, mark it Resolved instead.

Likelihood/Impact scale: Low / Medium / High.

---

## R-01 — Voice architecture is unproven for this use case
**Likelihood:** Medium · **Impact:** High

The hybrid (Claude for reasoning/memory, OpenAI Realtime API for voice) is a reasonable default but untested for this exact pattern (backend-owned memory feeding context into a separately-owned Realtime session). Latency, cost, or context-injection quality may not meet the "feels premium" bar (Principle 6).

**Mitigation:** Voice is sequenced last (`ROADMAP.md` Phase 4), after text-based memory/adaptivity is proven. Going native (D1) adds a genuine mitigation not available in the original plan: a **Speech framework + `AVSpeechSynthesizer` fallback path** (T4-03) means a Realtime failure degrades to a native, offline-capable voice loop instead of blocking the session outright — reducing impact from "session blocked" to "reduced feature richness for that session."

---

## R-02 — Memory system complexity grows unbounded over years
**Likelihood:** High · **Impact:** Medium

"Remember everything" for years means the structured + semantic memory will keep growing. Unmanaged, this risks slow queries, bloated context windows, and rising per-session cost.

**Mitigation:** Two-tier design (`ARCHITECTURE.md` §5.2) keeps live context bounded — sessions use summaries + top-k semantic matches, not full history. Raw transcripts retained separately (T6-03 defines archival policy) so "never forget" doesn't mean "always load everything." The SwiftData local cache intentionally excludes raw transcripts and embeddings by default (`ARCHITECTURE.md` §9.2), keeping the on-device store small regardless of server-side growth.

---

## R-03 — Data loss is unacceptable but requires an explicit backup strategy
**Likelihood:** Low · **Impact:** Critical

Principle 1 makes memory loss the single worst possible failure mode for this product. Now with two persistence layers (Supabase + SwiftData), there are two distinct loss scenarios to cover, not one:

1. Server-side loss (Supabase account/data issue) — the original risk.
2. **New nuance from D3**: a local write made offline and not yet synced (`syncStatus: pendingUpload`) is lost if the device is lost, stolen, or reset before the next successful sync. Because Supabase is the sole source of truth, this is a real, if narrow, window of exposure specific to the offline-first design.

**Mitigation:** Adopt Supabase's automated backups (point-in-time recovery) as a Phase 1 requirement. Add a periodic export job (structured data → versioned JSON/SQL dump) independent of the primary provider. For the local-pending-write window: sync eagerly (on every app foreground and app backgrounding, not just periodically) and surface a visible "syncing…" / "N changes waiting to sync" indicator in the UI so an unsynced state is never invisible to Julia. **Action:** add an explicit backup-verification task once the backup approach is chosen (tracked as a Phase 1 follow-up, not yet a numbered task in `TASKS.md`).

---

## R-04 — Single point of failure: one user, one maintainer, AI-assisted development
**Likelihood:** Medium · **Impact:** High

There is no team. If Julia stops maintaining it, or the Claude Code-assisted workflow becomes unavailable, the product has no continuity plan, directly conflicting with the "years" longevity goal.

**Mitigation:** Keep documentation (this doc set) current as the primary continuity mechanism — a future maintainer (including a future Claude Code session with no memory of this one) must be able to resume from `PROJECT.md`/`ARCHITECTURE.md` alone. Sticking to mainstream, well-documented Apple frameworks (SwiftUI, SwiftData, Speech, AVFoundation) rather than exotic tooling directly supports this — it's technology any future iOS developer (human or AI) already knows.

---

## R-05 — Vendor/model deprecation over a multi-year lifespan
**Likelihood:** High · **Impact:** Medium

Anthropic, OpenAI, and Supabase will all ship breaking changes and deprecate model versions over a multi-year period.

**Mitigation:** This risk is now structurally mitigated, not just process-mitigated: the `ConversationEngine` / `VoiceEngine` / `MemoryExtractionEngine` Domain-layer protocols (`ARCHITECTURE.md` §2) mean a provider swap is a new Data-layer adapter, not a rewrite. T6-02 (migration playbook) still governs the operational side (when/how to cut over), but the architecture itself was chosen specifically to make D2's "must stay swappable" requirement real.

---

## R-06 — Cost growth under a moderate-but-efficiency-conscious budget
**Likelihood:** Medium · **Impact:** Medium

D4 sets a moderate budget explicitly conditioned on avoiding unnecessary API calls — this is now a stated requirement, not just a nice-to-have, so failing to control cost is a more direct failure against Julia's actual constraint than in the original "no ceiling" draft.

**Mitigation:** T6-01 (usage/cost dashboard) tracks spend from Phase 1. Concrete cost-control levers built into the architecture itself: prompt caching for the recurring memory-snapshot context sent to Claude; the native Speech/AVSpeechSynthesizer fallback (§R-01) doubles as a cost lever for lower-stakes or offline interactions since it incurs no API cost; the Domain-layer provider abstraction (§R-05) also means a cheaper provider can be adopted later without a rewrite if pricing changes.

---

## R-07 — iOS distribution for years-long personal use is unresolved
**Likelihood:** High (if unaddressed) · **Impact:** High

The brief specifies iOS, personal use, multi-year lifespan, but distribution mechanism is still unconfirmed (T0-10). This is unaffected by the native pivot — if anything it's now more central, since there's no web fallback of any kind. Free Xcode-only provisioning profiles expire in 7 days — unworkable for continuous daily use. Apple Developer Program (TestFlight) requires an active $99/year enrollment and builds expire after 90 days, requiring periodic re-upload even without code changes.

**Mitigation:** Decide distribution mechanism explicitly in Phase 0 (T0-10). Recommended default: Apple Developer Program + TestFlight, with a recurring reminder (calendar or automated check) to re-build/re-upload before the 90-day expiry — an easy failure mode to overlook silently, since the app simply stops opening one day with no code-level warning.

---

## R-08 — Cold-start conflicts with "no generic lessons" principle
**Likelihood:** High · **Impact:** Low-Medium

Principle 3 ("everything generated specifically for me") is literally impossible on day one with zero memory.

**Mitigation:** T0-09/T1-05 — a dedicated onboarding/assessment flow is treated as its own designed experience (a calibration conversation), not a gap papered over with placeholder generic content. Its explicit purpose is to *generate* the first slice of personalized memory, not to teach yet.

---

## R-09 — Sensitive personal/professional data in transcripts
**Likelihood:** Medium · **Impact:** Medium

HR-scenario role-plays and real professional goals may reference sensitive workplace situations. This data now sits in three places: third-party LLM providers (API calls), Supabase, and the on-device SwiftData store.

**Mitigation:** Confirm Anthropic/OpenAI API-tier data usage policies explicitly exclude API data from model training (must be verified at implementation time, not assumed indefinitely). Supabase encryption at rest + Row Level Security (`ARCHITECTURE.md` §7). iOS Keychain for session tokens, iOS Data Protection for the SwiftData store — the local copy is now an explicit part of the sensitive-data surface and must be protected to the same standard as the server, not treated as "just a cache."

---

## R-10 — Existing repository domain mismatch
**Likelihood:** N/A (already occurred) · **Impact:** Low (caught and resolved)

The `elo-app` repository originally contained a complete, unrelated fitness-social app.

**Status: Resolved.** Julia confirmed (D1) that the Expo/React Native code is a separate, unrelated project and does not constrain the new architecture at all. The new native project replaces it entirely from Phase 0 (T0-01) rather than incrementally converting it — no ambiguity remains about what is "real" for this project.

---

## R-11 — Local/remote sync integrity (new: introduced by the SwiftData + Supabase dual-persistence design)
**Likelihood:** Medium · **Impact:** Medium

Offline-first local writes plus a remote source of truth is a well-understood but genuinely tricky pattern — silent conflict resolution (a local change quietly overwritten or discarded) would violate Principle 1 ("nothing important should ever be forgotten") in a subtle, hard-to-notice way.

**Mitigation:** Explicit, documented conflict rules rather than "sync automatically" left vague (`ARCHITECTURE.md` §4): append-only semantics for log-style tables eliminate most conflicts by construction; server-timestamp-wins for mutable aggregates is paired with a **non-blocking UI notice** whenever a local pending value is superseded, so a resolution is never invisible. `updated_at` added to every syncable table specifically to make this rule enforceable (`ARCHITECTURE.md` §9.1).

---

## R-12 — iOS 18+ / Swift 6 strict concurrency is a deliberate narrowing, not an oversight
**Likelihood:** Low · **Impact:** Low

Targeting iOS 18+ only and adopting Swift 6's strict concurrency checking from day one narrows device/OS compatibility more than a typical consumer app would accept, and adds upfront engineering rigor (data-race safety) that has a real learning/implementation cost.

**Mitigation:** Accepted as an intentional trade-off, not a risk to reduce: this is a single-user personal app where Julia controls her own device and can always run the latest iOS. Paying the Swift 6 concurrency cost once, early, is cheaper than retrofitting it after Phase 3–4 complexity (voice, sync, background jobs — all concurrency-heavy) is in place. Revisit only if this ever needs to support a device Julia doesn't control (not currently a requirement).

---

## Review cadence

Re-read this document at the start of each Phase in `ROADMAP.md`. Add new risks as they're identified during implementation rather than only at project start — a risk log that stops updating after week one is not doing its job.
