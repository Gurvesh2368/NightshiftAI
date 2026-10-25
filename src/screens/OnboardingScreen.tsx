import React, { useState } from 'react';
import { MapView } from '../components/MapView';
import { SupportedLang } from '../lib/tts';
import {
  Globe,
  Clock,
  MapPin,
  IndianRupee,
  ShieldCheck,
  UserPlus,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (profile: any) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  // Form State
  const [lang, setLang] = useState<SupportedLang>('en');
  const [shiftEnd, setShiftEnd] = useState('02:00');
  const [homeBy, setHomeBy] = useState('03:30');
  const [homeCoords, setHomeCoords] = useState<[number, number]>([72.8775, 19.0760]);
  const [budget, setBudget] = useState('50');
  const [stepFree, setStepFree] = useState(false);
  const [wellLitOnly, setWellLitOnly] = useState(true);

  // Consents
  const [consentLocation, setConsentLocation] = useState(true);
  const [consentCheckin, setConsentCheckin] = useState(true);
  const [consentAggregate, setConsentAggregate] = useState(true);

  // Contacts
  const [contactName, setContactName] = useState('Family (shyammar12345@gmail.com)');
  const [contactPhone, setContactPhone] = useState('+91 98200 11223');
  const [contactPriority, setContactPriority] = useState(1);

  const totalSteps = 6;

  const handleFinish = () => {
    onComplete({
      language: lang,
      shiftEnd,
      homeBy,
      homeCoords,
      budget: Number(budget),
      accessibility: { stepFree, wellLitOnly },
      consents: {
        location: consentLocation,
        checkin_sharing: consentCheckin,
        aggregate_contribution: consentAggregate
      },
      contacts: [
        {
          name: contactName,
          phone: contactPhone,
          priority: contactPriority,
          status: 'invited'
        }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-[#18191B] text-[#ECEEF3] flex flex-col max-w-md mx-auto">
      <div className="gradient-bar w-full fixed top-0 left-0 right-0 z-10" />

      {/* Header with Step Progress */}
      <div className="p-4 pt-6 border-b border-zinc-800">
        <div className="flex items-center justify-between text-xs text-[#A3A8B0] mb-2 font-semibold">
          <span>STEP {step} OF {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}% COMPLETE</span>
        </div>
        <div className="h-1.5 w-full bg-[#2E3236] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        {step === 1 && (
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <Globe className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Choose your language</h2>
            <p className="text-xs text-[#A3A8B0]">
              The app speaks turn-by-turn guidance and reads alerts aloud in your preferred tongue.
            </p>

            <div className="space-y-2.5 pt-2">
              {[
                { code: 'en' as SupportedLang, label: 'English', sub: 'Default system voice' },
                { code: 'hi' as SupportedLang, label: 'हिन्दी (Hindi)', sub: 'भारतीय आवाज' },
                { code: 'mr' as SupportedLang, label: 'मराठी (Marathi)', sub: 'महाराष्ट्र प्रादेशिक' }
              ].map(opt => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLang(opt.code)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    lang === opt.code
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-[#232629] border-zinc-800 text-[#A3A8B0] hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-bold text-base text-[#ECEEF3]">{opt.label}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{opt.sub}</div>
                  </div>
                  {lang === opt.code && (
                    <div className="h-6 w-6 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <Clock className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Shift & Deadline Times</h2>
            <p className="text-xs text-[#A3A8B0]">
              The engine checks every transit schedule and road speed to guarantee you are home by your deadline.
            </p>

            <div className="space-y-4 pt-2">
              <div className="rounded-2xl bg-[#232629] p-4 border border-zinc-800 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Shift Ends At (Night Departure)
                </label>
                <input
                  type="time"
                  value={shiftEnd}
                  onChange={e => setShiftEnd(e.target.value)}
                  className="w-full bg-[#18191B] border border-zinc-700 rounded-xl px-4 py-2.5 text-lg font-bold text-[#ECEEF3]"
                />
                <span className="text-[11px] text-[#A3A8B0]">Typical night departure: 2:00 AM</span>
              </div>

              <div className="rounded-2xl bg-[#232629] p-4 border border-zinc-800 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Must Be Home By (Hard Deadline)
                </label>
                <input
                  type="time"
                  value={homeBy}
                  onChange={e => setHomeBy(e.target.value)}
                  className="w-full bg-[#18191B] border border-zinc-700 rounded-xl px-4 py-2.5 text-lg font-bold text-[#ECEEF3]"
                />
                <span className="text-[11px] text-[#A3A8B0]">Typical target: 3:30 AM (Safe buffer)</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Home Location Pin</h2>
            <p className="text-xs text-[#A3A8B0]">
              Stored encrypted (AES-GCM). Only used to calculate arrival time and route corridor.
            </p>

            <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-md">
              <MapView
                className="h-56 w-full"
                center={homeCoords}
                zoom={14}
                currentPosition={homeCoords}
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-[#232629] border border-zinc-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-[#A3A8B0] block">Target Home Zone:</span>
                <span className="font-semibold text-[#ECEEF3]">Shivneri Nagar, Kurla West</span>
              </div>
              <span className="text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/40">
                Pinned
              </span>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <IndianRupee className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Budget & Accessibility</h2>
            <p className="text-xs text-[#A3A8B0]">
              Filter transit modes by affordability and safety requirements.
            </p>

            <div className="rounded-2xl bg-[#232629] p-4 border border-zinc-800 space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A3A8B0]">
                Maximum Daily Night Transit Budget: ₹{budget}
              </label>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>₹10 (Bus)</span>
                <span>₹50 (Standard)</span>
                <span>₹250 (Auto/Cab)</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#232629] border border-zinc-800 cursor-pointer">
                <div>
                  <div className="font-semibold text-sm text-[#ECEEF3]">Well-Lit Roads Only</div>
                  <div className="text-xs text-[#A3A8B0]">Exclude unlit lanes from route generation</div>
                </div>
                <input
                  type="checkbox"
                  checked={wellLitOnly}
                  onChange={e => setWellLitOnly(e.target.checked)}
                  className="h-5 w-5 accent-emerald-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#232629] border border-zinc-800 cursor-pointer">
                <div>
                  <div className="font-semibold text-sm text-[#ECEEF3]">Step-Free / Accessible</div>
                  <div className="text-xs text-[#A3A8B0]">Require ramps & elevators for fatigue/mobility</div>
                </div>
                <input
                  type="checkbox"
                  checked={stepFree}
                  onChange={e => setStepFree(e.target.checked)}
                  className="h-5 w-5 accent-emerald-500 rounded"
                />
              </label>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Privacy & Consents</h2>
            <p className="text-xs text-[#A3A8B0]">
              Granular consent toggles. You can revoke any permission anytime in your profile.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#232629] border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#ECEEF3]">Trip GPS Tracking</span>
                  <input
                    type="checkbox"
                    checked={consentLocation}
                    onChange={e => setConsentLocation(e.target.checked)}
                    className="h-5 w-5 accent-emerald-500"
                  />
                </div>
                <p className="text-xs text-[#A3A8B0]">
                  Only active while live navigation is in progress. Automatically destroyed 24h after arrival.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#232629] border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#ECEEF3]">Check-In Timer Sharing</span>
                  <input
                    type="checkbox"
                    checked={consentCheckin}
                    onChange={e => setConsentCheckin(e.target.checked)}
                    className="h-5 w-5 accent-emerald-500"
                  />
                </div>
                <p className="text-xs text-[#A3A8B0]">
                  Alerts emergency contacts if you fail to confirm safe arrival within 15 min of your deadline.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#232629] border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#ECEEF3]">k-Anonymous Zone Aggregation</span>
                  <input
                    type="checkbox"
                    checked={consentAggregate}
                    onChange={e => setConsentAggregate(e.target.checked)}
                    className="h-5 w-5 accent-emerald-500"
                  />
                </div>
                <p className="text-xs text-[#A3A8B0]">
                  Contributes to community worker count only when at least 20 workers are in the zone. Never shares individual routes.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <UserPlus className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Trusted Emergency Contact</h2>
            <p className="text-xs text-[#A3A8B0]">
              Receives instant SMS alert + live tracking web link if you trigger SOS or miss your check-in.
            </p>

            <div className="rounded-2xl bg-[#232629] p-4 border border-zinc-800 space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-[#A3A8B0] block mb-1">
                  Contact Name & Relation
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full bg-[#18191B] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-[#ECEEF3]"
                  placeholder="e.g. Pooja (Sister)"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A3A8B0] block mb-1">
                  Mobile Number (Receives SMS)
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full bg-[#18191B] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-[#ECEEF3]"
                  placeholder="+91 98200 11223"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#18191B] border border-zinc-800 text-[11px] text-emerald-400 flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>No app install required for contacts — works over regular SMS & browser link.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons Footer */}
      <div className="p-4 border-t border-zinc-800 flex items-center justify-between gap-3 bg-[#18191B]">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="px-4 py-3 rounded-xl bg-[#2E3236] text-[#ECEEF3] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#383d42] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="px-6 py-3 rounded-xl gradient-cta text-white font-bold text-xs flex items-center gap-1.5 ml-auto hover:brightness-110 transition-all"
          >
            <span>Next Step</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 ml-auto hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Complete Setup & View Plans</span>
          </button>
        )}
      </div>
    </div>
  );
};

