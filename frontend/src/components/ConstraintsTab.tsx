import React from "react";
import { useMetroStore } from "../store/useMetroStore";
import { CheckCircle2, XCircle } from "lucide-react";

export const ConstraintsTab: React.FC = () => {
  const { planData } = useMetroStore();

  if (!planData) return null;

  return (
    <div className="space-y-3">
      <div className="pb-2 border-b border-hairline">
        <h3 className="text-xs font-bold font-signage uppercase tracking-wider text-ink">
          Operating Rules & Safety Constraints
        </h3>
        <p className="text-[11px] text-ink-faint">
          Verified against GMRC operations policies and signalling safety benchmarks.
        </p>
      </div>

      <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
        {planData.constraint_checks.map((c, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-sm border ${
              c.passed
                ? "bg-white border-hairline"
                : "bg-red-50/60 border-rejected"
            }`}
          >
            <div className="flex items-start space-x-2.5">
              {c.passed ? (
                <CheckCircle2 className="w-4 h-4 text-approved mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rejected mt-0.5 shrink-0" />
              )}
              <div>
                <h4 className="text-xs font-bold text-ink">{c.name}</h4>
                <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">
                  {c.detail}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Assumptions List in Plain Language */}
        <div className="mt-4 pt-3 border-t border-hairline">
          <h4 className="text-xs font-bold text-ink mb-2">
            Model Assumptions & Estimates
          </h4>
          <ul className="space-y-1.5 text-xs text-ink-soft">
            {planData.assumptions.map((ass, i) => (
              <li key={i} className="flex items-baseline space-x-2">
                <span className="text-track font-bold">▪</span>
                <span>{ass}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
