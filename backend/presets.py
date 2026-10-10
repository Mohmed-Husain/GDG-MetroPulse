# MetroPulse Event Presets (P1, P2, P3)
from typing import List, Dict, Any
from backend.schemas import EventInput

PRESETS: List[Dict[str, Any]] = [
    {
        "event_id": "P1",
        "event_name": "IPL Match: Gujarat Titans vs Mumbai Indians",
        "category": "sports",
        "venue": "Narendra Modi Stadium Motera",
        "nearest_station_id": "STN_15",
        "nearest_station_name": "Motera Stadium",
        "date": "2026-05-18",
        "start_time": "19:30",
        "end_time": "23:30",
        "attendance_low": 75000,
        "attendance_mid": 105000,
        "attendance_high": 132000,
        "metro_mode_share": 0.35,
        "standby_rakes": 4,
        "rain": False,
        "baseline_headway_min": 6,
        "description": "Primary hackathon demo: 105,000 stadium egress onto STN_15 Motera Stadium.",
    },
    {
        "event_id": "P2",
        "event_name": "Music of the Spheres World Tour (Coldplay)",
        "category": "concert",
        "venue": "Narendra Modi Stadium Motera",
        "nearest_station_id": "STN_15",
        "nearest_station_name": "Motera Stadium",
        "date": "2026-01-25",
        "start_time": "18:00",
        "end_time": "23:45",
        "attendance_low": 85000,
        "attendance_mid": 110000,
        "attendance_high": 130000,
        "metro_mode_share": 0.45,
        "standby_rakes": 5,
        "rain": False,
        "baseline_headway_min": 6,
        "description": "High transit mode share concert (45%) with concentrated late night egress.",
    },
    {
        "event_id": "P3",
        "event_name": "Sharad Navratri Maha Garba Festival",
        "category": "festival",
        "venue": "Sabarmati Riverfront Event Centre",
        "nearest_station_id": "STN_07",
        "nearest_station_name": "Old High Court",
        "date": "2026-10-11",
        "start_time": "20:00",
        "end_time": "01:30",
        "attendance_low": 80000,
        "attendance_mid": 150000,
        "attendance_high": 250000,
        "metro_mode_share": 0.18,
        "standby_rakes": 4,
        "rain": False,
        "baseline_headway_min": 8,
        "description": "Festival surge at interchange hub STN_07 Old High Court (8-min baseline).",
    },
]


def get_preset_by_id(preset_id: str) -> Dict[str, Any]:
    for p in PRESETS:
        if p["event_id"] == preset_id:
            return p
    return PRESETS[0]
