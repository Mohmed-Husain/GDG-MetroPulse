import React from "react";
import { useMetroStore } from "../store/useMetroStore";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export const PlanSummaryBanner: React.FC = () => {
  const { planData, event } = useMetroStore();

  if (!planData) return null;

  const base = planData.baseline_kpis;
  const plan = planData.plan_kpis;
  const totalRiders = Math.round(event.expected_attendance * event.metro_mode_share);

  const hasCrowdingHazard = base.minutes_above_hold > 0;
  const planProtects = plan.peak_platform_density <= 2.0;

  return (
    <div className="bg-platform border-b border-hairline px-4 py-3 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white border border-hairline rounded-sm">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5">
            {planProtects ? (
              <CheckCircle2 className="w-5 h-5 text-approved shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-signal shrink-0" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-track font-signage">
                Plan Summary
              </span>
              <span className="text-xs text-ink-faint">·</span>
              <span className="text-xs font-semibold text-ink">
                {event.event_name} ({totalRiders.toLocaleString()} estimated metro riders)
              </span>
            </div>
            <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">
              {hasCrowdingHazard ? (
                <>
                  Under the current timetable, platform crowding exceeds safe limits for{" "}
                  <strong>{base.minutes_above_hold} minutes</strong> (peaking at{" "}
                  <strong>{base.peak_platform_density.toFixed(2)} people per m²</strong>). The proposed plan{" "}
                  holds entry briefly in the ticket area and dispatches{" "}
                  <strong>{plan.extra_trains_used || event.standby_rakes} extra shuttle trains</strong>, keeping platform crowding safe at{" "}
                  <strong>{plan.peak_platform_density.toFixed(2)} people per m²</strong>.
                </>
              ) : (
                <>
                  The simulation indicates manageable crowd flows throughout the event egress window. Recommended
                  directives are prepared for station staff and security coordination.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Quick Operational Tags */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 text-[11px]">
          <span className="px-2 py-1 rounded-sm bg-concrete text-ink font-medium border border-hairline" title="Safe platform target limit">
            Target: &le; 2.0 people/m²
          </span>
          <span className="px-2 py-1 rounded-sm bg-purple-50 text-ai-plan font-medium border border-purple-200" title="Extra trains allocated by proposed plan">
            +{plan.extra_trains_used || event.standby_rakes} Extra Shuttles
          </span>
          <span className="px-2 py-1 rounded-sm bg-amber-50 text-amber-800 font-semibold border border-signal/60" title="Indian metro standard: requires human operator confirmation">
            Operator Review Required
          </span>
        </div>
      </div>
    </div>
  );
};
