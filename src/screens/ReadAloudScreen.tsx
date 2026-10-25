import React, { useState, useEffect } from 'react';
import { tts, SupportedLang } from '../lib/tts';
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Globe,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ReadAloudScreenProps {
  currentText?: string;
  lang: SupportedLang;
  onChangeLang: (lang: SupportedLang) => void;
}

export const ReadAloudScreen: React.FC<ReadAloudScreenProps> = ({
  currentText = 'Shift ends 2:00 AM. Home by 3:30 AM. Recommended route: Bus 109 plus 4 minute walk. Night safety score 82. Verified 5 minutes ago.',
  lang,
  onChangeLang
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [autoReadScreens, setAutoReadScreens] = useState(true);
  const [urgentAlertsVoice, setUrgentAlertsVoice] = useState(true);
  const [voiceAvailable, setVoiceAvailable] = useState(true);

  useEffect(() => {
    const isAvail = tts.checkVoiceAvailability(lang);
    setVoiceAvailable(isAvail);
  }, [lang]);

  const togglePlayback = () => {
    if (isPlaying) {
      tts.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      tts.speak(currentText, {
        lang,
        rate: speechRate,
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false)
      });
    }
  };

  const handleRestart = () => {
    tts.stop();
    setIsPlaying(true);
    tts.speak(currentText, {
      lang,
      rate: speechRate,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  };

  return (
    <div className="min-h-screen bg-[#18191B] text-[#ECEEF3] flex flex-col max-w-md mx-auto p-4 pb-24">
      <div className="gradient-bar w-full fixed top-0 left-0 right-0 z-10" />

      {/* Screen Title */}
      <div className="pt-6 pb-2">
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Volume2 className="h-4 w-4" />
          <span>Accessibility Audio Engine</span>
        </div>
        <h1 className="text-2xl font-black text-[#ECEEF3] mt-1.5">
          Read Aloud & Voice Guidance
        </h1>
        <p className="text-xs text-[#A3A8B0] mt-1">
          Designed for tired workers, one-handed navigation, and hands-free transit.
        </p>
      </div>

      {/* "Reading Now" Text Card */}
      <div className="my-4 rounded-3xl bg-[#232629] p-5 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A3A8B0]">
            Reading Current Screen
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              isPlaying
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40 animate-pulse'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {isPlaying ? 'Speaking Now...' : 'Idle'}
          </span>
        </div>

        <div className="rounded-2xl bg-[#18191B] p-4 border border-zinc-800/80 text-sm font-medium text-zinc-200 leading-relaxed min-h-[90px]">
          "{currentText}"
        </div>

        {/* Audio Controls Bar */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <button
            onClick={handleRestart}
            className="h-11 w-11 rounded-full bg-[#2E3236] text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
            title="Restart playback"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={togglePlayback}
            className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500 hover:scale-105'
            }`}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
          </button>
        </div>

        {/* Guaranteed Audible Web Audio Tones Test */}
        <div className="pt-3 border-t border-zinc-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2 text-center">
            Guaranteed Audio Synthesis Test (Web Audio Engine)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => tts.playWaypointDing()}
              className="py-2 px-2 rounded-xl bg-[#18191B] hover:bg-zinc-800 text-[11px] font-bold text-emerald-300 border border-emerald-900/40 text-center"
            >
              🔔 Ding Chime
            </button>
            <button
              type="button"
              onClick={() => tts.playAlertChime()}
              className="py-2 px-2 rounded-xl bg-[#18191B] hover:bg-zinc-800 text-[11px] font-bold text-amber-300 border border-amber-900/40 text-center"
            >
              ⚠️ Alert Chime
            </button>
            <button
              type="button"
              onClick={() => tts.playSosSiren()}
              className="py-2 px-2 rounded-xl bg-[#18191B] hover:bg-zinc-800 text-[11px] font-bold text-red-300 border border-red-900/40 text-center"
            >
              🚨 SOS Siren
            </button>
          </div>
        </div>
      </div>

      {/* Language Selection */}
      <div className="rounded-3xl bg-[#232629] p-5 border border-zinc-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A3A8B0]">
          <Globe className="h-4 w-4 text-emerald-400" />
          <span>Speech Language</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'en' as SupportedLang, label: 'English' },
            { id: 'hi' as SupportedLang, label: 'हिन्दी' },
            { id: 'mr' as SupportedLang, label: 'मराठी' }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => {
                onChangeLang(l.id);
                if (isPlaying) tts.stop();
              }}
              className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                lang === l.id
                  ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                  : 'bg-[#18191B] border-zinc-800 text-[#A3A8B0] hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {!voiceAvailable && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Regional voice missing in browser. Standard voice will be used.</span>
          </div>
        )}
      </div>

      {/* Speed Slider */}
      <div className="mt-4 rounded-3xl bg-[#232629] p-5 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#A3A8B0]">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-zinc-400" />
            <span>Voice Speed</span>
          </div>
          <span className="text-emerald-400 font-mono">{speechRate}x</span>
        </div>

        <input
          type="range"
          min="0.75"
          max="1.5"
          step="0.1"
          value={speechRate}
          onChange={e => {
            const r = parseFloat(e.target.value);
            setSpeechRate(r);
            tts.rate = r;
          }}
          className="w-full accent-emerald-500 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-zinc-400">
          <span>0.75x (Relaxed)</span>
          <span>1.0x (Normal)</span>
          <span>1.5x (Fast)</span>
        </div>
      </div>

      {/* Hardware Tone Synthesizer Tests (100% Reliable Web Audio) */}
      <div className="mt-4 rounded-3xl bg-[#232629] p-5 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#A3A8B0]">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-400" />
            <span>Sound Effects & Hardware Tones</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">Web Audio API</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => tts.playWaypointDing()}
            className="p-3 rounded-2xl bg-[#18191B] border border-zinc-800 hover:border-emerald-500/50 text-center transition-all group"
          >
            <div className="text-sm">🔔</div>
            <div className="text-[11px] font-bold text-zinc-200 mt-1 group-hover:text-emerald-400">Waypoint Ding</div>
            <div className="text-[9px] text-zinc-500">660Hz / 880Hz</div>
          </button>

          <button
            onClick={() => tts.playAlertChime()}
            className="p-3 rounded-2xl bg-[#18191B] border border-zinc-800 hover:border-amber-500/50 text-center transition-all group"
          >
            <div className="text-sm">⚠️</div>
            <div className="text-[11px] font-bold text-zinc-200 mt-1 group-hover:text-amber-400">Alert Chime</div>
            <div className="text-[9px] text-zinc-500">440Hz / 550Hz</div>
          </button>

          <button
            onClick={() => tts.playSosSiren()}
            className="p-3 rounded-2xl bg-[#18191B] border border-zinc-800 hover:border-red-500/50 text-center transition-all group"
          >
            <div className="text-sm">🚨</div>
            <div className="text-[11px] font-bold text-zinc-200 mt-1 group-hover:text-red-400">SOS Siren</div>
            <div className="text-[9px] text-zinc-500">800Hz / 600Hz</div>
          </button>
        </div>
      </div>

      {/* Auto-read Toggles */}
      <div className="mt-4 space-y-2">
        <label className="flex items-center justify-between p-4 rounded-2xl bg-[#232629] border border-zinc-800 cursor-pointer">
          <div>
            <div className="font-bold text-xs text-[#ECEEF3]">
              Read Each Screen Automatically
            </div>
            <div className="text-[11px] text-[#A3A8B0]">
              Speaks screen summary upon opening
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoReadScreens}
            onChange={e => setAutoReadScreens(e.target.checked)}
            className="h-5 w-5 accent-emerald-500 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-4 rounded-2xl bg-[#232629] border border-zinc-800 cursor-pointer">
          <div>
            <div className="font-bold text-xs text-[#ECEEF3]">
              Speak Urgent Alerts
            </div>
            <div className="text-[11px] text-[#A3A8B0]">
              Speaks replan reasons & safety warnings instantly
            </div>
          </div>
          <input
            type="checkbox"
            checked={urgentAlertsVoice}
            onChange={e => setUrgentAlertsVoice(e.target.checked)}
            className="h-5 w-5 accent-emerald-500 rounded"
          />
        </label>
      </div>
    </div>
  );
};

