# MetroPulse: Click-by-Click Demo Script for Hackathon Judges

**Time Limit:** 3-4 minutes  
**Audience:** Judges on moving metro train  
**Fallback Strategy:** Every step has an immediate fallback if network or local models fail.

---

## Pre-Demo Checklist (30 seconds before judges arrive)

1. Open your browser to: **`http://localhost:8000`**
2. Notice the top badges:
   - `Simulated data` (Always visible)
   - `● Offline ready` (Green)
   - `Template Mode` or `Full AI Mode`
3. Hit `F11` (or enter fullscreen) on your laptop.

---

## The Presentation Flow

### Step 1: Set the Context (15 seconds)
- **Click:** Leave the app on Preset **`P1: IPL Match`**.
- **Say:**  
  *"Judges, this is MetroPulse. Large stadium events in Ahmedabad send 35,000 to 50,000 spectators to Motera Stadium station within minutes. Here is the unmanaged baseline vs our AI-optimized surge plan."*

### Step 2: Show the Baseline Breakdown (30 seconds)
- **Click:** On the segmented control above the Surge view, click **`Current Plan (Baseline)`** (or **`Side by Side`**).
- **Action:** Drag the time scrubber to **`T+15 min`**.
- **Point out:**  
  - Notice the **Platform Up and Down** turn red (**Level 5 Critical - 3.1 pax/m²**).
  - Notice the hatch overlay warning.
  - Explain: *"Under regular 6-minute matchday timetables, platforms crush, because incoming passengers overwhelm regular pass-through trains carrying background passengers."*

### Step 3: Switch to AI Plan & Show Coordinated Actions (45 seconds)
- **Click:** Click **`AI Plan`** on the segmented control.
- **Point out:**
  1. **Safe Platform Density:** Platforms are green/yellow (**Level 2-3 Steady, < 1.82 pax/m²**).
  2. **Active Concourse Holding:** Point to the yellow amber badge: *"Concourse turnstiles meter entry by 85%, holding crowds safely before they reach the tracks."*
  3. **Violet Train Pills (Shuttles):** Point to the violet train berthing at Platform Up: *"4 empty standby rakes run originating shuttles from Motera to Sabarmati, carrying 382 passengers with zero arrival load."*
- **Click:** Click on **`ACT-06: Concourse holding throttle`** in the right rail timeline.
- **Say:** *"Clicking any directive jumps the controller directly to that exact operational minute."*

### Step 4: KPI Verification & Robustness (30 seconds)
- **Point to the KPI Row & Chart:**
  - **Clearance Time:** Reduced by 48 minutes (from T+118m to T+70m).
  - **Minutes Above Hold:** Dropped from 52 minutes down to zero.
  - **Rakes Deployed:** 16 rakes utilized out of the 26 fleet limit (100% compliant).
  - **Uncertainty Band:** Point to the violet shaded band on the Recharts graph: *"We run a 50-run Monte Carlo simulation to prove robustness even under a +20% crowd spike."*

### Step 5: Trilingual Announcements (30 seconds)
- **Click:** In the right rail, click the **`PA Scripts`** tab.
- **Click:** Click **`ગુજરાતી`** and **`हिन्दी`**.
- **Say:** *"Station controllers get verified public address announcements in Gujarati, Hindi, and English with exact operational timings filled in. Operators can click 'Copy script' to broadcast over station audio systems."*

### Step 6: The Ultimate Resilience Test (30 seconds)
- **Action:** Turn off Wi-Fi on your laptop (or put laptop in Airplane Mode).
- **Click:** Change Attendance from **Mid** to **High (132k)** and click **`Generate plan`**.
- **Say:** *"Watch: the network is completely off, yet the simulation recomputes instantaneously, loads cached precedent safety envelopes, and maintains 100% functionality."*

### Step 7: Official Operator Sign-Off & Print (20 seconds)
- **Click:** Click **`Approve plan`** on the bottom decision bar.
- **Point out:** The green confirmation *"Approved at [HH:MM]"* with a 10-second undo window.
- **Click:** Click **`Print plan`** (or press Ctrl+P).
- **Show:** The clean A4 official transit order ready for station police and station masters.

---

## Fallback Cheat Sheet (If something unexpected happens)

| Scenario | Immediate Fix | What to say |
|---|---|---|
| Local LLM is slow or offline | Nothing needed! UI displays `Template Mode` automatically. | *"Notice our graceful degradation: since network is off, it uses vetted GMRC templates."* |
| Browser page was closed | Reopen `http://localhost:8000` | *"The server is a unified single-binary background service."* |
| Need larger text for judge | Press **`P`** on keyboard | *"Presenter mode toggles enlarged signage typography."* |
| Plan generation hangs | Click **`P1`** preset again | *"Presets are precomputed in local JSON cache."* |
