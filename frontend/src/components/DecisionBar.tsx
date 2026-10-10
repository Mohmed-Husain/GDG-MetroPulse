import React, { useState } from "react";
import { useMetroStore } from "../store/useMetroStore";
import { Check, X, Printer, RotateCcw, ShieldCheck } from "lucide-react";

export const DecisionBar: React.FC = () => {
  const {
    planData,
    approvePlan,
    rejectPlan,
    undoApproval,
    approvalStatus,
    approvalTime,
    undoCountdown,
  } = useMetroStore();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!planData) return null;

  const plan = planData.plan_kpis;
  const extraTrains = plan.extra_trains_used || 4;

  const handleConfirmApproval = async () => {
    setShowConfirmModal(false);
    await approvePlan();
  };

  return (
    <>
      {/* Confirmation Modal before approval */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-platform border border-hairline rounded shadow-xl w-full max-w-lg p-5 animate-in fade-in zoom-in-95 duration-150 select-none">
            <div className="flex items-start space-x-3 pb-3 border-b border-hairline">
              <ShieldCheck className="w-6 h-6 text-track mt-0.5 shrink-0" />
              <div>
                <h3 className="font-signage font-bold text-base text-ink">
                  Confirm Operator Approval for Proposed Plan
                </h3>
                <p className="text-xs text-ink-soft mt-0.5">
                  Review the operational changes before recording approval in the station shift log.
                </p>
              </div>
            </div>

            {/* Key plan highlights */}
            <div className="mt-3.5 space-y-2 text-xs">
              <div className="p-2.5 bg-white border border-hairline rounded-sm space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-track"></span>
                  <span className="font-semibold text-ink">
                    Dispatches {extraTrains} extra shuttle trains from siding tracks.
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-signal"></span>
                  <span className="font-semibold text-ink">
                    Pauses turnstile entry when platform crowding approaches 2.0 people/m².
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-approved"></span>
                  <span className="font-semibold text-ink">
                    Uses {plan.rakes_used} of 26 available rakes (fleet constraint satisfied).
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-amber-50 border border-signal/40 rounded-sm text-[11px] text-amber-900">
                <strong>Prototype Notice:</strong> This records approval in the prototype local shift log (`cache/approvals.json`) and prepares the printed operating order.
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-hairline flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 rounded-sm border border-hairline bg-white text-ink hover:bg-concrete font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-4 py-1.5 rounded-sm bg-approved hover:bg-green-700 text-white font-bold transition-colors shadow-subtle flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm approval</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <footer className="h-[62px] bg-platform border-t border-hairline px-4 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* Plain summary */}
        <div className="flex items-center space-x-2 text-xs text-ink-soft max-w-2xl">
          <ShieldCheck className="w-4 h-4 text-approved shrink-0" />
          <span className="truncate">
            <strong>Proposed plan:</strong> Keeps platform crowding safe (&le; {plan.peak_platform_density.toFixed(2)} people/m²), allocates {extraTrains} extra shuttles, and observes the 26-train fleet limit.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 text-xs">
          {approvalStatus === "approved" ? (
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-50 text-approved border border-green-300 rounded-sm font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>Plan approved at {approvalTime} (recorded in shift log)</span>
              </span>

              {undoCountdown !== null && (
                <button
                  onClick={undoApproval}
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-white text-ink border border-hairline hover:bg-concrete rounded-sm transition-colors"
                  title="Undo recorded approval"
                >
                  <RotateCcw className="w-3 h-3 text-ink-soft" />
                  <span>Undo ({undoCountdown}s)</span>
                </button>
              )}
            </div>
          ) : approvalStatus === "rejected" ? (
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 text-rejected border border-red-300 rounded-sm font-bold">
                <X className="w-3.5 h-3.5" />
                <span>Plan rejected by operator</span>
              </span>
              <button
                onClick={undoApproval}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-white text-ink border border-hairline hover:bg-concrete rounded-sm font-medium"
              >
                <RotateCcw className="w-3 h-3 text-ink-soft" />
                <span>Reset</span>
              </button>
            </div>
          ) : (
            <>
              {/* Reject */}
              <button
                onClick={() => rejectPlan()}
                className="px-3 py-1.5 rounded-sm border border-rejected/40 text-rejected hover:bg-red-50 transition-colors font-semibold"
              >
                Reject plan
              </button>

              {/* Print */}
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm border border-hairline bg-white text-ink hover:bg-concrete transition-colors font-semibold shadow-subtle"
              >
                <Printer className="w-3.5 h-3.5 text-ink-soft" />
                <span>Print plan</span>
              </button>

              {/* Approve */}
              <button
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-sm bg-approved hover:bg-green-700 text-white font-bold shadow-subtle transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve plan</span>
              </button>
            </>
          )}
        </div>
      </footer>
    </>
  );
};
