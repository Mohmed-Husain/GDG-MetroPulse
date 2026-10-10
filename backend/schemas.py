# MetroPulse Pydantic Schemas (v2)
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class EventInput(BaseModel):
    event_id: Optional[str] = "P1"
    event_name: str = "IPL Match: Gujarat Titans vs Mumbai Indians"
    venue: str = "Narendra Modi Stadium Motera"
    nearest_station_id: str = "STN_15"
    date: str = "2026-05-18"
    start_time: str = "19:30"
    end_time: str = "23:30"
    expected_attendance: int = 105000
    attendance_level: str = "mid"  # "low", "mid", "high"
    metro_mode_share: float = 0.35
    standby_rakes: int = 4
    rain: bool = False
    overrides: Optional[Dict[str, Any]] = None


class ParsedEvent(BaseModel):
    event_name: str
    venue: str
    nearest_station_id: str
    date: str
    start_time: str
    end_time: str
    expected_attendance: int
    attendance_level: str = "mid"
    confidence: float
    notes: str
    metro_mode_share: float = 0.35


class TimelineMinute(BaseModel):
    t_rel: int  # relative to T0 (-30 to +240)
    clock: str  # HH:MM
    arrivals: int
    forecourt_queue: int
    concourse_queue: int
    gates_entry_open: int
    gate_state: str  # "normal", "throttled", "held", "reversed"
    platform_density_up: float  # pax/m2
    platform_density_down: float  # pax/m2
    trains_departed_up: int
    trains_departed_down: int
    headway_min: float
    hold_state: bool
    hold_location: Optional[str] = None
    pax_on_platform_up: int = 0
    pax_on_platform_down: int = 0
    train_load_factor_up: float = 0.0
    train_load_factor_down: float = 0.0
    is_shuttle_train_up: bool = False
    is_shuttle_train_down: bool = False


class UncertaintyBand(BaseModel):
    t_rel: int
    clock: str
    p10_queue: float
    p50_queue: float
    p90_queue: float
    p10_density: float
    p50_density: float
    p90_density: float


class ActionCard(BaseModel):
    id: str
    t_rel: int
    clock: str
    owner: str  # Station controller, OCC, Security, Platform staff, PA announcer
    action: str
    reason: str
    trigger: str
    zone: str  # Forecourt, Concourse, Gates, Platform Up, Platform Down, Mainline
    requires_approval: bool = False
    status: str = "pending"


class KPIs(BaseModel):
    clearance_time_min: int  # -1 if not cleared within 4h
    peak_platform_density: float
    minutes_above_hold: int
    p95_waiting_time_min: int
    rakes_used: int
    extra_trains_used: int = 0
    max_load_factor: float
    critical_density_probability: float  # percentage 0-100


class ConstraintCheck(BaseModel):
    name: str
    passed: bool
    detail: str


class PlanResponse(BaseModel):
    plan_id: str
    event: EventInput
    baseline_timeline: List[TimelineMinute]
    plan_timeline: List[TimelineMinute]
    baseline_kpis: KPIs
    plan_kpis: KPIs
    actions: List[ActionCard]
    bands: List[UncertaintyBand]
    assumptions: List[str]
    constraint_checks: List[ConstraintCheck]


class AnnouncementItem(BaseModel):
    moment_id: str
    moment_name: str
    t_rel: int
    clock: str
    en: str
    gu: str
    hi: str
    source: str = "template"  # "llm" or "template"
    is_draft: bool = False


class AnnouncementRequest(BaseModel):
    plan_id: str
    event_name: str
    end_time: str
    station_name: str = "Motera Stadium"
    languages: List[str] = ["en", "gu", "hi"]


class ApprovalRequest(BaseModel):
    plan_id: str
    decision: str  # "approved" or "rejected"
    note: Optional[str] = ""
    operator: Optional[str] = "Station Controller"


class ApprovalResponse(BaseModel):
    plan_id: str
    status: str
    timestamp: str
    message: str


class HealthResponse(BaseModel):
    status: str = "healthy"
    llm: str  # "up" or "down"
    mode: str  # "full", "template", "cached"
    model: str
    latency_ms: int
