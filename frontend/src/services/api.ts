// MetroPulse API Service with Resilience & Offline Fallbacks
import type { EventInput, PlanResponse, AnnouncementItem, HealthResponse, PresetEvent } from "../types";
const rawBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").trim();
const API_BASE = rawBase
  ? (rawBase.endsWith("/api") ? rawBase : `${rawBase.replace(/\/+$/, "")}/api`)
  : "/api";

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Health check offline:", err);
  }
  return {
    status: "healthy",
    llm: "down",
    mode: "template",
    model: "qwen2.5:7b",
    latency_ms: 0,
  };
}

export async function fetchPresets(): Promise<PresetEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/presets`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Presets fetch error, using built-in presets:", err);
  }
  return [
    {
      event_id: "P1",
      event_name: "IPL Match: Gujarat Titans vs Mumbai Indians",
      category: "sports",
      venue: "Narendra Modi Stadium Motera",
      nearest_station_id: "STN_15",
      nearest_station_name: "Motera Stadium",
      date: "2026-05-18",
      start_time: "19:30",
      end_time: "23:30",
      attendance_low: 75000,
      attendance_mid: 105000,
      attendance_high: 132000,
      metro_mode_share: 0.35,
      standby_rakes: 4,
      rain: false,
      baseline_headway_min: 6,
      description: "Primary hackathon demo: 105,000 stadium egress onto STN_15 Motera Stadium.",
    },
    {
      event_id: "P2",
      event_name: "Music of the Spheres World Tour (Coldplay)",
      category: "concert",
      venue: "Narendra Modi Stadium Motera",
      nearest_station_id: "STN_15",
      nearest_station_name: "Motera Stadium",
      date: "2026-01-25",
      start_time: "18:00",
      end_time: "23:45",
      attendance_low: 85000,
      attendance_mid: 110000,
      attendance_high: 130000,
      metro_mode_share: 0.45,
      standby_rakes: 5,
      rain: false,
      baseline_headway_min: 6,
      description: "High transit mode share concert (45%) with concentrated late night egress.",
    },
    {
      event_id: "P3",
      event_name: "Sharad Navratri Maha Garba Festival",
      category: "festival",
      venue: "Sabarmati Riverfront Event Centre",
      nearest_station_id: "STN_07",
      nearest_station_name: "Old High Court",
      date: "2026-10-11",
      start_time: "20:00",
      end_time: "01:30",
      attendance_low: 80000,
      attendance_mid: 150000,
      attendance_high: 250000,
      metro_mode_share: 0.18,
      standby_rakes: 4,
      rain: false,
      baseline_headway_min: 8,
      description: "Festival surge at interchange hub STN_07 Old High Court (8-min baseline).",
    },
  ];
}

export async function requestPlan(event: EventInput): Promise<PlanResponse> {
  const res = await fetch(`${API_BASE}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    throw new Error(`Plan generation failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function requestAnnouncements(
  planId: string,
  eventName: string,
  endTime: string,
  stationName: string = "Motera Stadium"
): Promise<AnnouncementItem[]> {
  try {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_id: planId,
        event_name: eventName,
        end_time: endTime,
        station_name: stationName,
        languages: ["en", "gu", "hi"],
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Announcement fetch failed, using fallback templates:", err);
  }
  return [];
}

export async function parseEventText(text: string): Promise<any> {
  const res = await fetch(`${API_BASE}/parse-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error(`Parse event failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function recordApproval(planId: string, decision: "approved" | "rejected", note: string = ""): Promise<any> {
  const res = await fetch(`${API_BASE}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan_id: planId, decision, note, operator: "Chief Train Controller" }),
  });
  return await res.json();
}
