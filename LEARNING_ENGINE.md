# LEARNING_ENGINE.md

Defines the pedagogical logic of the application: methodology, spaced repetition, difficulty, level progression, weak-point detection, review, goals, and the fluency/confidence metrics. This is the **canonical source** for every formula referenced elsewhere — `ARCHITECTURE.md`'s `priority(topic)` scheduler and `PROMPT_ENGINE.md`'s generation rules both consume the algorithms defined here rather than redefining them.

---

## 1. Teaching methodology

Communicative, task-based approach, directly implementing `PROJECT_BRIEF.md`'s stated learning style:
- **Speaking first**: every topic is practiced through conversation/role-play before (or instead of) isolated grammar explanation.
- **Grammar through usage**: explicit grammar explanation is reactive (triggered by a real mistake, `PROMPT_ENGINE.md` §3), never a standalone lesson unless Julia asks for one directly.
- **Real-life simulation**: exercises are scenario-embedded (`PROMPT_ENGINE.md` §5–6), never flashcard-style in isolation.
- **Constant feedback, adaptive difficulty**: every session's difficulty and focus are computed fresh (§3), never a fixed curriculum path.

## 2. Spaced repetition algorithm

Applies to `vocabulary_items` and `mistakes` (both defined in `ARCHITECTURE.md` §9.1). A simplified SM-2-inspired model — proven, well-understood, and cheap to compute; a heavier ML-based scheduler is not justified for a single-user app (Principle 5).

Each item tracks: `easeFactor` (default 2.5, minimum 1.3), `intervalDays`, `repetitions`, `nextReviewDate`.

On every exposure (the item comes up in conversation and Julia uses/responds to it), a **quality score q (0–5)** is derived from observed performance:

| q | Meaning |
|---|---|
| 5 | Used correctly and spontaneously, no hesitation |
| 4 | Used correctly, slight hesitation |
| 3 | Used correctly only after a hint/scaffold |
| 2 | Attempted, incorrect, self-corrected |
| 1 | Attempted, incorrect, needed the coach's correction |
| 0 | Not recognized/used at all when the moment called for it |

Update rule (standard SM-2 formula, applied per item):

```
if q < 3:
    repetitions = 0
    intervalDays = 1
else:
    repetitions += 1
    if repetitions == 1: intervalDays = 1
    elif repetitions == 2: intervalDays = 6
    else: intervalDays = round(intervalDays * easeFactor)

easeFactor = max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
nextReviewDate = today + intervalDays
```

Items with `nextReviewDate <= today` are eligible for inclusion in the next session's focus (`PROMPT_ENGINE.md` §7.3/§5). This is intentionally the same, well-tested formula shape used by mainstream spaced-repetition tools — no need to reinvent it for this project.

## 3. Difficulty calculation

Feeds `ARCHITECTURE.md`'s `priority(topic)` scheduler; the terms it uses are defined precisely here:

- **`recency_decay(last_seen)`**: exponential decay, halving relevance roughly every 14 days since last exposure — a topic untouched for a month carries meaningfully more weight than one touched last week.
- **`error_frequency(topic)`**: count of unresolved `mistakes` tagged to the topic, normalized against total exposures to that topic (a topic with 3 mistakes out of 5 exposures scores higher than 3 out of 30).
- **`mastery_level(topic)`**: derived from the `topics.status` state machine (§4) plus the SM-2 `easeFactor`/`repetitions` of its associated vocabulary/mistakes — higher ease and repetitions push mastery up.
- **Session-level difficulty** (distinct from per-topic priority): a 0–1 scale set at session start from current CEFR estimate (§4) and the rolling **Fluency Score** (§8) trend — a dip in recent fluency nudges difficulty down slightly rather than compounding frustration; a sustained rise nudges it up.

## 4. Level progression (CEFR)

`users.cefr_level` is an **estimate that evolves**, not a fixed onboarding answer. State machine: `A1 → A2 → B1 → B2 → C1 → C2`.

**Promotion criteria** (all must hold, evaluated weekly, not per-session — avoids single-good-day noise):
- Mastery ≥ 80% across topics actively practiced at the current level over the last 4 weeks.
- Recent error rate (last 2 weeks) below the level's threshold band.
- No open "critical" mistakes (repeated, unresolved, high-occurrence) at the current level.

Promotion itself happens through a **checkpoint conversation** — a normal-feeling session the coach subtly uses to confirm the jump, not a formal test screen (keeps with "no random exercises," Principle 3, and "should not feel like a school," `PROJECT.md` §5).

**Demotion is soft, not formal**: if a broad struggle is detected (falling fluency/confidence trend, §8/§9, across multiple topics), the coach temporarily lowers its own delivered complexity (`PROMPT_ENGINE.md` §4) without changing the stored `cefr_level` — protects motivation; the stored level only moves down in a rare, sustained case, reviewed manually rather than fully automated.

## 5. Automatic weak-point detection

- A `mistake` is flagged **recurring** at `occurrences >= 3` within a rolling 30-day window.
- **Macro-topic clustering**: mistakes are tagged by `type` (grammar/pronunciation/vocabulary/fluency) and, where possible, a finer sub-tag (e.g., "verb tense," "preposition," "th-sound"). When 3+ distinct mistake rows share a sub-tag, that sub-tag becomes a first-class weak point even without a corresponding row in `topics` — this catches cross-cutting issues a fixed topic list would miss.
- Weak points feed directly into the scheduler's `error_frequency` term (§3) and into `PROMPT_ENGINE.md`'s exercise generation self-check (§5).

## 6. Intelligent review

- Due-for-review items (§2) are not presented as drills; they're passed to the scenario/conversation generator (`PROMPT_ENGINE.md` §5–6) as constraints — "this session's scenario should naturally create an opening to use word X" — so review is invisible as review.
- Review load per session is capped (aligned with `PROMPT_ENGINE.md` §8's context caps: top-20 vocabulary, top-15 mistakes) — reviewing everything due at once would overwhelm a single session; the scheduler prioritizes by SM-2 overdue-ness (days past `nextReviewDate`) when the due list exceeds the cap.

## 7. Daily & weekly goals

- **Daily**: one completed session (text or voice) counts toward the streak; no minimum duration enforced (a 5-minute session still counts — respects "quality over quantity" and avoids punishing a busy day).
- **Weekly**: default target of 5 sessions and a Business/Daily ratio held within **65–75% business** (tolerance band around the brief's 70/30 split, §8 of `PROJECT_BRIEF.md`) — evaluated as a rolling 4-week average, not a hard per-week cutoff, since real weeks vary.
- **Streak grace**: one missed day per rolling 2-week window doesn't break the streak (`TASKS.md` T5-08) — the streak counter itself remains a *derived* value from `sessions` (`ARCHITECTURE.md` §4/ADR-007); the grace rule is part of how it's derived, not a separately stored exception.
- Goals are visible but never the coach's framing in-conversation ("you need 2 more sessions this week" is a dashboard fact, not something the coach says mid-lesson — keeps the mentor framing, not a compliance-tracker framing).

## 8. Fluency calculation

A composite **Fluency Score (0–100)**, computed after each voice session and smoothed as a rolling metric (exponential moving average, α = 0.3, so a single unusual session doesn't whipsaw the trend):

| Component | Weight | Source |
|---|---|---|
| Speaking rate (words/min, normalized against level-appropriate target) | 25% | Realtime transcript timing |
| Hesitation/filler frequency (lower is better) | 20% | Realtime transcript (filler words, long pauses) |
| Vocabulary diversity (type-token ratio within the session) | 20% | Transcript analysis |
| Error rate per 100 words | 25% | `mistakes` logged for the session |
| Response latency (time to respond in conversation) | 10% | Realtime session timing |

Each sub-metric is normalized to 0–100 against level-appropriate reference bands before weighting (a B1 target speaking rate differs from a C1 target — the score reflects "how well for this level," not an absolute native-speaker benchmark, which would be discouraging and not what "adaptive difficulty" implies).

## 9. Confidence calculation

A separate composite **Confidence Score (0–100)**, distinct from fluency (a learner can be accurate but hesitant, or fast but error-prone — these need independent tracking):

| Component | Weight | Source |
|---|---|---|
| Self-correction rate (catches own mistakes before the coach does) | 30% | Transcript + `mistakes` (self vs. coach-flagged) |
| Willingness signal (chooses voice over text, attempts harder/unprompted topics) | 25% | Session mode + topic choice history |
| Hesitation markers (distinct weighting from fluency's use of the same raw signal — here read as confidence, not speed) | 20% | Realtime transcript |
| Session consistency (adherence to weekly goal, §7) | 15% | `sessions` |
| Optional self-rating ("how did that feel?") — asked occasionally, never every session (Principle 5) | 10% | In-app prompt, explicit opt-in per instance |

Also EMA-smoothed (α = 0.3). Fluency and Confidence are reported separately in the progress dashboard — collapsing them into one number would hide real information (e.g., a rising-fluency/falling-confidence pattern is a meaningful, actionable signal on its own).

## 10. Recommendation system

Distinct from the background scheduler (`ARCHITECTURE.md` §5.3) in that this is **user-facing** — powers the "why this lesson" transparency view (`TASKS.md` T3-05) and any proactive suggestion surfaced outside an active session. Priority order:

1. **Upcoming real-world event**, if set (`ARCHITECTURE.md`'s reserved `upcoming_event_boost`, `TASKS.md` T6-06) — always takes precedence when present and imminent.
2. **Highest-priority weak topic** per the §3 scoring, if not already covered this week.
3. **Due-for-review load** if it's backing up (many items past `nextReviewDate`, §6).
4. **Plateau detection**: if mastery on all currently active topics has been ≥ 90% for 2+ consecutive weeks with no new topic introduced, recommend introducing a new topic from the underrepresented category (business/daily balance, §7) rather than continuing to over-practice already-mastered ground.
5. **Milestone celebration**: when a recurring mistake resolves or a topic reaches `mastered`, surface it explicitly — positive signal, not just silently updated in the background.

## 11. Metrics reference (canonical)

| Metric | Range | Update cadence | Defined in |
|---|---|---|---|
| Fluency Score | 0–100 | Per voice session (EMA) | §8 |
| Confidence Score | 0–100 | Per session (EMA) | §9 |
| Mastery % (per topic) | 0–100% | Per session touching the topic | §4 state machine |
| SM-2 ease factor / interval | ≥1.3 / days | Per item exposure | §2 |
| Streak (days) | integer | Derived from `sessions` | §7 |
| Weekly business/daily adherence | % | Rolling 4-week average | §7 |

Other documents should reference this table rather than restate the formulas — in particular `ARCHITECTURE.md`'s scheduler and `NON_FUNCTIONAL_REQUIREMENTS.md`'s quality targets both point here.

## 12. Relationship to other documents

- `ARCHITECTURE.md` §5.3 implements its `priority(topic)` scheduler using `recency_decay`, `error_frequency`, and `mastery_level` as defined in §3 here — that file does not redefine them.
- `PROMPT_ENGINE.md` §5–7 consumes this document's due-for-review lists (§2/§6) and adaptive focus output (§3) to decide what to generate and what to correct.
- `OBSERVABILITY.md` §9 treats the metrics in §11 as product-health indicators to monitor over time, separate from technical/infrastructure metrics.
