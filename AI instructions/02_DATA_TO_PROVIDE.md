# Data to provide to the coder agent

Put everything in a folder called `data_inputs/` and hand it over with `01_BUILDER_PROMPT.md` and `03_UI_UX_DESIGN.md`.

**Rules for you (the human):**
- Verify real-world values from official sources (Gujarat Metro Rail Corporation website, press releases, timetable boards, news). I cannot confirm the current state of the network, so check which stations are open, current headways, and rake specs.
- If you cannot find something, write `UNKNOWN`. The agent will use a placeholder and list it in `ASSUMPTIONS.md`. Do not guess silently.
- Anything estimated by you should be marked `ESTIMATE`.

Priority: **A = must have, B = strongly helps, C = nice to have**.

---

## 1. Network (A) → `network.csv`

One row per station in running order, for the corridor you want to show (10-15 stations is enough for the demo).

```csv
order,station_id,station_name,typology,dist_to_next_km,run_time_to_next_min,platform_area_m2,is_interchange,protected,lat,lon
1,STN_01,FILL,residential,FILL,FILL,FILL,false,false,,
2,STN_02,FILL,office,FILL,FILL,FILL,false,false,,
```

- `typology` must be one of: residential, office, govt, college, mall, stadium, religious, tourist, interchange, mixed
- `protected` = true for stations that must never be skipped (hospital, major interchange, only access for an area)
- Platform area is rarely public: use `ESTIMATE` (length × width of the platform)
- Lat/lon is optional (only used for a secondary geo view)

Also tell the agent in a short note:
- Which line/corridor and direction names (e.g. "towards Gandhinagar")
- Terminals, and whether trains turn back at the platform or a siding
- Depot location and any section currently under construction (so it is not shown as open)

## 2. Rolling stock and signalling limits (A) → `rolling_stock.yaml`

```yaml
coaches_per_rake_current: FILL        # e.g. 3 or 6
coaches_per_rake_max: FILL
seated_per_coach: FILL
standing_comfort_per_coach: FILL      # at ~3-4 people/m2
standing_crush_per_coach: FILL        # ~6 people/m2
max_speed_kmph: FILL
service_speed_kmph: FILL
acceleration_mps2: FILL               # typical 0.8-1.0 if unknown, mark ESTIMATE
deceleration_mps2: FILL               # typical 1.0-1.1 if unknown
fleet_total_rakes: FILL
fleet_available_for_service: FILL     # after maintenance/spares
min_headway_seconds: FILL             # safe minimum from signalling
standard_dwell_seconds: FILL
min_dwell_seconds: FILL
max_dwell_seconds: FILL
door_flow_pax_per_second: FILL        # ESTIMATE ok
terminal_turnback_minutes: FILL
```

## 3. Current timetable (A) → `timetable.csv`

```csv
day_type,start_time,end_time,headway_min,direction,rake_coaches
weekday,06:00,08:00,FILL,both,FILL
weekday,08:00,11:00,FILL,both,FILL
weekend,06:00,23:00,FILL,both,FILL
```
Also: first train and last train times, and any special holiday timetable.

## 4. Event calendar (A) → `events.csv`

This drives the "seasonal pattern" story. Include **8-15 recurring events** from the corridor's region. Typical candidates: Navratri, Diwali shopping period, Uttarayan, Kankaria carnival, Rath Yatra, Ganesh Chaturthi processions, flower shows, large exhibitions or government events at Mahatma Mandir, cricket matches at the Narendra Modi Stadium, Eid and Christmas crowds, long-weekend travel days.

```csv
event_id,name,type,recurrence_rule,example_date_year1,example_date_year2,example_date_year3,start_time,end_time,duration_days,venue,nearest_station_id,attendance_low,attendance_mid,attendance_high,metro_mode_share_estimate,source
EVT_01,FILL,festival,"annual, date varies by lunar calendar",FILL,FILL,FILL,19:00,23:59,9,FILL,STN_XX,FILL,FILL,FILL,0.10,FILL
EVT_02,FILL,sports,"ad hoc, per fixture list",FILL,,,19:30,23:00,1,FILL,STN_XX,FILL,FILL,FILL,0.20,FILL
```

- Attendance numbers can be rough (`ESTIMATE`); give low/mid/high so the model learns uncertainty.
- Give 2-3 years of dates if you can find them (festival dates shift every year).
- `metro_mode_share_estimate`: share of attendees who use metro (0.05-0.30 typical guess, mark ESTIMATE)
- List public holidays and school/college vacation windows too (`holidays.csv`: date, name, type).

## 5. Demand anchors (B) → `demand_notes.md`

Anything real that lets the agent calibrate the synthetic data:
- Reported daily/monthly ridership of the line (news or official figures), with the source link
- Reported peak hours, busiest stations, and the weekday vs weekend difference
- Known problem stations and sections (what you personally observed counts: write when, where, how long the queues were)
- Share of passengers using QR tickets vs smart cards vs tokens (if known)

If nothing is available, write "no real data" and the agent will use assumptions and label everything as simulated.

## 6. Operations policy and constraints (A) → `policy.yaml`

```yaml
protected_stations: [FILL]          # never skip
max_unserved_minutes: FILL          # no station left without a stopping train longer than this
comfort_density_pax_per_m2: FILL    # threshold for "crowded"
critical_density_pax_per_m2: FILL
max_load_factor_comfort: FILL
allowed_levers:
  headway: true
  rake_length: true                 # only if you want to claim this lever
  short_turn: true
  zero_demand_skip: true
  reduced_dwell: true
  ab_skip_stop: false               # experimental
human_approval_required: true
min_time_between_plan_changes_min: FILL
```

## 7. Local model details (A) → `llm.md`

```md
model_name: (exact name as your server lists it)
parameter_size: (e.g. 8B, 14B, 32B)
quantization: (e.g. Q4_K_M)
server: ollama | llama.cpp | vLLM | LM Studio
base_url: http://localhost:xxxx/v1
supports_json_mode: yes|no|unknown
context_length: FILL
tokens_per_second_observed: FILL
thinking_mode: how you toggle it, if known
machine: CPU, RAM, GPU + VRAM
```

Run one test chat request through the API before handing this over, and paste the working `curl` command into the file. The agent will use it to build `agents/llm.py`.

## 8. Environment (A) → `environment.md`

- OS, Python version, Node version, package manager (npm/pnpm/yarn)
- Whether Docker is available
- Will the venue have internet? (assume **no**)
- Screen/projector resolution for the demo, and whether you present on your own laptop
- Time limit for your pitch (e.g. 3, 5, 7 minutes) and number of judges/format

## 9. Branding and pitch (B) → `brand.md`

- Project name (or let the agent use "MetroPulse") and team name
- Hackathon name, theme, and tracks
- Logo files if any (SVG preferred)
- Languages to support in the UI: English, Hindi, Gujarati (confirm)
- One-line problem statement and one-line impact claim you want on the first screen

## 10. Optional extras (C)

- Photos or screenshots of crowded platforms (for pitch slides, not the app)
- Weather normals for the city by month (rainfall, temperature) → `weather_normals.csv` with `month,avg_temp_c,rain_days`
- Any competing/similar solutions you know about, so the pitch can say how this differs
- A list of questions you expect from judges

---

## Checklist before you hand over

- [ ] network.csv (verified against official sources)
- [ ] rolling_stock.yaml (UNKNOWN/ESTIMATE flagged)
- [ ] timetable.csv
- [ ] events.csv + holidays.csv
- [ ] policy.yaml
- [ ] llm.md with a working test request
- [ ] environment.md
- [ ] demand_notes.md (even if "no real data")
- [ ] brand.md
- [ ] `01_BUILDER_PROMPT.md`, `03_UI_UX_DESIGN.md` copied into the repo root

Tip: if you are short on time, the minimum viable set is items 1, 2, 3, 4, 6, 7, 8. The agent can invent reasonable placeholders for the rest and flag them.
