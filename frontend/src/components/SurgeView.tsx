import React, { useEffect, useRef } from "react";
import { useMetroStore } from "../store/useMetroStore";
import type { TimelineMinute } from "../types";
import { Play, Pause, RotateCcw, ShieldAlert } from "lucide-react";

// Crowd ramp mapping with plain English text
export function getCrowdLevel(density: number): {
  level: 1 | 2 | 3 | 4 | 5;
  label: "Light" | "Steady" | "Busy" | "Crowded" | "Critical";
  hex: string;
} {
  if (density < 0.8) return { level: 1, label: "Light", hex: "#5BA8A0" };
  if (density < 1.6) return { level: 2, label: "Steady", hex: "#A8C686" };
  if (density < 2.0) return { level: 3, label: "Busy", hex: "#F2C14E" };
  if (density < 3.2) return { level: 4, label: "Crowded", hex: "#E8743B" };
  return { level: 5, label: "Critical", hex: "#B3243F" };
}

export function getQueueCrowdLevel(queueCount: number, capacity: number): {
  level: 1 | 2 | 3 | 4 | 5;
  label: "Light" | "Steady" | "Busy" | "Crowded" | "Critical";
  hex: string;
} {
  const ratio = queueCount / (capacity || 1);
  if (ratio < 0.25) return { level: 1, label: "Light", hex: "#5BA8A0" };
  if (ratio < 0.55) return { level: 2, label: "Steady", hex: "#A8C686" };
  if (ratio < 0.85) return { level: 3, label: "Busy", hex: "#F2C14E" };
  if (ratio < 1.15) return { level: 4, label: "Crowded", hex: "#E8743B" };
  return { level: 5, label: "Critical", hex: "#B3243F" };
}

interface ZoneDiagramProps {
  minuteData: TimelineMinute | null;
  isAiPlan: boolean;
  planLabel: string;
}

const SingleSurgeDiagram: React.FC<ZoneDiagramProps> = ({ minuteData, isAiPlan, planLabel }) => {
  if (!minuteData) return null;

  // Queues & densities
  const forecourtQueue = minuteData.forecourt_queue;
  const footbridgeQueue = Math.min(2500, Math.round(forecourtQueue * 0.35));
  const concourseQueue = minuteData.concourse_queue;
  const densityUp = minuteData.platform_density_up;
  const densityDown = minuteData.platform_density_down;

  // Levels
  const lvlForecourt = getQueueCrowdLevel(forecourtQueue, 8000);
  const lvlFootbridge = getQueueCrowdLevel(footbridgeQueue, 2500);
  const lvlConcourse = getQueueCrowdLevel(concourseQueue, 3500);
  const lvlUp = getCrowdLevel(densityUp);
  const lvlDown = getCrowdLevel(densityDown);

  const isHolding = minuteData.hold_state;
  const holdLoc = minuteData.hold_location;

  // Human relative time label
  const relativeText =
    minuteData.t_rel === 0
      ? "Event ends now"
      : minuteData.t_rel > 0
      ? `${minuteData.t_rel} min after event ends`
      : `${Math.abs(minuteData.t_rel)} min before event ends`;

  return (
    <div className="bg-platform p-3.5 rounded border border-hairline transition-all">
      {/* Label and Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs font-signage font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm ${
              isAiPlan ? "bg-ai-plan text-white" : "bg-baseline text-white"
            }`}
          >
            {planLabel}
          </span>
          <span className="text-xs text-ink-soft">
            <strong className="text-ink font-mono">{minuteData.clock}</strong> · {relativeText}{" "}
            <span className="text-ink-faint font-mono text-[11px]">(T{minuteData.t_rel >= 0 ? `+${minuteData.t_rel}` : minuteData.t_rel})</span>
          </span>
        </div>

        {isHolding && (
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-signal rounded-sm text-xs font-semibold animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-signal" />
            <span>Entry paused — holding area active for platform safety</span>
          </div>
        )}
      </div>

      {/* SVG Flow Diagram */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 940 230" className="w-full h-auto select-none min-w-[800px]">
          <defs>
            <pattern id={`hatch4-${planLabel}`} width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.4" />
            </pattern>
            <pattern id={`hatch5-${planLabel}`} width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#ffffff" strokeWidth="3" strokeOpacity="0.6" />
            </pattern>
            <marker id="flowArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#7A8594" />
            </marker>
          </defs>

          {/* 1. Outside waiting area (forecourt) */}
          <g transform="translate(10, 20)">
            <rect
              width="145"
              height="115"
              rx="4"
              fill={lvlForecourt.hex}
              stroke={isHolding && holdLoc === "forecourt" ? "#F2A900" : "#C9D0D9"}
              strokeWidth={isHolding && holdLoc === "forecourt" ? "3" : "1"}
              className="transition-colors duration-300"
            />
            {lvlForecourt.level >= 4 && (
              <rect width="145" height="115" rx="4" fill={`url(#hatch${lvlForecourt.level}-${planLabel})`} pointerEvents="none" />
            )}
            <text x="12" y="24" fill="#ffffff" fontWeight="700" fontSize="12" fontFamily="Public Sans">
              Outside waiting area
            </text>
            <text x="12" y="38" fill="#ffffff" fontSize="10" opacity="0.85" fontStyle="italic">
              (forecourt)
            </text>
            <text x="12" y="56" fill="#ffffff" fontSize="11" opacity="0.95" fontWeight="600">
              {lvlForecourt.label} crowd
            </text>
            <text x="12" y="86" fill="#ffffff" fontSize="22" fontWeight="700" fontFamily="Public Sans">
              {forecourtQueue.toLocaleString()}
            </text>
            <text x="12" y="104" fill="#ffffff" fontSize="10" opacity="0.9">
              people in plaza
            </text>
          </g>

          {/* Arrow 1 */}
          <line x1="160" y1="78" x2="190" y2="78" stroke="#7A8594" strokeWidth="2" markerEnd="url(#flowArrow)" />

          {/* 2. Walkway (footbridge) */}
          <g transform="translate(195, 20)">
            <rect
              width="135"
              height="115"
              rx="4"
              fill={lvlFootbridge.hex}
              stroke="#C9D0D9"
              strokeWidth="1"
              className="transition-colors duration-300"
            />
            {lvlFootbridge.level >= 4 && (
              <rect width="135" height="115" rx="4" fill={`url(#hatch${lvlFootbridge.level}-${planLabel})`} pointerEvents="none" />
            )}
            <text x="12" y="24" fill="#ffffff" fontWeight="700" fontSize="12" fontFamily="Public Sans">
              Walkway
            </text>
            <text x="12" y="38" fill="#ffffff" fontSize="10" opacity="0.85" fontStyle="italic">
              (footbridge)
            </text>
            <text x="12" y="56" fill="#ffffff" fontSize="11" opacity="0.95" fontWeight="600">
              {lvlFootbridge.label} flow
            </text>
            <text x="12" y="86" fill="#ffffff" fontSize="22" fontWeight="700" fontFamily="Public Sans">
              {footbridgeQueue.toLocaleString()}
            </text>
            <text x="12" y="104" fill="#ffffff" fontSize="10" opacity="0.9">
              people moving
            </text>
          </g>

          {/* Arrow 2 */}
          <line x1="335" y1="78" x2="365" y2="78" stroke="#7A8594" strokeWidth="2" markerEnd="url(#flowArrow)" />

          {/* 3. Ticket and circulation area (concourse) */}
          <g transform="translate(370, 20)">
            <rect
              width="145"
              height="115"
              rx="4"
              fill={lvlConcourse.hex}
              stroke={isHolding ? "#F2A900" : "#C9D0D9"}
              strokeWidth={isHolding ? "3" : "1"}
              className="transition-colors duration-300"
            />
            {lvlConcourse.level >= 4 && (
              <rect width="145" height="115" rx="4" fill={`url(#hatch${lvlConcourse.level}-${planLabel})`} pointerEvents="none" />
            )}
            <text x="12" y="24" fill="#ffffff" fontWeight="700" fontSize="12" fontFamily="Public Sans">
              Ticket area
            </text>
            <text x="12" y="38" fill="#ffffff" fontSize="10" opacity="0.85" fontStyle="italic">
              (concourse)
            </text>
            <text x="12" y="56" fill="#ffffff" fontSize="11" opacity="0.95" fontWeight="600">
              {isHolding ? "Holding active" : `${lvlConcourse.label} crowd`}
            </text>
            <text x="12" y="86" fill="#ffffff" fontSize="22" fontWeight="700" fontFamily="Public Sans">
              {concourseQueue.toLocaleString()}
            </text>
            <text x="12" y="104" fill="#ffffff" fontSize="10" opacity="0.9">
              waiting at turnstiles
            </text>
          </g>

          {/* Arrow 3 */}
          <line x1="520" y1="78" x2="545" y2="78" stroke="#7A8594" strokeWidth="2" markerEnd="url(#flowArrow)" />

          {/* 4. Ticket Gates */}
          <g transform="translate(550, 20)">
            <rect width="75" height="115" rx="2" fill="#EDEFF2" stroke="#C9D0D9" strokeWidth="1" />
            <text x="12" y="22" fill="#172033" fontWeight="700" fontSize="11">
              GATES
            </text>
            {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
              const isThrottled = isHolding;
              const isReversed = isAiPlan && slotIdx >= 4;
              const slotColor = isThrottled ? "#E1E5EA" : isReversed ? "#6A3FB5" : "#2E7D4F";
              return (
                <rect
                  key={slotIdx}
                  x="10"
                  y={30 + slotIdx * 11}
                  width="55"
                  height="7"
                  rx="1"
                  fill={slotColor}
                  stroke="#ffffff"
                  strokeWidth="0.5"
                />
              );
            })}
            <text x="8" y="106" fill="#4A5568" fontSize="9" fontWeight="600">
              {minuteData.gates_entry_open} open
            </text>
          </g>

          {/* Fork arrows to Platforms */}
          <path d="M 630 65 L 655 45" fill="none" stroke="#7A8594" strokeWidth="2" markerEnd="url(#flowArrow)" />
          <path d="M 630 85 L 655 105" fill="none" stroke="#7A8594" strokeWidth="2" markerEnd="url(#flowArrow)" />

          {/* 5. Platform A (Southbound / APMC) */}
          <g transform="translate(660, 15)">
            <rect
              width="165"
              height="58"
              rx="4"
              fill={lvlUp.hex}
              stroke={lvlUp.level === 5 ? "#B3243F" : "#C9D0D9"}
              strokeWidth={lvlUp.level === 5 ? "2" : "1"}
              className="transition-colors duration-300"
            />
            {lvlUp.level >= 4 && (
              <rect width="165" height="58" rx="4" fill={`url(#hatch${lvlUp.level}-${planLabel})`} pointerEvents="none" />
            )}
            <text x="10" y="18" fill="#ffffff" fontWeight="700" fontSize="11">
              Platform A (Southbound)
            </text>
            <text x="10" y="34" fill="#ffffff" fontSize="13" fontWeight="700" fontFamily="Public Sans">
              {densityUp.toFixed(2)} people/m²
            </text>
            <text x="10" y="49" fill="#ffffff" fontSize="10" opacity="0.95">
              {lvlUp.label} · {minuteData.pax_on_platform_up.toLocaleString()} people waiting
            </text>
          </g>

          {/* Train Pill A */}
          <g transform="translate(835, 15)">
            <rect
              width="95"
              height="58"
              rx="29"
              fill={minuteData.trains_departed_up > 0 ? (minuteData.is_shuttle_train_up ? "#6A3FB5" : "#1F4E9C") : "#EDEFF2"}
              stroke={minuteData.is_shuttle_train_up ? "#6A3FB5" : "#C9D0D9"}
              strokeWidth={minuteData.is_shuttle_train_up ? "2" : "1"}
              className="transition-all duration-300"
            />
            <text
              x="47"
              y="26"
              textAnchor="middle"
              fill={minuteData.trains_departed_up > 0 ? "#ffffff" : "#6B7685"}
              fontSize="10"
              fontWeight="700"
            >
              {minuteData.trains_departed_up > 0 ? (minuteData.is_shuttle_train_up ? "EXTRA SHUTTLE" : "TRAIN") : "BERTH"}
            </text>
            <text
              x="47"
              y="43"
              textAnchor="middle"
              fill={minuteData.trains_departed_up > 0 ? "#ffffff" : "#6B7685"}
              fontSize="10"
              fontWeight="600"
            >
              {minuteData.trains_departed_up > 0 ? `${Math.round(minuteData.train_load_factor_up * 100)}% load` : "Waiting"}
            </text>
          </g>

          {/* 6. Platform B (Northbound / Gandhinagar) */}
          <g transform="translate(660, 82)">
            <rect
              width="165"
              height="58"
              rx="4"
              fill={lvlDown.hex}
              stroke={lvlDown.level === 5 ? "#B3243F" : "#C9D0D9"}
              strokeWidth={lvlDown.level === 5 ? "2" : "1"}
              className="transition-colors duration-300"
            />
            {lvlDown.level >= 4 && (
              <rect width="165" height="58" rx="4" fill={`url(#hatch${lvlDown.level}-${planLabel})`} pointerEvents="none" />
            )}
            <text x="10" y="18" fill="#ffffff" fontWeight="700" fontSize="11">
              Platform B (Northbound)
            </text>
            <text x="10" y="34" fill="#ffffff" fontSize="13" fontWeight="700" fontFamily="Public Sans">
              {densityDown.toFixed(2)} people/m²
            </text>
            <text x="10" y="49" fill="#ffffff" fontSize="10" opacity="0.95">
              {lvlDown.label} · {minuteData.pax_on_platform_down.toLocaleString()} people waiting
            </text>
          </g>

          {/* Train Pill B */}
          <g transform="translate(835, 82)">
            <rect
              width="95"
              height="58"
              rx="29"
              fill={minuteData.trains_departed_down > 0 ? (minuteData.is_shuttle_train_down ? "#6A3FB5" : "#1F4E9C") : "#EDEFF2"}
              stroke={minuteData.is_shuttle_train_down ? "#6A3FB5" : "#C9D0D9"}
              strokeWidth={minuteData.is_shuttle_train_down ? "2" : "1"}
              className="transition-all duration-300"
            />
            <text
              x="47"
              y="26"
              textAnchor="middle"
              fill={minuteData.trains_departed_down > 0 ? "#ffffff" : "#6B7685"}
              fontSize="10"
              fontWeight="700"
            >
              {minuteData.trains_departed_down > 0 ? (minuteData.is_shuttle_train_down ? "EXTRA SHUTTLE" : "TRAIN") : "BERTH"}
            </text>
            <text
              x="47"
              y="43"
              textAnchor="middle"
              fill={minuteData.trains_departed_down > 0 ? "#ffffff" : "#6B7685"}
              fontSize="10"
              fontWeight="600"
            >
              {minuteData.trains_departed_down > 0 ? `${Math.round(minuteData.train_load_factor_down * 100)}% load` : "Waiting"}
            </text>
          </g>

          {/* Bottom Operational Status Bar */}
          <g transform="translate(10, 168)">
            <rect width="920" height="44" rx="2" fill="#EDEFF2" stroke="#C9D0D9" strokeWidth="1" />
            <text x="15" y="27" fill="#172033" fontSize="11" fontWeight="700">
              TRAIN SERVICE: Every {minuteData.headway_min} minutes
            </text>
            <text x="250" y="27" fill="#4A5568" fontSize="11">
              Entering station: <tspan fontWeight="700" fill="#172033">{minuteData.arrivals} people/min</tspan>
            </text>
            <text x="490" y="27" fill="#4A5568" fontSize="11">
              Gate mode: <tspan fontWeight="700" fill={minuteData.gate_state === "held" ? "#F2A900" : "#2E7D4F"}>{minuteData.gate_state === "held" ? "Holding Entry" : minuteData.gate_state === "reversed" ? "Extra Entry Lanes Active" : "Normal Entry"}</tspan>
            </text>
            <text x="730" y="27" fill="#4A5568" fontSize="11">
              Safety target: <tspan fontWeight="700">&le; 2.0 people/m²</tspan>
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export const SurgeView: React.FC = () => {
  const {
    planData,
    currentMinute,
    setCurrentMinute,
    isPlaying,
    togglePlay,
    playbackSpeed,
    setPlaybackSpeed,
    viewMode,
    setViewMode,
  } = useMetroStore();

  const scrubberRef = useRef<HTMLDivElement>(null);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentMinute(currentMinute >= 240 ? -30 : currentMinute + 1);
    }, 1000 / playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, currentMinute, playbackSpeed, setCurrentMinute]);

  // Keyboard navigation (arrows & space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setCurrentMinute(currentMinute + (e.shiftKey ? 15 : 1));
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setCurrentMinute(currentMinute - (e.shiftKey ? 15 : 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentMinute, togglePlay, setCurrentMinute]);

  if (!planData) {
    return (
      <div className="bg-platform p-8 text-center text-ink-soft border-b border-hairline">
        <p>No crowd plan generated yet. Select an event preset and click Generate crowd plan.</p>
      </div>
    );
  }

  // Get current minute data for plan and baseline
  const tStart = -30;
  const minuteIndex = Math.max(0, Math.min(270, currentMinute - tStart));
  const planMinute = planData.plan_timeline[minuteIndex] || null;
  const baselineMinute = planData.baseline_timeline[minuteIndex] || null;

  // Human relative time text
  const currentRelativeText =
    currentMinute === 0
      ? "Event ends now"
      : currentMinute > 0
      ? `${currentMinute} min after event ends`
      : `${Math.abs(currentMinute)} min before event ends`;

  return (
    <section className="bg-platform border-b border-hairline p-4 select-none">
      {/* Section Header with Segmented Plan Switcher and Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="font-signage font-bold text-sm text-ink">
            Where people build up
          </h2>
          <p className="text-xs text-ink-soft">
            Simulated crowd movement through station areas.
          </p>
        </div>

        {/* Plan Switcher */}
        <div className="inline-flex rounded-sm border border-hairline bg-concrete p-0.5 text-xs">
          <button
            onClick={() => setViewMode("plan")}
            className={`px-3 py-1 rounded-sm font-semibold transition-colors ${
              viewMode === "plan" ? "bg-ai-plan text-white shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            Proposed plan
          </button>
          <button
            onClick={() => setViewMode("baseline")}
            className={`px-3 py-1 rounded-sm font-semibold transition-colors ${
              viewMode === "baseline" ? "bg-baseline text-white shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            Current plan
          </button>
          <button
            onClick={() => setViewMode("side-by-side")}
            className={`px-3 py-1 rounded-sm font-semibold transition-colors ${
              viewMode === "side-by-side" ? "bg-track text-white shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            Compare side-by-side
          </button>
        </div>

        {/* 5-Level Crowd Ramp Legend */}
        <div className="flex items-center space-x-2 text-xs text-ink-soft">
          <span className="font-semibold text-ink">Crowd levels:</span>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#5BA8A0]"></span>
            <span>1 Light</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#A8C686]"></span>
            <span>2 Steady</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F2C14E]"></span>
            <span>3 Busy</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#E8743B] hatch-pattern-level4"></span>
            <span>4 Crowded</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#B3243F] hatch-pattern-level5"></span>
            <span className="font-bold text-rejected">5 Critical</span>
          </div>
        </div>
      </div>

      {/* Main Flow Visualisation */}
      {viewMode === "plan" && (
        <SingleSurgeDiagram minuteData={planMinute} isAiPlan={true} planLabel="Proposed Plan" />
      )}
      {viewMode === "baseline" && (
        <SingleSurgeDiagram minuteData={baselineMinute} isAiPlan={false} planLabel="Current Plan" />
      )}
      {viewMode === "side-by-side" && (
        <div className="space-y-3">
          <SingleSurgeDiagram minuteData={baselineMinute} isAiPlan={false} planLabel="Current Plan (Overload)" />
          <SingleSurgeDiagram minuteData={planMinute} isAiPlan={true} planLabel="Proposed Plan (Managed)" />
        </div>
      )}

      {/* Time Scrubber & Controls */}
      <div className="mt-4 pt-3 border-t border-hairline">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          {/* Play, Pause, Reset Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-track text-white hover:bg-track-deep shadow-sm transition-colors text-xs font-semibold"
              title={isPlaying ? "Pause simulation (Space)" : "Play simulation (Space)"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>

            <button
              onClick={() => setCurrentMinute(-30)}
              className="flex items-center space-x-1 px-2 py-1.5 rounded-sm border border-hairline bg-white text-ink-soft hover:text-ink text-xs transition-colors"
              title="Reset slider to 30 min before event end"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Playback Speed Stepper */}
            <div className="inline-flex rounded-sm border border-hairline bg-white p-0.5 text-xs">
              {([1, 4, 16] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-0.5 rounded-sm font-mono font-medium ${
                    playbackSpeed === speed ? "bg-track text-white" : "text-ink-soft hover:text-ink"
                  }`}
                  title={`${speed}x simulation playback speed`}
                >
                  {speed}×
                </button>
              ))}
            </div>
          </div>

          {/* Human-Friendly Time Readout */}
          <div className="text-right">
            <span className="text-xs text-ink-soft mr-2">Time:</span>
            <span className="font-mono text-base font-bold text-ink">
              {planMinute?.clock || "23:30"}
            </span>
            <span className="text-xs text-ink-soft ml-2">
              · {currentRelativeText}
            </span>
            <span className="font-mono text-[11px] text-ink-faint ml-1">
              (T{currentMinute >= 0 ? `+${currentMinute}` : currentMinute})
            </span>
          </div>
        </div>

        {/* Heat Strip Scrubber */}
        <div className="relative" ref={scrubberRef}>
          {/* Heat strip background based on platform density */}
          <div className="h-3 w-full rounded-sm flex overflow-hidden border border-hairline mb-1">
            {planData.plan_timeline.map((tm, idx) => {
              const maxD = Math.max(tm.platform_density_up, tm.platform_density_down);
              const cl = getCrowdLevel(maxD);
              return (
                <div
                  key={idx}
                  className="flex-1 h-full cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: cl.hex }}
                  onClick={() => setCurrentMinute(tm.t_rel)}
                  title={`${tm.clock}: ${maxD} people/m² (${cl.label})`}
                />
              );
            })}
          </div>

          {/* Action markers on slider */}
          <div className="relative h-3 w-full">
            {planData.actions.map((act) => {
              const pct = ((act.t_rel - (-30)) / 270) * 100;
              return (
                <button
                  key={act.id}
                  onClick={() => setCurrentMinute(act.t_rel)}
                  className="absolute -top-1 -translate-x-1/2 w-2 h-3.5 bg-signal border border-amber-900 rounded-sm hover:scale-125 transition-transform z-10"
                  style={{ left: `${pct}%` }}
                  title={`${act.clock}: ${act.action}`}
                />
              );
            })}
          </div>

          {/* Slider input */}
          <input
            type="range"
            min={-30}
            max={240}
            step={1}
            value={currentMinute}
            onChange={(e) => setCurrentMinute(Number(e.target.value))}
            className="w-full accent-track cursor-pointer h-2 bg-shelter rounded-lg"
          />

          {/* Axis markers in plain language */}
          <div className="flex justify-between text-[11px] text-ink-soft mt-1 font-medium">
            <span>30 min before</span>
            <span className="font-bold text-track">Event ends</span>
            <span>30 min after</span>
            <span>1 hr after</span>
            <span>2 hr after</span>
            <span>4 hr after</span>
          </div>
        </div>
      </div>
    </section>
  );
};
