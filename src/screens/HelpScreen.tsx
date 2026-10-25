import React, { useState, useEffect, useRef } from 'react';
import { HoldButton } from '../components/HoldButton';
import { PhoneCall, Mic, MicOff, Users, ShieldCheck, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';
import { tts } from '../lib/tts';

interface HelpScreenProps {
  onTriggerSos: () => void;
  contacts?: any[];
}

export const HelpScreen: React.FC<HelpScreenProps> = ({
  onTriggerSos,
  contacts = [
    { name: 'Affected User (patilgurveshp@gmail.com)', phone: '+91 98765 43210', status: 'Primary Disaster Alert' },
    { name: 'Emergency Family Network', phone: '+91 98200 11223', status: 'Active · Auto Alert' },
    { name: 'Emergency Dispatch Desk', phone: '112', status: 'Direct Responder' }
  ]
}) => {
  const [listeningVoice, setListeningVoice] = useState(false);
  const [heardTranscript, setHeardTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Stop voice recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const toggleVoiceDetection = () => {
    if (listeningVoice) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setListeningVoice(false);
      setSpeechError(null);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setSpeechError('Speech recognition is not supported in this browser. Please use the 2-Second Hold SOS button.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setListeningVoice(true);
        setSpeechError(null);
        tts.playWaypointDing();
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        const clean = transcript.trim();
        setHeardTranscript(clean);

        // Emergency trigger keywords
        const lower = clean.toLowerCase();
        if (
          lower.includes('help') ||
          lower.includes('bachao') ||
          lower.includes('emergency') ||
          lower.includes('police') ||
          lower.includes('sos')
        ) {
          tts.speak('Emergency distress keyword recognized. Triggering SOS now.');
          recognition.stop();
          setListeningVoice(false);
          onTriggerSos();
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[Speech] Recognition event:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone in browser settings.');
        } else {
          setSpeechError(`Voice detection stopped (${event.error}). Tap to restart.`);
        }
        setListeningVoice(false);
      };

      recognition.onend = () => {
        setListeningVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setSpeechError(`Unable to start microphone: ${err.message}`);
      setListeningVoice(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1210] text-[#F4F6F2] flex flex-col max-w-md mx-auto p-4 pb-24 font-sans selection:bg-[#C8DC35] selection:text-black">
      <div className="gradient-bar w-full fixed top-0 left-0 right-0 z-10" />

      {/* Screen Title */}
      <div className="pt-6 pb-2 text-center">
        <h1 className="text-2xl font-black text-[#F4F6F2]">Emergency Assistance</h1>
        <p className="text-xs text-[#9BA398] mt-1">
          Zero typing in emergencies · Hardware Hold or Real Voice Trigger
        </p>
      </div>

      {/* Center 2-Second Hold Button */}
      <div className="my-auto py-6 flex justify-center">
        <HoldButton
          onTrigger={onTriggerSos}
          durationMs={2000}
          label="HOLD FOR 2 SECONDS"
          sublabel="Alerts your emergency contacts with live GPS stream, SMS, and Email. Does not call 112 directly without confirmation."
        />
      </div>

      {/* Direct 112 & Real Voice Trigger */}
      <div className="space-y-3 mb-6">
        {/* Direct 112 Call */}
        <a
          href="tel:112"
          className="flex items-center justify-between p-4 rounded-2xl bg-red-600 hover:bg-red-500 border border-red-500/60 text-white active:scale-[0.98] transition-all shadow-xl shadow-red-950/60 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-black/40">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm">Call 112 (National Emergency)</div>
              <div className="text-xs text-rose-100">Police, Ambulance, Fire Dispatch</div>
            </div>
          </div>
          <span className="font-mono text-xs font-black bg-white text-red-700 px-3 py-1.5 rounded-xl">
            CALL 112
          </span>
        </a>

        {/* Real Voice Trigger (Speech Recognition) */}
        <div className="rounded-2xl bg-[#181C17] border border-[#2C342A] p-3.5 space-y-2">
          <button
            type="button"
            onClick={toggleVoiceDetection}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
              listeningVoice
                ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse'
                : 'bg-[#0F1210] border-[#2C342A] text-[#F4F6F2] hover:bg-[#252B23]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${listeningVoice ? 'bg-red-600 text-white' : 'bg-[#252B23] text-[#C8DC35]'}`}>
                {listeningVoice ? <Mic className="h-4 w-4 animate-bounce" /> : <Mic className="h-4 w-4" />}
              </div>
              <div className="text-left">
                <div className="font-bold text-xs">
                  {listeningVoice ? 'Listening actively... Say "HELP" or "EMERGENCY"' : 'Activate Voice Emergency Trigger'}
                </div>
                <div className="text-[11px] text-[#9BA398]">
                  {listeningVoice ? 'Microphone live · Ambient noise monitored' : 'Real-time Web Speech Recognition API'}
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${listeningVoice ? 'bg-red-700 text-white' : 'bg-[#1E2512] text-[#C8DC35]'}`}>
              {listeningVoice ? 'LIVE' : 'TAP TO ARM'}
            </span>
          </button>

          {heardTranscript && listeningVoice && (
            <div className="p-2.5 rounded-lg bg-[#0F1210] border border-[#2C342A] text-xs font-mono text-zinc-300">
              <span className="text-[#9BA398]">Speech Detected: </span>
              <span className="text-[#C8DC35] font-bold">"{heardTranscript}"</span>
            </div>
          )}

          {speechError && (
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-300 text-[11px]">
              {speechError}
            </div>
          )}
        </div>
      </div>

      {/* Trusted Contacts Tree */}
      <div className="rounded-3xl bg-[#181C17] p-4 border border-[#2C342A] space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#9BA398]">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-[#C8DC35]" />
            <span>Emergency Contacts Broadcast List</span>
          </div>
          <span className="text-[11px] font-mono text-[#C8DC35]">Auto-Armed</span>
        </div>

        <div className="space-y-2">
          {contacts.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1210] border border-[#2C342A] text-xs font-mono"
            >
              <div>
                <div className="font-bold text-[#F4F6F2]">{c.name}</div>
                <div className="text-[11px] text-[#9BA398]">{c.phone}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E2512] text-[#C8DC35] border border-[#C8DC35]/40">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
