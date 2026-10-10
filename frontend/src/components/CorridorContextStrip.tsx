import React from "react";
import { useMetroStore } from "../store/useMetroStore";
import { Shield } from "lucide-react";

interface ContextStation {
  id: string;
  name: string;
  protected: boolean;
  isVenue: boolean;
}

export const CorridorContextStrip: React.FC = () => {
  const { event, currentMinute } = useMetroStore();

  const isOldHighCourt = event.nearest_station_id === "STN_07";

  const stations: ContextStation[] = isOldHighCourt
    ? [
        { id: "STN_02", name: "Jivraj Park", protected: false, isVenue: false },
        { id: "STN_03", name: "Rajiv Nagar", protected: false, isVenue: false },
        { id: "STN_04", name: "Shreyas", protected: true, isVenue: false },
        { id: "STN_05", name: "Paldi", protected: true, isVenue: false },
        { id: "STN_06", name: "Gandhigram", protected: true, isVenue: false },
        { id: "STN_07", name: "Old High Court", protected: true, isVenue: true },
        { id: "STN_08", name: "Usmanpura", protected: false, isVenue: false },
        { id: "STN_09", name: "Vijay Nagar", protected: false, isVenue: false },
        { id: "STN_10", name: "Vadaj", protected: true, isVenue: false },
        { id: "STN_11", name: "Ranip", protected: true, isVenue: false },
        { id: "STN_12", name: "Sabarmati Rly", protected: true, isVenue: false },
      ]
    : [
        { id: "STN_10", name: "Vadaj", protected: true, isVenue: false },
        { id: "STN_11", name: "Ranip", protected: true, isVenue: false },
        { id: "STN_12", name: "Sabarmati Rly", protected: true, isVenue: false },
        { id: "STN_13", name: "AEC", protected: false, isVenue: false },
        { id: "STN_14", name: "Sabarmati", protected: false, isVenue: false },
        { id: "STN_15", name: "Motera Stadium", protected: true, isVenue: true },
        { id: "STN_16", name: "Koteshwar Rd", protected: false, isVenue: false },
        { id: "STN_17", name: "Vishwakarma Col", protected: false, isVenue: false },
        { id: "STN_18", name: "Tapovan Circle", protected: true, isVenue: false },
        { id: "STN_19", name: "Narmada Canal", protected: false, isVenue: false },
        { id: "STN_20", name: "Koba Circle", protected: true, isVenue: false },
      ];

  const trainOffset1 = ((currentMinute + 30) * 1.8) % 100;
  const trainOffset2 = (trainOffset1 + 50) % 100;

  return (
    <div className="bg-platform border-b border-hairline px-4 py-2 select-none">
      <div className="flex flex-wrap items-center justify-between text-[11px] text-ink-soft mb-1 font-medium gap-1">
        <span>Metro Line Stations (North-South Corridor)</span>
        <div className="flex items-center space-x-3 text-[10px]">
          <span className="flex items-center space-x-1" title="Station that must not be disrupted by schedule changes">
            <Shield className="w-3 h-3 text-track" />
            <span>Protected interchange</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-1.5 rounded-full bg-track"></span>
            <span>Scheduled train</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-1.5 rounded-full bg-ai-plan border border-white"></span>
            <span>Extra shuttle</span>
          </span>
        </div>
      </div>

      <div className="relative py-2">
        {/* Track Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-shelter -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-hairline -translate-y-1/2"></div>

        {/* Moving train pills */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-2 rounded-full bg-track shadow-sm transition-all duration-300"
          style={{ left: `${trainOffset1}%` }}
          title="Scheduled Train"
        ></div>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-2 rounded-full bg-ai-plan ring-1 ring-white shadow-sm transition-all duration-300"
          style={{ left: `${trainOffset2}%` }}
          title="Extra Event Shuttle"
        ></div>

        {/* Stations */}
        <div className="relative flex justify-between items-center z-10">
          {stations.map((stn) => (
            <div
              key={stn.id}
              className={`flex flex-col items-center group cursor-default transition-all ${
                stn.isVenue ? "scale-105" : ""
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                  stn.isVenue
                    ? "bg-track border-track ring-4 ring-track/20 shadow-sm"
                    : stn.protected
                    ? "bg-white border-track"
                    : "bg-white border-hairline"
                }`}
              >
                {stn.protected && !stn.isVenue && (
                  <Shield className="w-2 h-2 text-track" />
                )}
                {stn.isVenue && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
              </div>

              <span
                className={`mt-1 text-[10px] tracking-tight max-w-[70px] truncate text-center ${
                  stn.isVenue
                    ? "font-bold text-track"
                    : stn.protected
                    ? "font-semibold text-ink"
                    : "text-ink-soft"
                }`}
                title={stn.name}
              >
                {stn.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
