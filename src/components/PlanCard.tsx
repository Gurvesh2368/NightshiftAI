import React from 'react';
import { TripPlan } from '../engine/types';
import { ScoreRing } from './ScoreRing';
import { TrustChip } from './TrustChip';
import { Clock, IndianRupee, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PlanCardProps {
  plan: TripPlan;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpenReceipt: () => void;
  onNavigate: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isSelected = true,
  onOpenReceipt,
  onNavigate
}) => {
  return (
    <div
      className={`rounded-2xl bg-[#181C17] p-5 border transition-all ${
        isSelected
          ? 'border-[#C8DC35]/60 shadow-lg shadow-[#C8DC35]/10'
          : 'border-[#2C342A]'
      }`}
    >
      {/* Top row: Name & Score Ring */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8DC35] bg-[#1E2512] border border-[#C8DC35]/40 px-2 py-0.5 rounded-md">
              {plan.mode.toUpperCase()} ROUTE
            </span>
            <span className="text-xs text-[#9BA398]">
              Depart {plan.departureTime}
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#F4F6F2] mt-1.5 leading-snug">
            {plan.name}
          </h3>
          <p className="text-xs text-[#9BA398] mt-0.5">{plan.summary}</p>
        </div>
        <div
          onClick={onOpenReceipt}
          className="cursor-pointer transition-transform hover:scale-105"
          title="Click to view full Trust Receipt"
        >
          <ScoreRing score={plan.safetyScore} size={64} />
        </div>
      </div>

      {/* Metrics Row: ETA, Cost, Safety Tier */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#2C342A] text-sm">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <Clock className="h-4 w-4 text-[#9BA398]" />
          <span className="font-semibold text-[#F4F6F2]">{plan.etaP50Min} min</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <IndianRupee className="h-4 w-4 text-[#9BA398]" />
          <span className="font-semibold text-[#F4F6F2]">₹{plan.fareInr}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[#9BA398]">Night Safety:</span>
          <span
            className={`font-semibold ${
              plan.safetyScore >= 80 ? 'text-[#C8DC35]' : 'text-amber-400'
            }`}
          >
            {plan.safetyTier} ({plan.safetyScore}/100)
          </span>
        </div>
      </div>

      {/* Trust Chips Row */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <TrustChip
          status={plan.overallStatus}
          label={plan.statusChip.label}
          detail={plan.statusChip.detail}
          onClick={onOpenReceipt}
        />
        <div
          onClick={onOpenReceipt}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white cursor-pointer ml-auto"
        >
          <span>Why this score</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* "Why this score" Bullet list */}
      <div className="mt-3.5 space-y-1.5 rounded-xl bg-[#0F1210] p-3.5 border border-[#2C342A]">
        {plan.whyThisScore.slice(0, 3).map((bullet, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#C8DC35] shrink-0 mt-0.5" />
            <span>{bullet}</span>
          </div>
        ))}
      </div>

      {/* Primary CTA: Start Live Navigation */}
      <div className="mt-5 flex gap-2.5">
        <button
          onClick={onNavigate}
          className="flex-1 py-3.5 px-4 rounded-xl bg-[#C8DC35] hover:bg-[#D4E83E] text-[#0F1210] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C8DC35]/15 active:scale-[0.98] transition-all"
        >
          <span>Check in & Start Navigation</span>
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={onOpenReceipt}
          className="py-3.5 px-4 rounded-xl bg-[#252B23] text-[#F4F6F2] hover:bg-[#2F362C] transition-colors flex items-center justify-center border border-[#2C342A]"
          title="Trust Receipt Sheet"
        >
          <ShieldAlert className="h-5 w-5 text-zinc-300" />
        </button>
      </div>
    </div>
  );
};

