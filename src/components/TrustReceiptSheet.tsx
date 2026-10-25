import React from 'react';
import { TripPlan } from '../engine/types';
import { TrustChip } from './TrustChip';
import { ScoreRing } from './ScoreRing';
import { X, Shield, AlertTriangle, Database, Info, ArrowRight } from 'lucide-react';

interface TrustReceiptSheetProps {
  plan: TripPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TrustReceiptSheet: React.FC<TrustReceiptSheetProps> = ({
  plan,
  isOpen,
  onClose
}) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm transition-opacity sm:items-center p-0 sm:p-4">
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#232629] border border-zinc-700/60 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 duration-200"
      >
        {/* Top Gradient & Header */}
        <div className="gradient-bar w-full" />
        <div className="flex items-center justify-between border-b border-zinc-700/60 p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-[#ECEEF3]">
                Trust Receipt & Data Audit
              </h2>
              <p className="text-xs text-[#A3A8B0]">
                Verified inputs and uncertainty bounds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2E3236] text-[#A3A8B0] hover:text-white transition-colors"
            aria-label="Close Trust Receipt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5 text-sm">
          {/* Overview Banner */}
          <div className="flex items-center justify-between rounded-2xl bg-[#18191B] p-4 border border-zinc-800">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#A3A8B0]">
                Route Recommendation
              </div>
              <div className="font-semibold text-base text-[#ECEEF3] mt-0.5">
                {plan.name}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrustChip
                  status={plan.overallStatus}
                  label={plan.statusChip.label}
                  size="sm"
                />
                <span className="text-xs text-zinc-400">
                  {plan.etaP50Min} min · ₹{plan.fareInr}
                </span>
              </div>
            </div>
            <ScoreRing score={plan.safetyScore} size={64} />
          </div>

          {/* Hard cap warning if capped */}
          {plan.scoreCapReason && (
            <div className="flex items-start gap-3 rounded-2xl bg-amber-950/40 border border-amber-600/40 p-3.5 text-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-xs uppercase tracking-wider text-amber-400">
                  Score Cap Enforced
                </div>
                <div className="text-xs mt-0.5 leading-relaxed">
                  {plan.scoreCapReason}
                </div>
              </div>
            </div>
          )}

          {/* Data Points Table */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Database className="h-4 w-4 text-zinc-400" />
              <h3 className="font-semibold text-xs uppercase tracking-wider text-[#A3A8B0]">
                Verified Inputs ({plan.dataPoints.length})
              </h3>
            </div>
            <div className="space-y-2.5">
              {plan.dataPoints.map((dp, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[#18191B] p-3 border border-zinc-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#ECEEF3] text-xs">
                      {dp.key.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <TrustChip
                      status={dp.verified ? 'KNOWN' : 'PROBABLE'}
                      label={dp.verified ? 'Verified' : 'Probable'}
                      size="sm"
                    />
                  </div>
                  <div className="text-xs text-zinc-300">
                    {typeof dp.value === 'object'
                      ? JSON.stringify(dp.value)
                      : String(dp.value)}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#A3A8B0] pt-1 border-t border-zinc-800">
                    <span>Source: {dp.source}</span>
                    <span>
                      Observed:{' '}
                      {dp.observedAt
                        ? new Date(dp.observedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Open Uncertainties */}
          {plan.uncertainties.length > 0 && (
            <div className="rounded-2xl bg-[#18191B] p-4 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                <Info className="h-4 w-4 text-amber-400" />
                <span>Acknowledged Uncertainties</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-zinc-300">
                {plan.uncertainties.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Why Chosen & Fallback */}
          <div className="rounded-2xl bg-[#18191B] p-4 border border-zinc-800 space-y-2">
            <div className="text-xs uppercase tracking-wider text-[#A3A8B0]">
              Decision Engine Justification
            </div>
            <div className="text-xs text-zinc-200 leading-relaxed">
              Selected because it maintains continuous high illumination and live-monitored vehicle transit, arriving at 02:43 AM (47 minutes prior to your 03:30 AM deadline).
            </div>
            {plan.fallbackPlan && (
              <div className="mt-3 pt-3 border-t border-zinc-800 flex items-start gap-2 text-xs text-emerald-300">
                <ArrowRight className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-400">
                    Fallback Plan:{' '}
                  </span>
                  {plan.fallbackPlan}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-4 border-t border-zinc-700/60 bg-[#18191B]">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#2E3236] text-[#ECEEF3] font-semibold text-sm hover:bg-[#383d42] transition-colors"
          >
            Close Trust Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

