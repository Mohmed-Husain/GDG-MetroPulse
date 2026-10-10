# MetroPulse Monte Carlo Simulation Engine (Uncertainty Bands p10-p90)
import numpy as np
from typing import List, Dict
from backend.schemas import EventInput, UncertaintyBand
from backend.engine.simulation import run_simulation, format_clock


def run_monte_carlo(
    event: EventInput,
    headway_schedule: Dict[int, int],
    station_area_m2: float = 2100.0,
    runs: int = 60,
    seed: int = 42,
) -> List[UncertaintyBand]:
    """
    Simulates variations across attendance (+-15%), mode share (+-10%),
    and walk timing noise to produce p10, p50, and p90 uncertainty bands.
    """
    rng = np.random.default_rng(seed)
    t_start = -30
    t_end = 240
    time_steps = t_end - t_start + 1

    queue_matrix = np.zeros((runs, time_steps))
    density_matrix = np.zeros((runs, time_steps))

    base_att = event.expected_attendance
    base_share = event.metro_mode_share

    for i in range(runs):
        # Sample stochastic parameters
        att_sample = int(base_att * rng.normal(1.0, 0.08))
        share_sample = float(np.clip(base_share * rng.normal(1.0, 0.06), 0.05, 0.60))

        timeline, _, _ = run_simulation(
            attendance=att_sample,
            metro_mode_share=share_sample,
            end_time_str=event.end_time,
            is_ai_plan=True,
            standby_rakes=event.standby_rakes,
            rain=event.rain,
            station_area_m2=station_area_m2,
            headway_schedule=headway_schedule,
            use_qr_multiplier=True,
            extra_entry_gates=4,
        )

        for step_idx, tm in enumerate(timeline):
            queue_matrix[i, step_idx] = tm.forecourt_queue + tm.concourse_queue
            density_matrix[i, step_idx] = max(tm.platform_density_up, tm.platform_density_down)

    # Compute percentiles
    p10_q = np.percentile(queue_matrix, 10, axis=0)
    p50_q = np.percentile(queue_matrix, 50, axis=0)
    p90_q = np.percentile(queue_matrix, 90, axis=0)

    p10_d = np.percentile(density_matrix, 10, axis=0)
    p50_d = np.percentile(density_matrix, 50, axis=0)
    p90_d = np.percentile(density_matrix, 90, axis=0)

    bands: List[UncertaintyBand] = []
    for step_idx, t_rel in enumerate(range(t_start, t_end + 1)):
        clock = format_clock(event.end_time, t_rel)
        bands.append(
            UncertaintyBand(
                t_rel=t_rel,
                clock=clock,
                p10_queue=float(round(p10_q[step_idx], 0)),
                p50_queue=float(round(p50_q[step_idx], 0)),
                p90_queue=float(round(p90_q[step_idx], 0)),
                p10_density=float(round(p10_d[step_idx], 2)),
                p50_density=float(round(p50_d[step_idx], 2)),
                p90_density=float(round(p90_d[step_idx], 2)),
            )
        )

    return bands
