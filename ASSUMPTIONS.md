# MetroPulse Assumptions and Calibration Log

This document records all parameters marked `ESTIMATE` or `UNKNOWN` from the data inputs, along with their assigned defaults and engineering rationale.

---

## 1. Station Geometry and Capacities (STN_15 Motera Stadium)

| Parameter | Default Value | Status | Rationale |
|---|---|---|---|
| Platform dimensions | 140m × 15m (2,100 m²) | Verified | From `network.csv` and GMRC Phase-1 DPR. |
| Usable platform fraction | 0.60 | `ESTIMATE` | Stairs, escalators, pillars, platform screen door setback reduce standee area to ~1,260 m² (630 m² per side platform). |
| Platform hold threshold | 2.0 pax/m² | Policy Benchmark | Fruin LOS E boundary specified in `policy.yaml`. When platform density exceeds 2.0 pax/m², concourse entry turnstiles throttle. |
| Platform resume threshold | 1.5 pax/m² | `ESTIMATE` | Hysteresis gap to prevent rapid oscillation of gate opening and closing. |
| Platform critical density | 3.5 pax/m² | `ESTIMATE` | Severe crowd crush danger zone where crowd turbulence occurs; policy lists 6.0 as ultimate crush limit. |
| Automatic Fare Collection (AFC) entry gates | 10 gates | `ESTIMATE` | Typical elevated station mezzanine capacity in Ahmedabad Metro Phase-1 stations. |
| Gate service rate (regular) | 25 pax/min/gate | `ESTIMATE` | Standard transit benchmark for contactless smart cards / tokens (~2.4s per tap). |
| Dedicated event QR ticket multiplier | 1.30 (32.5 pax/min) | `ESTIMATE` | Faster barcode / pre-printed token entry scan without balance check or recharge delay. |
| Mezzanine concourse capacity | 3,500 pax | `ESTIMATE` | Usable staging area on intermediate concourse level before ticket gates. |
| Forecourt & footbridge capacity | 8,000 pax | `ESTIMATE` | Outdoor plaza and dedicated stadium pedestrian overbridge holding pens. |
| Venue walk time to station | 5 minutes | `ESTIMATE` | Normal egress pace from stadium security gates along direct footbridge (~350m). |
| Rain walking multiplier | 1.40 (+40% walk time) | `ESTIMATE` | Wet surface navigation and umbrellas slow walking velocity to ~7 min. |

---

## 2. Demand Generation & Surge Egress Distribution

| Parameter | Default Value | Status | Rationale |
|---|---|---|---|
| Direction split | 55% South / 45% North | `ESTIMATE` | Historical matchday ridership shows heavier flow toward central Ahmedabad / APMC (old city & western suburbs) than Gandhinagar. |
| Pre-T0 egress fraction | 10% | `ESTIMATE` | Early leavers departing between T-15 and T0 to beat traffic or after lopsided match conclusions. |
| Peak egress window | 70% in T0 to T+40 | `ESTIMATE` | Mass stadium evacuation following presentation ceremony, peaking sharply around T+15. |
| Dispersed tail fraction | 20% in T+40 to T+120 | `ESTIMATE` | Fans lingering at merchandise stalls, hospitality lounges, and outer concourses. |
| Rain compression factor | 1.25 | `ESTIMATE` | Sudden rain causes spectators to evacuate open seating immediately upon match stoppage. |

---

## 3. Rolling Stock & Signalling

| Parameter | Default Value | Status | Rationale |
|---|---|---|---|
| Rake configuration | 3-car permanently coupled | Verified | `rolling_stock.yaml`: DMC + TC + DMC trainset. |
| Comfort seating + standing | 450 pax | Verified | 136 seated + 314 standing @ 3.0 pax/m² (GMRC Phase-2 DPR). |
| Maximum comfort load factor | 0.85 (382 pax/train) | Policy Benchmark | `policy.yaml` mandates max 0.85 load factor; crush loads (764 pax) are never scheduled in plan. |
| Arrival load factor | 25% (112 pax) | `ESTIMATE` | Regular revenue passengers already on board when train arrives from upstream at night. |
| Available boarding capacity | 270 pax/train (pass-through) | Derived | Comfort capacity (382) minus arrival load (112). |
| Shuttle boarding capacity | 382 pax/train (originating) | Derived | Empty shuttle originating at Motera has 0 arrival load. |
| Door flow rate | 1.3 pax/sec/door | `ESTIMATE` | 12 doors per side (4 per coach) allowing max ~468 pax exchange in 30 seconds. |
| Standard intermediate dwell | 30 seconds | Verified | Timetable baseline. |
| Matchday extended dwell | 60 seconds | Verified | Permitted by `policy.yaml` and matchday advisory. |
| Baseline matchday headway | 6 minutes | Verified | `timetable.csv` row `event_matchday`. |
| AI plan minimum headway | 3 minutes | `ESTIMATE` | Safe practical operational minimum (CBTC moving-block signalling can achieve 90s, but 3 min prevents junction bunching). |
| Southbound short-turn point | STN_12 (Sabarmati Rly Stn) | `ASSUMPTION` | Crossover track available; round-trip shuttle time ~18 min. Flagged in UI for operator confirmation. |
| Northbound short-turn point | STN_23 (GNLU) | Policy Benchmark | Explicitly permitted in `policy.yaml`; round-trip shuttle time ~22 min. |
| Standby rakes | 4 rakes (range 0-8) | Precedent Data | `precedents.csv` notes GMRC dispatched all 4 standby rakes during previous major surges. |

---

## 4. Qualitative Precedent Sanity Check

- **IPL 2026 Final (Narendra Modi Stadium):**
  - Precedent recorded severe entrance queues between 23:30 and 01:00 (approx 90 min queue duration) with 5-minute headways and paper tickets.
  - The simulated **Current Plan Baseline** for Preset 1 produces platform densities climbing to 2.8-3.1 pax/m² and queue clearance times of ~118 minutes, matching real-world observations.
  - The **AI Plan** compresses platform density safely below 2.0 pax/m² through concourse holding gates and 4 staged empty shuttles, clearing the surge in ~68 minutes.
