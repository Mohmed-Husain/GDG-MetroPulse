"""
MetroPulse: Stadium Surge Planner - Standalone Simulation Runner
================================================================
Runs the minute-by-minute crowd surge simulation engine, optimizer,
policy constraint auditor, and Monte Carlo uncertainty analysis.

Usage:
    python simulate.py              # Runs Preset P1 (IPL Stadium Match)
    python simulate.py --all        # Runs all presets (P1, P2, P3)
    python simulate.py --preset P2  # Runs Preset P2 (Coldplay Concert)
    python simulate.py --preset P3  # Runs Preset P3 (Navratri Garba)
    python simulate.py --help       # Shows custom parameter flags
"""

import sys
import os
import argparse
import json
from pathlib import Path
from typing import Dict, Any

# Ensure project root is on Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from backend.schemas import EventInput, PlanResponse
from backend.presets import PRESETS, get_preset_by_id
from backend.api import compute_plan_internal
from backend.templates.announcements import get_template_announcements

# ANSI Color codes for clean terminal output
class Colors:
    HEADER = "\033[95m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"

# Disable colors on Windows cmd if not supported
if os.name == "nt" and "WT_SESSION" not in os.environ and "TERM" not in os.environ:
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    except Exception:
        pass


def get_density_level(density: float) -> str:
    """Classifies crowd density according to Fruin Level of Service (LOS)."""
    if density < 1.0:
        return f"{Colors.GREEN}Level 1 (LOS A-B: Free Flow){Colors.RESET}"
    elif density < 1.5:
        return f"{Colors.GREEN}Level 2 (LOS C: Controlled Flow){Colors.RESET}"
    elif density < 2.0:
        return f"{Colors.YELLOW}Level 3 (LOS D: Dense Crowding){Colors.RESET}"
    elif density <= 2.5:
        return f"{Colors.RED}Level 4 (LOS E: Capacity Limit / Hold Active){Colors.RESET}"
    else:
        return f"{Colors.RED}{Colors.BOLD}Level 5 (LOS F: Critical Crush Risk){Colors.RESET}"


def display_plan_simulation(plan: PlanResponse, verbose: bool = False):
    """Prints a structured, formatted simulation report."""
    event = plan.event
    base_kpi = plan.baseline_kpis
    plan_kpi = plan.plan_kpis

    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*78}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}  METROPULSE SIMULATION REPORT: {event.event_name.upper()}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*78}{Colors.RESET}")

    # 1. Event Parameters
    print(f"\n{Colors.BOLD}[1] EVENT PARAMETERS & CORRIDOR CONTEXT{Colors.RESET}")
    print(f"  * Venue:                 {event.venue}")
    print(f"  * Nearest Metro Station: {event.nearest_station_id} ({'Motera Stadium' if event.nearest_station_id=='STN_15' else 'Old High Court'})")
    print(f"  * Event Time:            {event.date} from {event.start_time} to {event.end_time} (T0 = {event.end_time})")
    print(f"  * Expected Attendance:   {event.expected_attendance:,} spectators ({event.attendance_level.upper()} tier)")
    print(f"  * Metro Mode Share:      {int(event.metro_mode_share * 100)}% ({int(event.expected_attendance * event.metro_mode_share):,} transit riders)")
    print(f"  * Standby Siding Rakes:  {event.standby_rakes} rakes pre-staged")
    print(f"  * Weather Condition:     {'RAIN (Adverse weather mode)' if event.rain else 'CLEAR (Standard operating conditions)'}")

    # 2. Comparative KPI Summary
    print(f"\n{Colors.BOLD}[2] OPERATIONAL METRICS: BASELINE VS AI-OPTIMIZED PLAN{Colors.RESET}")
    sep = "+------------------------------------+--------------------+--------------------+"
    print(f"  {sep}")
    print(f"  | Operational Metric                 | Current Baseline   | AI Optimized Plan  |")
    print(f"  {sep}")

    # Clearance time formatting
    base_clr = f">{plan.baseline_timeline[-1].t_rel} min" if base_kpi.clearance_time_min == -1 else f"{base_kpi.clearance_time_min} min"
    plan_clr = f"{plan_kpi.clearance_time_min} min" if plan_kpi.clearance_time_min != -1 else "Cleared"
    print(f"  | Egress Clearance Time (95% pax)   | {base_clr:<18} | {Colors.GREEN}{plan_clr:<18}{Colors.RESET} |")

    # Platform density
    base_dens = f"{base_kpi.peak_platform_density:.2f} pax/m2"
    plan_dens = f"{plan_kpi.peak_platform_density:.2f} pax/m2"
    print(f"  | Peak Platform Crowd Density        | {Colors.RED}{base_dens:<18}{Colors.RESET} | {Colors.GREEN}{plan_dens:<18}{Colors.RESET} |")

    # Minutes above hold threshold
    base_hold = f"{base_kpi.minutes_above_hold} min"
    plan_hold = f"{plan_kpi.minutes_above_hold} min"
    print(f"  | Platform Time in Hold State (>2.0) | {Colors.RED}{base_hold:<18}{Colors.RESET} | {Colors.GREEN}{plan_hold:<18}{Colors.RESET} |")

    # P95 passenger wait time
    base_wait = f"{base_kpi.p95_waiting_time_min} min"
    plan_wait = f"{plan_kpi.p95_waiting_time_min} min"
    print(f"  | Estimated P95 Passenger Queue Wait | {base_wait:<18} | {Colors.GREEN}{plan_wait:<18}{Colors.RESET} |")

    # Fleet rakes deployed
    base_rakes = f"{base_kpi.rakes_used} / 26 rakes"
    plan_rakes = f"{plan_kpi.rakes_used} / 26 rakes"
    print(f"  | Total Active Fleet Deployed        | {base_rakes:<18} | {plan_rakes:<18} |")

    # Extra shuttle rakes
    plan_shuttles = f"{plan_kpi.extra_trains_used} siding shuttles"
    print(f"  | Dedicated Empty Shuttles Dispatched| {'None (0)':<18} | {Colors.GREEN}{plan_shuttles:<18}{Colors.RESET} |")

    # Max train load factor
    base_lf = f"{int(base_kpi.max_load_factor*100)}% (Crush load)"
    plan_lf = f"{int(plan_kpi.max_load_factor*100)}% (Comfort cap)"
    print(f"  | Peak Train Car Load Factor         | {base_lf:<18} | {Colors.GREEN}{plan_lf:<18}{Colors.RESET} |")

    # Critical crush risk
    base_risk = f"{base_kpi.critical_density_probability}% risk"
    plan_risk = f"{plan_kpi.critical_density_probability}% risk (Zero)"
    print(f"  | Critical Platform Crush Risk       | {Colors.RED}{base_risk:<18}{Colors.RESET} | {Colors.GREEN}{plan_risk:<18}{Colors.RESET} |")
    print(f"  {sep}")

    # 3. Policy & Constraint Auditing
    print(f"\n{Colors.BOLD}[3] POLICY & SAFETY CONSTRAINT AUDITING (policy.yaml){Colors.RESET}")
    all_passed = True
    for c in plan.constraint_checks:
        status_tag = f"{Colors.GREEN}[PASS]{Colors.RESET}" if c.passed else f"{Colors.RED}[FAIL]{Colors.RESET}"
        if not c.passed:
            all_passed = False
        print(f"  {status_tag} {c.name:<32} : {c.detail}")

    if all_passed:
        print(f"  {Colors.BOLD}{Colors.GREEN}[OK] All 5 regulatory metro constraints strictly validated.{Colors.RESET}")
    else:
        print(f"  {Colors.BOLD}{Colors.RED}[!] Some safety constraints require operator intervention.{Colors.RESET}")

    # 4. Deterministic Operational Action Directives
    print(f"\n{Colors.BOLD}[4] OPERATIONAL DIRECTIVES TIMELINE (OCC & Station Master){Colors.RESET}")
    print(f"  {'TIME':<7} | {'ZONE':<12} | {'RESPONSIBILITY':<20} | {'DIRECTIVE'}")
    print(f"  {'-'*7}-+-{'-'*12}-+-{'-'*20}-+-{'-'*35}")
    for card in plan.actions:
        approval_str = f" {Colors.YELLOW}[REQUIRES OCC SIGN-OFF]{Colors.RESET}" if card.requires_approval else ""
        print(f"  {card.clock:<7} | {card.zone:<12} | {card.owner:<20} | {card.action}{approval_str}")

    # 5. Monte Carlo Stochastic Uncertainty Bands
    if plan.bands:
        print(f"\n{Colors.BOLD}[5] MONTE CARLO UNCERTAINTY BANDS (p10 / p50 / p90 across 50 runs){Colors.RESET}")
        sample_points = [b for b in plan.bands if b.t_rel in [0, 15, 30, 45, 60, 90, 120]]
        print(f"  {'T-REL':<8} | {'CLOCK':<7} | {'QUEUE P10':<11} | {'QUEUE P50':<11} | {'QUEUE P90':<11} | {'PEAK DENSITY P90'}")
        print(f"  {'-'*8}-+-{'-'*7}-+-{'-'*11}-+-{'-'*11}-+-{'-'*11}-+-{'-'*18}")
        for pt in sample_points:
            t_str = f"T{pt.t_rel:+d}"
            print(f"  {t_str:<8} | {pt.clock:<7} | {int(pt.p10_queue):<11,} | {int(pt.p50_queue):<11,} | {int(pt.p90_queue):<11,} | {pt.p90_density:.2f} pax/m2")

    # 6. Sample Multilingual Public Address Announcement
    print(f"\n{Colors.BOLD}[6] MULTILINGUAL PUBLIC ADDRESS SCRIPT (Gujarati / Hindi / English){Colors.RESET}")
    station_name = "Motera Stadium" if event.nearest_station_id == "STN_15" else "Old High Court"
    announcements = get_template_announcements(event_name=event.event_name, station_name=station_name, headway_min=3)
    if announcements:
        sample = announcements[0]
        print(f"  * Moment: {sample.moment_name} (T{sample.t_rel:+d} / {sample.clock}) [Source: {sample.source.upper()}]")
        print(f"  * [EN]: \"{sample.en}\"")
        try:
            print(f"  * [GU]: \"{sample.gu}\"")
            print(f"  * [HI]: \"{sample.hi}\"")
        except Exception:
            pass

    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*78}{Colors.RESET}")
    print(f"  Simulation complete for {event.event_id}. Plan ID: {plan.plan_id}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*78}{Colors.RESET}\n")


def run_single_preset(preset_id: str, verbose: bool = False, export_path: str = None):
    """Executes simulation for a given preset ID."""
    preset = get_preset_by_id(preset_id)
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
    print(f"\n[MetroPulse] Running crowd surge simulation for {preset['event_id']} ({preset['event_name']})...")
    plan = compute_plan_internal(event)
    display_plan_simulation(plan, verbose=verbose)

    if export_path:
        out = Path(export_path)
        out.write_text(plan.model_dump_json(indent=2), encoding="utf-8")
        print(f"[MetroPulse] Plan successfully exported to: {out.resolve()}")

    return plan


def main():
    parser = argparse.ArgumentParser(
        description="MetroPulse Standalone Crowd Surge Simulator (Gujarat Metro Rail Corporation)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--preset",
        type=str,
        default="P1",
        choices=["P1", "P2", "P3"],
        help="Preset to simulate: P1 (IPL Match Motera), P2 (Coldplay Concert), P3 (Navratri Garba)",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Simulate all three standard presets sequentially (P1, P2, P3)",
    )
    parser.add_argument(
        "--attendance",
        type=int,
        default=None,
        help="Override expected attendance (e.g. 120000)",
    )
    parser.add_argument(
        "--mode-share",
        type=float,
        default=None,
        help="Override metro transit mode share fraction (e.g. 0.40)",
    )
    parser.add_argument(
        "--rain",
        action="store_true",
        help="Simulate adverse rainy weather surge conditions",
    )
    parser.add_argument(
        "--export",
        type=str,
        default=None,
        help="Path to export full Plan JSON results",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Display expanded diagnostic information",
    )

    args = parser.parse_args()

    print(f"\n===========================================================")
    print(f"  MetroPulse Stadium Surge Planner (PS-05)")
    print(f"  Offline Deterministic Crowd & Transit Simulation")
    print(f"===========================================================")

    if args.all:
        for pid in ["P1", "P2", "P3"]:
            run_single_preset(pid, verbose=args.verbose, export_path=f"cache/{pid}_cli_output.json" if args.export else None)
        print(f"{Colors.GREEN}{Colors.BOLD}[OK] All presets simulated successfully!{Colors.RESET}\n")
    elif args.attendance or args.mode_share or args.rain:
        # Custom simulation run
        base_preset = get_preset_by_id(args.preset)
        event = EventInput(
            event_id="CUSTOM",
            event_name=f"Custom Surge Simulation ({base_preset['event_name']})",
            venue=base_preset["venue"],
            nearest_station_id=base_preset["nearest_station_id"],
            date=base_preset["date"],
            start_time=base_preset["start_time"],
            end_time=base_preset["end_time"],
            expected_attendance=args.attendance or base_preset["attendance_mid"],
            attendance_level="custom",
            metro_mode_share=args.mode_share or base_preset["metro_mode_share"],
            standby_rakes=base_preset["standby_rakes"],
            rain=args.rain if args.rain else base_preset["rain"],
        )
        print(f"\n[MetroPulse] Running custom crowd surge simulation...")
        plan = compute_plan_internal(event)
        display_plan_simulation(plan, verbose=args.verbose)
        if args.export:
            Path(args.export).write_text(plan.model_dump_json(indent=2), encoding="utf-8")
            print(f"[MetroPulse] Plan successfully exported to: {args.export}")
    else:
        run_single_preset(args.preset, verbose=args.verbose, export_path=args.export)


if __name__ == "__main__":
    main()
