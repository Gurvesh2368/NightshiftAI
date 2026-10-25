import React, { useState, useEffect } from 'react';
import {
  bluetoothMesh,
  MeshChainState,
  BluetoothEmergencyPacket
} from '../lib/bluetoothMesh';
import {
  Radio,
  Share2,
  ShieldAlert,
  Building2,
  Bus,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
  WifiOff,
  Signal,
  Smartphone,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface BluetoothMeshChainProps {
  autoStart?: boolean;
  onAuthorityDispatched?: (receipt: any) => void;
  className?: string;
}

export const BluetoothMeshChain: React.FC<BluetoothMeshChainProps> = ({
  autoStart = false,
  onAuthorityDispatched,
  className = ''
}) => {
  const [meshState, setMeshState] = useState<MeshChainState>(() => bluetoothMesh.getState());
  const [showLogs, setShowLogs] = useState(false);
  const [isScanningBle, setIsScanningBle] = useState(false);

  useEffect(() => {
    const unsubscribe = bluetoothMesh.subscribe(state => {
      setMeshState(state);
      if (state.activePacket?.authorityReceipt && onAuthorityDispatched) {
        onAuthorityDispatched(state.activePacket.authorityReceipt);
      }
    });

    if (autoStart && !meshState.isBroadcasting) {
      bluetoothMesh.startMeshBroadcast();
    }

    return () => unsubscribe();
  }, [autoStart]);

  const handleManualTrigger = () => {
    bluetoothMesh.startMeshBroadcast();
  };

  const handleScanPhysicalBle = async () => {
    setIsScanningBle(true);
    try {
      await bluetoothMesh.scanForPhysicalBleDevice();
    } finally {
      setIsScanningBle(false);
    }
  };

  const packet = meshState.activePacket;
  const isDispatched = packet?.status === 'DISPATCHED_TO_AUTHORITY';
  const isRelaying = meshState.isBroadcasting && !isDispatched;

  return (
    <div
      className={`rounded-2xl bg-[#141813] border border-[#2C342A] p-4 text-xs font-sans shadow-xl space-y-3.5 ${className}`}
    >
      {/* Header with Radio Beacon & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className={`h-5 w-5 ${meshState.isBroadcasting ? 'text-[#C8DC35] animate-pulse' : 'text-zinc-500'}`} />
            {meshState.isBroadcasting && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8DC35] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C8DC35]" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-sm text-[#F4F6F2] tracking-wide uppercase">
              <span>Bluetooth Mesh Relay Chain</span>
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-[#1E2512] text-[#C8DC35] px-2 py-0.5 rounded border border-[#C8DC35]/40">
                <WifiOff className="h-3 w-3" />
                <span>OFF-GRID 2.4GHz</span>
              </span>
            </div>
            <div className="text-[11px] text-[#9BA398]">
              Hop-by-hop BLE emergency relay to Higher Authorities (112 Command)
            </div>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
            isDispatched
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
              : meshState.isLoopActive
              ? 'bg-[#1E2512] text-[#C8DC35] border border-[#C8DC35]/60'
              : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {meshState.isLoopActive && <span className="h-1.5 w-1.5 rounded-full bg-[#C8DC35] animate-ping" />}
          {isDispatched
            ? `112 AUTHORITY ENGAGED · CYCLE #${meshState.loopCycle}`
            : meshState.isLoopActive
            ? `LOOP CYCLE #${meshState.loopCycle} · RELAYING`
            : 'MESH STANDBY'}
        </span>
      </div>

      {/* Web Bluetooth API Status Banner */}
      <div className="flex items-center justify-between text-[11px] font-mono bg-[#0F1210] p-2.5 rounded-xl border border-[#2C342A]">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <Signal className="h-3.5 w-3.5 text-[#C8DC35]" />
          <span>Web Bluetooth API:</span>
          <span className="text-[#C8DC35] font-bold">
            {meshState.bleConnected
              ? `Connected (${meshState.connectedDeviceName || 'BLE Hardware'})`
              : meshState.bluetoothSupported
              ? 'Default Browser API Armed'
              : '2.4 GHz Multi-Tab Broadcast Channel'}
          </span>
        </div>
        <span className="text-[10px] text-[#9BA398] bg-[#181C17] px-2 py-0.5 rounded border border-[#2C342A]">
          Heartbeat: 2.8s
        </span>
      </div>

      {/* Visual Chain Diagram */}
      <div className="p-3 rounded-xl bg-[#0F1210] border border-[#2C342A] space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#9BA398]">
          <span>Chain of Custody Traversal</span>
          <span>{packet ? `${packet.hopCount} Hops Completed` : 'Ready to Traverse'}</span>
        </div>

        {/* Nodes Representation */}
        <div className="grid grid-cols-4 gap-1.5 items-center text-center">
          {/* Node 1: Origin */}
          <div
            className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              meshState.isBroadcasting
                ? 'bg-red-950/60 border-red-500/80 text-red-200 ring-1 ring-red-500/50'
                : 'bg-[#181C17] border-[#2C342A] text-zinc-400'
            }`}
          >
            <User className="h-4 w-4" />
            <div className="font-extrabold text-[10px] leading-tight">Worker</div>
            <span className="text-[9px] font-mono text-zinc-400">Offline Origin</span>
          </div>

          {/* Node 2: Worker Peer Hop */}
          <div
            className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              packet && packet.hopCount >= 1
                ? 'bg-[#1E2512] border-[#C8DC35]/80 text-[#C8DC35]'
                : 'bg-[#181C17] border-[#2C342A] text-zinc-500 opacity-60'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <div className="font-extrabold text-[10px] leading-tight">Peer BLE</div>
            <span className="text-[9px] font-mono text-[#9BA398]">-58 dBm</span>
          </div>

          {/* Node 3: Transit Relay Hop */}
          <div
            className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              packet && packet.hopCount >= 2
                ? 'bg-[#1E2512] border-[#C8DC35]/80 text-[#C8DC35]'
                : 'bg-[#181C17] border-[#2C342A] text-zinc-500 opacity-60'
            }`}
          >
            <Bus className="h-4 w-4" />
            <div className="font-extrabold text-[10px] leading-tight">Transit Hub</div>
            <span className="text-[9px] font-mono text-[#9BA398]">-67 dBm</span>
          </div>

          {/* Node 4: Higher Authority Gateway */}
          <div
            className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              isDispatched
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                : 'bg-[#181C17] border-[#2C342A] text-zinc-500 opacity-60'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <div className="font-extrabold text-[10px] leading-tight">112 Dispatch</div>
            <span className="text-[9px] font-mono text-emerald-400">Authority</span>
          </div>
        </div>

        {/* Dynamic Chain Route Trace */}
        {packet && (
          <div className="p-2.5 rounded-lg bg-[#181C17] border border-[#2C342A] text-[11px] font-mono space-y-1">
            <div className="text-[#9BA398] font-bold text-[10px] uppercase">Active Bluetooth Route:</div>
            <div className="flex flex-wrap items-center gap-1 text-[#F4F6F2]">
              {packet.chain.map((c, i) => (
                <React.Fragment key={i}>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      c.role === 'higher_authority'
                        ? 'bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-500/40'
                        : c.role === 'origin'
                        ? 'bg-red-950 text-red-300 border border-red-500/40'
                        : 'bg-[#1E2512] text-[#C8DC35] border border-[#C8DC35]/40'
                    }`}
                  >
                    {c.nodeId}
                  </span>
                  {i < packet.chain.length - 1 && <span className="text-[#9BA398]">➔</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* HIGHER AUTHORITY OFFICIAL ESCALATION TICKET (When reached) */}
      {packet?.authorityReceipt && (
        <div className="rounded-xl bg-gradient-to-br from-emerald-950 to-zinc-900 border border-emerald-500/70 p-3.5 space-y-2 text-white animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold tracking-wide">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 stroke-[3]" />
              <span className="uppercase text-[11px]">HIGHER AUTHORITY ENGAGED</span>
            </div>
            <span className="font-mono text-[10px] bg-black/60 px-2 py-0.5 rounded text-emerald-300 border border-emerald-400/30">
              ETA: {packet.authorityReceipt.etaMinutes} MINS
            </span>
          </div>

          <div className="text-[11px] space-y-1 font-mono text-zinc-300">
            <div>
              <span className="text-[#9BA398]">Agency: </span>
              <strong className="text-white">{packet.authorityReceipt.agency}</strong>
            </div>
            <div>
              <span className="text-[#9BA398]">First Responder Unit: </span>
              <span className="text-emerald-300 font-bold">{packet.authorityReceipt.dispatchUnit}</span>
            </div>
            <div>
              <span className="text-[#9BA398]">Dispatch Ref: </span>
              <span className="text-[#C8DC35] underline">{packet.authorityReceipt.referenceId}</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls & Actions */}
      <div className="flex gap-2">
        {!meshState.isBroadcasting ? (
          <button
            type="button"
            onClick={handleManualTrigger}
            className="flex-1 py-3 px-3 rounded-xl bg-[#C8DC35] hover:bg-[#D4E83E] text-[#0F1210] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Radio className="h-4 w-4" />
            <span>Broadcast BLE Mesh SOS (Offline)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleManualTrigger}
            className="flex-1 py-3 px-3 rounded-xl bg-[#1E2512] border border-[#C8DC35]/60 hover:bg-[#283218] text-[#C8DC35] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Re-Broadcast Mesh Chain</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleScanPhysicalBle}
          disabled={isScanningBle}
          className="py-3 px-3 rounded-xl bg-[#181C17] hover:bg-[#222820] border border-[#2C342A] text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          title="Pair physical BLE peripheral using native Web Bluetooth API"
        >
          <Signal className="h-4 w-4 text-[#C8DC35]" />
          <span>{isScanningBle ? 'Scanning...' : 'Pair Web Bluetooth'}</span>
        </button>
      </div>

      {/* Expandable Live Radio Activity Log */}
      <div className="border-t border-[#2C342A] pt-2">
        <button
          type="button"
          onClick={() => setShowLogs(!showLogs)}
          className="w-full flex items-center justify-between text-[11px] text-[#9BA398] hover:text-white py-1 cursor-pointer"
        >
          <span className="font-mono">Live BLE Radio Activity Logs ({meshState.relayLog.length})</span>
          {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showLogs && (
          <div className="mt-2 p-2.5 rounded-xl bg-[#090B09] border border-[#2C342A] max-h-36 overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1">
            {meshState.relayLog.length === 0 ? (
              <div className="text-zinc-600">No radio activity logged yet. Click Broadcast to initiate chain.</div>
            ) : (
              meshState.relayLog.map((line, i) => (
                <div key={i} className="leading-tight">
                  {line}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

