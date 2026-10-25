import React, { useState } from 'react';
import { HoldButton } from '../components/HoldButton';
import { PhoneCall, Mic, Users, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface HelpScreenProps {
  onTriggerSos: () => void;
  contacts?: any[];
}

export const HelpScreen: React.FC<HelpScreenProps> = ({
  onTriggerSos,
  contacts = [
    { name: 'Family (patilgurveshp@gmail.com)', phone: '+91 98200 11223', status: 'Accepted · Auto Email' },
    { name: 'Pooja (Sister)', phone: '+91 98200 11223', status: 'Accepted' },
    { name: 'Suresh (Coworker)', phone: '+91 97690 44556', status: 'Invited' }
  ]
}) => {
  const [listeningVoice, setListeningVoice] = useState(false);

  const startVoiceHelpDetection = () => {
    setListeningVoice(true);
    // Simulate voice "help" detection
    setTimeout(() => {
      setListeningVoice(false);
      onTriggerSos();
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#18191B] text-[#ECEEF3] flex flex-col max-w-md mx-auto p-4 pb-24">
      <div className="gradient-bar w-full fixed top-0 left-0 right-0 z-10" />

      {/* Screen Title */}
      <div className="pt-6 pb-2 text-center">
        <h1 className="text-2xl font-black text-[#ECEEF3]">Emergency Assistance</h1>
        <p className="text-xs text-[#A3A8B0] mt-1">
          Zero typing in emergencies · Help in ≤ 2 taps
        </p>
      </div>

      {/* Center 2-Second Hold Button */}
      <div className="my-auto py-6 flex justify-center">
        <HoldButton
          onTrigger={onTriggerSos}
          durationMs={2000}
          label="HOLD FOR 2 SECONDS"
          sublabel="Alerts your trusted contacts with live location link. Does not call emergency dispatch directly."
        />
      </div>

      {/* Direct 112 & Voice Options */}
      <div className="space-y-3 mb-6">
        {/* Direct 112 Call */}
        <a
          href="tel:112"
          className="flex items-center justify-between p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm">Call 112 (National Emergency)</div>
              <div className="text-xs text-rose-200 opacity-90">Police, Ambulance, Fire</div>
            </div>
          </div>
          <span className="font-mono text-xs font-bold bg-white text-red-950 px-3 py-1.5 rounded-xl">
            CALL 112
          </span>
        </a>

        {/* Voice Trigger Option */}
        <button
          onClick={startVoiceHelpDetection}
          className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
            listeningVoice
              ? 'bg-amber-950/80 border-amber-500 text-amber-200 animate-pulse'
              : 'bg-[#232629] border-zinc-800 text-[#ECEEF3] hover:bg-[#2E3236]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#2E3236] text-amber-400">
              <Mic className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs">
                {listeningVoice ? 'Listening... Say "HELP"' : 'Speak: Say "HELP"'}
              </div>
              <div className="text-[11px] text-[#A3A8B0]">Voice-activated emergency trigger</div>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-400">
            {listeningVoice ? 'LISTENING' : 'ACTIVATE'}
          </span>
        </button>
      </div>

      {/* Trusted Contacts Registry Status */}
      <div className="rounded-3xl bg-[#232629] p-4 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#A3A8B0]">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-400" />
            <span>Trusted Contacts Tree</span>
          </div>
          <span className="text-[11px] text-zinc-500">Auto Call-Tree</span>
        </div>

        <div className="space-y-2">
          {contacts.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#18191B] border border-zinc-800/80 text-xs"
            >
              <div>
                <div className="font-semibold text-[#ECEEF3]">{c.name}</div>
                <div className="text-[11px] font-mono text-[#A3A8B0]">{c.phone}</div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  c.status === 'Accepted'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

