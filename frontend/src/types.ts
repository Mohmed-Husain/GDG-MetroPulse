// MetroPulse TypeScript Type Definitions matching backend schemas

export interface EventInput {
  event_id: string;
  event_name: string;
  venue: string;
  nearest_station_id: string;
  date: string;
  start_time: string;
  end_time: string;
  expected_attendance: number;
  attendance_level: "low" | "mid" | "high";
  metro_mode_share: number;
  standby_rakes: number;
  rain: boolean;
  overrides?: Record<string, any>;
}

export interface PresetEvent {
  event_id: string;
  event_name: string;
  category: string;
  venue: string;
  nearest_station_id: string;
  nearest_station_name: string;
  date: string;
  start_time: string;
  end_time: string;
  attendance_low: number;
  attendance_mid: number;
  attendance_high: number;
  metro_mode_share: number;
  standby_rakes: number;
  rain: boolean;
  baseline_headway_min: number;
  description: string;
}

export interface TimelineMinute {
  t_rel: number;
  clock: string;
  arrivals: number;
  forecourt_queue: number;
  concourse_queue: number;
  gates_entry_open: number;
  gate_state: "normal" | "throttled" | "held" | "reversed";
  platform_density_up: number;
  platform_density_down: number;
  trains_departed_up: number;
  trains_departed_down: number;
  headway_min: number;
  hold_state: boolean;
  hold_location: string | null;
  pax_on_platform_up: number;
  pax_on_platform_down: number;
  train_load_factor_up: number;
  train_load_factor_down: number;
  is_shuttle_train_up: boolean;
  is_shuttle_train_down: boolean;
}

export interface UncertaintyBand {
  t_rel: number;
  clock: string;
  p10_queue: number;
  p50_queue: number;
  p90_queue: number;
  p10_density: number;
  p50_density: number;
  p90_density: number;
}

export interface ActionCard {
  id: string;
  t_rel: number;
  clock: string;
  owner: "Station controller" | "OCC" | "Security" | "Platform staff" | "PA announcer";
  action: string;
  reason: string;
  trigger: string;
  zone: string;
  requires_approval: boolean;
  status: "pending" | "approved" | "acknowledged";
}

export interface KPIs {
  clearance_time_min: number;
  peak_platform_density: number;
  minutes_above_hold: number;
  p95_waiting_time_min: number;
  rakes_used: number;
  extra_trains_used?: number;
  max_load_factor: number;
  critical_density_probability: number;
}

export interface ConstraintCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface PlanResponse {
  plan_id: string;
  event: EventInput;
  baseline_timeline: TimelineMinute[];
  plan_timeline: TimelineMinute[];
  baseline_kpis: KPIs;
  plan_kpis: KPIs;
  actions: ActionCard[];
  bands: UncertaintyBand[];
  assumptions: string[];
  constraint_checks: ConstraintCheck[];
}

export interface AnnouncementItem {
  moment_id: string;
  moment_name: string;
  t_rel: number;
  clock: string;
  en: string;
  gu: string;
  hi: string;
  source: "llm" | "template";
  is_draft: boolean;
}

export interface HealthResponse {
  status: string;
  llm: "up" | "down";
  mode: "full" | "template" | "cached";
  model: string;
  latency_ms: number;
}
