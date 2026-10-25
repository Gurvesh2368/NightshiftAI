import React, { useState } from 'react';
import { TripPlan } from '../engine/types';
import {
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  MapPin,
  Clock,
  HeartHandshake,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface CheckinScreenProps {
  plan: TripPlan;
  onConfirmSafe: () => void;
  onTriggerSos: () => void;
  onOpenNearby: (filter?: string) => void;
  onBack: () => void;
}

export const CheckinScreen: React.FC<CheckinScreenProps> = ({
  plan,
  onConfirmSafe,
  onTriggerSos,
  onOpenNearby,
  onBack
}) => {
  const [showHelpOptions, setShowHelpOptions] = useState(false);

  return (
    <div className="min-h-screen bg-[#18191B] text-[#ECEEF3] flex flex-col max-w-md mx-auto p-4 pb-20">
      <div className="gradient-bar w-full fixed top-0 left-0 right-0 z-10" />

      {/* Header */}
      <div className="pt-6 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Clock className="h-4 w-4" />
          <span>PRE-TRAVEL CHECK-IN · 02:00 AM</span>
        </div>
        <h1 className="text-2xl font-black text-[#ECEEF3] mt-2">
          Shift just ended.
        </h1>
        <p className="text-base font-semibold text-zinc-300 mt-1">
          Are you okay to travel home right now?
        </p>
      </div>

      {/* Safe-arrival timer card */}
      <div className="rounded-3xl bg-[#232629] p-4 border border-zinc-800 space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-[#A3A8B0]">
            Safe-Arrival Timer
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
            Auto-Armed
          </span>
        </div>
        <div className="text-sm font-bold text-[#ECEEF3]">
          Expected Home: {plan.arrivalTime} (Deadline: 03:30 AM)
        </div>
        <p className="text-xs text-[#A3A8B0] leading-relaxed">
          If safe arrival is not confirmed by 03:45 AM (deadline + 15 min grace), we will quietly prompt you first, then notify your emergency contact.
        </p>
      </div>

      {!showHelpOptions ? (
        <div className="space-y-4 my-auto">
          {/* Large Primary Action: I'm Okay */}
          <button
            onClick={onConfirmSafe}
            className="w-full py-5 px-6 rounded-3xl gradient-cta text-white font-extrabold text-lg flex items-center justify-between shadow-xl shadow-emerald-950/40 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-7 w-7 text-emerald-300" />
              <div className="text-left">
                <div>I'm Okay to Travel</div>
                <div className="text-xs font-normal text-emerald-200 opacity-90">
                  Begin turn-by-turn navigation ({plan.name})
                </div>
              </div>
            </div>
            <span className="text-2xl">→</span>
          </button>

          {/* Secondary Action: I Need Help */}
          <button
            onClick={() => setShowHelpOptions(true)}
            className="w-full py-5 px-6 rounded-3xl bg-[#2E3236] text-[#ECEEF3] font-bold text-base border border-zinc-700/80 flex items-center justify-between hover:bg-[#383d42] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
              <div className="text-left">
                <div>I Need Help / Feeling Unwell</div>
                <div className="text-xs font-normal text-[#A3A8B0]">
                  Emergency call 112, safe spots, pharmacy
                </div>
              </div>
            </div>
            <span className="text-xl text-[#A3A8B0]">▼</span>
          </button>

          <button
            onClick={onBack}
            className="w-full py-3 text-xs text-[#A3A8B0] hover:text-white underline text-center"
          >
            Back to Plan Selection
          </button>
        </div>
      ) : (
        <div className="space-y-3 my-auto animate-in fade-in duration-200">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            Emergency & Support Options (≤ 2 Taps)
          </div>

          {/* 112 Direct Call */}
          <a
            href="tel:112"
            className="flex items-center justify-between p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 hover:brightness-125 transition-all"
          >
            <div className="flex items-center gap-3">
              <PhoneCall className="h-6 w-6 text-rose-400" />
              <div>
                <div className="font-bold text-sm text-white">Call 112 (National Emergency)</div>
                <div className="text-xs text-rose-300">Police, Medical & Ambulance Dispatch</div>
              </div>
            </div>
            <span className="font-mono text-xs bg-rose-900 px-2 py-1 rounded text-white">
              TAP TO CALL
            </span>
          </a>

          {/* Alert Trusted Contacts */}
          <button
            onClick={onTriggerSos}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#232629] border border-zinc-700 hover:bg-[#2a2e32] text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <HeartHandshake className="h-6 w-6 text-emerald-400" />
              <div>
                <div className="font-bold text-sm text-[#ECEEF3]">
                  Alert Emergency Contacts
                </div>
                <div className="text-xs text-[#A3A8B0]">
                  Sends SMS with your live GPS location link
                </div>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-semibold">ALERT</span>
          </button>

          {/* Nearest Open Safe Place */}
          <button
            onClick={() => onOpenNearby('waiting_spot')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#232629] border border-zinc-700 hover:bg-[#2a2e32] text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
              <div>
                <div className="font-bold text-sm text-[#ECEEF3]">
                  Find Nearest Staffed Safe Spot
                </div>
                <div className="text-xs text-[#A3A8B0]">
                  Staffed Metro bay (500m) or Police Chowki (1.6 km)
                </div>
              </div>
            </div>
            <span className="text-xs text-indigo-400 font-semibold">VIEW</span>
          </button>

          {/* Nearest 24h Pharmacy */}
          <button
            onClick={() => onOpenNearby('pharmacy')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#232629] border border-zinc-700 hover:bg-[#2a2e32] text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-teal-400" />
              <div>
                <div className="font-bold text-sm text-[#ECEEF3]">
                  Nearest Open 24/7 Pharmacy
                </div>
                <div className="text-xs text-[#A3A8B0]">
                  Apollo Pharmacy (800m away, verified open)
                </div>
              </div>
            </div>
            <span className="text-xs text-teal-400 font-semibold">DIRECTIONS</span>
          </button>

          <button
            onClick={() => setShowHelpOptions(false)}
            className="w-full py-3 rounded-2xl bg-[#2E3236] text-[#ECEEF3] text-xs font-semibold hover:bg-[#383d42] mt-3"
          >
            Cancel & Return
          </button>
        </div>
      )}

      {/* Honest statement note */}
      <div className="mt-auto pt-6 text-center text-xs text-[#A3A8B0] flex items-center justify-center gap-1.5">
        <HelpCircle className="h-4 w-4 shrink-0 text-zinc-500" />
        <span>We never diagnose health. Check-ins are completely optional.</span>
      </div>
    </div>
  );
};

