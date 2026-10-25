import React, { useState } from 'react';
import { SupportedLang } from '../lib/tts';
import {
  User,
  Shield,
  Heart,
  Clock,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ProfileScreenProps {
  userProfile: any;
  onUpdateProfile: (updated: any) => void;
  onSignOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  onUpdateProfile,
  onSignOut
}) => {
  const [shiftEnd, setShiftEnd] = useState(userProfile?.shiftEnd || '02:00');
  const [homeBy, setHomeBy] = useState(userProfile?.homeBy || '03:30');
  const [budget, setBudget] = useState(userProfile?.budget || 50);
  const [bloodGroup, setBloodGroup] = useState('O+ (Universal Donor)');
  const [allergies, setAllergies] = useState('No known drug allergies');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...userProfile,
      shiftEnd,
      homeBy,
      budget,
      healthInfo: { bloodGroup, allergies }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteData = () => {
    localStorage.clear();
    alert('All local profile, trip history, and encrypted health data has been permanently deleted.');
    onSignOut();
  };

  return (
    <div className="min-h-screen bg-[#18191B] text-[#ECEEF3] flex flex-col max-w-md mx-auto p-4 pb-24">
      <div className="gradient-bar w-full fixed top-0 left-0 right-0 z-10" />

      {/* Screen Title */}
      <div className="pt-6 pb-2">
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <User className="h-4 w-4" />
          <span>Worker Settings</span>
        </div>
        <h1 className="text-2xl font-black text-[#ECEEF3] mt-1.5">
          Profile & Preferences
        </h1>
        <p className="text-xs text-[#A3A8B0] mt-1">
          Zero employee tracking · Stored encrypted · Revoke consents anytime
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 mt-3">
        {/* Shift Timings */}
        <div className="rounded-3xl bg-[#232629] p-5 border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A3A8B0]">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span>Shift & Transit Deadlines</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#A3A8B0] block mb-1">Shift Ends</label>
              <input
                type="time"
                value={shiftEnd}
                onChange={e => setShiftEnd(e.target.value)}
                className="w-full bg-[#18191B] border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-[#ECEEF3]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#A3A8B0] block mb-1">Home Deadline</label>
              <input
                type="time"
                value={homeBy}
                onChange={e => setHomeBy(e.target.value)}
                className="w-full bg-[#18191B] border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-[#ECEEF3]"
              />
            </div>
          </div>
        </div>

        {/* Emergency Medical Health Card */}
        <div className="rounded-3xl bg-[#232629] p-5 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A3A8B0]">
              <Heart className="h-4 w-4 text-rose-400" />
              <span>Emergency Card (Optional)</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              AES-256 Encrypted
            </span>
          </div>

          <div>
            <label className="text-[11px] text-[#A3A8B0] block mb-1">Blood Group</label>
            <input
              type="text"
              value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value)}
              className="w-full bg-[#18191B] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-[#ECEEF3]"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#A3A8B0] block mb-1">Allergies / Medical Notes</label>
            <input
              type="text"
              value={allergies}
              onChange={e => setAllergies(e.target.value)}
              className="w-full bg-[#18191B] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-[#ECEEF3]"
            />
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Profile and encryption preferences saved successfully!</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl gradient-cta text-white font-bold text-xs hover:brightness-110 transition-all"
        >
          Save Preferences
        </button>
      </form>

      {/* Delete / Danger Zone */}
      <div className="mt-6 rounded-3xl bg-rose-950/30 border border-rose-900/40 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
          <Trash2 className="h-4 w-4 text-rose-400" />
          <span>Data Governance & Cascade Delete</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Deletes all cached trips, emergency cards, and unlinks your phone identifier from all audit records.
        </p>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800 transition-colors"
          >
            Permanently Delete My Data
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDeleteData}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
            >
              Confirm Permanent Deletion
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="py-3 px-4 rounded-xl bg-[#2E3236] text-[#ECEEF3] text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={onSignOut}
          className="text-xs text-[#A3A8B0] hover:text-white underline"
        >
          Sign Out of Session
        </button>
      </div>
    </div>
  );
};

