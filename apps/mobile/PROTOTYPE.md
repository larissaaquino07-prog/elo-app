# PROTOTYPE.md

**This code is a throwaway visual/interaction spike, not real progress against `IMPLEMENTATION_PLAN.md`.**

## Why this exists

Requested 2026-08-10, after Julia asked for a preview of the app to react to and got (correctly) a blank placeholder screen — task 1.4 of macro-stage 1 hadn't even closed yet. Rather than wait until macro-stages 5–19 build the real data/AI/UI layers in dependency order (`IMPLEMENTATION_PLAN.md` §3), this "fatia vertical fina" (thin vertical slice) was pulled forward specifically so Julia can react to the **visual direction and interaction feel** of the Coach chat screen early — chosen over the alternatives (a static mockup, or waiting for the real sequence) explicitly by her.

## What is real here

- `src/theme/tokens.ts` — color/typography/spacing values transcribed directly from `DESIGN_SYSTEM.md` §2–4. These values are the approved source of truth and are expected to survive into the real implementation unchanged.
- The screen shape (four tabs: Coach/Progress/Memory/Profile) matches `DESIGN_SYSTEM.md` §5.4 exactly.

## What is fake here

- **No AI.** `src/app/(tabs)/index.tsx`'s coach replies are three hardcoded strings (`CANNED_COACH_REPLIES`), picked in rotation, after a fixed `setTimeout` delay standing in for a real Claude API round trip. No Anthropic or OpenAI call exists anywhere in this repository. Written to roughly match `PROMPT_ENGINE.md` §1–2's tone so the *feel* is representative — the actual reasoning behind them is nothing.
- **No memory, no persistence.** Messages live in a `useState` array and vanish on reload. No `expo-sqlite`, no Supabase, no sync.
- **No real voice.** The mic control cycles `idle → listening → thinking → speaking` on tap alone, per `DESIGN_SYSTEM.md` §5.3's state list — there is no `react-native-webrtc`, no `@react-native-voice/voice`, no actual audio capture.
- **Progress/Memory/Profile tabs are empty placeholders**, not implementations.
- No `@coach/domain`/`@coach/data` architecture (`ARCHITECTURE_DECISIONS.md` ADR-021) — this is plain component state, deliberately, since the monorepo packages don't exist yet (macro-stage 3).

## What happens to this code

Discard or substantially rebuild once the real sequence reaches these screens (`IMPLEMENTATION_PLAN.md` macro-stages 13–19, after 5–12 build real data access and AI engines underneath). The token file (`src/theme/tokens.ts`) is the one piece likely to survive as-is. Nothing here should be read as macro-stage 1–4 completion, and nothing here changes the sequencing or status already recorded in `IMPLEMENTATION_PLAN.md`.
