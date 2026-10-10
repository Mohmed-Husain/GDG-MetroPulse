# MetroPulse FastAPI Backend
import os
import time
import json
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.schemas import (
    EventInput,
    ParsedEvent,
    PlanResponse,
    AnnouncementItem,
    AnnouncementRequest,
    ApprovalRequest,
    ApprovalResponse,
    HealthResponse,
    KPIs,
    ConstraintCheck,
)
from backend.presets import PRESETS, get_preset_by_id
from backend.engine.simulation import run_simulation
from backend.engine.optimizer import optimize_plan
from backend.engine.monte_carlo import run_monte_carlo
from backend.engine.actions import generate_action_cards
from backend.templates.announcements import get_template_announcements
from backend.llm import (
    check_llm_health,
    parse_event_text,
    generate_announcements_llm,
    LLM_MODEL,
)

BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_DIR = BASE_DIR / "cache"
CACHE_DIR.mkdir(exist_ok=True)
APPROVALS_FILE = CACHE_DIR / "approvals.json"
if not APPROVALS_FILE.exists():
    APPROVALS_FILE.write_text("[]", encoding="utf-8")

app = FastAPI(
    title="MetroPulse Stadium Surge Planner API",
    description="Actionable minute-by-minute crowd management planning for Ahmedabad Metro",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def get_health():
    """Health check measuring LLM availability and operating mode."""
    t0 = time.time()
    llm_info = await check_llm_health()
    latency = int((time.time() - t0) * 1000)

    is_llm_up = llm_info.get("available", False)
    mode = "full" if is_llm_up else "template"

    return HealthResponse(
        status="healthy",
        llm="up" if is_llm_up else "down",
        mode=mode,
        model=LLM_MODEL,
        latency_ms=latency,
    )


@app.get("/api/presets")
def get_presets():
    """Returns curated presets (P1 IPL Match, P2 Concert, P3 Navratri Garba)."""
    return PRESETS


@app.post("/api/parse-event", response_model=ParsedEvent)
async def parse_event(payload: Dict[str, str] = Body(...)):
    """Parses unformatted event announcement text into structured EventInput."""
    text = payload.get("text", "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Empty text supplied")
    return await parse_event_text(text)


def compute_plan_internal(event: EventInput) -> PlanResponse:
    """Internal computation core for plan and baseline."""
    # Determine station platform area
    station_area_m2 = 1960.0 if event.nearest_station_id == "STN_07" else 2100.0
    base_headway = 8 if event.nearest_station_id == "STN_07" else 6

    # 1. Simulate Baseline (Current Plan)
    baseline_timeline, baseline_kpis, _ = run_simulation(
        attendance=event.expected_attendance,
        metro_mode_share=event.metro_mode_share,
        end_time_str=event.end_time,
        is_ai_plan=False,
        standby_rakes=0,
        rain=event.rain,
        station_area_m2=station_area_m2,
        headway_schedule=None,
        use_qr_multiplier=False,
        extra_entry_gates=0,
    )

    # 2. Simulate AI Plan with Optimization
    plan_timeline, plan_kpis, constraints, best_schedule = optimize_plan(
        event=event,
        station_area_m2=station_area_m2,
    )

    # 3. Deterministic Action Cards
    actions = generate_action_cards(event=event, timeline=plan_timeline)

    # 4. Monte Carlo Uncertainty Bands
    bands = run_monte_carlo(
        event=event,
        headway_schedule=best_schedule,
        station_area_m2=station_area_m2,
        runs=50,
    )

    # Documented assumptions list
    assumptions = [
        "Usable platform fraction calibrated at 0.60 (stairs/buffers subtracted).",
        "Max comfort load factor capped at 0.85 (crush loads never scheduled).",
        "AFC entry gates: 10 base + 4 reversed in AI plan; 1.3x QR scan multiplier.",
        "Pass-through trains carry 25% background arrival load at night.",
        "Originating shuttle trains carry 0% arrival load, turning back at STN_12/STN_23.",
        "Hold threshold: Fruin LOS E (2.0 pax/m²); resume hysteresis at 1.5 pax/m².",
    ]

    plan_id = f"PLAN_{event.event_id or 'CUSTOM'}_{int(time.time())}"

    return PlanResponse(
        plan_id=plan_id,
        event=event,
        baseline_timeline=baseline_timeline,
        plan_timeline=plan_timeline,
        baseline_kpis=baseline_kpis,
        plan_kpis=plan_kpis,
        actions=actions,
        bands=bands,
        assumptions=assumptions,
        constraint_checks=constraints,
    )


@app.post("/api/plan", response_model=PlanResponse)
async def generate_plan(event: EventInput):
    """Generates baseline vs AI plan comparison, timeline, KPIs, and bands."""
    cache_file = CACHE_DIR / f"{event.event_id or 'CUSTOM'}.json"

    # If preset and clean, check cache first for instant response
    try:
        response = compute_plan_internal(event)
        # Save to cache
        cache_file.write_text(response.model_dump_json(indent=2), encoding="utf-8")
        return response
    except Exception as e:
        # If live computation encounters error, fallback to cache if available
        if cache_file.exists():
            cached_data = json.loads(cache_file.read_text(encoding="utf-8"))
            return PlanResponse(**cached_data)
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@app.post("/api/announcements", response_model=List[AnnouncementItem])
async def generate_announcements(req: AnnouncementRequest):
    """Generates 3-language public address scripts (LLM with template fallback)."""
    return await generate_announcements_llm(
        event_name=req.event_name,
        end_time=req.end_time,
        station_name=req.station_name,
    )


@app.post("/api/approve", response_model=ApprovalResponse)
def approve_plan(payload: ApprovalRequest):
    """Logs human operator decision to local cache/approvals.json."""
    record = {
        "plan_id": payload.plan_id,
        "decision": payload.decision,
        "note": payload.note,
        "operator": payload.operator,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    approvals = []
    if APPROVALS_FILE.exists():
        try:
            approvals = json.loads(APPROVALS_FILE.read_text(encoding="utf-8"))
        except Exception:
            approvals = []
    approvals.append(record)
    APPROVALS_FILE.write_text(json.dumps(approvals, indent=2), encoding="utf-8")

    return ApprovalResponse(
        plan_id=payload.plan_id,
        status="recorded",
        timestamp=record["timestamp"],
        message=f"Plan {payload.plan_id} successfully {payload.decision} by {payload.operator}.",
    )


# Static file serving for single-command production deployment
DIST_DIR = BASE_DIR / "frontend" / "dist"
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        target = DIST_DIR / full_path
        if target.is_file():
            return FileResponse(target)
        return FileResponse(DIST_DIR / "index.html")
