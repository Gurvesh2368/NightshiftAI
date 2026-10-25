import React, { useState, useEffect, useRef } from 'react';
import { TripPlan } from '../engine/types';
import { MapView } from '../components/MapView';
import { MOCK_PLACES } from '../data/mockScenario';
import { tts, SupportedLang } from '../lib/tts';
import {
  Navigation,
  Volume2,
  VolumeX,
  AlertTriangle,
  Eye,
  CheckCircle,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ShieldCheck,
  Compass,
  Share2,
  Check
} from 'lucide-react';
import { buildEmergencySituation } from '../lib/emergencyEmail';

interface NavigateScreenProps {
  plan: TripPlan;
  lang?: SupportedLang;
  onArriveHome: () => void;
  onTriggerSos: () => void;
  onReplan: (reason: string) => void;
  onBack: () => void;
}

export const NavigateScreen: React.FC<NavigateScreenProps> = ({
  plan,
  lang = 'en',
  onArriveHome,
  onTriggerSos,
  onReplan,
  onBack
}) => {
  // Navigation simulation steps
  const polyline = plan.polyline || [];
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [simPlaying, setSimPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [etaRemainingMin, setEtaRemainingMin] = useState(plan.etaP50Min);
  const [sharedToast, setSharedToast] = useState(false);

  // Active coords
  const currentCoords = polyline[currentStepIdx] || polyline[0] || [72.8625, 19.0640];

  // Turn instructions
  const allInstructions = plan.legs.flatMap(l => l.instructions);
  const activeInstruction =
    allInstructions[Math.min(currentStepIdx, allInstructions.length - 1)] ||
    allInstructions[0] || {
      text: 'Follow illuminated corridor towards your destination',
      textHi: 'आपल्या गंतव्यस्थानाकडे प्रकाशित कॉरिडॉरचे अनुसरण करा',
      textMr: 'आपल्या गंतव्यस्थानाकडे प्रकाशित कॉरिडॉरचे अनुसरण करा',
      distanceM: 150,
      action: 'straight'
    };

  // Get spoken text based on selected language
  const getSpokenText = () => {
    if (lang === 'hi' && activeInstruction.textHi) return activeInstruction.textHi;
    if (lang === 'mr' && activeInstruction.textMr) return activeInstruction.textMr;
    return activeInstruction.text;
  };

  // Speak instruction whenever step changes
  useEffect(() => {
    if (voiceEnabled) {
      const text = getSpokenText();
      tts.playWaypointDing();
      tts.speak(text, { lang });
    }
  }, [currentStepIdx, voiceEnabled, lang]);

  // Wake Lock API integration
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          setWakeLockActive(true);
          wakeLock.addEventListener('release', () => setWakeLockActive(false));
        }
      } catch (err) {
        console.warn('Wake lock error:', err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
      tts.stop();
    };
  }, []);

  // Simulator timer
  useEffect(() => {
    let timer: any = null;
    if (simPlaying) {
      timer = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev < polyline.length - 1) {
            const next = prev + 1;
            setEtaRemainingMin(m => Math.max(1, m - 4));
            return next;
          } else {
            setSimPlaying(false);
            return prev;
          }
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [simPlaying, polyline.length]);

  // Simulate off-route divergence
  const triggerSimulatedOffRoute = () => {
    setIsOffRoute(true);
    tts.playAlertChime();
    if (voiceEnabled) {
      tts.speak('Off route detected. Recomputing safest illuminated path.', { lang });
    }
    setTimeout(() => {
      onReplan('Off-route detected: Automatically rerouted to well-lit main arterial road.');
      setIsOffRoute(false);
    }, 2000);
  };

  const handleShareLiveLocation = async () => {
    const sit = buildEmergencySituation({ lat: currentCoords[1], lng: currentCoords[0] }, 'manual');
    const shareUrl = sit.trackingUrl;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NightShift AI — Live Trip GPS',
          text: `I'm travelling home via ${plan.name}. Watch my live location in real time:`,
          url: shareUrl
        });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 3000);
  };

  const isAtFinalStep = currentStepIdx >= polyline.length - 1;

  return (
    <div className="min-h-screen bg-[#18191B] text-[#ECEEF3] flex flex-col max-w-md mx-auto pb-safe">
      <div className="gradient-bar w-full fixed top-0 left-0 right-0 z-10" />

      {/* Top Banner: Turn-by-Turn Guidance */}
      <div className="bg-[#232629] border-b border-zinc-800 p-4 pt-6 shadow-xl z-20">
        <div className="flex items-center justify-between text-xs text-[#A3A8B0] mb-2 font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Compass className="h-4 w-4 animate-spin-slow" />
            <span>LIVE NAVIGATION · {plan.mode.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            {wakeLockActive && (
              <span className="flex items-center gap-1 text-[10px] bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full">
                <Eye className="h-3 w-3" /> Screen Awake
              </span>
            )}
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (voiceEnabled) tts.stop();
              }}
              className="p-1 rounded-lg bg-[#2E3236] text-zinc-300 hover:text-white"
              title="Toggle voice announcements"
            >
              {voiceEnabled ? (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-zinc-500" />
              )}
            </button>
          </div>
        </div>

        {/* Big Next Turn Instruction */}
        <div className="flex items-start gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/50">
            <Navigation className="h-6 w-6 transform rotate-45" />
          </div>
          <div className="flex-1">
            <div className="text-base font-extrabold text-[#ECEEF3] leading-snug">
              {getSpokenText()}
            </div>
            <div className="text-xs text-[#A3A8B0] mt-1 flex items-center gap-2">
              <span>Next waypoint in {activeInstruction.distanceM || 150}m</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                Corridor: Well Lit LED
              </span>
            </div>
          </div>
        </div>

        {/* Off Route Warning Banner */}
        {isOffRoute && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-950/80 border border-amber-600/40 text-amber-200 text-xs flex items-center gap-2 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Off route detected &gt; 50m. Recomputing safest feasible route...</span>
          </div>
        )}

        {/* Live location shared toast */}
        {sharedToast && (
          <div className="mt-2 p-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Live GPS tracking link copied & sent to patilgurveshp@gmail.com!</span>
          </div>
        )}
      </div>

      {/* Interactive Map Section */}
      <div className="relative w-full px-3 py-2" style={{ minHeight: '380px', height: '420px' }}>
        <MapView
          className="h-full w-full"
          routeCoordinates={polyline}
          currentPosition={currentCoords}
          places={MOCK_PLACES}
          zoom={14.5}
          center={currentCoords}
        />

        {/* Floating Top-Right SOS & Family Location Share Controls */}
        <div className="absolute top-5 right-5 z-30 flex flex-col items-end gap-2">
          <button
            onClick={onTriggerSos}
            className="flex items-center gap-2 py-2 px-3.5 rounded-full bg-red-600 text-white font-extrabold text-xs shadow-xl shadow-red-950/60 hover:bg-red-500 active:scale-95 transition-all"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>SOS (1-TAP)</span>
          </button>

          <button
            onClick={handleShareLiveLocation}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-zinc-900/90 backdrop-blur-md text-emerald-400 font-bold text-[11px] shadow-lg hover:bg-zinc-800 transition-all border border-emerald-500/40"
            title="Share live moving location with family (patilgurveshp@gmail.com)"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share with Family</span>
          </button>
        </div>

        {/* Floating Bottom Trip ETA Ribbon */}
        <div className="absolute bottom-5 left-5 right-5 z-30 flex items-center justify-between p-3.5 rounded-2xl bg-[#232629]/95 backdrop-blur-md border border-zinc-700/80 shadow-2xl">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#A3A8B0]">
              Safe Arrival Countdown
            </div>
            <div className="text-lg font-black text-emerald-400">
              {etaRemainingMin} min remaining
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#A3A8B0]">
              Deadline: 03:30 AM
            </div>
            <div className="text-xs font-semibold text-[#ECEEF3]">
              +47m safe buffer
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls & Demo GPX Simulator */}
      <div className="bg-[#18191B] border-t border-zinc-800 p-4 space-y-3">
        {/* Simulator controls for easy testing indoor */}
        <div className="rounded-2xl bg-[#232629] p-3 border border-zinc-800 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-[#A3A8B0] block">GPS Simulation</span>
            <span className="font-semibold text-emerald-400">
              Waypoint {currentStepIdx + 1} of {polyline.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStepIdx(0)}
              className="p-2 rounded-xl bg-[#2E3236] text-zinc-300 hover:text-white"
              title="Reset Route"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSimPlaying(!simPlaying)}
              className={`p-2 rounded-xl ${
                simPlaying ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
              }`}
              title={simPlaying ? 'Pause GPX' : 'Auto Play GPX'}
            >
              {simPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() =>
                setCurrentStepIdx(prev => Math.min(polyline.length - 1, prev + 1))
              }
              className="p-2 rounded-xl bg-[#2E3236] text-zinc-300 hover:text-white"
              title="Step Forward"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Divergence test button */}
        <div className="flex gap-2">
          <button
            onClick={triggerSimulatedOffRoute}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#2E3236] text-xs font-semibold text-amber-300 border border-amber-600/30 hover:bg-[#383d42] transition-colors"
          >
            Simulate Off-Route Divergence
          </button>
          <button
            onClick={onBack}
            className="py-2.5 px-3 rounded-xl bg-[#2E3236] text-xs text-[#A3A8B0] hover:text-white"
          >
            Exit Nav
          </button>
        </div>

        {/* Primary Arrival CTA */}
        {isAtFinalStep ? (
          <button
            onClick={onArriveHome}
            className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 hover:bg-emerald-500 animate-bounce transition-all"
          >
            <CheckCircle className="h-5 w-5" />
            <span>I've Arrived Home Safely (Clear Timer)</span>
          </button>
        ) : (
          <button
            onClick={onArriveHome}
            className="w-full py-3.5 rounded-2xl gradient-cta text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Confirm Safe Arrival Early</span>
          </button>
        )}
      </div>
    </div>
  );
};

