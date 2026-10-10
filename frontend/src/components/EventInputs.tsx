import React from "react";
import { useMetroStore } from "../store/useMetroStore";
import { CloudRain, FileText, Sparkles, HelpCircle } from "lucide-react";

export const EventInputs: React.FC = () => {
  const {
    event,
    presets,
    selectedPresetId,
    selectPreset,
    updateEvent,
    generatePlan,
    isGenerating,
    isOutOfDate,
    setPasteModalOpen,
  } = useMetroStore();

  const currentPreset = presets.find((p) => p.event_id === selectedPresetId);

  return (
    <section className="bg-platform border-b border-hairline px-4 py-3 select-none">
      {/* Section Header & Explanatory Helper */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div>
          <h2 className="font-signage font-bold text-sm text-ink">
            Plan a busy event
          </h2>
          <p className="text-xs text-ink-soft">
            MetroPulse uses these estimates to simulate queues and compare operating plans.
          </p>
        </div>
        {isOutOfDate && (
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm border border-signal">
            Inputs modified — Click "Generate crowd plan" to update results
          </span>
        )}
      </div>

      {/* Input Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs items-end">
        {/* 1. Event Preset */}
        <div>
          <label className="block text-ink font-semibold mb-1">
            Event preset
          </label>
          <select
            value={selectedPresetId}
            onChange={(e) => selectPreset(e.target.value)}
            className="w-full bg-white border border-hairline rounded-sm px-2.5 py-1.5 text-ink font-medium focus:border-track"
          >
            {presets.map((p) => (
              <option key={p.event_id} value={p.event_id}>
                {p.event_id}: {p.event_name.length > 28 ? `${p.event_name.slice(0, 26)}...` : p.event_name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. People at the event (Attendance) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              className="text-ink font-semibold flex items-center space-x-1"
              title="Total expected event attendees"
            >
              <span>People at event</span>
              <HelpCircle className="w-3 h-3 text-ink-faint" />
            </label>
            <span className="font-mono text-ink-soft font-bold">
              {event.expected_attendance.toLocaleString()}
            </span>
          </div>
          <div className="flex rounded-sm border border-hairline bg-white p-0.5">
            <button
              onClick={() => {
                if (currentPreset) {
                  updateEvent({
                    expected_attendance: currentPreset.attendance_low,
                    attendance_level: "low",
                  });
                }
              }}
              className={`flex-1 py-1 rounded-sm text-[11px] font-medium transition-colors ${
                event.attendance_level === "low"
                  ? "bg-track text-white font-bold"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Low ({((currentPreset?.attendance_low || 75000) / 1000).toFixed(0)}k)
            </button>
            <button
              onClick={() => {
                if (currentPreset) {
                  updateEvent({
                    expected_attendance: currentPreset.attendance_mid,
                    attendance_level: "mid",
                  });
                }
              }}
              className={`flex-1 py-1 rounded-sm text-[11px] font-medium transition-colors ${
                event.attendance_level === "mid"
                  ? "bg-track text-white font-bold"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Mid ({((currentPreset?.attendance_mid || 105000) / 1000).toFixed(0)}k)
            </button>
            <button
              onClick={() => {
                if (currentPreset) {
                  updateEvent({
                    expected_attendance: currentPreset.attendance_high,
                    attendance_level: "high",
                  });
                }
              }}
              className={`flex-1 py-1 rounded-sm text-[11px] font-medium transition-colors ${
                event.attendance_level === "high"
                  ? "bg-track text-white font-bold"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              High ({((currentPreset?.attendance_high || 132000) / 1000).toFixed(0)}k)
            </button>
          </div>
        </div>

        {/* 3. Expected to use the metro (Metro mode share) */}
        <div>
          <label
            className="block text-ink font-semibold mb-1 flex items-center space-x-1"
            title="Estimated percentage of attendees travelling by metro"
          >
            <span>Metro users</span>
            <HelpCircle className="w-3 h-3 text-ink-faint" />
          </label>
          <div className="flex items-center space-x-1.5">
            <input
              type="number"
              min={5}
              max={65}
              step={1}
              value={Math.round(event.metro_mode_share * 100)}
              onChange={(e) =>
                updateEvent({ metro_mode_share: Number(e.target.value) / 100 })
              }
              className="w-16 bg-white border border-hairline rounded-sm px-2 py-1.5 text-center font-mono font-bold text-ink"
            />
            <span className="text-ink-soft text-xs">% of attendees</span>
          </div>
        </div>

        {/* 4. Event ends at */}
        <div>
          <label className="block text-ink font-semibold mb-1">
            Event ends at
          </label>
          <input
            type="time"
            value={event.end_time}
            onChange={(e) => updateEvent({ end_time: e.target.value })}
            className="w-full bg-white border border-hairline rounded-sm px-2.5 py-1.5 font-mono font-bold text-ink"
          />
        </div>

        {/* 5. Extra trains available (Standby rakes) */}
        <div>
          <label
            className="block text-ink font-semibold mb-1 flex items-center space-x-1"
            title="Trains that may be available on siding tracks for additional shuttle service"
          >
            <span>Extra trains</span>
            <HelpCircle className="w-3 h-3 text-ink-faint" />
          </label>
          <div className="flex items-center border border-hairline rounded-sm bg-white">
            <button
              onClick={() =>
                updateEvent({ standby_rakes: Math.max(0, event.standby_rakes - 1) })
              }
              className="px-3 py-1 text-ink-soft hover:text-ink font-bold text-sm"
              title="Decrease available extra trains"
            >
              -
            </button>
            <span className="flex-1 text-center font-mono font-bold text-ink">
              {event.standby_rakes} trains
            </span>
            <button
              onClick={() =>
                updateEvent({ standby_rakes: Math.min(8, event.standby_rakes + 1) })
              }
              className="px-3 py-1 text-ink-soft hover:text-ink font-bold text-sm"
              title="Increase available extra trains"
            >
              +
            </button>
          </div>
        </div>

        {/* 6. Action buttons & Rain toggle */}
        <div className="flex items-center space-x-2">
          {/* Rain Slowdown Toggle */}
          <button
            onClick={() => updateEvent({ rain: !event.rain })}
            className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 rounded-sm border transition-colors ${
              event.rain
                ? "bg-blue-50 text-track border-track font-bold"
                : "bg-white text-ink-soft border-hairline hover:text-ink font-medium"
            }`}
            title="Toggles rain effect (slows walking pace, causes faster stadium exit)"
          >
            <CloudRain className={`w-3.5 h-3.5 ${event.rain ? "text-track" : "text-ink-faint"}`} />
            <span>Rain</span>
          </button>

          {/* Paste Notice */}
          <button
            onClick={() => setPasteModalOpen(true)}
            className="flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-sm bg-white text-ink border border-hairline hover:bg-concrete transition-colors font-medium"
            title="Paste raw WhatsApp circular or event notification"
          >
            <FileText className="w-3.5 h-3.5 text-ink-soft" />
            <span>Paste notice</span>
          </button>

          {/* Generate Crowd Plan Primary Button */}
          <button
            onClick={() => generatePlan()}
            disabled={isGenerating}
            className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-sm text-white font-bold shadow-subtle transition-all whitespace-nowrap ${
              isOutOfDate
                ? "bg-track ring-2 ring-track/30 hover:bg-track-deep"
                : "bg-track hover:bg-track-deep"
            } ${isGenerating ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? "Calculating..." : "Generate crowd plan"}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
