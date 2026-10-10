import React from "react";
import { useMetroStore } from "../store/useMetroStore";
import { Cpu, Presentation, Info, AlertTriangle } from "lucide-react";

export const Header: React.FC = () => {
  const { health, presenterMode, togglePresenterMode, announcementLang, setAnnouncementLang, isOutOfDate, event } =
    useMetroStore();

  const llmStatus = health?.llm || "down";

  return (
    <header className="bg-platform border-b border-hairline px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Brand & Wordmark with Event Context */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5" aria-hidden="true">
          <div className="w-2.5 h-2.5 rounded-full bg-track"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-ai-plan"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-signal"></div>
        </div>
        <div>
          <div className="flex items-baseline space-x-2">
            <span className="font-signage font-bold text-lg tracking-tight text-ink">
              MetroPulse
            </span>
            <span className="text-xs text-ink-soft font-medium">
              Crowd plan for a major event
            </span>
          </div>
          <p className="text-[11px] text-ink-faint">
            {event.nearest_station_id === "STN_07" ? "Old High Court Station" : "Motera Stadium Station"} · {event.venue}
          </p>
        </div>
      </div>

      {/* Status Badges & Mode Indicators */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Simulated Data Badge */}
        <span
          className="px-2.5 py-1 rounded-sm bg-shelter text-ink-soft border border-hairline font-medium flex items-center space-x-1"
          title="This is a prototype using simulated inputs and outputs."
        >
          <Info className="w-3 h-3 text-ink-faint" />
          <span>Simulated data</span>
        </span>

        {/* Truthful Offline Status Badge */}
        <div
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-sm bg-green-50 text-approved border border-green-200"
          title="Application assets, queue models, and template announcements run locally without external APIs."
        >
          <span className="w-2 h-2 rounded-full bg-approved"></span>
          <span className="font-medium">Offline support configured</span>
        </div>

        {/* Human-Readable AI / Template Status Badge */}
        <div
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-sm bg-white text-ink border border-hairline"
          title={
            llmStatus === "up"
              ? "The local language model is responding."
              : "The crowd plan works offline; announcements use reviewed transit templates."
          }
        >
          <Cpu className="w-3.5 h-3.5 text-ink-soft" />
          <span className="font-medium">
            {llmStatus === "up" ? "AI writing available" : "Using saved scripts"}
          </span>
        </div>

        {/* Out-of-date notice if inputs changed */}
        {isOutOfDate && (
          <div
            className="flex items-center space-x-1 px-2.5 py-1 rounded-sm bg-amber-50 text-amber-900 border border-signal font-medium animate-pulse"
            title="Your inputs changed. Generate a new plan before reviewing or approving it."
          >
            <AlertTriangle className="w-3 h-3 text-signal" />
            <span>Plan needs to be regenerated</span>
          </div>
        )}

        {/* Language Selector */}
        <div
          className="flex items-center space-x-0.5 border border-hairline rounded-sm bg-white p-0.5"
          role="group"
          aria-label="Language selection"
        >
          <button
            onClick={() => setAnnouncementLang("en")}
            className={`px-2 py-0.5 rounded-sm font-medium transition-colors ${
              announcementLang === "en" ? "bg-track text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setAnnouncementLang("gu")}
            className={`px-2 py-0.5 rounded-sm font-medium transition-colors ${
              announcementLang === "gu" ? "bg-track text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            ગુજરાતી
          </button>
          <button
            onClick={() => setAnnouncementLang("hi")}
            className={`px-2 py-0.5 rounded-sm font-medium transition-colors ${
              announcementLang === "hi" ? "bg-track text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            हिन्दी
          </button>
        </div>

        {/* Presenter Mode Hotkey Toggle */}
        <button
          onClick={togglePresenterMode}
          title="Presenter mode (Hotkey: P) — Enlarges typography and simplifies view for presentations"
          className={`px-2.5 py-1 rounded-sm flex items-center space-x-1.5 border border-hairline transition-colors ${
            presenterMode ? "bg-ai-plan text-white border-ai-plan" : "bg-white text-ink-soft hover:text-ink"
          }`}
        >
          <Presentation className="w-3.5 h-3.5" />
          <span className="font-medium">Presenter</span>
          <span className="font-mono text-[10px] bg-concrete/60 px-1 py-0.2 rounded border border-hairline">P</span>
        </button>
      </div>
    </header>
  );
};
