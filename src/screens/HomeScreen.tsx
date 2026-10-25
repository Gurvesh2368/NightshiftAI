import React, { useState } from 'react';
import { TripPlan, PlanMode } from '../engine/types';
import { PlanCard } from '../components/PlanCard';
import { TrustReceiptSheet } from '../components/TrustReceiptSheet';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { TrustChip } from '../components/TrustChip';
import {
  CloudRain,
  Shield,
  Clock,
  Sparkles,
  Zap,
  RotateCcw,
  AlertTriangle,
  Radio,
  ChevronDown
} from 'lucide-react';
import { SupportedLang } from '../lib/tts';

interface HomeScreenProps {
  plans: TripPlan[];
  selectedMode: PlanMode;
  onSelectMode: (mode: PlanMode) => void;
  onStartCheckin: (plan: TripPlan) => void;
  onSimulateEvent: (eventType: string) => void;
  lang: SupportedLang;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  plans,
  selectedMode,
  onSelectMode,
  onStartCheckin,
  onSimulateEvent,
  lang
}) => {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [showSimMenu, setShowSimMenu] = useState(false);

  // Active plan for the selected mode
  const currentPlan =
    plans.find(p => p.mode === selectedMode) ||
    plans.find(p => p.mode === 'safest') ||
    plans[0];

  const getTextToRead = () => {
    if (!currentPlan) return '';
    if (lang === 'hi') {
      return `शिफ्ट समाप्त 2:00 पूर्वाह्न। घर पहुंचने का समय 3:30 पूर्वाह्न। अनुशंसित मार्ग ${currentPlan.name}। नाइट सेफ्टी स्कोर ${currentPlan.safetyScore}। सत्यापित 5 मिनट पहले।`;
    }
    if (lang === 'mr') {
      return `शिफ्ट समाप्ती पहाटे 2:00. घरी पोहोचण्याची वेळ 3:30. शिफारस केलेला मार्ग ${currentPlan.name}. रात्रीचा सुरक्षा स्कोअर ${currentPlan.safetyScore}.`;
    }
    return `Shift ends 2:00 AM. Home by 3:30 AM. Recommended route: ${currentPlan.name}. Duration ${currentPlan.etaP50Min} minutes. Fare ${currentPlan.fareInr} rupees. Night safety score ${currentPlan.safetyScore} out of 100. ${currentPlan.statusChip.label}.`;
  };

  return (
    <div className="min-h-screen bg-[#0F1210] text-[#F4F6F2] flex flex-col max-w-md mx-auto p-4 pb-24 font-sans selection:bg-[#C8DC35] selection:text-black">
      {/* Top Bar */}
      <div className="pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9BA398]">
            <Clock className="h-3.5 w-3.5 text-[#C8DC35]" />
            <span>Shift Ends 02:00 AM · Home by 03:30 AM</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#F4F6F2] mt-0.5">
            NightShift AI
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Read Aloud Screen Reader */}
          <ReadAloudButton getTextToRead={getTextToRead} lang={lang} />

          {/* Live Scenario Simulator Button */}
          <button
            onClick={() => setShowSimMenu(!showSimMenu)}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-[#252B23] text-amber-300 hover:bg-[#2F362C] text-xs font-bold transition-all border border-amber-500/30"
            title="Simulate Realtime Events (Demo)"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Simulate</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Simulator Dropdown Modal / Popover */}
      {showSimMenu && (
        <div className="my-2 p-3.5 rounded-2xl bg-[#181C17] border border-amber-500/50 shadow-2xl space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400">
            <span>Simulate Realtime Chaos Events</span>
            <span className="text-[10px] text-zinc-400">Hackathon Evaluator</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <button
              onClick={() => {
                onSimulateEvent('bus_cancel');
                setShowSimMenu(false);
              }}
              className="p-2 rounded-xl bg-[#0F1210] hover:bg-zinc-800 text-left text-zinc-200 flex items-center justify-between"
            >
              <span>🚫 Simulate Bus 109 Cancellation</span>
              <span className="text-[10px] text-amber-400">Triggers Replan</span>
            </button>
            <button
              onClick={() => {
                onSimulateEvent('rain_storm');
                setShowSimMenu(false);
              }}
              className="p-2 rounded-xl bg-[#0F1210] hover:bg-zinc-800 text-left text-zinc-200 flex items-center justify-between"
            >
              <span>🌧️ Simulate Heavy Rain Storm</span>
              <span className="text-[10px] text-sky-400">Weather Risk</span>
            </button>
            <button
              onClick={() => {
                onSimulateEvent('telemetry_down');
                setShowSimMenu(false);
              }}
              className="p-2 rounded-xl bg-[#0F1210] hover:bg-zinc-800 text-left text-zinc-200 flex items-center justify-between"
            >
              <span>❓ Simulate Critical Feed Down</span>
              <span className="text-[10px] text-rose-400">UNKNOWN Cap 60</span>
            </button>
            <button
              onClick={() => {
                onSimulateEvent('reset');
                setShowSimMenu(false);
              }}
              className="p-2 rounded-xl bg-[#252B23] hover:bg-zinc-700 text-left text-[#C8DC35] font-bold flex items-center justify-between"
            >
              <span>🔄 Reset to Clean Seed State</span>
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs: Safest / Cheapest / Fastest */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-[#181C17] border border-[#2C342A] text-xs font-bold my-3">
        {(['safest', 'cheapest', 'fastest'] as PlanMode[]).map(mode => {
          const isActive = selectedMode === mode;
          return (
            <button
              key={mode}
              onClick={() => onSelectMode(mode)}
              className={`py-2.5 rounded-lg capitalize transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#C8DC35] text-[#0F1210] font-black shadow-md'
                  : 'text-[#9BA398] hover:text-[#F4F6F2]'
              }`}
            >
              {mode}
            </button>
          );
        })}
      </div>

      {/* Main Plan Card */}
      {currentPlan && (
        <PlanCard
          plan={currentPlan}
          onOpenReceipt={() => setIsReceiptOpen(true)}
          onNavigate={() => onStartCheckin(currentPlan)}
        />
      )}

      {/* Weather Card */}
      <div className="mt-4 rounded-3xl bg-[#232629] p-4 border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-950/60 border border-sky-600/40 text-sky-400">
            <CloudRain className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-[#ECEEF3]">
              Rain Probable Near 1:30 AM
            </div>
            <div className="text-[11px] text-[#A3A8B0]">
              65% chance of light drizzle · Open-Meteo Radar
            </div>
          </div>
        </div>
        <TrustChip status="PROBABLE" label="Probable" size="sm" />
      </div>

      {/* Trust Receipt Sheet Modal */}
      <TrustReceiptSheet
        plan={currentPlan}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};

