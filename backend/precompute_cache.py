# Precompute cache for P1, P2, P3
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.schemas import EventInput
from backend.presets import PRESETS
from backend.api import compute_plan_internal, CACHE_DIR

def main():
    print("Precomputing cached plans for presets P1, P2, P3...")
    for preset in PRESETS:
        event = EventInput(
            event_id=preset["event_id"],
            event_name=preset["event_name"],
            venue=preset["venue"],
            nearest_station_id=preset["nearest_station_id"],
            date=preset["date"],
            start_time=preset["start_time"],
            end_time=preset["end_time"],
            expected_attendance=preset["attendance_mid"],
            attendance_level="mid",
            metro_mode_share=preset["metro_mode_share"],
            standby_rakes=preset["standby_rakes"],
            rain=preset["rain"],
        )
        plan = compute_plan_internal(event)
        target = CACHE_DIR / f"{preset['event_id']}.json"
        target.write_text(plan.model_dump_json(indent=2), encoding="utf-8")
        print(f"Cached {preset['event_id']} -> {target.name} (Clearance: {plan.plan_kpis.clearance_time_min}m, Peak Density: {plan.plan_kpis.peak_platform_density})")
    print("Precomputation finished successfully!")

if __name__ == "__main__":
    main()
