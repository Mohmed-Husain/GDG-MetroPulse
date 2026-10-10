import React, { useEffect } from "react";
import { useMetroStore } from "./store/useMetroStore";
import { Header } from "./components/Header";
import { EventInputs } from "./components/EventInputs";
import { CorridorContextStrip } from "./components/CorridorContextStrip";
import { PlanSummaryBanner } from "./components/PlanSummaryBanner";
import { SurgeView } from "./components/SurgeView";
import { KpiRow } from "./components/KpiRow";
import { QueueChart } from "./components/QueueChart";
import { ActionTimeline } from "./components/ActionTimeline";
import { AnnouncementsTab } from "./components/AnnouncementsTab";
import { ConstraintsTab } from "./components/ConstraintsTab";
import { DecisionBar } from "./components/DecisionBar";
import { PasteNoticeModal } from "./components/PasteNoticeModal";
import { PrintView } from "./components/PrintView";
import { ListOrdered, Volume2, ShieldCheck, X } from "lucide-react";

export const App: React.FC = () => {
  const { init, activeTab, setActiveTab, presenterMode, togglePresenterMode } = useMetroStore();

  useEffect(() => {
    init();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        togglePresenterMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [init, togglePresenterMode]);

  return (
    <div className="min-h-screen bg-concrete text-ink flex flex-col font-sans">
      {/* 1. Header */}
      <div className="no-print">
        <Header />
      </div>

      {/* Floating Exit Presenter Mode Banner */}
      {presenterMode && (
        <div className="no-print bg-ai-plan text-white px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-md z-40">
          <span>
            <strong>PRESENTER MODE ACTIVE:</strong> Setup controls are hidden and typography is enlarged for live demonstration.
          </span>
          <button
            onClick={togglePresenterMode}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
          >
            <span>Exit Presenter Mode (Press P)</span>
            <X className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      )}

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col overflow-y-auto no-print pb-24">
        {/* Setup inputs (hidden in presenter mode) */}
        <div className="hide-presenter">
          <EventInputs />
          <CorridorContextStrip />
        </div>

        {/* Plan Summary Banner */}
        <PlanSummaryBanner />

        {/* Station Crowd Flow (Main Visual Centerpiece) */}
        <SurgeView />

        {/* Operational Workspace Grid: Actions, Comparison Metrics & Chart */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left / Center Section: Primary Metrics & Crowding Chart (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-platform p-3.5 rounded border border-hairline shadow-subtle">
              <KpiRow />
            </div>

            <QueueChart />
          </div>

          {/* Right Section: Actions & Announcements Tabs (5 cols on lg) */}
          <div className="lg:col-span-5 bg-platform border border-hairline rounded shadow-subtle flex flex-col overflow-hidden">
            {/* Tab navigation */}
            <div className="border-b border-hairline flex items-center px-2 py-1.5 bg-concrete/60 select-none">
              <button
                onClick={() => setActiveTab("actions")}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-sm flex items-center justify-center space-x-1.5 transition-colors ${
                  activeTab === "actions"
                    ? "bg-white text-track shadow-sm border border-hairline"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>What should staff do?</span>
              </button>

              <button
                onClick={() => setActiveTab("announcements")}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-sm flex items-center justify-center space-x-1.5 transition-colors ${
                  activeTab === "announcements"
                    ? "bg-white text-track shadow-sm border border-hairline"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Announcements</span>
              </button>

              <button
                onClick={() => setActiveTab("assumptions")}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-sm flex items-center justify-center space-x-1.5 transition-colors ${
                  activeTab === "assumptions"
                    ? "bg-white text-track shadow-sm border border-hairline"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Rules & Safety</span>
              </button>
            </div>

            {/* Tab content */}
            <div className="p-3 flex-1 overflow-y-auto">
              {activeTab === "actions" && <ActionTimeline />}
              {activeTab === "announcements" && <AnnouncementsTab />}
              {activeTab === "assumptions" && <ConstraintsTab />}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Decision Bar (Fixed at bottom) */}
      <div className="no-print fixed bottom-0 left-0 right-0 z-40">
        <DecisionBar />
      </div>

      {/* Modals & Print Out */}
      <PasteNoticeModal />
      <PrintView />
    </div>
  );
};

export default App;
