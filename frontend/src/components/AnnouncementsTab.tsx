import React, { useState } from "react";
import { useMetroStore } from "../store/useMetroStore";
import { Copy, Check, Volume2, Info } from "lucide-react";

export const AnnouncementsTab: React.FC = () => {
  const { announcements, announcementLang, setAnnouncementLang, health } = useMetroStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isLlmOffline = health?.llm !== "up";

  return (
    <div className="space-y-3">
      {/* Header and Language Bar */}
      <div className="pb-2 border-b border-hairline">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold font-signage uppercase tracking-wider text-ink">
              Passenger Announcements
            </h3>
            <p className="text-[11px] text-ink-faint">
              Draft messages for station public address audio and platform display screens.
            </p>
          </div>

          {/* Language selector */}
          <div className="inline-flex rounded-sm border border-hairline bg-white p-0.5 text-xs">
            <button
              onClick={() => setAnnouncementLang("en")}
              className={`px-2.5 py-1 rounded-sm font-semibold transition-colors ${
                announcementLang === "en" ? "bg-track text-white shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setAnnouncementLang("gu")}
              className={`px-2.5 py-1 rounded-sm font-semibold transition-colors ${
                announcementLang === "gu" ? "bg-track text-white shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              ગુજરાતી
            </button>
            <button
              onClick={() => setAnnouncementLang("hi")}
              className={`px-2.5 py-1 rounded-sm font-semibold transition-colors ${
                announcementLang === "hi" ? "bg-track text-white shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Offline Status or AI Notice */}
      {isLlmOffline ? (
        <div className="p-2.5 rounded-sm bg-blue-50/60 border border-blue-200 flex items-start space-x-2 text-xs text-ink-soft">
          <Info className="w-4 h-4 text-track shrink-0 mt-0.5" />
          <span>
            <strong>AI writing is unavailable.</strong> Using saved announcement templates vetted for GMRC stations.
          </span>
        </div>
      ) : (
        <div className="p-2.5 rounded-sm bg-purple-50/60 border border-purple-200 flex items-start space-x-2 text-xs text-purple-900">
          <Info className="w-4 h-4 text-ai-plan shrink-0 mt-0.5" />
          <span>
            AI-assisted localized translations. Station staff must review drafts before broadcasting over station audio.
          </span>
        </div>
      )}

      {/* Announcement Moments List */}
      <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
        {announcements.map((item) => {
          const text =
            announcementLang === "gu"
              ? item.gu
              : announcementLang === "hi"
              ? item.hi
              : item.en;

          const relativeText =
            item.t_rel === 0
              ? "At event end"
              : item.t_rel > 0
              ? `${item.t_rel} min after end`
              : `${Math.abs(item.t_rel)} min before end`;

          return (
            <div
              key={item.moment_id}
              className="p-3.5 rounded-sm bg-white border border-hairline hover:border-hairline/80 transition-all shadow-subtle"
            >
              {/* Header: Moment Title, Time, Source */}
              <div className="flex flex-wrap items-center justify-between gap-1 mb-2 text-xs">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-3.5 h-3.5 text-track" />
                  <span className="font-bold text-ink">{item.moment_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                      item.source === "llm"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.source === "llm" ? "AI Draft" : "Reviewed Template"}
                  </span>
                  <span className="font-mono text-[11px] text-ink-faint">
                    {relativeText}
                  </span>
                </div>
              </div>

              {/* Broadcast Script */}
              <div
                className={`p-3 rounded-sm bg-platform border border-hairline text-ink text-sm font-serif leading-relaxed ${
                  announcementLang === "gu" ? "leading-[1.85]" : ""
                }`}
              >
                "{text}"
              </div>

              {/* Footer: Channels & Copy Action */}
              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-ink-faint">
                  Suggested channels: Ticket concourse PA, Platform screens
                </span>
                <button
                  onClick={() => handleCopy(item.moment_id, text)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-sm text-track hover:bg-track/10 transition-colors font-semibold"
                >
                  {copiedId === item.moment_id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-approved" />
                      <span className="text-approved">Copied announcement</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy announcement</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
