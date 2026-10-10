# MetroPulse Demand Engine (Egress Crowd Flow)
import numpy as np
from typing import Dict, Tuple


def calculate_minute_arrivals(
    attendance: int,
    metro_mode_share: float,
    rain: bool = False,
    walk_time_min: int = 5,
    t_start: int = -30,
    t_end: int = 240,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Computes minute-by-minute passenger arrivals at the station gates.
    Time axis: t=0 is the event end time.
    Returns:
        total_arrivals: array of length (t_end - t_start + 1)
        southbound_arrivals: 55% split towards APMC/Ahmedabad
        northbound_arrivals: 45% split towards Gandhinagar
    """
    total_riders = int(attendance * metro_mode_share)
    total_minutes = t_end - t_start + 1
    t_range = np.arange(t_start, t_end + 1)  # -30 to 240

    # Walking time delay
    effective_walk = int(walk_time_min * (1.4 if rain else 1.0))

    # Egress shape distribution:
    # 1. Pre-T0 departures (approx 10% leave in last 15 min, t = -15 to 0)
    # 2. Main mass surge (approx 70% leave in first 40 min after T0, peak at ~15 min)
    # 3. Dispersed tail (approx 20% leave in t = 40 to 120)
    
    # Pre-T0 Gaussian centered around -5 min with sigma ~ 5
    pre_t0_pdf = np.exp(-0.5 * ((t_range - (-5 + effective_walk)) / 4.5) ** 2)
    pre_t0_pdf[t_range < -15 + effective_walk] = 0
    pre_t0_pdf[t_range > 5 + effective_walk] = 0

    # Main surge Gaussian or skew-normal centered at T+15
    peak_loc = 12 if rain else 15
    peak_sigma = 8 if rain else 10
    main_pdf = np.exp(-0.5 * ((t_range - (peak_loc + effective_walk)) / peak_sigma) ** 2)
    main_pdf[t_range < 0 + effective_walk] = 0

    # Tail exponential decay from T+35 to T+120
    tail_loc = 40 + effective_walk
    tail_pdf = np.zeros_like(t_range, dtype=float)
    tail_mask = t_range >= tail_loc
    tail_pdf[tail_mask] = np.exp(-(t_range[tail_mask] - tail_loc) / 30.0)

    # Normalize components
    p1 = 0.10
    p2 = 0.72 if not rain else 0.76
    p3 = 1.0 - p1 - p2

    if np.sum(pre_t0_pdf) > 0:
        pre_t0_pdf = pre_t0_pdf / np.sum(pre_t0_pdf) * p1
    if np.sum(main_pdf) > 0:
        main_pdf = main_pdf / np.sum(main_pdf) * p2
    if np.sum(tail_pdf) > 0:
        tail_pdf = tail_pdf / np.sum(tail_pdf) * p3

    combined_pdf = pre_t0_pdf + main_pdf + tail_pdf
    if np.sum(combined_pdf) > 0:
        combined_pdf = combined_pdf / np.sum(combined_pdf)

    total_arrivals = np.round(combined_pdf * total_riders).astype(int)
    
    # Ensure exact sum matches total_riders
    diff = total_riders - np.sum(total_arrivals)
    if diff != 0 and len(total_arrivals) > 45:
        total_arrivals[15 - t_start] += diff

    # Split: 55% Southbound (APMC side), 45% Northbound (Gandhinagar side)
    southbound_arrivals = np.round(total_arrivals * 0.55).astype(int)
    northbound_arrivals = total_arrivals - southbound_arrivals

    return total_arrivals, southbound_arrivals, northbound_arrivals
