import React, { useState } from "react";
import { useMetroStore } from "../store/useMetroStore";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, HelpCircle, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  tooltipText: string;
  baselineDisplay: string;
  planDisplay: string;
  differenceText: string;
  status: "better" | "worse" | "neutral" | "info";
  subnote?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  tooltipText,
  baselineDisplay,
  planDisplay,
  differenceText,
  status,
  subnote,
}) => {
  const badgeClasses =
    status === "better"
      ? "bg-green-50 text-approved border border-green-200"
      : status === "worse"
      ? "bg-red-50 text-rejected border border-red-200"
      : status === "info"
      ? "bg-purple-50 text-ai-plan border border-purple-200"
      : "bg-gray-100 text-ink-soft border border-hairline";

  return (
    <div className="bg-white border border-hairline p-3 rounded-sm flex-1 min-w-[200px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-ink flex items-center space-x-1" title={tooltipText}>
          <span>{label}</span>
          <HelpCircle className="w-3 h-3 text-ink-faint" />
        </span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm flex items-center space-x-0.5 ${badgeClasses}`}>
          {status === "better" && <ArrowDown className="w-3 h-3 mr-0.5" />}
          {status === "worse" && <ArrowUp className="w-3 h-3 mr-0.5" />}
          {status === "neutral" && <Minus className="w-3 h-3 mr-0.5" />}
          <span>{differenceText}</span>
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div>
          <span className="text-[11px] text-ink-faint block">Proposed plan</span>
          <span className="font-signage font-bold text-lg text-ink">{planDisplay}</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-ink-faint block">Current plan</span>
          <span className="font-signage font-medium text-sm text-ink-soft">{baselineDisplay}</span>
        </div>
      </div>

      {subnote && (
        <p className="mt-1 text-[10px] text-ink-faint border-t border-hairline/60 pt-1">
          {subnote}
        </p>
      )}
    </div>
  );
};

export const KpiRow: React.FC = () => {
  const { planData } = useMetroStore();
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  if (!planData) return null;

  const base = planData.baseline_kpis;
  const plan = planData.plan_kpis;

  // 1. Time to clear most passengers (95% riders)
  const baseCleared = base.clearance_time_min > 0 && base.clearance_time_min <= 240;
  const planCleared = plan.clearance_time_min > 0 && plan.clearance_time_min <= 240;

  const baseClearanceStr = baseCleared ? `${base.clearance_time_min} min` : "Not cleared in 4 hrs";
  const planClearanceStr = planCleared ? `${plan.clearance_time_min} min` : "Not cleared in 4 hrs";

  let clearanceDiff = "No change";
  let clearanceStatus: "better" | "worse" | "neutral" = "neutral";

  if (baseCleared && planCleared) {
    const diff = base.clearance_time_min - plan.clearance_time_min;
    if (diff > 0) {
      clearanceDiff = `${diff} min faster`;
      clearanceStatus = "better";
    } else if (diff < 0) {
      clearanceDiff = `${Math.abs(diff)} min slower`;
      clearanceStatus = "worse";
    } else {
      clearanceDiff = "No change";
      clearanceStatus = "neutral";
    }
  } else if (!baseCleared && planCleared) {
    clearanceDiff = "Cleared safely";
    clearanceStatus = "better";
  }

  // 2. Highest platform crowding
  const densityDiff = base.peak_platform_density - plan.peak_platform_density;
  const densityStatus: "better" | "worse" | "neutral" =
    densityDiff > 0.05 ? "better" : densityDiff < -0.05 ? "worse" : "neutral";
  const densityDiffStr =
    densityDiff > 0
      ? `${densityDiff.toFixed(2)} lower`
      : densityDiff < 0
      ? `${Math.abs(densityDiff).toFixed(2)} higher`
      : "No change";

  // 3. Time spent above target (hold threshold)
  const holdDiff = base.minutes_above_hold - plan.minutes_above_hold;
  const holdStatus: "better" | "worse" | "neutral" =
    holdDiff > 0 ? "better" : holdDiff < 0 ? "worse" : "neutral";
  const holdDiffStr =
    holdDiff > 0
      ? `${holdDiff} min less`
      : holdDiff < 0
      ? `${Math.abs(holdDiff)} min more`
      : "No change";

  // 4. Extra trains used
  const extraTrainsPlan = plan.extra_trains_used || 4;
  const extraTrainsBase = base.extra_trains_used || 0;
  const extraTrainsDiff = extraTrainsPlan - extraTrainsBase;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="font-signage font-bold text-xs uppercase tracking-wider text-ink">
          Plan Results Comparison
        </h3>
        <button
          onClick={() => setShowMoreDetails(!showMoreDetails)}
          className="text-xs font-semibold text-track hover:underline flex items-center space-x-1"
        >
          <span>{showMoreDetails ? "Hide secondary measures" : "Show more details"}</span>
          {showMoreDetails ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4 Primary Measures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Time to clear crowd"
          tooltipText="Time until 95% of simulated metro passengers have boarded trains and departed"
          baselineDisplay={baseClearanceStr}
          planDisplay={planClearanceStr}
          differenceText={clearanceDiff}
          status={clearanceStatus}
          subnote="Measured from scheduled event end time"
        />

        <MetricCard
          label="Highest platform crowding"
          tooltipText="Estimated peak crowd density on the busiest platform (target is 2.0 people per m² or less)"
          baselineDisplay={`${base.peak_platform_density.toFixed(2)} people/m²`}
          planDisplay={`${plan.peak_platform_density.toFixed(2)} people/m²`}
          differenceText={densityDiffStr}
          status={densityStatus}
          subnote="Safety target: &le; 2.0 people per m²"
        />

        <MetricCard
          label="Time spent above target"
          tooltipText="Total minutes platforms exceed the configured 2.0 people per m² crowd threshold"
          baselineDisplay={`${base.minutes_above_hold} min`}
          planDisplay={`${plan.minutes_above_hold} min`}
          differenceText={holdDiffStr}
          status={holdStatus}
          subnote="Target: 0 min (entry paused before platform)"
        />

        <MetricCard
          label="Extra trains used"
          tooltipText="Number of additional standby train sets deployed from siding tracks as event shuttles"
          baselineDisplay={`${extraTrainsBase} extra`}
          planDisplay={`+${extraTrainsPlan} extra trains`}
          differenceText={`+${extraTrainsDiff} shuttles`}
          status="info"
          subnote={`Total corridor fleet: ${plan.rakes_used} of 26 trains active`}
        />
      </div>

      {/* Secondary Measures (Collapsible) */}
      {showMoreDetails && (
        <div className="p-3 bg-white border border-hairline rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150 text-xs">
          <div>
            <span className="text-ink-soft block font-medium">Estimated long-wait time:</span>
            <p className="font-bold text-ink text-sm mt-0.5">
              {plan.p95_waiting_time_min} min{" "}
              <span className="text-ink-faint font-normal font-mono">(vs {base.p95_waiting_time_min} min baseline)</span>
            </p>
            <span className="text-[10px] text-ink-faint">Wait time that 95% of simulated passengers do not exceed</span>
          </div>

          <div>
            <span className="text-ink-soft block font-medium">Maximum train passenger load:</span>
            <p className="font-bold text-ink text-sm mt-0.5">
              {Math.round(plan.max_load_factor * 100)}% load factor{" "}
              <span className="text-ink-faint font-normal font-mono">(vs {Math.round(base.max_load_factor * 100)}% baseline)</span>
            </p>
            <span className="text-[10px] text-ink-faint">Target comfort limit: 85% maximum (crush loads never planned)</span>
          </div>

          <div>
            <span className="text-ink-soft block font-medium">Critical crowd hazard chance:</span>
            <p className="font-bold text-ink text-sm mt-0.5">
              {plan.critical_density_probability.toFixed(1)}% risk{" "}
              <span className="text-ink-faint font-normal font-mono">(vs {base.critical_density_probability.toFixed(1)}% baseline)</span>
            </p>
            <span className="text-[10px] text-ink-faint">Model-based estimate of exceeding emergency crush threshold</span>
          </div>
        </div>
      )}
    </div>
  );
};
