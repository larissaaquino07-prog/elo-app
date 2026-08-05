# RISKS.md

Technical risks and mitigation strategies. Reviewed and updated as the project progresses — not a one-time document. Risk IDs are stable across revisions; do not renumber when closing a risk, mark it Resolved instead.

Likelihood/Impact scale: Low / Medium / High.

---

## R-01 — Voice architecture is unproven for this use case
**Likelihood:** Medium · **Impact:** High

Decision D2 (Claude + OpenAI Realtime hybrid) is a reasonable default but untested for this exact pattern (Claude-owned memory feeding context into a separately-owned Realtime session). Latency, cost, or context-injection quality may not meet the "feels premium" bar (Principle 6).

**Mitigation:** Voice is sequenced last (`ROADMAP.md` Phase 4), after text-based memory/adaptivity is proven, so a voice pivot doesn't require rebuilding the whole system. Text-mode fallback (T4-05) ensures a voice failure never blocks a study session.

---

## R-02 — Memory system complexity grows unbounded over years
**Likelihood:** High · **Impact:** Medium

"Remember everything" for years means the structured + semantic memory will keep growing. Unmanaged, this risks slow queries, bloated context windows, and rising per-session cost.

**Mitigation:** Two-tier design (`ARCHITECTURE.md` §3.2) keeps live context bounded — sessions use summaries + top-k semantic matches, not full history. Raw transcripts retained separately (T6-03 defines archival policy) so "never forget" doesn't mean "always load everything."

---

## R-03 — Data loss is unacceptable but not yet mitigated by backup strategy
**Likelihood:** Low · **Impact:** Critical

Principle 1 makes memory loss the single worst possible failure mode for this product — worse than any UX bug. No explicit backup/disaster-recovery plan exists yet beyond "Supabase is managed."

**Mitigation:** Adopt Supabase's automated backups (point-in-time recovery on paid tier) as a Phase 1 requirement, not an afterthought; add a periodic export job (structured data → versioned JSON/SQL dump) independent of the primary provider, so memory survives even a full Supabase account loss. **Action:** add explicit backup-verification task before Phase 1 exit (currently missing from `TASKS.md` — add as T1-09 in next revision once backup approach is chosen).

---

## R-04 — Single point of failure: one user, one maintainer, AI-assisted development
**Likelihood:** Medium · **Impact:** High

There is no team. If Julia stops maintaining it (time, motivation, life changes), or the Claude Code-assisted workflow becomes unavailable, the product has no continuity plan, directly conflicting with "years" longevity goal.

**Mitigation:** Keep documentation (this doc set) current as the primary continuity mechanism — a future maintainer (including a future Claude Code session with no memory of this one) must be able to resume from `PROJECT.md`/`ARCHITECTURE.md` alone. Avoid exotic/undocumented tooling choices that only make sense with tribal knowledge.

---

## R-05 — Vendor/model deprecation over a multi-year lifespan
**Likelihood:** High · **Impact:** Medium

Anthropic, OpenAI, and Supabase will all ship breaking changes and deprecate model versions over a multi-year period. A model swap that isn't handled carefully could alter the coach's "personality" or degrade memory-extraction quality/format.

**Mitigation:** T6-02 (model migration playbook). Keep memory extraction output in a stable, versioned internal schema (`ARCHITECTURE.md` §5) decoupled from any specific model's raw output format, so swapping the underlying LLM doesn't require a data migration.

---

## R-06 — Cost growth is unmonitored under a "no budget ceiling" posture
**Likelihood:** Medium · **Impact:** Medium

Decision D4 explicitly deprioritizes cost for experience quality. Over years of daily voice + text usage, this could become materially expensive without anyone noticing until a bill is a surprise.

**Mitigation:** T6-01 (usage/cost dashboard) is scheduled early enough (tracked from Phase 1 via token logging in `ARCHITECTURE.md` §7) to catch cost trends before they become a shock, even though optimization itself isn't prioritized.

---

## R-07 — iOS distribution for years-long personal use is unresolved
**Likelihood:** High (if unaddressed) · **Impact:** High

The brief specifies iOS, personal use, multi-year lifespan, but says nothing about distribution. Free Xcode-only provisioning profiles expire in 7 days — unworkable for continuous daily use. Apple Developer Program (TestFlight) requires an active $99/year enrollment and builds expire after 90 days, requiring periodic re-upload even without code changes.

**Mitigation:** Decide distribution mechanism explicitly in Phase 0 (T0-10). Recommended default: Apple Developer Program + TestFlight, with a recurring reminder (calendar or automated check) to re-build/re-upload before the 90-day expiry, since this is an easy failure mode to overlook silently — the app simply stops opening one day with no code-level warning.

---

## R-08 — Cold-start conflicts with "no generic lessons" principle
**Likelihood:** High · **Impact:** Low-Medium

Principle 3 ("everything generated specifically for me") is literally impossible on day one with zero memory. If not designed for deliberately, the first sessions will either be generic (violating the principle) or the app will feel broken/empty.

**Mitigation:** T0-06/T1-03 — a dedicated onboarding/assessment flow is treated as its own designed experience (a calibration conversation), not a gap papered over with placeholder generic content. Its explicit purpose is to *generate* the first slice of personalized memory, not to teach yet.

---

## R-09 — Sensitive personal/professional data in transcripts
**Likelihood:** Medium · **Impact:** Medium

HR-scenario role-plays and real professional goals may reference sensitive workplace situations. This data sits with third-party LLM providers (API calls) and in Supabase.

**Mitigation:** Confirm Anthropic/OpenAI API-tier data usage policies (not consumer-tier) explicitly exclude API data from model training (current default behavior for both providers' commercial APIs, but must be verified at implementation time, not assumed indefinitely). Encrypt at rest (Supabase default) and scope access via Row Level Security even for a single user (`ARCHITECTURE.md` §6).

---

## R-10 — Existing repository domain mismatch
**Likelihood:** N/A (already occurred) · **Impact:** Low (caught early)

The `elo-app` repository contained a complete, unrelated fitness-social app when this documentation pass began. If this had gone unnoticed, Phase 1 work risked building on top of, or being confused with, fitness-domain code/data models.

**Mitigation:** Resolved by decision D1 — documented explicitly in `PROJECT.md` §8 and actioned as T0-01/T0-09 (confirm reuse, then strip fitness-domain code) before any feature work begins. **Status: Mitigated, pending Julia's confirmation of D1.**

---

## Review cadence

Re-read this document at the start of each Phase in `ROADMAP.md`. Add new risks as they're identified during implementation rather than only at project start — a risk log that stops updating after week one is not doing its job.
