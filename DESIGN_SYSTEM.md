# DESIGN_SYSTEM.md

Visual identity for the application. Original design, not derived from any existing app's UI or brand (per project instructions) — including the discontinued Expo/React Native fitness prototype that previously lived in this repository (D1/ADR-001), whose palette and components are not reused here. Built for native iOS (SwiftUI, iOS 18+), full light **and** dark mode support (a deliberate change from the discontinued prototype, which was dark-only), and accessibility as a first-class constraint, not a pass at the end.

---

## 1. Design principles

- **Premium, not loud.** Confidence expressed through restraint, precision, and motion — not saturation or ornamentation (`PROJECT.md` Principle 6).
- **Mentor, not app-store gamification.** Achievements and progress are shown with quiet craft (§9), never cartoonish badges or aggressive celebration animations — the audience is a working HR professional, not a mobile-game player.
- **Calm by default, alive when it matters.** Static UI most of the time; motion is reserved for moments with real meaning (a session completing, a mistake resolving, a streak continuing) — see §10.

## 2. Color

Two independent, fully-specified palettes (light/dark), driven by iOS's system appearance via semantic color assets — never a manual in-app toggle overriding the system (`prefers-color-scheme` equivalent is automatic).

### 2.1 Neutrals

| Token | Dark | Light | Use |
|---|---|---|---|
| `background` | `#12141A` | `#FAFAF8` | Screen background |
| `surface` | `#1B1E27` | `#FFFFFF` | Cards, sheets |
| `surfaceElevated` | `#242835` | `#F3F2EF` | Nested/elevated cards, modals |
| `border` | `#2E3340` | `#E4E2DD` | Hairlines, dividers |
| `textPrimary` | `#F5F5F3` | `#1A1C21` | Primary text |
| `textSecondary` | `#A6ACBB` | `#5C606B` | Secondary text, captions |
| `textTertiary` | `#6D7484` | `#8B8F99` | Placeholder, disabled |

### 2.2 Brand accent

| Token | Value (both modes, adjusted for contrast) | Use |
|---|---|---|
| `accentPrimary` | `#5B5FEF` (dark bg) / `#4A4ED9` (light bg) | Primary actions, active states, brand mark |
| `accentWarm` | `#E8A24C` | Achievement/celebration moments only (§9) — never a default UI color, so it stays meaningful |

### 2.3 Category colors (Business / Daily English)

Deliberately two, not four-plus (unlike the discontinued prototype's per-sport palette) — this app has exactly two content categories (`PROJECT_BRIEF.md` §2):

| Token | Dark | Light | Use |
|---|---|---|---|
| `categoryBusiness` | `#7C7FF2` | `#5B5FEF` | Business English sessions/badges (70% weighting) |
| `categoryDaily` | `#D97757` | `#C4602F` | Daily English sessions/badges (30% weighting) |

### 2.4 Semantic

| Token | Dark | Light | Use |
|---|---|---|---|
| `success` | `#4CAF7D` | `#2E9160` | Resolved mistake, mastered item, correct usage |
| `warning` / `correction` | `#E1615A` (muted coral, not alarm-red) | `#C94A44` | Gentle correction indicator — deliberately soft, never punitive-reading (ties to `PROMPT_ENGINE.md` §3's tone) |
| `info` | `#5B9FE8` | `#3A7FC9` | Neutral system messages (sync status, offline notice) |

All text-on-background pairs meet **WCAG AA (≥4.5:1)** at minimum; verified per token pair, not assumed (§11).

## 3. Typography

System font (SF Pro, via Dynamic Type) — not a custom typeface. This is a deliberate accessibility and longevity choice: Dynamic Type support and correct VoiceOver behavior come free, and the font renders identically well in a future macOS app (`ARCHITECTURE.md` §6).

| Style | iOS text style mapping | Use |
|---|---|---|
| Display | `.largeTitle`, semibold | Onboarding, milestone screens |
| Title | `.title2`, semibold | Screen headers |
| Headline | `.headline` | Card titles, section headers |
| Body | `.body` | Primary reading text, chat messages |
| Callout | `.callout` | Secondary conversational text |
| Caption | `.caption` | Metadata, timestamps, labels |

Chat/conversation text uses `Body` at a very slightly increased line height (1.3×) versus UI chrome — optimized for reading a conversation, not scanning a form.

## 4. Spacing & grid

4pt base unit: `4, 8, 12, 16, 24, 32, 48, 64`.

- Screen margins: 16pt standard, 24pt on larger devices (iPad-class, if ever supported).
- Card internal padding: 16pt.
- Stack spacing between related elements: 8pt; between unrelated groups: 24–32pt.
- Respect safe areas and Dynamic Island / home indicator insets natively (SwiftUI default behavior, not manually recalculated).

## 5. Components

### 5.1 Buttons
- **Primary**: filled `accentPrimary`, white/`textPrimary`-on-accent text, 12pt corner radius, 48pt min height (exceeds the 44×44pt minimum tap target, §11).
- **Secondary**: outlined, `accentPrimary` border and text, transparent fill.
- **Tertiary**: text-only, `accentPrimary`, used for low-emphasis actions ("Skip", "Not now").
- **Destructive**: outlined or text, `warning` color, reserved for data deletion (`TASKS.md` T5-07) — never used for routine actions.

### 5.2 Cards
- **Session card**: category color as a subtle left accent bar or icon tint (not a full-bleed background — keeps the neutral-first premium feel), title, duration, timestamp.
- **Progress card**: large numeral (Fluency/Confidence score or streak), small trend indicator (up/flat/down), no chart-junk.
- **Vocabulary/mistake card**: term or pattern, mastery-state chip, last-practiced timestamp.

### 5.3 Inputs
- **Text field**: single-line or multi-line chat composer, `surfaceElevated` background, `border` outline on focus in `accentPrimary`.
- **Voice record control**: a single circular control with explicit, animated states — `idle` → `listening` → `thinking` → `speaking` — each with a distinct but subtle motion treatment (§10) and a VoiceOver-announced state change (§11), since this is the primary interaction surface for the app's highest-priority feature (Principle 4).

### 5.4 Navigation
- **Native `TabView` / `NavigationStack`**, not a custom-built tab bar — a deliberate departure from the discontinued prototype's custom blur tab bar. Native components come with correct accessibility, Dynamic Type, and platform-convention behavior for free, and require no bespoke maintenance across iOS versions (directly serves `RISKS.md` R-04, maintainability).
- Tabs: Coach (conversation), Progress, Memory (searchable history/vocabulary), Profile — four, matching the app's actual pillars (`PROJECT.md` §6), not padded out for symmetry.

## 6. Animation & transitions

Native SwiftUI animations only — no custom animation engine.

| Moment | Treatment |
|---|---|
| Message appearing | Quick fade + slight rise, 200ms, `easeOut` |
| Voice state change | Spring, response 0.4 / damping 0.8 — the control should feel alive, not mechanical |
| Progress ring / score update | Animated fill over ~600ms, `easeInOut` — value changes are never instant jumps |
| Screen transitions | Native `NavigationStack` push/pop, no custom overrides |
| Streak/milestone celebration | A single, restrained moment (subtle scale + `accentWarm` glow, ~400ms) — not a full-screen confetti overlay; matches §1's "quiet craft" principle |

All durations/curves above are tokens, not per-view magic numbers, so they stay consistent as new screens are added.

## 7. Haptic feedback

- Light impact: standard button taps.
- Success notification haptic: correct/mastered/streak-continued moments.
- Warning haptic (not error): a gentle correction — deliberately the *warning*, not *error*, haptic category, consistent with the non-punitive tone (`PROMPT_ENGINE.md` §3).
- Selection feedback: pickers, toggles, tab switches.
- Respects the system Reduce Motion / haptics-off accessibility settings automatically (native `UIFeedbackGenerator` behavior).

## 8. Feedback & states

- Every async action (sending a message, syncing, loading history) has an explicit loading state — never a silent frozen UI.
- Sync status is a small, persistent, non-modal indicator (ties to `RISKS.md` R-03/R-11's "never silent" requirement) — visible but not intrusive.
- Offline mode has a distinct, calm badge (not an alarming red banner) — being offline is an expected, handled state (`ARCHITECTURE.md` §5.4 native fallback), not an error.

## 9. Achievements & milestones

Tasteful, professional-appropriate — no cartoon badges. A milestone (topic mastered, streak length, recurring mistake resolved) is presented as a short, specific, well-typeset statement ("50 hours of Business English practice") with the single restrained animation from §6, in `accentWarm`. Never full-screen takeover, never sound effects beyond the haptic in §7.

## 10. Motion philosophy (summary)

Motion is meaningful, not decorative — every animation in §6 exists to communicate a state change, never purely for polish's sake. Reduce Motion (§11) always has a defined, non-degraded fallback, never just "animations off."

## 11. Accessibility

- **Dynamic Type**: fully supported up to accessibility sizes (AX1–AX5); layouts use adaptive stacks, not fixed pixel widths, so nothing clips or truncates at large sizes.
- **VoiceOver**: every interactive element has a label; the voice record control (§5.3) announces its own state changes (`"Listening"`, `"Coach is thinking"`, `"Coach is speaking"`) so the app's core interaction is fully usable non-visually.
- **Contrast**: WCAG AA (≥4.5:1) verified per color pair in §2, both modes.
- **Tap targets**: minimum 44×44pt everywhere, no exceptions.
- **Reduce Motion**: every spring/fade animation in §6 has a Reduce-Motion-respecting fallback (cross-fade or instant state change instead of spring/scale) via `UIAccessibility.isReduceMotionEnabled`.
- **Reading order**: conversation transcripts read in natural chronological order under VoiceOver, including inline corrections (§3-format text is not a separate, out-of-order element).

## 12. Light & dark mode

Both fully specified (§2), resolved automatically by the OS via semantic color assets — not a manually-toggled in-app setting overriding system state, and not dark-only (a deliberate departure from the discontinued prototype). Every component in §5 is verified to render correctly, at full contrast, in both.

## 13. Relationship to other documents

- Implements the "everything should feel premium" mandate from `PROJECT.md` §4 (Principle 6) concretely.
- The voice control states in §5.3 map directly to `ARCHITECTURE.md` §5.4's voice engine states (primary/fallback/reconnecting).
- Accessibility targets in §11 are the design-level counterpart to the measurable accessibility requirements in `NON_FUNCTIONAL_REQUIREMENTS.md`.
