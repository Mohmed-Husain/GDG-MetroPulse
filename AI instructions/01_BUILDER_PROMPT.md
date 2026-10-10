# BUILDER PROMPT: MetroPulse Stadium Surge Planner (PS-05)

You are a senior full-stack engineer. Build a **working, offline-capable prototype** for the hackathon problem below. Read this file fully, then `READ_FIRST.md` (it overrides anything that conflicts), `03_UI_UX_DESIGN.md` (follow it exactly), and the files in `data_inputs/` that `READ_FIRST.md` lists.

**Time budget: the whole build must fit in about 2 hours.** The hackathon is held on a moving metro train with patchy network. A focused demo of one core flow that works beats an ambitious system that doesn't. Do not ask me questions unless truly blocked: make an assumption, log it in `ASSUMPTIONS.md`, and continue.

---

## 1. The problem (from the organiser's brief, PS-05, Metro Operations)

> **The Stadium Surge.** Large events send thousands of people to one or two stations within minutes, creating serious crowd-safety risks. Cricket matches, Navratri nights and large riverfront events produce sudden surges at nearby stations. Operators know the event dates but lack a ready, actionable crowd management plan.
> **Expected deliverable:** Given an event's details (venue, expected attendance, end time), generate a **minute-by-minute crowd plan**: which gates to open, where to hold passengers, when to add trains, plus **announcement scripts in Gujarati, Hindi and English**.

Offline operation is "Not required" for this problem, but **resilience is a judging criterion** ("holds up with poor or no network, degrades gracefully"), so build everything to run fully offline.

## 2. Judging criteria and what we must visibly show

| Criterion | What the demo must show |
|---|---|
| Relevance to the problem | An operator enters event details and gets an actionable minute-by-minute plan they could hand to station staff |
| Working prototype | The core flow runs end to end live: inputs → simulation → plan → announcements |
| Resilience | Works with the network off; a visible "Offline ready" status; LLM unavailable → template announcements; cached presets |
| Technical depth | A real crowd-flow simulation with an optimizer and uncertainty bands; the LLM does real work (parsing a messy event notice, writing localized scripts), not decoration |
| Feasibility and impact | Plan respects real constraints (fleet, gate throughput, safe platform density, human approval); a short PPP model in `PITCH.md` |

## 3. Scope

**MUST (build first, in this order)**
1. Event input form with 3 presets, plus free-text paste box.
2. Crowd-flow engine for **one event station** (egress after the event ends) with a "Current plan" baseline and an "AI plan".
3. Minute-by-minute plan timeline (gates, holds, trains) and a handful of action cards.
4. KPIs and a baseline vs AI plan chart.
5. Announcement scripts in English, Gujarati, Hindi, with offline template fallback.
6. Print-ready export of the plan.

**SHOULD**
7. Local-LLM parsing of a pasted event notice into the form fields.
8. Monte Carlo uncertainty band (p10-p90) on the queue chart.
9. Station "surge view" animation with the time scrubber.
10. Cached results for the 3 presets (instant demo even if everything else fails).

**COULD**
11. Pre-event arrival (ingress) phase. 12. Rain toggle effect. 13. Local save of approved plans with a "pending sync" badge. 14. Second event station (for example Navratri at Old High Court).

**NOT building (explicitly out of scope):** model training, LightGBM or forecasting pipelines, multi-year synthetic datasets, LangGraph or multi-agent graphs, skip-stop optimization, full-network simulation, user accounts, databases beyond local files.

## 4. Architecture and stack (keep it boring)

- **Frontend:** React 18 + Vite + TypeScript, Tailwind (tokens from the design doc), Zustand, hand-written SVG for the station surge view, Recharts for the chart.
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, numpy. No database; presets and results cached as JSON in `cache/`.
- **LLM:** local model through an OpenAI-compatible API. Config via `.env`: `LLM_BASE_URL`, `LLM_MODEL`, `LLM_TIMEOUT_S` (default 20), `LLM_ENABLE_THINKING=false`. Read values from `data_inputs/llm.md`. One module `llm.py` with JSON-schema prompts, Pydantic validation, up to 2 retries with the error fed back, strip `<think>...</think>`, and an `LLMUnavailable` exception.
- **Offline rules:** no CDN, no web fonts from the internet (bundle fonts locally), no map tiles, no external API calls. `npm run build` output is served by FastAPI so the whole app is one command: `make run`.
- **Repo layout:**

```
metropulse/
├─ README.md  ASSUMPTIONS.md  PITCH.md  DEMO_SCRIPT.md  Makefile  .env.example
├─ data_inputs/            # copied in
├─ config/stadium.yaml     # everything tunable, with ESTIMATE flags
├─ backend/  engine/  llm.py  templates/  api.py  schemas.py
├─ cache/                  # precomputed preset results
└─ frontend/
```

## 5. Inputs from `data_inputs/` and how to use them

| File | Use |
|---|---|
| `network.csv` | Station order, run times (ESTIMATE), platform area for the event station (STN_15 Motera Stadium is the main demo station), neighbours for the context strip, coordinates not needed |
| `rolling_stock.yaml` | 3-coach rakes, seated 136, comfort standing, crush capacity, door count, door flow, dwell limits, min headway, turnback time |
| `timetable.csv` | The `event_matchday` and `festival_navratri` rows define the **Current plan baseline** headways |
| `policy.yaml` | Hard constraints: protected stations, platform hold density (2.0 pax/m² LOS_E), load factor 0.85, min time between plan changes 15 min, `rake_length: false`, human approval required, allowed levers |
| `events.csv` | Presets: attendance low/mid/high, mode share, end times, nearest station |
| `precedents.csv`, `ridership_reports.csv` | Sanity checks: past surges, queue durations, "dispatched all 4 standby rakes" |
| `llm.md` | Local model connection |

Treat values marked ESTIMATE or UNKNOWN as placeholders: expose each as a named parameter in `config/stadium.yaml` and list it in `ASSUMPTIONS.md`.

## 6. Engine specification

Deterministic, seeded, runs in well under 3 seconds per plan (Monte Carlo up to 10 seconds is fine). Time resolution: **1 minute**. Time axis: **T0 = event end time**; simulate T-30 to T+240 minutes.

### 6.1 Demand (people arriving at the station entrance per minute)
- Total metro riders `N = expected_attendance × metro_mode_share` (both editable; defaults from `events.csv`).
- Egress shape (parameters in config, ESTIMATE): about 10% leave in the last 15 minutes before T0, about 70% in the first 40 minutes after T0 with a peak around T+10 to T+20, about 20% in a tail up to T+120. Use smooth distributions, not steps.
- Direction split between the two platforms (default 55% towards Ahmedabad/APMC side, 45% towards Gandhinagar, ESTIMATE).
- Walk time from venue exit to station gates (default 5 minutes, ESTIMATE).
- Optional rain toggle: slows walking, makes arrivals more compressed.

### 6.2 Station model (zones in series)
`Forecourt/footbridge → Concourse (queue for gates) → Gates → Platform (per direction) → Train`
- **Gates:** `entry_gates_total` (ESTIMATE, default 10), service rate per gate (default 25 pax/min, ESTIMATE), a share of gates can be switched between entry and exit, special pre-sold event QR tickets raise throughput by a factor (parameter, default 1.0 baseline and 1.3 in the plan if enabled).
- **Platform:** area from `network.csv` for the station, side platforms assumed (half each direction), usable fraction (default 0.6). **Density = people on the platform / usable area.** Hold threshold 2.0 pax/m² from `policy.yaml`; resume below 1.5 (hysteresis); critical threshold parameter (default 3.5, ESTIMATE).
- **Concourse and forecourt capacities:** parameters (ESTIMATE). If exceeded, queue spills back to forecourt; flag it.
- **Holding rule:** when platform density exceeds the hold threshold, close or throttle gate entry (people wait in the concourse, then the forecourt); resume when density falls. The plan must show where people are held and when released.

### 6.3 Trains
- Each direction has a departure schedule. A train takes boarders up to capacity at **comfort load factor 0.85** (crush is never planned). Trains arriving at the event station carry an arrival load (default 25% of capacity at night, ESTIMATE). Boarding time limited by `doors × door_flow × dwell`.
- **Current plan baseline:** headway from the `event_matchday` row (or `festival_navratri`), regular rakes passing through, dwell 30 seconds.
- **AI plan levers (policy-allowed only: headway, short_turn, reduced/extended dwell; rake length is NOT a lever):**
  1. Headway per 15-minute block (choose from 3, 4, 5, 6 minutes; never below the practical minimum parameter, default 3 minutes; the CBTC floor of 90 seconds from `rolling_stock.yaml` is only a hard limit).
  2. **Staged empty rakes:** N standby rakes pre-positioned at the nearest siding (default 4 from `precedents.csv`, range 0-8) that run as **originating trains from the event station** with zero arrival load, using short-turn points from config (default turnbacks `STN_12` for southbound, ASSUMED and flagged "needs operator confirmation", and `STN_23` for northbound, per `policy.yaml`).
  3. Extended dwell at the event station up to `max_dwell_seconds` (60).
  4. Fleet check: for each service pattern compute rakes required = ceil(round-trip time / headway), using run times from `network.csv`, dwell and turnback; **never exceed available rakes**. Regular full-line headway can't be shortened freely because the corridor fleet is limited; explain this in the UI (it is why short-turn shuttles are the lever).
- Respect `min_time_between_plan_changes_min`: headway only changes at 15-minute block boundaries.

### 6.4 Optimizer
Simulation-based search, not an LLM. For each 15-minute block choose headway, shuttle on/off, gate count (entry vs exit), and hold behaviour to minimise: `clearance_time + w1 × minutes_above_hold_density + w2 × rakes_used`, subject to all constraints (platform critical density never exceeded, fleet limit, min headway, protected stations untouched, human approval). A greedy coordinate search is enough. After choosing, **verify robustness** at p90 attendance and report if the plan breaks.

### 6.5 Monte Carlo (SHOULD)
Sample attendance, mode share, direction split, and egress timing noise (about 100-200 runs, seeded). Report p10, p50 and p90 for queue length and platform density, and the probability that density exceeds the critical threshold with and without the plan.

### 6.6 Outputs
- `timeline[]`: per minute `{t_rel, clock, arrivals, forecourt_queue, concourse_queue, gates_entry_open, gate_state, platform_density_up, platform_density_down, trains_departed, headway_min, hold_state}` for baseline and plan.
- `actions[]`: 8-14 **action cards** generated deterministically from the decisions:
  `{id, t_rel, clock, owner (Station controller | OCC | Security | Platform staff | PA announcer), action, reason, trigger (time or condition), zone, requires_approval}`.
  Examples of the content: staff briefing time; pre-position standby rakes; open N entry gates at time X; start holding in forecourt pens when density passes the threshold; release in waves; when to insert shuttle trains; when to revert gates to exit mode; final clearance and close-out.
- `kpis`: baseline vs plan: clearance time (95% of riders departed), peak platform density, minutes above hold threshold, p95 waiting time, rakes used, max train load factor, probability of exceeding critical density.
- Validate against `precedents.csv` qualitatively: the baseline for the IPL preset should produce queues lasting about 60-150 minutes, in the same range as the reported queue period. Set parameters from the data **before** running the plan; do not tune parameters to flatter the AI plan. Record the check in `ASSUMPTIONS.md`.

## 7. AI (LLM) tasks

All LLM outputs are validated JSON. Every task has a non-LLM fallback so the app never breaks.

1. **EventParse (SHOULD).** Input: a pasted event notice (English/Gujarati/Hindi/mixed, WhatsApp style). Output: `{event_name, venue, nearest_station_id, date, start_time, end_time, expected_attendance, confidence, notes}`. Fallback: the manual form. The UI shows parsed fields for the operator to confirm.
2. **Announcements (MUST).** For each key moment in the plan (pre-event notice, entry gates opening, hold in forecourt, platform crowding, extra trains, last trains, all-clear) produce a short PA script in **English, Gujarati and Hindi** with the real numbers/times from the plan filled in. Output schema: `{moment_id, en, gu, hi}`. **Fallback:** a library of pre-written template scripts for every moment in all three languages in `backend/templates/`, with `{time}`, `{station}`, `{gate}` placeholders. Write those templates carefully in natural, simple language. Mark all machine-written Gujarati and Hindi as **"Draft, review before broadcast"** in the UI.
3. **Operator brief (SHOULD).** A 5-8 line plain-language summary of the plan: what, why, risks. Fallback: a template using the KPIs.

Notes: disable thinking mode for speed; keep prompts short; low temperature for extraction, moderate for scripts. Run a quick Gujarati sanity check on startup (`make check-llm`) and print latency; if the model's Gujarati looks poor, the UI should default to templates and show the LLM output only as an optional "AI rewrite".

## 8. API (all JSON, prefix `/api`)

```
GET  /health                 -> {llm: up|down, mode: full|template|cached, model, latency_ms}
GET  /presets                -> list of event presets with all fields
POST /parse-event            {text}                    -> parsed event (LLM or fallback)
POST /plan                   {event, overrides?}       -> {baseline, plan, bands?, actions[], kpis, assumptions[]}
POST /announcements          {plan_id, languages[]}    -> [{moment_id, en, gu, hi, source: llm|template}]
POST /approve                {plan_id, decision, note} -> stored locally in cache/approvals.json
```
Define all schemas once in `schemas.py` and generate TypeScript types. Build the **frontend against mock JSON first** (`VITE_USE_MOCK=true`), then switch to the live API.

## 9. Frontend

Follow `03_UI_UX_DESIGN.md` for look, layout, components, copy, motion and accessibility. Functional requirements:

1. Event input strip with preset selector, attendance (with low/mid/high), metro share, end time, standby rakes, rain toggle, "Paste event notice" box, and a **Generate plan** button.
2. **Surge view** (hero): the station zones in series with density fills, train arrivals, gate states, and a time scrubber T-30 to T+240 with play/pause. Corridor context strip above it (11 stations around the event station).
3. **Plan comparison:** KPI row (Current plan vs AI plan) and a queue/density chart with the p10-p90 band.
4. **Action timeline** (right rail): minute-by-minute cards in time order, each with owner and trigger. Clicking one jumps the scrubber to that time.
5. **Announcements tab:** English / ગુજરાતી / हिन्दी, copy button, "Draft" label for machine-written text, source tag (template or AI).
6. **Decision bar:** Approve / Reject; Print plan (print stylesheet produces a clean A4 page with the action timeline and announcements).
7. **Status:** header badge for Offline ready, model status (Full / Template mode / Cached), and "Simulated data".
8. **Presenter mode:** hotkey `P` enlarges type and hides controls.

## 10. Presets and demo flow

Create 3 presets from `events.csv` and `precedents.csv` (editable):
- **P1: Night cricket match at Narendra Modi Stadium** (Motera Stadium station): the main demo.
- **P2: Large concert at the same venue** (higher mode share, later end).
- **P3: Navratri night at the riverfront** (event station Old High Court; baseline from `festival_navratri`; may reuse the same engine with that station's platform area).

3-minute demo story: (1) problem and precedent (long queues after the final); (2) pick preset P1, show the current plan overload (platform density crosses the threshold, queue time); (3) generate AI plan, show action timeline and where passengers are held; (4) KPIs and uncertainty band; (5) switch the language tabs and show the announcements; (6) pull the network and kill the LLM live: app still works with templates and cached presets; (7) print the plan.

## 11. Resilience requirements (these are judged)

- Whole app works with the machine in airplane mode.
- Engine and presets work without the LLM. Announcement templates exist for all moments and all three languages.
- `cache/` contains precomputed results for P1-P3 so the UI loads instantly. If live computation or the LLM fails, show a quiet notice and use the cached result.
- Never show a stack trace to the user; show a plain-language message and a retry.
- A "Mode" indicator tells the audience exactly what is running (Full, Template, Cached).

## 12. Pitch artifacts (generate as files)

- `PITCH.md`: a 3-minute script and a one-slide **PPP model**: who builds (operator or private software partner), who runs (control room team), who pays (for example event organisers through a per-event surge-management fee or a ticket cess, plus operator savings), pilot plan (one stadium, one season), risks, and what real data would replace our estimates. **Do not invent performance numbers**; all figures shown come from the simulator and are labelled "Simulated".
- `DEMO_SCRIPT.md`: click-by-click steps with the exact words to say and the fallback if something fails.
- `ASSUMPTIONS.md`: every ESTIMATE/UNKNOWN parameter, its default and why.

## 13. Two-hour build plan (checkpoints)

| Time | Deliver |
|---|---|
| 0:00-0:10 | Scaffold, `.env`, Makefile, schemas, mock JSON for all endpoints |
| 0:10-0:45 | Frontend on mocks: form, surge view, chart, action timeline, announcements tab, print view |
| 0:45-1:15 | Engine: demand, station zones, trains, baseline vs plan, KPIs, action cards, presets cached |
| 1:15-1:35 | Connect frontend to the live API; LLM tasks with fallbacks; health/mode indicator |
| 1:35-1:50 | Monte Carlo band, resilience tests (airplane mode, LLM off), polish |
| 1:50-2:00 | `PITCH.md`, `DEMO_SCRIPT.md`, final run-through |

At each checkpoint run the app, fix breakage, and write two lines on what works. If you are behind, **cut from the COULD and SHOULD lists, never from MUST.**

## 14. Definition of done

- [ ] `make run` serves the app with the network disabled
- [ ] P1, P2, P3 each produce a plan, KPIs and announcements
- [ ] The plan respects `policy.yaml` constraints (no rake-length change, fleet limit, min headway, hold threshold, human approval)
- [ ] English, Gujarati and Hindi announcements for every key moment, via LLM and via templates
- [ ] LLM off → still fully usable; cached results load instantly
- [ ] Print export works
- [ ] UI follows `03_UI_UX_DESIGN.md`; "Simulated data" label visible
- [ ] `ASSUMPTIONS.md`, `PITCH.md`, `DEMO_SCRIPT.md`, `README.md` present
- [ ] No console errors in the demo flow

## 15. Working style

- Commit after every checkpoint; keep functions small and typed; one source of truth for schemas and config.
- Prefer boring and reliable over clever. No new dependencies that need the internet at runtime.
- Do not hardcode event or station specifics in engine code; they live in `config/stadium.yaml` and `data_inputs/`.
- Be honest in the UI: estimates are labelled, synthetic outputs are labelled, machine-drafted translations are labelled.