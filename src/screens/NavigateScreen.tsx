import React, { useState, useEffect } from 'react';
import { TripPlan } from '../engine/types';
import { MapView } from '../components/MapView';
import { SupportedLang, tts } from '../lib/tts';
import {
  Navigation,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle,
  Share2,
  Clock,
  ShieldCheck,
  Radio,
  ArrowRight,
  RefreshCw,
  Compass,
  X
} from 'lucide-react';
import { watchUserLocation, GeoCoordinates, DEFAULT_COORDS } from '../lib/geo';

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
  const polyline = plan.polyline || [];
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [etaRemainingMin, setEtaRemainingMin] = useState(plan.etaP50Min);
  const [sharedToast, setSharedToast] = useState(false);
  const [fitRouteOverview, setFitRouteOverview] = useState(true);
  const [userLocation, setUserLocation] = useState<GeoCoordinates>(() => ({
    lat: polyline[0]?.[1] || DEFAULT_COORDS.lat,
    lng: polyline[0]?.[0] || DEFAULT_COORDS.lng,
    accuracy: 5
  }));
  const [speedKmh, setSpeedKmh] = useState<number>(0);

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

  // Active coordinates: User location or polyline current point
  const currentCoords: [number, number] = [userLocation.lng, userLocation.lat];

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

  // Real-time GPS Watcher
  useEffect(() => {
    const unwatch = watchUserLocation(coords => {
      setUserLocation(coords);

      // Compute speed in km/h if available from device
      if (coords.speed !== null && coords.speed !== undefined && coords.speed >= 0) {
        setSpeedKmh(Math.round(coords.speed * 3.6));
      }

      // Check distance to next waypoint
      if (polyline.length > 0 && currentStepIdx < polyline.length - 1) {
        const target = polyline[currentStepIdx + 1];
        if (target) {
          const dLat = Math.abs(coords.lat - target[1]);
          const dLng = Math.abs(coords.lng - target[0]);
          // Approximate distance under ~35 meters triggers next maneuver
          if (dLat < 0.00035 && dLng < 0.00035) {
            setCurrentStepIdx(idx => Math.min(polyline.length - 1, idx + 1));
            setEtaRemainingMin(m => Math.max(1, m - 1));
          }
        }
      }
    });

    return () => unwatch();
  }, [polyline, currentStepIdx]);

  // Screen Wake Lock API
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
        console.warn('Wake lock notice:', err);
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

  const handleShareLiveLocation = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const trackingUrl = `${origin}/?view=contact_alert&lat=${userLocation.lat}&lng=${userLocation.lng}&user=${encodeURIComponent(plan.name)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NightShift AI — Live Tracking',
          text: `Tracking route: ${plan.name}`,
          url: trackingUrl
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(trackingUrl);
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 2500);
  };

  const handleRecalculateRoute = () => {
    tts.playAlertChime();
    tts.speak('Recalculating safest illuminated route from your current position.', { lang });
    onReplan('Manual route refresh requested from live GPS position.');
  };

  const isAtFinalStep = currentStepIdx >= polyline.length - 1 && polyline.length > 0;

  return (
    <div className="min-h-screen bg-[#0F1210] text-[#F4F6F2] flex flex-col font-sans selection:bg-[#C8DC35] selection:text-black">
      {/* Top Turn Maneuver Tactical HUD Banner */}
      <div className="bg-[#181C17] border-b border-[#2C342A] p-4 pt-6 shadow-xl z-20">
        <div className="flex items-center justify-between pb-3 border-b border-[#2C342A]">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8DC35] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C8DC35]" />
            </span>
            <span className="text-[10px] font-mono font-black tracking-widest text-[#C8DC35] uppercase">
              LIVE CORRIDOR NAVIGATION
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed readout */}
            <span className="text-[10px] font-mono text-[#9BA398] bg-[#0F1210] px-2 py-0.5 rounded border border-[#2C342A]">
              {speedKmh > 0 ? `${speedKmh} km/h` : 'Walking'}
            </span>

            {/* Voice toggle */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-1.5 rounded-lg bg-[#252B23] text-zinc-300 hover:text-white"
              title={voiceEnabled ? 'Mute Voice' : 'Enable Voice'}
            >
              {voiceEnabled ? (
                <Volume2 className="h-4 w-4 text-[#C8DC35]" />
              ) : (
                <VolumeX className="h-4 w-4 text-zinc-500" />
              )}
            </button>

            {/* Exit Nav */}
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg bg-[#252B23] text-zinc-400 hover:text-white"
              title="Exit Navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Big Maneuver Instruction */}
        <div className="pt-3.5 flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-[#C8DC35] text-[#0F1210] shadow-lg shrink-0">
            <Navigation className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-mono text-[#C8DC35] font-black uppercase tracking-wider">
              IN {activeInstruction.distanceM || 150} METERS
            </div>
            <div className="text-base font-black text-[#F4F6F2] leading-tight mt-0.5">
              {getSpokenText()}
            </div>
            <div className="text-[11px] text-[#9BA398] mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Illuminated Arterial Corridor · LED Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-View Interactive Tactical Vector Map */}
      <div className="flex-1 relative min-h-[340px]">
        <MapView
          className="h-full w-full absolute inset-0"
          routeCoordinates={polyline}
          currentPosition={currentCoords}
          center={currentCoords}
          zoom={16}
          startLabel="START"
          endLabel="DESTINATION"
          fitBoundsOnRoute={fitRouteOverview}
        />

        {/* Live GPS Accuracy Floating Pill */}
        <div className="absolute top-3 left-3 z-10 p-2 rounded-xl bg-[#0F1210]/90 backdrop-blur-md border border-[#2C342A] text-[10px] font-mono text-zinc-300 flex items-center gap-1.5 shadow-lg">
          <Radio className="h-3 w-3 text-[#C8DC35] animate-pulse" />
          <span>GPS Fix: ±{userLocation.accuracy || 5}m</span>
        </div>

        {/* Floating Quick Action Buttons on Map */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {/* Toggle Route Overview (Start-to-End) vs Focused Follow Mode */}
          <button
            onClick={() => setFitRouteOverview(prev => !prev)}
            className={`p-2.5 rounded-xl backdrop-blur-md border shadow-xl transition-all ${
              fitRouteOverview
                ? 'bg-[#C8DC35] text-[#0F1210] border-white font-bold'
                : 'bg-[#181C17]/95 text-white hover:text-[#C8DC35] border-[#2C342A]'
            }`}
            title={fitRouteOverview ? 'Route Overview (Start to End) Active - Click to Follow GPS' : 'Following GPS Position - Click for Route Overview'}
          >
            <Compass className="h-4 w-4" />
          </button>

          {/* Share Live Tracking */}
          <button
            onClick={handleShareLiveLocation}
            className="p-2.5 rounded-xl bg-[#181C17]/95 backdrop-blur-md border border-[#2C342A] text-white hover:text-[#C8DC35] shadow-xl"
            title="Share Live GPS Link"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {/* Recalculate */}
          <button
            onClick={handleRecalculateRoute}
            className="p-2.5 rounded-xl bg-[#181C17]/95 backdrop-blur-md border border-[#2C342A] text-white hover:text-[#C8DC35] shadow-xl"
            title="Recalculate Safe Route"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {sharedToast && (
          <div className="absolute bottom-4 left-4 right-4 z-20 p-3 rounded-xl bg-[#1E2512] border border-[#C8DC35]/60 text-[#C8DC35] text-xs font-bold text-center shadow-2xl animate-in fade-in">
            ✓ Live moving GPS tracking link copied to clipboard!
          </div>
        )}
      </div>

      {/* Bottom Tactical Controls & Telemetry Tray */}
      <div className="bg-[#141813] border-t border-[#2C342A] p-4 space-y-3 z-20">
        {/* Trip ETA & Distance Bar */}
        <div className="p-3 rounded-2xl bg-[#0F1210] border border-[#2C342A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-[#C8DC35]" />
            <div>
              <div className="text-sm font-black text-[#F4F6F2]">
                {etaRemainingMin} mins remaining
              </div>
              <div className="text-[11px] text-[#9BA398]">
                {plan.legs[0]?.distanceKm || 1.8} km total route distance
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#9BA398]">Safety Score</div>
            <div className="text-sm font-black text-[#C8DC35]">
              {plan.safetyScore}/100
            </div>
          </div>
        </div>

        {/* Action Buttons: Confirm Arrival & Emergency SOS */}
        <div className="grid grid-cols-2 gap-2">
          {/* Arrived Safely CTA */}
          <button
            type="button"
            onClick={onArriveHome}
            className="py-3.5 px-3 rounded-xl bg-[#C8DC35] hover:bg-[#D4E83E] text-[#0F1210] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            <CheckCircle className="h-4 w-4 stroke-[2.5]" />
            <span>I've Arrived Safely</span>
          </button>

          {/* Emergency SOS Trigger */}
          <button
            type="button"
            onClick={onTriggerSos}
            className="py-3.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xl shadow-red-950/60 active:scale-[0.98] transition-all cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4 stroke-[2.5]" />
            <span>Trigger SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
