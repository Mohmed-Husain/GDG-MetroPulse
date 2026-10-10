# MetroPulse: Stadium Surge Planner (PS-05)

**Ahmedabad-Gandhinagar Metro Corridor Crowd Surge Planning System**  
Built for the **GDG Metro Hackathon · Problem Statement PS-05 (Metro Operations)**  
Gujarat Metro Rail Corporation (GMRC)

---

## ⚡ Instant Quick Start (Copy & Paste to Run)

Choose how you want to run the simulation:

### Option A: Launch Interactive Web Simulation Dashboard (Recommended)

Run this single command in your terminal:
```bash
python run.py
```
> **What this does:** Automatically launches the backend simulation engine, loads the compiled React dashboard, and **automatically opens your web browser** to **`http://localhost:8000`**.
> 
> *On Windows, you can also simply double-click [`run.bat`](file:///c:/Users/Husain/Documents/GDGMetro%20Hackathone/run.bat) or run `.\run.bat` in PowerShell / CMD.*

---

### Option B: Run Standalone Terminal Simulation (No Browser Needed)

If you want to run the full simulation engine and view the complete numerical analysis, comparative KPIs, safety constraint audit, and action directives directly in your terminal:

```bash
# Run Primary Matchday Surge Simulation (Preset P1: IPL Match Motera - 105,000 attendance)
python simulate.py
```

```bash
# Run all 3 Event Presets (P1 IPL Match, P2 Coldplay Concert, P3 Navratri Garba)
python simulate.py --all
```

```bash
# Run custom simulation with specific attendance or rainy weather
python simulate.py --preset P1 --attendance 125000 --rain
```

---

## 📋 Prerequisites & Installation

The project runs completely offline with standard Python packages. If running in a fresh environment:

```bash
# 1. Install required Python packages
pip install -r requirements.txt

# 2. Run the simulation
python run.py
```

*Required packages:* `fastapi`, `uvicorn`, `pydantic`, `numpy`, `pyyaml`, `httpx`, `python-dotenv`.

---

## 🎯 What the Simulation Models

Large public events (such as cricket matches at Narendra Modi Stadium Motera or concerts) send 30,000+ passengers into a metro station within 60 minutes. MetroPulse provides station controllers and the Operation Control Centre (OCC) with a minute-by-minute crowd control and transit dispatch plan:

1. **5-Zone Physical Station Flow Model:**
   - Egress path: **Forecourt Plaza → Footbridge → Concourse → Turnstiles / AFC → Up/Down Platforms**.
   - Dynamic crowd density calculation in $\text{pax/m}^2$ across every zone.
   - Hysteresis holding gate logic: meters concourse entry when platform density exceeds **Fruin LOS E ($2.0\text{ pax/m}^2$)** to eliminate platform crush hazards.

2. **Policy-Compliant Transit Dispatch Optimization:**
   - Dynamic 15-minute block headway scheduling ($3\text{ min}$ during peak egress, scaling to $4\text{ min}$, $5\text{ min}$, and $6\text{ min}$).
   - Pre-staged empty siding shuttle trains docked at Sabarmati & Motera sidings.
   - Strict adherence to the 26-rake fleet limit and $90\text{s}$ CBTC safety floor.

3. **Deterministic Minute-by-Minute Action Timeline:**
   - 12 role-specific operational cards assigned to the Station Controller, OCC Chief Train Controller, Security / Police Marshals, and Platform Staff.
   - Clear digital sign-off checkpoints for safety-critical actions.

4. **Monte Carlo Uncertainty Bands ($p10$, $p50$, $p90$):**
   - 50 stochastic runs varying attendance magnitude ($\pm 15\%$), metro mode share ($\pm 10\%$), and passenger walking arrival dispersion.

5. **Multilingual Public Address (PA) Scripts:**
   - Contextual, minute-by-minute station announcements in **Gujarati (ગુજરાતી)**, **Hindi (हिन्दी)**, and **English**.
   - Built-in template fallback ensuring zero-failure offline execution.

6. **Printable Official Operating Order:**
   - Single-click print stylesheet formatted as an official A4 railway circular for Station Masters and Police Marshals.

---

## 🏟️ Built-In Event Presets

| Preset | Event Name | Venue | Nearest Station | Attendance | Metro Share | Baseline Headway |
|:---:|:---|:---|:---:|:---:|:---:|:---:|
| **P1** | **IPL Match: Gujarat Titans vs Mumbai Indians** | Narendra Modi Stadium | STN_15 Motera Stadium | 105,000 | 35% | 6 min |
| **P2** | **Music of the Spheres World Tour (Coldplay)** | Narendra Modi Stadium | STN_15 Motera Stadium | 110,000 | 45% | 6 min |
| **P3** | **Sharad Navratri Maha Garba Festival** | Sabarmati Riverfront | STN_07 Old High Court | 150,000 | 18% | 8 min |

---

## 🛠️ CLI Simulation Options (`simulate.py`)

| Command | Description |
|:---|:---|
| `python simulate.py` | Runs simulation for Preset P1 (IPL Match Motera) |
| `python simulate.py --all` | Runs simulations for all three presets (P1, P2, P3) |
| `python simulate.py --preset P2` | Runs simulation for Preset P2 (Coldplay Concert) |
| `python simulate.py --preset P3` | Runs simulation for Preset P3 (Navratri Garba) |
| `python simulate.py --attendance 120000` | Simulates custom crowd attendance |
| `python simulate.py --mode-share 0.40` | Simulates custom metro transit mode share |
| `python simulate.py --rain` | Simulates adverse rainy weather surge conditions |
| `python simulate.py --export plan.json` | Exports full numerical plan and minute timeline to JSON |
| `python simulate.py --help` | Displays all available command line arguments |

---

## 🌐 Full Web Application Launcher (`run.py`)

| Command | Description |
|:---|:---|
| `python run.py` | Starts full server and auto-opens `http://localhost:8000` |
| `python run.py --port 8080` | Starts server on a custom port |
| `python run.py --cli` | Executes the terminal simulation directly |
| `python run.py --no-browser` | Starts server without auto-opening browser |

---

## 📁 Repository Structure

```
metropulse/
├── run.py                  # Single-command launcher (web server + auto-browser)
├── run.bat                 # Windows 1-click batch launcher (double-clickable)
├── run.ps1                 # Windows PowerShell launcher
├── simulate.py             # Standalone CLI crowd surge simulation runner
├── requirements.txt        # Python backend dependencies
├── README.md               # Documentation & setup guide
├── Makefile                # Standard build and execution targets
├── ASSUMPTIONS.md          # Calibrated engineering parameters & formulas
├── DEMO_SCRIPT.md          # Step-by-step judge demonstration script
├── PITCH.md                # 3-minute hackathon pitch script
├── config/
│   └── stadium.yaml        # Tunable parameters, station capacities & constraints
├── data_inputs/            # Timetable, network, rolling stock, and policy rules
├── cache/                  # Precomputed JSON plans for P1, P2, P3 & approvals
├── backend/
│   ├── api.py              # FastAPI application with static SPA serving
│   ├── schemas.py          # Pydantic v2 data models
│   ├── presets.py          # Presets P1, P2, P3 definitions
│   ├── llm.py              # Offline/online LLM client with template fallbacks
│   ├── precompute_cache.py # Precomputes JSON plans for instant loading
│   ├── engine/             # Crowd flow simulation & optimization engine
│   │   ├── simulation.py   # 5-zone minute-by-minute simulation
│   │   ├── optimizer.py    # Coordinate search headway optimizer
│   │   ├── actions.py      # Deterministic action card generator
│   │   ├── demand.py       # Egress arrival curve distribution
│   │   └── monte_carlo.py  # Stochastic uncertainty bands (p10-p90)
│   └── templates/          # Multilingual public address templates (EN, GU, HI)
└── frontend/               # React 19 + Vite + TypeScript + Tailwind CSS UI
    ├── dist/               # Production build (served directly by run.py)
    └── src/                # Interactive UI source code & Recharts visualization
```

---

## 💡 Troubleshooting

- **Port 8000 already in use:** `run.py` detects if MetroPulse is already running and immediately opens your browser. If a different app is using port 8000, `run.py` automatically binds to the next free port (e.g., 8001).
- **Offline operation:** The application runs 100% offline with zero external network dependencies.
