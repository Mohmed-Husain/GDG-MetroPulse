# UI/UX Design System: MetroPulse Stadium Surge Planner

The coder agent must follow this file. If something isn't covered, pick the option closest to the principles in §1 and note it in `ASSUMPTIONS.md`.

---

## 1. Design brief

**Subject:** a crowd-management planning tool for metro stations during large events (cricket matches, concerts, Navratri nights). An operator enters event details and gets a minute-by-minute plan: gates, holding areas, extra trains, announcements in Gujarati, Hindi and English.

**Audience:** (1) a station controller or control-room operator who needs a plan they can act on, and (2) hackathon judges, seen on a **laptop screen inside a moving train**, so legibility and robustness matter more than polish for a big projector.

**Primary job of the screen:** show *where the crowd builds up, what the plan does about it, and what improves*, then let the operator approve and hand the plan to staff.

**Personality:** calm, precise, civic. It should feel like transit wayfinding and a printed operating notice, not a startup dashboard.

**The one memorable thing:** the **Surge view**. A horizontal flow diagram of the station: Forecourt → Footbridge → Concourse → Gates → Platform, with a train arriving beside it. Each zone fills with a crowd-density colour as the time scrubber moves. Every other element stays quiet so this one carries the story.

**Avoid:** identical rounded card grids, soft grey shadows on everything, gradient washes, neon-on-black, cream-and-terracotta, tracked-out all-caps labels above every heading, monospace for every small label, arrows on every button, decorative icons with no meaning.

## 2. Colour palette

Light theme only (reads best on laptop screens in a bright train). Dark theme is out of scope.

### 2.1 Base tokens

| Token | Hex | Use |
|---|---|---|
| `--concrete` | `#EDEFF2` | App background |
| `--platform` | `#F9FAFB` | Primary surface (hero area, right rail) |
| `--shelter` | `#E1E5EA` | Secondary surface, table stripes, inactive tracks |
| `--hairline` | `#C9D0D9` | Dividers and borders (1px) |
| `--ink` | `#172033` | Primary text |
| `--ink-soft` | `#4A5568` | Secondary text (min 4.5:1 on `--platform`) |
| `--ink-faint` | `#6B7685` | Tertiary text, large text only |

### 2.2 Brand and meaning

| Token | Hex | Use |
|---|---|---|
| `--track` | `#1F4E9C` | Corridor line, primary buttons, focus rings, links |
| `--track-deep` | `#163A75` | Hover/pressed for track blue |
| `--baseline` | `#7A8594` | The **current plan** (slate): baseline series and outlines |
| `--ai-plan` | `#6A3FB5` | The **AI plan** (violet): plan series, new trains, plan tags |
| `--signal` | `#F2A900` | Attention: hold zones, event markers, "needs approval" |
| `--approved` | `#2E7D4F` | Approved, constraint check passed |
| `--rejected` | `#B3243F` | Error, constraint violated (same as Critical crowd level) |

### 2.3 Crowd level ramp (most important scale)

Used for zone fills in the Surge view, platform density, chart bands and legends.

| Level | Label | Hex | Meaning |
|---|---|---|---|
| 1 | Light | `#5BA8A0` | well under hold threshold |
| 2 | Steady | `#A8C686` | up to 80% of hold threshold |
| 3 | Busy | `#F2C14E` | approaching hold threshold |
| 4 | Crowded | `#E8743B` | above hold threshold (2.0 pax/m² on platforms) |
| 5 | Critical | `#B3243F` | above critical threshold |

**Never rely on colour alone:** every level also has a text label, and levels 4 and 5 use a diagonal hatch overlay (level 5 with a bold outline). Check the ramp in a colour-blindness simulator and adjust lightness if levels 2 and 3 merge.

### 2.4 Contrast
- Body text 4.5:1 or more; large text and key components 3:1 or more.
- Verify token pairs with a script in the build; fail the build if a pair drops below threshold.

## 3. Typography

- **Archivo** (variable, width axis): the signage voice. Semi-expanded (about 112-125 width) for screen titles and zone names in the Surge view; normal width for UI. Weights 400, 500, 600, 700.
- **Source Serif 4**: **only** for the printed plan and the announcement scripts, so they read like an official notice.
- Gujarati and Hindi: **Noto Sans Gujarati / Noto Sans Devanagari** for UI, **Noto Serif Gujarati / Noto Serif Devanagari** for announcement scripts. Gujarati script needs slightly more line-height (about 1.7).
- **Bundle every font locally (WOFF2). No CDN, no Google Fonts requests.** The app runs offline.
- Tabular figures for all changing numbers (`font-variant-numeric: tabular-nums`). If the Archivo build lacks them, switch the UI family to **Public Sans**.
- **Scale (px):** 12 / 14 / 16 / 20 / 28 / 40. Body 16 (14 for dense tables). One large number per view at most.
- Sentence case everywhere. No all-caps labels, no accent colour on a single word in a headline, no eyebrow labels unless they carry real information (for example a date).
- Prose lines under 70 characters.

## 4. Layout

**Primary target: laptop, 1440×900 and 1366×768.** Also fine at 1920×1080. Below 1100 px wide, the right rail becomes a drawer. Nothing may overflow horizontally.

### 4.1 Main screen

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ MetroPulse · Stadium Surge     Simulated data   ● Offline ready · Template mode   EN ગુ हिं │ 52px
├──────────────────────────────────────────────────────────┬────────────────────┤
│ Event inputs (one compact row)                            │ Action timeline    │
│ [Preset ▾] attendance · metro share · ends at · standby   │ Announcements      │
│ rakes · rain      [Paste event notice]   [Generate plan]  │ (tabs)             │
├──────────────────────────────────────────────────────────┤                    │
│ Corridor context strip (11 stations around the venue)     │ T-60  Staff brief   │
├──────────────────────────────────────────────────────────┤ T-20  Open 10 gates │
│ SURGE VIEW (hero)                                         │ T+8   Hold in       │
│ Forecourt → Footbridge → Concourse → Gates → Platform     │       forecourt     │
│ (up and down) + train pill; scrubber T-30 … T+240         │ T+14  Shuttle trains│
├──────────────────────────────────────────────────────────┤ ...                │
│ KPI row (Current plan vs AI plan) + queue chart with band │                    │
├──────────────────────────────────────────────────────────┴────────────────────┤
│ Decision bar:  one-sentence summary      [Reject]  [Print plan]  [Approve plan]  │ 60px
└───────────────────────────────────────────────────────────────────────────────┘
```

- Left-aligned text; numbers right-aligned in tables.
- Structure by space and hairlines, not by boxing every item. One `--platform` surface for the hero and right rail; the rest sits on `--concrete`.
- Radius: 2px for inputs and buttons, 0 for panels, full round only for train pills and zone markers (shape carries meaning).
- 8px spacing grid; panel padding 20px on laptop.
- Right rail is 340px wide, collapsing to a drawer below 1100px.
- Inputs strip: one row where possible, wrapping to two on narrow screens. Primary action is **Generate plan**.

### 4.2 Printed plan (A4)
A separate print stylesheet: title, event details, KPI summary, the action timeline as a table (time, owner, action, trigger), and the three-language announcements. Serif for announcements, black on white, no colour dependence (levels shown with text labels).

## 5. The Surge view (hero component)

- Five zones left to right as rounded-rectangle blocks connected by thin arrows: **Forecourt, Footbridge, Concourse, Gates, Platform**. The platform block splits into **Up** and **Down**. Zone names in semi-expanded Archivo 600.
- **Fill = crowd level** from the ramp, with the level label and the number of people inside it. Levels 4-5 get the hatch overlay.
- **Hold zones:** when the plan holds passengers, the zone shows a `--signal` outline with a small label ("Holding, entry paused") and a count of people held.
- **Gates:** drawn as small slots; open entry gates in `--approved`, exit mode in `--baseline`, closed/throttled in `--shelter`. Count shown in text.
- **Trains:** a pill below the platform with its fill showing load; trains added by the plan have a `--ai-plan` outline. Departures slide out and arrivals slide in as the scrubber advances.
- **Current plan vs AI plan:** a segmented control above the view ("Current plan", "AI plan", "Side by side"). In side-by-side, two compact surge views stack on the same time axis.
- **Scrubber:** below the view, T-30 to T+240 with play/pause and speed (1×, 4×, 16×). A heat strip behind it shows the platform crowd level through time, with `--signal` markers on action-card times. Keyboard: left/right moves 1 minute (shift = 15), space plays/pauses.
- **Context strip:** thin, 11 stations centred on the venue station, event station highlighted, trains as tiny pills moving along the line, protected stations with a small shield glyph.
- Performance: SVG with transform-based motion; no full-tree re-render per frame.

## 6. Key components

| Component | Behaviour and look |
|---|---|
| **Event inputs** | Preset selector, number fields with units, a low/mid/high attendance selector, standby-rake stepper, rain toggle. Changing any value marks the plan "out of date" until Generate plan runs again |
| **Paste event notice** | Opens a text area; shows parsed fields for confirmation; the operator accepts or edits |
| **KPI row** | Six values: clearance time, peak platform density, minutes above hold threshold, p95 wait, rakes used, chance of exceeding critical density. Each shows current plan, AI plan, delta. Improvement deltas in `--approved` with a ▼/▲ glyph matching the direction of good change |
| **Queue chart** | Two series: current plan (`--baseline`, dashed) and AI plan (`--ai-plan`, solid), 15% opacity p10-p90 band, a horizontal line at the hold threshold, axis aligned with the scrubber |
| **Action card** | Time, owner tag, action sentence, trigger ("time" or "if platform density above 2.0"), reason on expand, a small "needs approval" mark where required. Clicking jumps the scrubber to that time. Cards for the current moment get a left bar in `--track` |
| **Announcement item** | Moment name, three language tabs (English, ગુજરાતી, हिन्दी), script in serif, Copy button, source tag (Template or AI), "Draft, review before broadcast" label on machine-written Gujarati and Hindi |
| **Decision bar** | Reject (secondary), Print plan (secondary), Approve plan (primary). After approval it shows "Approved, 22:41" and offers Undo for 10 seconds |
| **Status badges** | "Simulated data" (always visible), Offline ready, and Mode: Full / Template / Cached with a one-line tooltip explaining each |
| **Constraint chip** | Each plan lists its checks (fleet limit, minimum headway, hold threshold, human approval) with ✓ in `--approved` or ✗ in `--rejected` |
| **Presenter mode** | Hotkey `P`: bigger type (+2 steps), hides setup controls, shows a discreet 3-minute step guide |

## 7. Motion

- Functional motion only: trains moving, zone fills changing with the scrubber, drawer open/close (200 ms ease-out), focus and press states.
- **One signature moment:** pressing **Generate plan** replays the flow so the audience sees it: the Surge view shows the current plan overload first, then re-flows (about 1.2 s, ease-in-out, left to right) to the AI plan: hold zones appear, queue shrinks, new train pills slot in. Don't animate anything else on entrance.
- Respect `prefers-reduced-motion`: instant state changes with a brief highlight on what changed.

## 8. Content and copy

Plain, direct, active; use words an operator would use.

- Buttons: "Generate plan", "Approve plan", "Reject plan", "Print plan", "Copy script".
- Crowd: "Platform Up reaches Crowded at T+12" rather than "density threshold exceeded".
- Constraint message: "Not allowed: a 2-minute gap is shorter than the safe 3-minute minimum. Using 3 minutes."
- Empty state: "No plan yet. Choose a preset and select Generate plan."
- Offline/LLM messages, no apologies and no vague wording: "The local model did not respond in 20 s. Using template announcements."
- Units always visible: min, pax/m², trains/hour. 24-hour time. Times in the plan are shown both clock time and T-relative ("23:42, T+12").
- All UI strings go through one i18n file (English, Gujarati, Hindi); layouts tolerate 30% longer strings.

## 9. States and edge cases

- Loading: skeletons that match the final layout (the Surge view appears with zones first, then fills).
- LLM slow/down: quiet banner "Template mode" plus the mode badge changes; no stack traces anywhere.
- Very large attendance or tiny mode share: show the number with units and a warning if outside plausible ranges.
- Wide uncertainty: show the band prominently with the sentence "High uncertainty: attendance is unconfirmed".
- Plan can't meet the threshold within constraints: say so, show the best valid plan and what is still exceeded.
- Network off: nothing requests the internet; the Offline ready badge stays green.
- Long Gujarati/Hindi strings wrap without clipping.

## 10. Accessibility

- Full keyboard use (inputs, scrubber, action cards, decision bar). Visible focus: 2px `--track` outline, 2px offset.
- Action timeline is an `aria-live="polite"` region for new items.
- Surge view has a text summary of the current minute and a "View as table" toggle.
- Crowd levels always have text, never colour alone. Touch targets at least 40px.
- Minimum text 14px for dense data, 16px otherwise.

## 11. Iconography and imagery

- One line icon set (for example Lucide), 1.5px stroke, only where it means something: shield (protected station), flag (event), chevron (direction), gate glyph.
- No stock photos, no illustrations, no emoji.
- Wordmark: "MetroPulse" in Archivo semi-expanded 700, with a small mark of three dots on a line.

## 12. Charts

- Axis labels 12px in `--ink-soft`; gridlines in `--hairline` at 1px; no chart border.
- Baseline dashed `--baseline`, AI plan solid `--ai-plan`, uncertainty band at 15% opacity.
- Label lines directly instead of using a legend where possible.
- Tooltip: `--platform` surface, 1px `--hairline`, 4px max radius, no heavy shadow.

## 13. Build checklist for the agent

- [ ] Tokens exist as CSS variables and Tailwind theme values; components use no raw hex
- [ ] Contrast check script passes
- [ ] All fonts bundled locally; English, Gujarati and Hindi render correctly offline
- [ ] Surge view implemented as in §5, including hatch overlays and hold-zone outlines
- [ ] Signature re-flow animation implemented, with a reduced-motion fallback
- [ ] Screenshots reviewed at 1440×900 and 1366×768: nothing overflows or overlaps
- [ ] Print stylesheet produces a clean A4 plan
- [ ] No all-caps labels, no repeated identical card grids, no decorative gradients
- [ ] Keyboard-only walkthrough of the demo flow succeeds
- [ ] Works with the network disabled
- [ ] Final self-critique: remove one decorative element and say which