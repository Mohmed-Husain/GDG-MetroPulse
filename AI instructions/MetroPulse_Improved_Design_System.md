# MetroPulse UI/UX Design System --- Clear Operator Edition

**Purpose:** Replace the current crowded, jargon-heavy dashboard with a
calm, easy-to-present interface for the MetroPulse Stadium Surge
Planner.

**Primary user:** A hackathon judge or technically capable person who
does not know metro operations terminology. **Primary task:** Choose an
event, understand where queues may form, compare a proposed plan with
the current plan, review actions, and approve or print the plan.
**Design principle:** Explain the operational meaning first. Show
specialist terms only when useful, with a short explanation beside them.

------------------------------------------------------------------------

## 1. Product experience

The interface must answer these questions in this order:

1.  **What is happening?** --- Which event, which station, and when does
    it end?
2.  **Where is the problem?** --- Where are people waiting or crowding?
3.  **What does MetroPulse recommend?** --- Which actions should staff
    take, and when?
4.  **Does the plan help?** --- Compare waiting, crowding, and trains
    used.
5.  **What happens next?** --- Review announcements, then approve or
    print the plan.

Do not make users interpret a wall of numbers before they understand the
situation.

### Core design rules

-   Keep the screen focused on one primary story: **crowd builds up →
    recommended actions → expected result**.
-   Use plain English by default. Specialist terms must have a nearby
    explanation or tooltip.
-   Use sentence case, not all-caps headings.
-   Avoid cramming every control into one row.
-   Avoid repeated tiny cards, tiny text, decorative icons, and
    unnecessary borders.
-   Do not make the announcement rail compete visually with the station
    flow.
-   Make the page work at 1366×768 and 1440×900. No horizontal page
    overflow.
-   At narrower widths, stack sections and turn the right panel into a
    drawer.
-   This is a prototype using simulated inputs and outputs. Always show
    **Simulated data**.

------------------------------------------------------------------------

## 2. Information architecture

Use three main areas instead of showing every feature at equal
importance.

### A. Header

Show: - MetroPulse wordmark - Event/station context - `Simulated data` -
Offline status: `Offline ready` or a clear explanation if not
available - AI status in human terms: `AI writing available`,
`Using saved scripts`, or `Saved plan` - Language selector - Presenter
mode

Do not show unexplained implementation labels such as `Template Mode`
without a short explanation. Use a tooltip or secondary text: - **AI
writing available** --- "The local language model is responding." -
**Using saved scripts** --- "The plan still works; announcements use
reviewed templates." - **Saved plan** --- "Showing a previously
calculated result. It may not reflect your latest inputs."

Never show `Offline ready` unless offline readiness has actually been
verified or the app is designed and packaged to work offline. If it is
unverified, show `Offline support configured` instead.

### B. Event setup

Place event inputs in a compact but readable section with clear labels
and units.

Required controls: - Event preset - Expected event attendance -
Estimated share expected to use the metro - Event end time - Standby
trains available - Rain toggle, if supported - Optional pasted event
notice - Primary button: **Generate crowd plan**

Use labels such as: - `People at the event` instead of only
`Attendance` - `Expected to use the metro` instead of only
`Metro share` - `Event ends at` - `Extra trains available` instead of
only `Standby rakes`

Show one helper sentence: "MetroPulse uses these estimates to simulate
queues and compare operating plans."

Do not silently overwrite manual edits when changing presets. If a
preset is changed, either populate its values explicitly or ask the user
to confirm replacing the current inputs.

### C. Main results

Use this order: 1. A plain-language summary 2. Station flow
visualisation 3. Recommended actions 4. Current plan vs proposed plan
comparison 5. Announcements 6. Approval and print controls

The action timeline and announcements should not be squeezed into a
narrow permanent rail on a laptop. Use tabs or a clearly sized side
panel. On smaller screens, make it a drawer.

------------------------------------------------------------------------

## 3. Main screen layout

Suggested desktop layout:

``` text
┌───────────────────────────────────────────────────────────────────────────┐
│ MetroPulse     Simulated data     Offline status     AI / saved-script status│
├───────────────────────────────────────────────────────────────────────────┤
│ Plan a busy event                                                          │
│ Event preset | People at event | Metro users | End time | Extra trains     │
│ [Optional: paste event notice]                         [Generate crowd plan]│
├───────────────────────────────────────────────────────────────────────────┤
│ PLAN SUMMARY                                                               │
│ “Crowding is expected on Platform A around 23:40. The plan holds entry     │
│  briefly and adds available shuttle service. Operator review is required.” │
├───────────────────────────────────────────────────────────────────────────┤
│ WHERE PEOPLE BUILD UP                                                      │
│ Outside → Walkway → Ticket area → Gates → Platform A / Platform B → Train  │
│ Each zone: plain label, number of people, simple crowd status               │
│ Time slider: 30 min before event end → 4 hours after event end              │
├───────────────────────────────────────────────────────────────────────────┤
│ WHAT SHOULD STAFF DO?                         PLAN RESULTS                 │
│ 23:15 Brief station staff                    Current plan | Proposed plan  │
│ 23:30 Prepare gates                          Time to clear most passengers│
│ 23:40 Hold entry if platform is crowded      Highest platform crowding     │
│ 23:45 Dispatch extra train if available      Time spent above target       │
│                                               Extra trains used             │
├───────────────────────────────────────────────────────────────────────────┤
│ [Review announcements]        [Reject plan] [Print plan] [Approve plan]    │
└───────────────────────────────────────────────────────────────────────────┘
```

This is a hierarchy guide, not a requirement to copy the ASCII layout
literally.

------------------------------------------------------------------------

## 4. Plain-language terminology

Use these display labels throughout the UI. Keep the underlying API
field names and calculation variables unchanged unless a code change is
necessary.

  -----------------------------------------------------------------------
  Current / specialist    Display this instead    Explanation for tooltip
  term                                            or help text
  ----------------------- ----------------------- -----------------------
  Stadium Surge Planner   Crowd plan for a major  Plan for managing
                          event                   passengers after a
                                                  large event

  Attendance              People at the event     Total expected event
                                                  attendees

  Metro share / mode      Expected to use the     Estimated percentage of
  share                   metro                   attendees travelling by
                                                  metro

  Standby rakes           Extra trains available  Trains that may be
                                                  available for
                                                  additional service

  Rake                    Train set               A complete train used
                                                  for service

  Headway                 Time between trains     Minutes between
                                                  consecutive trains

  Short-turn shuttle      Extra shuttle train     A train that runs on a
                                                  shorter section of the
                                                  line

  Dwell time              Time a train stays at   Time allowed for
                          the station             passengers to board and
                                                  leave

  Forecourt               Outside waiting area    Area outside the
                                                  station entrance

  Footbridge              Walking bridge          Walkway passengers use
                                                  to reach the station

  Concourse               Ticket and circulation  Indoor area between
                          area                    entrances and platforms

  Gate throughput         People gates can        Estimated capacity of
                          process per minute      open gates

  Platform density        Crowd level on platform Estimated people per
                                                  square metre

  pax/m²                  people per m²           Estimated number of
                                                  people in each square
                                                  metre

  Hold threshold          Crowd level where entry Configured trigger for
                          is paused               holding people before
                                                  the platform

  Hysteresis / resume     Resume level            Lower crowd level at
  threshold                                       which entry may resume

  Clearance time          Time for most           In this prototype, time
                          passengers to leave     until 95% of simulated
                                                  metro riders have
                                                  departed

  P95 wait time           Long-wait estimate      Estimated wait time
                                                  that 95% of simulated
                                                  passengers do not
                                                  exceed, if implemented
                                                  correctly

  Fleet deployed          Extra trains used       Number of train sets
                                                  assigned by the
                                                  proposed plan; clarify
                                                  whether regular trains
                                                  are included

  Crush hazard risk       Chance of exceeding the A model-based estimate,
                          configured critical     not a real-world safety
                          crowd level             certification

  Monte Carlo             Many simulated          Repeated simulations
                          scenarios               with varied assumptions
                                                  to show uncertainty

  p10--p90 band           Range across simulated  Middle 80% range of
                          scenarios               outcomes from the runs,
                                                  if computed as
                                                  specified

  Baseline                Current plan            Existing timetable and
                                                  operating assumptions

  AI plan                 Proposed plan           Alternative calculated
                                                  by the planner; not
                                                  automatically approved

  OCC                     Operations control      Team coordinating train
                          centre                  service

  PA                      Public announcement     Message broadcast to
                                                  passengers

  Template mode           Using saved scripts     Prewritten
                                                  announcements are used
                                                  because AI writing is
                                                  unavailable

  Cached mode             Showing a saved result  Previously calculated
                                                  plan is shown; it may
                                                  not reflect current
                                                  inputs

  Protected station       Station that must not   Station excluded from
                          be disrupted            changes by the supplied
                                                  operating rules
  -----------------------------------------------------------------------

Do not use a label such as "AI plan" to imply that a language model made
all decisions. Prefer **Proposed plan** in the main UI and explain that
it is calculated by the simulator and planning algorithm.

------------------------------------------------------------------------

## 5. Station flow visualisation

The station flow should be the visual centrepiece, but it must be
readable to a first-time viewer.

### Zones and labels

Use this flow:

**Outside waiting area → Walkway → Ticket area → Gates → Platform A /
Platform B → Train**

The detailed specialist names may appear as secondary text: - Outside
waiting area *(forecourt)* - Walkway *(footbridge)* - Ticket area
*(concourse)*

Each zone should show: - Number of people currently estimated in the
zone - Plain-language crowd status: `Light`, `Steady`, `Busy`,
`Crowded`, or `Critical` - A brief action/status label when relevant,
e.g. `Entry paused — holding area`

The visual must not imply precise real-time CCTV detection. This
prototype shows **simulated crowd movement**, unless connected to a
verified live data source.

### Crowd colours

Retain the existing crowd colour tokens where accessible and legible: -
Light: `#5BA8A0` - Steady: `#A8C686` - Busy: `#F2C14E` - Crowded:
`#E8743B` - Critical: `#B3243F`

Always show text as well as colour. Use a pattern or bold outline for
Crowded/Critical states. Do not rely on colour alone.

### Time control

Replace unexplained `T+28 min` as the main label with: - **Time:**
`23:58` - Secondary: `28 minutes after event end`

The slider should show: - `30 min before` - `Event ends` -
`30 min after` - `1 hour after` - `2 hours after` - `4 hours after`

A tooltip can show the exact relative value, such as `T+28`. Keep the
relative timeline available for technical users, but do not make it the
only way to understand time.

Playback controls should be simple: `Play`, `Pause`, `Reset`. Put `4×`
and `16×` speed options in a secondary menu.

------------------------------------------------------------------------

## 6. Plan comparison: show only meaningful metrics first

The current screen has too many small KPI cards and technical terms.
Show four primary measures in the main comparison:

1.  **Time to clear most passengers** --- time until 95% of simulated
    metro riders have departed.
2.  **Highest platform crowding** --- peak estimated people per square
    metre, with the configured target shown.
3.  **Time above crowding target** --- minutes above the configured hold
    threshold.
4.  **Extra trains used** --- number of additional train sets allocated.

Put these secondary measures behind `More details`: - Estimated
long-wait time - Maximum train load - Probability of exceeding the
configured critical density - Uncertainty range

Each metric must show: - Current plan value - Proposed plan value -
Difference - Whether the change is better, worse, or unchanged

Do not colour a change green just because the number went down. For
example, extra trains used is not necessarily better when lower; the
goal is a feasible, effective plan, not minimizing every metric
independently.

### Important display correctness

-   If the model fails to clear the crowd during the simulated window,
    display `Not cleared within 4 hours` rather than treating `T+240` as
    a successful clearance.
-   If clearance times are equal, say `No change`, not
    `0 minutes faster`.
-   Define whether "extra trains used" excludes trains already scheduled
    in the baseline.
-   Use consistent comparison windows and identical demand assumptions
    for baseline and proposed plan.
-   Never claim a real-world percentage improvement from simulated data.

------------------------------------------------------------------------

## 7. Charts

Default to **Platform crowding over time** because it connects directly
to the safety objective. Let users switch to
`People waiting across the station`.

The chart must: - Label the lines `Current plan` and `Proposed plan`. -
Show a clear horizontal line labelled `Configured crowding target`. -
Use minutes or clock time consistently. - Keep the time slider and chart
aligned. - Use a shaded uncertainty range only if multiple simulations
actually produced it. - Explain the uncertainty band in plain English:
"Range across simulated scenarios." - Include a no-data, loading and
error state. - Avoid presenting a chart of cached values as if it
reflects new inputs.

The chart must be secondary to the main station flow, not compete with
it.

------------------------------------------------------------------------

## 8. Recommended actions

Use the heading **What should staff do?**

Every action item must answer: - **When?** Show both clock time and
relative time where useful. - **Who?** Station staff, security, control
room or announcement operator. - **What?** One short, concrete
instruction. - **Why?** A brief reason in plain language. -
**Condition?** If it depends on crowd level or another event. -
**Approval?** Clearly identify actions that require operator
confirmation.

Example display:

**23:40 --- Prepare to hold platform entry** - **Owner:** Station
staff - **Reason:** The simulation estimates that the platform may
exceed the configured crowding target. - **Trigger:** If platform
crowding reaches the configured threshold. - **Status:** Requires
operator approval

Do not present model-generated recommendations as automatic commands to
real staff. The plan is simulated and must be reviewed.

Clicking an action should move the time slider to that moment and update
the station visualisation.

------------------------------------------------------------------------

## 9. Announcements

Rename `PA Scripts` to **Passenger announcements**.

Each announcement should show: - Moment,
e.g. `Hold passengers outside` - Time it is intended to be used -
Language tabs: `English`, `ગુજરાતી`, `हिन्दी` - Script text in a readable
size - `Copy announcement` action - Source: `Reviewed template` or
`AI draft` - Review warning when the text was generated by an LLM

Use plain, respectful language. Do not claim an announcement was
broadcast; the prototype only drafts and displays it.

If the LLM is unavailable, show: "AI writing is unavailable. Using saved
announcement templates."

Never show raw stack traces or silently use a stale announcement that
contradicts the current plan.

------------------------------------------------------------------------

## 10. Status, approval and print

### Status labels

Use: - `Simulated data` - `Offline ready` only after offline capability
is verified - `AI writing available` - `Using saved scripts` -
`Showing saved plan` - `Plan needs to be regenerated` when inputs change

Avoid unexplained labels such as `Full`, `Template`, `Cached`, `OCC`,
`p95`, `p10–p90`, and `pax/m²` in primary UI text.

### Approval

The bottom action bar should show: - `Reject plan` - `Print plan` -
`Approve plan`

Before approval, show a brief confirmation summary: - Main recommended
changes - Any constraints not met - Any assumptions requiring attention

After approval, show who approved it only if the application actually
records that information. Do not imply real operational authorization
beyond the prototype.

### Print plan

Generate a clean A4 document with: - Event details and simulated-data
notice - Plain-language summary - Primary comparison metrics - Action
timeline with time, owner, action and trigger - English, Gujarati and
Hindi announcements - Assumptions, warnings and approval status

The printed document must remain understandable in black and white.

------------------------------------------------------------------------

## 11. Input validation and edge cases

The UI must handle the following states clearly:

-   Missing or invalid attendance, metro share or end time
-   Extremely high or low event attendance
-   Zero extra trains available
-   Rain enabled or disabled, if implemented
-   Event details changed after a plan was generated
-   A plan that cannot meet the configured crowding target
-   Local LLM unavailable or slow
-   Cached preset selected
-   Cached result does not match current input
-   No feasible plan under the supplied constraints
-   A crowd that is not cleared within the simulation window
-   Gujarati or Hindi text wrapping onto multiple lines
-   Offline mode not actually verified

Use clear messages. Examples: - "Enter an expected attendance greater
than zero." - "Your inputs changed. Generate a new plan before reviewing
or approving it." - "The plan could not keep every platform below the
configured target. Review the remaining risk." - "This scenario was not
cleared within the four-hour simulation window." - "Showing a saved
scenario. It does not reflect your latest changes."

Never hide a constraint violation just to make the interface look
successful.

------------------------------------------------------------------------

## 12. Visual design tokens

Keep the current light transit-oriented palette unless contrast testing
identifies a problem.

``` css
:root {
  --concrete: #EDEFF2;
  --platform: #F9FAFB;
  --shelter: #E1E5EA;
  --hairline: #C9D0D9;
  --ink: #172033;
  --ink-soft: #4A5568;
  --ink-faint: #6B7685;

  --track: #1F4E9C;
  --track-deep: #163A75;
  --baseline: #7A8594;
  --ai-plan: #6A3FB5;
  --signal: #F2A900;
  --approved: #2E7D4F;
  --rejected: #B3243F;
}
```

-   Use a clean sans-serif font available locally.
-   Bundle fonts and assets required for offline operation.
-   Body text: 16px where possible; never below 14px for dense data.
-   Headings: 20px and 28px; use 40px only for a single key number or
    title.
-   Use clear spacing and section headings instead of boxing every item.
-   Use compact corners and subtle dividers, not heavy shadows or
    gradients.
-   Buttons must have descriptive labels and visible keyboard focus.
-   Maintain accessible contrast and do not communicate status through
    colour alone.

If the specified fonts are not already available locally, use an
installed, bundled fallback rather than relying on the internet.

------------------------------------------------------------------------

## 13. Presenter mode

Presenter mode is for the hackathon demo, not a different product.

When enabled: - Hide setup details that are no longer relevant. -
Increase text size. - Keep the event, crowd visualisation and current
action visible. - Make the current plan and proposed plan easy to
compare. - Show one short explanation of the current simulation time. -
Keep `Simulated data` visible. - Provide a reliable exit from presenter
mode.

Do not use animations that delay or obstruct the demonstration. Respect
reduced-motion preferences.

------------------------------------------------------------------------

## 14. Acceptance checklist

The redesign is complete only when all applicable items below are
verified:

-   [ ] A first-time viewer can identify the event and purpose without
    explanation.
-   [ ] Primary inputs have plain labels and visible units.
-   [ ] Specialist terms are replaced or explained.
-   [ ] The station flow is the visual focus and does not overflow.
-   [ ] Crowd status is communicated through text and colour/pattern.
-   [ ] Current and proposed plans are clearly distinguished.
-   [ ] The four primary metrics are readable and correctly defined.
-   [ ] The chart uses the same time axis as the station view.
-   [ ] Actions show time, owner, reason, trigger and approval status.
-   [ ] Announcements clearly identify language and whether they are
    templates or drafts.
-   [ ] Changing inputs marks the old plan as out of date.
-   [ ] Constraint failures and incomplete clearance are shown honestly.
-   [ ] Cached results are never mistaken for a newly computed plan.
-   [ ] The app works at 1366×768 and 1440×900 without overlap.
-   [ ] The interface is tested with longer Gujarati and Hindi strings.
-   [ ] Offline status is truthful and tested.
-   [ ] Print output is readable in black and white.
-   [ ] Keyboard navigation and visible focus work.
-   [ ] No console errors occur during the main demo flow.

### Final instruction to the implementation agent

Refactor the existing interface in place. Preserve working simulation
logic, APIs, schemas and data unless a change is necessary. Do not
replace real calculations with mock values to make the new UI look
better. First simplify labels and hierarchy, then fix layout, then
improve visual polish. After each stage, run the application and verify
the main event-to-plan-to-announcement flow.
