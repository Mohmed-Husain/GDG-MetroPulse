import React, { useState } from "react";
import { useMetroStore } from "../store/useMetroStore";
import { parseEventText } from "../services/api";
import { X, Sparkles, Check, AlertCircle } from "lucide-react";

const SAMPLES = [
  {
    name: "IPL 2026 Match Circular",
    text: `URGENT GMRC ADVISORY: IPL Match tonight at Narendra Modi Stadium Motera between GT and CSK. Match concludes around 23:30. Anticipating stadium crowd of 115,000 spectators with 35% metro share. Need high frequency egress shuttles towards APMC.`,
  },
  {
    name: "Coldplay Music Tour Notice",
    text: `SPECIAL EVENT NOTICE: Coldplay Concert at Motera Stadium on 25 Jan 2026. Gates open 17:00, concert ends at 23:45. Expected attendance 110,000. Majority youth crowd using metro (mode share ~45%). Siding trains to be kept on standby.`,
  },
  {
    name: "Navratri Maha Garba Circular",
    text: `COMMISSIONER NOTICE: Sharad Navratri Mega Garba night at GMDC Ground / Riverfront near Old High Court station. Crowd expected 150,000 between 20:00 and 01:30. Extended night operations required until 02:00 AM.`,
  },
];

export const PasteNoticeModal: React.FC = () => {
  const { isPasteModalOpen, setPasteModalOpen, applyParsedEvent } = useMetroStore();
  const [text, setText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isPasteModalOpen) return null;

  const handleParse = async () => {
    if (!text.trim()) return;
    setIsParsing(true);
    setError(null);
    try {
      const res = await parseEventText(text);
      setParsedResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to parse text");
    } finally {
      setIsParsing(false);
    }
  };

  const handleApply = () => {
    if (parsedResult) {
      applyParsedEvent(parsedResult);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-platform border border-hairline rounded shadow-lg w-full max-w-xl p-5 select-none animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div>
            <h3 className="font-signage font-bold text-base text-ink">
              Paste Event Notice / Circular
            </h3>
            <p className="text-xs text-ink-soft">
              Parses messy circulars or WhatsApp notices (English, Hindi, Gujarati) into structured transit plan inputs.
            </p>
          </div>
          <button
            onClick={() => setPasteModalOpen(false)}
            className="p-1 rounded text-ink-soft hover:text-ink"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="mt-3 flex items-center space-x-2 text-xs">
          <span className="text-ink-soft font-medium">Quick paste:</span>
          {SAMPLES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setText(s.text);
                setParsedResult(null);
              }}
              className="px-2 py-0.5 rounded-sm bg-white border border-hairline text-ink hover:border-track transition-colors font-medium text-[11px]"
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <div className="mt-2.5">
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste raw police advisory, stadium circular, or WhatsApp forward message here..."
            className="w-full bg-white border border-hairline rounded-sm p-2.5 text-xs text-ink focus:border-track font-sans"
          />
        </div>

        {/* Action Button */}
        <div className="mt-2 flex justify-between items-center">
          <span className="text-[11px] text-ink-faint">
            Uses local model with regex heuristic fallback if offline.
          </span>
          <button
            onClick={handleParse}
            disabled={isParsing || !text.trim()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-track text-white hover:bg-track-deep font-medium text-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isParsing ? "Extracting..." : "Parse notice"}</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 text-rejected border border-red-200 rounded-sm text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Parsed Result Confirmation Card */}
        {parsedResult && (
          <div className="mt-3 p-3 bg-white border border-hairline rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-ink">Extracted Event Parameters</span>
              <span className="px-1.5 py-0.2 bg-green-100 text-approved text-[10px] font-bold rounded-sm">
                Confidence: {Math.round(parsedResult.confidence * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-ink-soft text-[11px]">Event Name:</span>
                <p className="font-semibold text-ink">{parsedResult.event_name}</p>
              </div>
              <div>
                <span className="text-ink-soft text-[11px]">Target Station:</span>
                <p className="font-semibold text-ink">
                  {parsedResult.nearest_station_id} (Motera Stadium)
                </p>
              </div>
              <div>
                <span className="text-ink-soft text-[11px]">Expected Crowd:</span>
                <p className="font-semibold text-ink">
                  {parsedResult.expected_attendance.toLocaleString()} ({Math.round(parsedResult.metro_mode_share * 100)}% metro share)
                </p>
              </div>
              <div>
                <span className="text-ink-soft text-[11px]">End Time:</span>
                <p className="font-semibold text-ink">{parsedResult.end_time} hrs</p>
              </div>
            </div>

            <div className="pt-2 border-t border-hairline flex justify-end">
              <button
                onClick={handleApply}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-approved hover:bg-green-700 text-white rounded-sm text-xs font-bold transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Apply to Simulator</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
