// MetroPulse Zustand Store
import { create } from "zustand";
import type { EventInput, PlanResponse, AnnouncementItem, HealthResponse, PresetEvent } from "../types";
import { fetchPresets, requestPlan, requestAnnouncements, recordApproval, fetchHealth } from "../services/api";

interface MetroState {
  event: EventInput;
  selectedPresetId: string;
  presets: PresetEvent[];
  planData: PlanResponse | null;
  isGenerating: boolean;
  isOutOfDate: boolean;
  currentMinute: number; // T-relative (-30 to 240)
  isPlaying: boolean;
  playbackSpeed: 1 | 4 | 16;
  viewMode: "plan" | "baseline" | "side-by-side";
  activeTab: "actions" | "announcements" | "assumptions";
  announcements: AnnouncementItem[];
  announcementLang: "en" | "gu" | "hi";
  approvalStatus: "none" | "approved" | "rejected";
  approvalTime: string | null;
  undoCountdown: number | null;
  presenterMode: boolean;
  health: HealthResponse | null;
  isPasteModalOpen: boolean;

  // Actions
  init: () => Promise<void>;
  selectPreset: (presetId: string) => void;
  updateEvent: (partial: Partial<EventInput>) => void;
  generatePlan: () => Promise<void>;
  setCurrentMinute: (t: number) => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: 1 | 4 | 16) => void;
  setViewMode: (mode: "plan" | "baseline" | "side-by-side") => void;
  setActiveTab: (tab: "actions" | "announcements" | "assumptions") => void;
  setAnnouncementLang: (lang: "en" | "gu" | "hi") => void;
  approvePlan: () => Promise<void>;
  rejectPlan: () => Promise<void>;
  undoApproval: () => void;
  togglePresenterMode: () => void;
  setPasteModalOpen: (open: boolean) => void;
  applyParsedEvent: (parsed: any) => void;
}

const DEFAULT_EVENT: EventInput = {
  event_id: "P1",
  event_name: "IPL Match: Gujarat Titans vs Mumbai Indians",
  venue: "Narendra Modi Stadium Motera",
  nearest_station_id: "STN_15",
  date: "2026-05-18",
  start_time: "19:30",
  end_time: "23:30",
  expected_attendance: 105000,
  attendance_level: "mid",
  metro_mode_share: 0.35,
  standby_rakes: 4,
  rain: false,
};

export const useMetroStore = create<MetroState>((set, get) => ({
  event: DEFAULT_EVENT,
  selectedPresetId: "P1",
  presets: [],
  planData: null,
  isGenerating: false,
  isOutOfDate: false,
  currentMinute: 15,
  isPlaying: false,
  playbackSpeed: 1,
  viewMode: "plan",
  activeTab: "actions",
  announcements: [],
  announcementLang: "en",
  approvalStatus: "none",
  approvalTime: null,
  undoCountdown: null,
  presenterMode: false,
  health: null,
  isPasteModalOpen: false,

  init: async () => {
    const [presets, health] = await Promise.all([fetchPresets(), fetchHealth()]);
    set({ presets, health });
    await get().generatePlan();
  },

  selectPreset: (presetId: string) => {
    const { presets } = get();
    const target = presets.find((p) => p.event_id === presetId);
    if (!target) return;

    const newEvent: EventInput = {
      event_id: target.event_id,
      event_name: target.event_name,
      venue: target.venue,
      nearest_station_id: target.nearest_station_id,
      date: target.date,
      start_time: target.start_time,
      end_time: target.end_time,
      expected_attendance: target.attendance_mid,
      attendance_level: "mid",
      metro_mode_share: target.metro_mode_share,
      standby_rakes: target.standby_rakes,
      rain: target.rain,
    };

    set({
      selectedPresetId: presetId,
      event: newEvent,
      isOutOfDate: true,
      approvalStatus: "none",
      approvalTime: null,
    });
    get().generatePlan();
  },

  updateEvent: (partial: Partial<EventInput>) => {
    set((state) => ({
      event: { ...state.event, ...partial },
      isOutOfDate: true,
    }));
  },

  generatePlan: async () => {
    const { event } = get();
    set({ isGenerating: true });
    try {
      const plan = await requestPlan(event);
      const announcements = await requestAnnouncements(
        plan.plan_id,
        event.event_name,
        event.end_time,
        event.nearest_station_id === "STN_07" ? "Old High Court" : "Motera Stadium"
      );

      set({
        planData: plan,
        announcements,
        isGenerating: false,
        isOutOfDate: false,
        approvalStatus: "none",
        currentMinute: 15,
      });
    } catch (err) {
      console.error("Plan generation error:", err);
      set({ isGenerating: false });
    }
  },

  setCurrentMinute: (t: number) => {
    set({ currentMinute: Math.max(-30, Math.min(240, t)) });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setPlaybackSpeed: (speed: 1 | 4 | 16) => {
    set({ playbackSpeed: speed });
  },

  setViewMode: (viewMode) => {
    set({ viewMode });
  },

  setActiveTab: (activeTab) => {
    set({ activeTab });
  },

  setAnnouncementLang: (announcementLang) => {
    set({ announcementLang });
  },

  approvePlan: async () => {
    const { planData } = get();
    if (!planData) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    await recordApproval(planData.plan_id, "approved");
    set({
      approvalStatus: "approved",
      approvalTime: now,
      undoCountdown: 10,
    });

    const interval = setInterval(() => {
      const count = get().undoCountdown;
      if (count && count > 1) {
        set({ undoCountdown: count - 1 });
      } else {
        clearInterval(interval);
        set({ undoCountdown: null });
      }
    }, 1000);
  },

  rejectPlan: async () => {
    const { planData } = get();
    if (!planData) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    await recordApproval(planData.plan_id, "rejected");
    set({
      approvalStatus: "rejected",
      approvalTime: now,
      undoCountdown: null,
    });
  },

  undoApproval: () => {
    set({
      approvalStatus: "none",
      approvalTime: null,
      undoCountdown: null,
    });
  },

  togglePresenterMode: () => {
    set((state) => {
      const next = !state.presenterMode;
      if (next) {
        document.body.classList.add("presenter-mode");
      } else {
        document.body.classList.remove("presenter-mode");
      }
      return { presenterMode: next };
    });
  },

  setPasteModalOpen: (isPasteModalOpen) => {
    set({ isPasteModalOpen });
  },

  applyParsedEvent: (parsed) => {
    set((state) => ({
      event: {
        ...state.event,
        event_name: parsed.event_name,
        venue: parsed.venue,
        nearest_station_id: parsed.nearest_station_id,
        date: parsed.date,
        start_time: parsed.start_time,
        end_time: parsed.end_time,
        expected_attendance: parsed.expected_attendance,
        attendance_level: parsed.attendance_level,
        metro_mode_share: parsed.metro_mode_share,
      },
      isOutOfDate: true,
      isPasteModalOpen: false,
    }));
    get().generatePlan();
  },
}));
