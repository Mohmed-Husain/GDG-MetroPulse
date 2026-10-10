import React, { useState } from "react";
import { useMetroStore } from "../store/useMetroStore";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

export const QueueChart: React.FC = () => {
  const { planData, currentMinute, setCurrentMinute } = useMetroStore();
  const [metric, setMetric] = useState<"density" | "queue">("density");

  if (!planData) return null;

  // Prepare chart data
  const chartData = planData.plan_timeline.map((tm, idx) => {
    const base = planData.baseline_timeline[idx];
    const band = planData.bands[idx];

    const planDensity = Math.max(tm.platform_density_up, tm.platform_density_down);
    const baseDensity = base ? Math.max(base.platform_density_up, base.platform_density_down) : 0;

    const planQueue = tm.forecourt_queue + tm.concourse_queue;
    const baseQueue = base ? base.forecourt_queue + base.concourse_queue : 0;

    return {
      t_rel: tm.t_rel,
      clock: tm.clock,
      planDensity: Number(planDensity.toFixed(2)),
      baseDensity: Number(baseDensity.toFixed(2)),
      p10Density: band?.p10_density ?? 0,
      p90Density: band?.p90_density ?? 0,
      planQueue,
      baseQueue,
      p10Queue: band?.p10_queue ?? 0,
      p90Queue: band?.p90_queue ?? 0,
    };
  });

  return (
    <div className="bg-platform p-3.5 rounded border border-hairline select-none">
      {/* Header and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <h4 className="font-signage font-bold text-xs uppercase tracking-wider text-ink">
            {metric === "density" ? "Platform Crowding Over Time" : "People Waiting Across the Station"}
          </h4>
          <p className="text-[11px] text-ink-soft">
            {metric === "density"
              ? "Compares platform crowd levels against the configured 2.0 people per m² safety target"
              : "Total passengers queued outside and in the ticket concourse"}
          </p>
        </div>

        <div className="inline-flex rounded-sm border border-hairline bg-white p-0.5 text-xs">
          <button
            onClick={() => setMetric("density")}
            className={`px-2.5 py-1 rounded-sm font-semibold transition-colors ${
              metric === "density" ? "bg-track text-white shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            Platform Crowding
          </button>
          <button
            onClick={() => setMetric("queue")}
            className={`px-2.5 py-1 rounded-sm font-semibold transition-colors ${
              metric === "queue" ? "bg-track text-white shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            Station Queues
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload.length > 0) {
                const t = e.activePayload[0].payload.t_rel;
                setCurrentMinute(t);
              }
            }}
          >
            <CartesianGrid stroke="#C9D0D9" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="t_rel"
              tickFormatter={(t) => (t % 30 === 0 ? `T${t >= 0 ? `+${t}` : t}` : "")}
              stroke="#6B7685"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#6B7685"
              fontSize={11}
              domain={metric === "density" ? [0, 4.5] : [0, "auto"]}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-platform border border-hairline p-2.5 rounded text-xs shadow-sm">
                    <div className="font-bold text-ink mb-1">
                      {d.clock} ({d.t_rel >= 0 ? `${d.t_rel} min after end` : `${Math.abs(d.t_rel)} min before end`})
                    </div>
                    {metric === "density" ? (
                      <>
                        <div className="flex items-center space-x-2 text-ai-plan font-bold">
                          <span>Proposed plan:</span>
                          <span>{d.planDensity} people/m²</span>
                        </div>
                        <div className="flex items-center space-x-2 text-baseline font-medium">
                          <span>Current plan:</span>
                          <span>{d.baseDensity} people/m²</span>
                        </div>
                        <div className="text-[10px] text-ink-faint mt-1 pt-1 border-t border-hairline">
                          Range across simulated runs: {d.p10Density} – {d.p90Density} people/m²
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2 text-ai-plan font-bold">
                          <span>Proposed plan queue:</span>
                          <span>{d.planQueue.toLocaleString()} people</span>
                        </div>
                        <div className="flex items-center space-x-2 text-baseline font-medium">
                          <span>Current plan queue:</span>
                          <span>{d.baseQueue.toLocaleString()} people</span>
                        </div>
                        <div className="text-[10px] text-ink-faint mt-1 pt-1 border-t border-hairline">
                          Range across simulated runs: {d.p10Queue.toLocaleString()} – {d.p90Queue.toLocaleString()} people
                        </div>
                      </>
                    )}
                  </div>
                );
              }}
            />

            {/* Reference safety threshold line */}
            {metric === "density" && (
              <ReferenceLine
                y={2.0}
                stroke="#F2A900"
                strokeDasharray="4 4"
                label={{
                  value: "Configured Crowding Target (2.0 people/m²)",
                  fill: "#92400E",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
            )}

            {/* Time Cursor */}
            <ReferenceLine x={currentMinute} stroke="#1F4E9C" strokeWidth={2} />

            {/* Range across simulated scenarios Area */}
            {metric === "density" ? (
              <Area
                type="monotone"
                dataKey="p90Density"
                stroke="none"
                fill="#6A3FB5"
                fillOpacity={0.12}
              />
            ) : (
              <Area
                type="monotone"
                dataKey="p90Queue"
                stroke="none"
                fill="#6A3FB5"
                fillOpacity={0.12}
              />
            )}

            {/* Current Plan: Dashed Slate */}
            <Line
              type="monotone"
              dataKey={metric === "density" ? "baseDensity" : "baseQueue"}
              stroke="#7A8594"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Current Plan"
            />

            {/* Proposed Plan: Solid Violet */}
            <Line
              type="monotone"
              dataKey={metric === "density" ? "planDensity" : "planQueue"}
              stroke="#6A3FB5"
              strokeWidth={2.5}
              dot={false}
              name="Proposed Plan"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Direct Line Labels Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-ink-soft mt-1 gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-baseline"></span>
            <span>Current plan (timetable baseline)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 bg-ai-plan"></span>
            <span className="font-semibold text-ai-plan">Proposed plan (managed dispatch)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-ai-plan/20 rounded-sm"></span>
            <span>Range across simulated scenarios</span>
          </div>
        </div>

        <span className="text-[11px] text-ink-faint">Click chart to jump timeline</span>
      </div>
    </div>
  );
};
