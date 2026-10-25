import React, { useState, useEffect } from 'react';
import { MapView } from '../components/MapView';
import {
  AlertTriangle,
  PhoneCall,
  CheckCircle,
  Shield,
  Navigation,
  Battery,
  Clock,
  MapPin,
  ExternalLink,
  MessageSquare,
  Hospital
} from 'lucide-react';
import { getStoredCoords, reverseGeocode } from '../lib/geo';

interface ContactAlertPageProps {
  workerName?: string;
  onBackToApp: () => void;
}

export const ContactAlertPage: React.FC<ContactAlertPageProps> = ({
  workerName = 'Gurvesh Patil',
  onBackToApp
}) => {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialLat = urlParams?.get('lat') ? parseFloat(urlParams.get('lat')!) : getStoredCoords().lat;
  const initialLng = urlParams?.get('lng') ? parseFloat(urlParams.get('lng')!) : getStoredCoords().lng;
  const initialUser = urlParams?.get('user') || workerName;

  const [acknowledged, setAcknowledged] = useState(false);
  const [secondsSinceLastPing, setSecondsSinceLastPing] = useState(4);
  const [coords, setCoords] = useState<[number, number]>([initialLng, initialLat]);
  const [locationName, setLocationName] = useState<string>('Live GPS Telemetry Stream');

  useEffect(() => {
    reverseGeocode(initialLat, initialLng).then(addr => {
      setLocationName(addr);
    });
  }, [initialLat, initialLng]);

  // Simulate live telemetry ping every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceLastPing(s => {
        if (s > 15) {
          // slight jitter simulating live GPS movement
          setCoords([initialLng + (Math.random() - 0.5) * 0.0003, initialLat + (Math.random() - 0.5) * 0.0003]);
          return 1;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [initialLat, initialLng]);

  const googleMapsUrl = `https://www.google.com/maps?q=${coords[1]},${coords[0]}`;

  return (
    <div className="min-h-screen bg-[#18191B] text-[#ECEEF3] flex flex-col max-w-md mx-auto p-4 pb-12">
      <div className="gradient-bar w-full fixed top-0 left-0 right-0 z-10" />

      {/* Emergency Header */}
      <div className="pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-950/80 border border-red-800/60 px-3 py-1 rounded-full animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            <span>FAMILY EMERGENCY DISPATCH PORTAL</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            Live Stream
          </span>
        </div>

        <h1 className="text-2xl font-black text-[#ECEEF3] mt-2">
          {workerName} needs assistance
        </h1>
        <p className="text-xs text-[#A3A8B0] mt-1">
          Real-time GPS tracking · Telemetry updating every 15s
        </p>
      </div>

      {/* Live Map with Route and Safe Spots */}
      <div className="my-3 rounded-3xl overflow-hidden border-2 border-red-500/60 shadow-2xl shadow-red-950/60" style={{ height: '320px' }}>
        <MapView
          className="h-full w-full"
          center={coords}
          zoom={15}
          currentPosition={coords}
        />
      </div>

      {/* Telemetry Status Bar */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
        <div className="p-2.5 rounded-2xl bg-[#232629] border border-zinc-800">
          <span className="text-[10px] text-[#A3A8B0] block uppercase font-bold">GPS Accuracy</span>
          <span className="font-bold text-emerald-400">±5 meters</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#232629] border border-zinc-800">
          <span className="text-[10px] text-[#A3A8B0] block uppercase font-bold">Last Ping</span>
          <span className="font-bold text-[#ECEEF3]">{secondsSinceLastPing}s ago</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#232629] border border-zinc-800">
          <span className="text-[10px] text-[#A3A8B0] block uppercase font-bold">Battery</span>
          <span className="font-bold text-emerald-400">78% · Online</span>
        </div>
      </div>

      {/* Full Situation Summary Card */}
      <div className="rounded-3xl bg-[#232629] p-4 border border-zinc-800 space-y-3 mb-4 text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="font-bold uppercase tracking-wider text-[#A3A8B0] text-[10px]">
            Incident Telemetry
          </span>
          <span className="text-zinc-400 truncate max-w-[200px]">{locationName}</span>
        </div>

        <div className="space-y-1.5 text-zinc-300">
          <div className="flex justify-between">
            <span className="text-[#A3A8B0]">Target Destination:</span>
            <span className="font-semibold text-white">Shivneri Nagar, Kurla West</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#A3A8B0]">Emergency Medical:</span>
            <span className="font-semibold text-rose-300">Blood Group O+ · No allergies</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#A3A8B0]">Nearest Safe Spot:</span>
            <span className="font-semibold text-emerald-400">City Hospital (1.2 km away)</span>
          </div>
        </div>
      </div>

      {/* Action Buttons for Family */}
      <div className="space-y-2.5 mt-auto">
        {!acknowledged ? (
          <button
            onClick={() => setAcknowledged(true)}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 active:scale-[0.98] transition-all"
          >
            <CheckCircle className="h-5 w-5" />
            <span>I'm Responding / On My Way</span>
          </button>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>{workerName} has been notified on their screen that you are responding.</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:+919876543210"
            className="py-3 px-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md text-center"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Call Worker</span>
          </a>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-3 rounded-2xl bg-[#2E3236] hover:bg-[#383d42] text-[#ECEEF3] font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 text-center"
          >
            <Navigation className="h-4 w-4 text-emerald-400" />
            <span>Google Maps</span>
          </a>
        </div>

        <a
          href="tel:112"
          className="w-full py-2.5 rounded-2xl bg-zinc-900 border border-red-800/60 hover:bg-zinc-800 text-red-300 font-bold text-xs flex items-center justify-center gap-2 text-center"
        >
          <span>Dispatch Emergency Services (Call 112)</span>
        </a>

        <button
          onClick={onBackToApp}
          className="w-full py-2 text-xs text-[#A3A8B0] hover:text-white underline text-center"
        >
          Return to NightShift App
        </button>
      </div>
    </div>
  );
};
