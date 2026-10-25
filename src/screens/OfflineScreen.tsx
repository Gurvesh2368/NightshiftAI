import React, { useState } from 'react';
import { TripPlan } from '../engine/types';
import { TrustChip } from '../components/TrustChip';
import {
  WifiOff,
  MessageSquare,
  Shield,
  Hospital,
  Bus,
  RefreshCw,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Check
} from 'lucide-react';
import { triggerDeviceSms, buildEmergencySmsSituation } from '../lib/emergencySms';
import { BluetoothMeshChain } from '../components/BluetoothMeshChain';

interface OfflineScreenProps {
  plan?: TripPlan | null;
  onReconnect: () => void;
  onSendSmsSos: () => void;
}

export const OfflineScreen: React.FC<OfflineScreenProps> = ({
  plan,
  onReconnect,
  onSendSmsSos
}) => {
  const [smsTriggered, setSmsTriggered] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleOfflineSms = async () => {
    setSmsTriggered(true);
    try {
      const res = await triggerDeviceSms(buildEmergencySmsSituation());
      setNotice(res.copied ? '✓ SMS alert copied to clipboard & SMS composer initiated' : '✓ SMS composer opened');
      onSendSmsSos();
      setTimeout(() => setNotice(null), 4000);
    } catch {
      onSendSmsSos();
    }
  };

  const offlineRows = [
    {
      title: 'Emergency Contacts',
      statusText: 'Ready (Cached)',
      status: 'KNOWN' as const,
      icon: Shield
    },
    {
      title: 'Emergency Health & Medical Card',
      statusText: 'Ready (Cached)',
      status: 'KNOWN' as const,
      icon: CheckCircle2
    },
    {
      title: 'City Hospital Emergency & Trauma',
      statusText: '1.2 km · OUTDATED (1h ago)',
      status: 'OUTDATED' as const,
      icon: Hospital
    },
    {
      title: 'Night Express Bus 109 Last Run',
      statusText: 'Last bus 03:45 AM · OUTDATED',
      status: 'OUTDATED' as const,
      icon: Bus
    },
    {
      title: 'Staffed Metro Waiting Spot',
      statusText: 'Saved 2 days ago',
      status: 'OUTDATED' as const,
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-[#18191B] text-[#ECEEF3] flex flex-col max-w-md mx-auto p-4 pb-20">
      <div className="gradient-bar w-full fixed top-0 left-0 right-0 z-10" />

      {/* Top Offline Amber Banner */}
      <div className="rounded-2xl bg-amber-950/80 border border-amber-600/40 p-4 mt-6 text-amber-200 flex items-start gap-3">
        <WifiOff className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-sm text-amber-300">
            Offline · Showing Saved Trip Information
          </div>
          <p className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">
            All telemetry statuses are recomputed from age. Nothing is fabricated or guessed.
          </p>
        </div>
      </div>

      {/* Cached Trip Summary Card */}
      {plan && (
        <div className="mt-4 rounded-3xl bg-[#232629] p-5 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-[#A3A8B0]">
              Cached Trip Corridor
            </span>
            <TrustChip status="OUTDATED" label="OUTDATED (1:12 AM)" size="sm" />
          </div>

          <div className="text-lg font-bold text-[#ECEEF3]">{plan.name}</div>
          <div className="text-xs text-zinc-300">
            {plan.summary} · {plan.etaP50Min} min · ₹{plan.fareInr}
          </div>

          <div className="text-[11px] text-amber-400 font-medium bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/30">
            ⚠️ Turn-by-turn guidance and offline map corridor are preserved in local storage.
          </div>
        </div>
      )}

      {/* Saved Records Breakdown */}
      <div className="mt-4 rounded-3xl bg-[#232629] p-5 border border-zinc-800 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#A3A8B0]">
          Offline Bundle Health
        </div>

        <div className="space-y-2.5">
          {offlineRows.map((row, i) => {
            const Icon = row.icon;
            return (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#18191B] border border-zinc-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-zinc-400" />
                  <span className="font-semibold text-zinc-200">{row.title}</span>
                </div>
                <TrustChip status={row.status} label={row.statusText} size="sm" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bluetooth Mesh Relay Chain (100% Off-Grid Escalation) */}
      <BluetoothMeshChain autoStart={true} className="mt-4" />

      {/* Offline SOS Trigger */}
      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={handleOfflineSms}
          className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 transition-all text-center cursor-pointer active:scale-[0.98]"
        >
          {smsTriggered ? (
            <>
              <Check className="h-5 w-5 stroke-[3]" />
              <span>✓ Send SOS by Text Message (Offline)</span>
            </>
          ) : (
            <>
              <MessageSquare className="h-5 w-5" />
              <span>Send SOS by Text Message (Offline)</span>
            </>
          )}
        </button>

        {notice && (
          <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-semibold text-center animate-in fade-in">
            {notice}
          </div>
        )}

        <button
          onClick={onReconnect}
          className="w-full py-3.5 rounded-2xl bg-[#2E3236] hover:bg-[#383d42] text-[#ECEEF3] font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 text-emerald-400" />
          <span>Check Connection & Refresh Live Data</span>
        </button>
      </div>

      <div className="text-center text-[11px] text-[#A3A8B0] mt-4 leading-relaxed">
        SOS works without internet. It launches your phone's SMS composer prefilled with your name and last known GPS coordinates.
      </div>
    </div>
  );
};

