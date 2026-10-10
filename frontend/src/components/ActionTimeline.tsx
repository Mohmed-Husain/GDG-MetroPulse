import React, { useState } from "react";
import { useMetroStore } from "../store/useMetroStore";
import { ChevronDown, ChevronRight } from "lucide-react";

export const ActionTimeline: React.FC = () => {
  const { planData, currentMinute, setCurrentMinute } = useMetroStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!planData) return null;

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  // Convert technical owner names to clear operator terms
  const getPlainOwner = (owner: string) => {
    switch (owner) {
      case "OCC":
        return "Operations Control Centre";
      case "Station controller":
        return "Station Staff";
      case "Platform staff":
        return "Platform Staff";
      case "Security":
        return "Security Marshals";
      case "PA announcer":
        return "Announcement Staff";
      default:
        return owner;
    }
  };

  const getOwnerBadge = (owner: string) => {
    switch (owner) {
      case "OCC":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Station controller":
        return "bg-blue-100 text-track border-blue-200";
      case "Security":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Platform staff":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-3" aria-live="polite">
      {/* Header and Advisory note */}
      <div className="pb-2 border-b border-hairline">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-signage uppercase tracking-wider text-ink">
            What should staff do?
          </h3>
          <span className="text-xs font-semibold text-ink-soft">
            {planData.actions.length} Recommended Actions
          </span>
        </div>
        <p className="text-[11px] text-ink-faint mt-0.5">
          Recommendations generated from simulated crowd flow. Staff directives require human confirmation.
        </p>
      </div>

      {/* Action Directive Cards */}
      <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
        {planData.actions.map((act) => {
          const isCurrent = Math.abs(currentMinute - act.t_rel) <= 2;
          const isExpanded = expandedId === act.id;
          const relativeText =
            act.t_rel === 0
              ? "At event end"
              : act.t_rel > 0
              ? `${act.t_rel} min after end`
              : `${Math.abs(act.t_rel)} min before end`;

          return (
            <div
              key={act.id}
              onClick={() => setCurrentMinute(act.t_rel)}
              className={`p-3 rounded-sm border cursor-pointer transition-all ${
                isCurrent
                  ? "bg-blue-50/60 border-track border-l-4 shadow-sm"
                  : "bg-white border-hairline hover:border-track/40 hover:bg-concrete/40"
              }`}
            >
              {/* Header: Time, Plain Owner, Approval Chip */}
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono font-bold text-ink text-sm">
                    {act.clock}
                  </span>
                  <span className="text-[11px] text-ink-soft font-medium">
                    ({relativeText})
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded-sm text-[10px] font-semibold border ${getOwnerBadge(
                      act.owner
                    )}`}
                  >
                    {getPlainOwner(act.owner)}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  {act.requires_approval ? (
                    <span className="px-1.5 py-0.2 rounded-sm bg-signal/20 text-amber-900 text-[10px] font-bold border border-signal/40">
                      Requires approval
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-sm bg-concrete text-ink-soft text-[10px] font-medium border border-hairline">
                      Standard procedure
                    </span>
                  )}
                  <span className="text-[10px] text-ink-faint font-medium">
                    · {act.zone}
                  </span>
                </div>
              </div>

              {/* Concrete Directive */}
              <p className="text-xs text-ink font-semibold leading-relaxed">
                {act.action}
              </p>

              {/* Trigger & Toggle */}
              <div className="mt-2 pt-1.5 border-t border-hairline/60 flex items-center justify-between text-[11px] text-ink-soft">
                <span className="italic truncate max-w-[240px]">
                  <strong>Trigger:</strong> {act.trigger}
                </span>
                <button
                  onClick={(e) => toggleExpand(act.id, e)}
                  className="text-track hover:underline flex items-center text-[11px] font-semibold"
                >
                  {isExpanded ? "Hide reason" : "Why do this?"}
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  )}
                </button>
              </div>

              {/* Expandable Explanation */}
              {isExpanded && (
                <div className="mt-2 p-2.5 rounded-sm bg-concrete/70 text-xs text-ink-soft leading-relaxed border border-hairline">
                  <p>
                    <strong className="text-ink">Operational reason:</strong> {act.reason}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-faint">
                    Clicking this action moves the time slider to {act.clock} to view station crowd status.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
