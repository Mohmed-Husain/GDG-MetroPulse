# MetroPulse — Simulation Model Specification

**Edition:** Clear Operator & Judge Review  
**Author:** Senior Simulation & Operations-Research Engineer  
**Status:** Canonical Reference for MetroPulse Engine

---

## Limitation & Purpose Statement

> **OPERATIONAL LIMITATION STATEMENT**  
> *"This is a deterministic planning prototype using configured and estimated inputs. Its outputs are simulated scenarios, not live crowd measurements or a certification of real-world safety."*

The purpose of the MetroPulse Stadium Surge Planner is to compare an existing baseline transit operating schedule against a feasible, constrained alternative plan during post-event egress surges (e.g. at Narendra Modi Stadium, Motera).

---

## 1. Simulation Inputs

The simulation operates over a discrete time window from **$T-30$ to $T+240$ minutes** (271 one-minute intervals), where $T_0$ is the scheduled event end time (e.g. 23:30).

| Input Parameter | Source / Type | Description / Example |
| :--- | :--- | :--- |
| `expected_attendance` | User / Preset | Stadium crowd (e.g., 105,000 for IPL match) |
| `metro_mode_share` | User / Preset | Proportion using metro (e.g., 0.35 = 35%) |
| `end_time` | User / Preset | Event conclusion clock time (e.g., "23:30") |
| `rain` | User / Preset | Boolean flag; triggers slower walking & compressed egress |
| `standby_rakes` | Configuration | Pre-positioned siding trainsets available (0 to 4) |
| `station_area_m2` | `network.csv` | Total platform footprint (2,100 m² for Motera Stadium) |
| `usable_fraction` | `stadium.yaml` | Usable standing fraction (0.60, excluding buffers & stairs) |
| `fleet_available` | `rolling_stock.yaml` | Maximum active trainsets available (26 rakes) |
| `min_headway` | `policy.yaml` | Signalling practical floor (3.0 minutes) |

---

## 2. Demand Calculation: Attendance to Metro Riders

Total expected transit ridership is:
$$\text{Expected Metro Demand} = \lfloor \text{Event Attendance} \times \text{Metro Mode Share} \rfloor$$
*Example:* $105,000 \times 0.35 = 36,750\text{ passengers}$.

### Egress Curve & Walking Delay
Passengers leave the stadium venue according to a 3-component distribution:
1. **Pre-event early departures** (10%): departing $T-15$ to $T_0$.
2. **Main egress surge** (70%): unimodal surge peaking at $T+15$ min.
3. **Dispersed tail** (20%): gradual departures from $T+40$ to $T+120$ min.

A walking time offset (5 minutes standard, 7 minutes in rain) shifts arrival at the station entrance.
The sum of minute-by-minute arrivals $\sum_{t=-30}^{240} \text{Arrivals}(t)$ matches $\text{Expected Metro Demand}$ exactly.

---

## 3. Five Logical Stages of Station Flow

Passengers progress strictly through 5 capacity-limited physical zones:

```
[Stadium Egress] 
       │
       ▼
1. Outside Station (Forecourt & Holding Pens, Cap: 8,000 pax)
       │ AFC Turnstiles (10-14 gates @ 25-32 pax/min/gate)
       ▼
2. Station Entrance & Ticket Gates
       │ Entry Flow
       ▼
3. Concourse Mezzanine (Cap: 3,500 pax)
       │ Directional Split: 55% Southbound, 45% Northbound
       ▼
4. Platforms (Platform A: Southbound, Platform B: Northbound)
       │ Usable Area: 630 m² per platform side
       ▼
5. Berthing Trains (Scheduled + Standby Shuttles)
       │ Boarding Flow: min(Waiting Pax, Remaining Train Capacity)
       ▼
[Departed Passengers]
```

---

## 4. Queue Calculations & Strict Conservation Law

At every simulated minute $t$:
$$\text{Queue}(t) = \text{Queue}(t-1) + \text{Inflow}(t) - \text{Outflow}(t)$$

### Invariant: Total System Passenger Conservation
At every minute $t$, the sum of passengers across all queues plus departed passengers equals cumulative arrivals:
$$\sum_{i=t_{\text{start}}}^{t} \text{Arrivals}(i) = Q_{\text{forecourt}}(t) + Q_{\text{concourse}}(t) + P_{\text{up}}(t) + P_{\text{down}}(t) + \text{Departed}_{\text{cum}}(t)$$

No passenger is created, destroyed, or double-counted.

### Small Numerical Examples

#### Example A: Queue Growth (Inflow exceeds gate throughput)
- Concourse has 400 passengers.
- Gates process up to 300 pax/min.
- 500 passengers arrive from Forecourt.
- Flow into Concourse = 500. Flow through Gates to Platform = 300.
- New Concourse Queue = $400 + 500 - 300 = 600\text{ passengers}$ (Queue grows by 200).

#### Example B: Train Departure (Outflow reduces platform crowding)
- Platform A has 1,100 passengers waiting.
- Train berths with 270 empty boarding spaces.
- Boarded passengers = $\min(1,100, 270) = 270$.
- Departing train carries 270 passengers away.
- New Platform A Occupancy = $1,100 - 270 = 830\text{ passengers}$.
- Density drops from $1,100 / 630 = 1.75\text{ pax/m²}$ to $830 / 630 = 1.32\text{ pax/m²}$.

---

## 5. Platform Density & Holding Hysteresis

$$\text{Density}_{\text{platform}}(t) = \frac{\text{Passengers on Platform}(t)}{\text{Usable Platform Area} = 630\text{ m²}}$$

### Operating Rules
- **Safe Crowding Target:** $2.0\text{ pax/m²}$ (Fruin LOS E, $\approx 1,260$ people per platform).
- **Hysteresis Holding:**
  - If $\max(\text{Density}_{\text{up}}, \text{Density}_{\text{down}}) \ge 2.0\text{ pax/m²}$: **HOLD ACTIVATED**. Gates meter entry to 15% rate. Excess passengers wait safely in Concourse or Forecourt pens.
  - When density drops below $1.5\text{ pax/m²}$ ($\approx 945$ people): **HOLD RELEASED**. Normal gate flow resumes.
- **Physical Capacity Limit:** Platforms have a physical ceiling ($3.5\text{ pax/m²} = 2,205$ pax). Under no circumstances can flow exceed platform space.

---

## 6. Train Boarding & Fleet Logic

- **Trainset Configuration:** Permanently coupled 3-car rakes.
- **Train Capacity:** 450 passenger nominal comfort capacity; comfort loading capped at 85% ($382$ pax).
- **Pass-through Arrival Load:** Mainline trains arrive with 25% background passenger load ($112$ pax).
- **Available Boarding Space:**
  - Regular Scheduled Train: $382 - 112 = 270\text{ boarding passengers}$.
  - Dedicated Empty Shuttle (originating from Motera siding): $382\text{ boarding passengers}$.
- **Mainline Fleet Requirement:**
  $$\text{Mainline Rakes} = \left\lceil \frac{\text{Corridor Round Trip Time} (75\text{ min})}{\text{Headway (min)}} \right\rceil$$
  - At 6-min headway: $\lceil 75 / 6 \rceil = 13\text{ rakes}$.
  - At 4-min headway: $\lceil 75 / 4 \rceil = 19\text{ rakes}$.
  - At 3-min headway: $\lceil 75 / 3 \rceil = 25\text{ rakes}$.
- **Standby Shuttles:** Maximum 4 standby rakes.
- **Hard Fleet Limit:** $\text{Mainline Rakes} + \text{Active Standby Rakes} \le 26\text{ rakes}$.

---

## 7. Explainable Planner (Coordinate Search)

Rather than an unverified black-box optimizer, MetroPulse uses an **explainable, bounded search**:

1. **Step 1:** Run the baseline simulation (standard 6-minute headway, 0 standby shuttles, no automated holding).
2. **Step 2:** Identify bottleneck periods (minutes where density $\ge 2.0$ or queue exceeds 1,000).
3. **Step 3:** Evaluate candidate operational levers:
   - Headway during peak egress $T_0$ to $T+60$: $\{3, 4, 5, 6\}$ minutes.
   - Headway during mid egress $T+60$ to $T+120$: $\{4, 5, 6\}$ minutes.
   - Headway during tail $T+120$ to $T+240$: $\{6\}$ minutes.
   - Standby shuttles deployed: $\{0, 1, 2, 3, 4\}$.
   - Gate configuration: $\{10\text{ base}, 14\text{ reversed entry}\}$.
4. **Step 4:** Enforce Hard Constraints:
   - Candidate is rejected if $\text{Rakes Required} > 26$.
   - Candidate is rejected if $\min(\text{Headway}) < 3\text{ minutes}$.
5. **Step 5:** Evaluate Candidate Score:
   $$\text{Score} = \text{Clearance Time (min)} + 10 \times \text{Minutes Above Hold} + 5 \times \text{Peak Density} + 1 \times \text{Rakes Used}$$
6. **Step 6:** Select lowest-score feasible candidate and execute complete minute-by-minute simulation.
7. **Step 7:** Validate final result independently.

---

## 8. Hard Operational Constraints (Non-Negotiable)

1. **Fleet Limit:** $\le 26$ active rakes.
2. **Signalling Safety Floor:** Headway $\ge 3$ minutes (practical safe limit above 90s CBTC floor).
3. **Fixed Rake Length:** Permanently coupled 3-car sets (no dynamic decoupling).
4. **Train Capacity:** Cannot board more than available spaces ($270$ regular, $382$ shuttle).
5. **Human Approval:** OCC formal sign-off required for timetable changes and shuttle dispatch.

---

## 9. KPI Calculations

| KPI | Mathematical Definition | Honest Failure Condition |
| :--- | :--- | :--- |
| **Time to Clear Crowd** | First minute $t$ where $\text{Departed}(t) \ge 0.95 \times \text{Demand}$. | If not cleared by $T+240$, returns `-1` (displayed as *"Not cleared within 4 hours"*). |
| **Highest Platform Crowding** | $\max_{t} (\max(\text{Density}_{\text{up}}(t), \text{Density}_{\text{down}}(t)))$ | Platform and minute where peak occurs. |
| **Time Above Crowding Target** | Number of minutes where either platform density $\ge 2.0\text{ pax/m²}$. | Accurately counts single or dual platform hold. |
| **Extra Trains Used** | Number of additional standby rakes deployed by the plan. | Baseline = 0; Plan = count of deployed siding rakes. |

---

## 10. Data Source vs Demo Assumptions

| Item | Status | Source / Note |
| :--- | :--- | :--- |
| Platform Area (2,100 m²) | Verified Data | `network.csv` (Motera Stadium 140m × 15m) |
| Train Capacity (450 pax) | Verified Data | `rolling_stock.yaml` (Hyundai Rotem 3-car rake) |
| Max Fleet (26 rakes) | Verified Data | `rolling_stock.yaml` (32 total − 6 maintenance) |
| Signalling Floor (90s / 3 min) | Verified Data | `policy.yaml` and CBTC technical specifications |
| Usable Area Fraction (0.60) | Demo Assumption | Documented in `ASSUMPTIONS.md` (buffers/stairs) |
| AFC Turnstile Rate (25 pax/min)| Demo Assumption | Standard gate throughput benchmark |
| Mode Share (35%) | Demo Assumption | Typical cricket match transit split |

---

## 11. What the Simulator Does Not Model

To ensure transparency and avoid false precision, the model deliberately **does not** include:
- Individual micro-particle pedestrian dynamics or collision physics.
- Unconstrained arbitrary agent stochastic noise.
- Network-wide electrical traction power load flow.
- Secondary transfer station crowding outside the primary stadium hub and corridor.
- Unverified real-world safety certifications.
