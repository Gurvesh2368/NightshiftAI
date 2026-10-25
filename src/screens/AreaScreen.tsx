import React, { useState } from 'react';
import { MOCK_AREA_ZONES } from '../data/mockScenario';
import { TrustChip } from '../components/TrustChip';
import { Users, Shield, AlertTriangle, EyeOff, CheckCircle2, Lock, Radio, Network } from 'lucide-react';
import { BluetoothMeshChain } from '../components/BluetoothMeshChain';

export const AreaScreen: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'density' | 'mesh'>('mesh');

  return (
    <div className="min-h-screen bg-[#18191B] text-[#ECEEF3] flex flex-col max-w-md mx-auto p-4 pb-24">
      <div className="gradient-bar w-full fixed top-0 left-0 right-0 z-10" />

      {/* Screen Title */}
      <div className="pt-6 pb-2">
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Network className="h-4 w-4" />
          <span>Local Area & Mesh Relay</span>
        </div>
        <h1 className="text-2xl font-black text-[#ECEEF3] mt-1.5">
          {activeSubTab === 'mesh' ? 'Bluetooth Relay Mesh' : 'Night Worker Density'}
        </h1>
        <p className="text-xs text-[#A3A8B0] mt-1 leading-relaxed">
          {activeSubTab === 'mesh'
            ? 'Autonomous hop-by-hop BLE emergency chain to Higher Authorities when off-grid.'
            : 'Active workers 2:00–3:00 AM. Grouped counts only, never individual GPS paths.'}
        </p>
      </div>

      {/* Sub-Tab Selector */}
      <div className="grid grid-cols-2 gap-2 my-3 p-1 rounded-2xl bg-[#232629] border border-zinc-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveSubTab('mesh')}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'mesh'
              ? 'bg-[#1E2512] text-[#C8DC35] border border-[#C8DC35]/50 shadow'
              : 'text-[#9BA398] hover:text-white'
          }`}
        >
          <Radio className="h-3.5 w-3.5" />
          <span>Bluetooth Chain</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('density')}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'density'
              ? 'bg-[#1E2512] text-[#C8DC35] border border-[#C8DC35]/50 shadow'
              : 'text-[#9BA398] hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Worker Density</span>
        </button>
      </div>

      {activeSubTab === 'mesh' ? (
        <div className="space-y-4">
          <BluetoothMeshChain autoStart={false} />

          <div className="rounded-2xl bg-[#232629] p-4 border border-zinc-800 space-y-2.5 text-xs text-zinc-300">
            <div className="font-extrabold text-[#C8DC35] uppercase text-[11px] tracking-wide flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              <span>How the Offline Chain Escalates</span>
            </div>
            <p className="text-[11px] text-[#A3A8B0] leading-relaxed">
              1. <strong>Zero Internet Broadcast:</strong> If you trigger SOS with no cellular or Wi-Fi, your phone emits an encrypted 2.4 GHz BLE radio packet.
            </p>
            <p className="text-[11px] text-[#A3A8B0] leading-relaxed">
              2. <strong>Peer-to-Peer Hopping:</strong> Nearby night workers, delivery bikes, or BEST transit buses detect the packet, verify hop signatures, and relay it along the corridor.
            </p>
            <p className="text-[11px] text-[#A3A8B0] leading-relaxed">
              3. <strong>Higher Authority Dispatch:</strong> Once the packet reaches a Police Chowki beacon, transit hub terminal, or an online peer, it automatically dispatches first responders via 112 National Police Command.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Privacy Guarantee Pill */}
          <div className="p-3.5 rounded-2xl bg-[#232629] border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2.5 my-3">
            <Lock className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-[#ECEEF3]">Differential Privacy Guard:</strong> Any zone with fewer than 20 worker reports is strictly masked.
            </div>
          </div>

          {/* Zone Cards Grid */}
          <div className="space-y-3 mt-1">
        {MOCK_AREA_ZONES.map((zone, idx) => {
          if (zone.hidden) {
            return (
              <div
                key={idx}
                className="rounded-3xl border-2 border-dashed border-zinc-700/80 bg-[#1e2023]/60 p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-400">
                    {zone.zone_id}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full">
                    k &lt; 20 Masked
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <EyeOff className="h-4 w-4 text-zinc-500" />
                  <span>{zone.hiddenReason}</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="rounded-3xl bg-[#232629] p-5 border border-zinc-800 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#ECEEF3]">
                    {zone.zone_id}
                  </h3>
                  <span className="text-xs text-[#A3A8B0]">
                    {zone.source} · Confidence {zone.confidence}
                  </span>
                </div>
                <TrustChip status="KNOWN" label="Verified" size="sm" />
              </div>

              {/* Counts display */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-[#18191B] border border-zinc-800/80">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#A3A8B0]">
                    Active Workers
                  </div>
                  <div className="text-2xl font-black text-emerald-400 mt-0.5">
                    {zone.active_count}
                  </div>
                  <div className="text-[11px] text-zinc-400">In 2:00–3:00 AM window</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#18191B] border border-zinc-800/80">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#A3A8B0]">
                    Transport Verified
                  </div>
                  <div className="text-2xl font-black text-[#ECEEF3] mt-0.5">
                    {zone.transport_verified_count}
                  </div>
                  <div className="text-[11px] text-zinc-400">Running transit routes</div>
                </div>
              </div>

              {/* Mobility Gap Warning if present */}
              {zone.hasGapFlag && (
                <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-600/40 text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 block">Mobility Gap Identified:</strong>
                    <span>{zone.gapDetail}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Source Citation */}
      <div className="text-center text-[11px] text-[#A3A8B0] mt-6 pt-4 border-t border-zinc-800 leading-relaxed">
        Aggregated via <code className="text-emerald-400">area_zones()</code> Postgres RPC with SECURITY DEFINER · Sample 180 check-ins · Never links individual identities
      </div>
        </>
      )}
    </div>
  );
};

