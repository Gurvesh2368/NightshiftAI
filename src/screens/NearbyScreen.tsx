import React, { useState } from 'react';
import { MOCK_PLACES } from '../data/mockScenario';
import { OfflinePlace } from '../lib/db';
import { MapView } from '../components/MapView';
import { TrustChip } from '../components/TrustChip';
import {
  Compass,
  Hospital,
  Pill,
  ShieldAlert,
  Coffee,
  Navigation,
  ChevronRight
} from 'lucide-react';

interface NearbyScreenProps {
  initialFilter?: string;
  onNavigateToPlace: (place: OfflinePlace) => void;
}

export const NearbyScreen: React.FC<NearbyScreenProps> = ({
  initialFilter = 'all',
  onNavigateToPlace
}) => {
  const [filter, setFilter] = useState<string>(initialFilter);
  const [selectedPlace, setSelectedPlace] = useState<OfflinePlace | null>(null);

  const categories = [
    { id: 'all', label: 'All Safe Spots', icon: Compass },
    { id: 'hospital', label: 'Hospitals', icon: Hospital },
    { id: 'pharmacy', label: 'Pharmacies', icon: Pill },
    { id: 'police', label: 'Police', icon: ShieldAlert },
    { id: 'waiting_spot', label: 'Waiting Spots', icon: Compass },
    { id: 'food', label: 'Food / Water', icon: Coffee }
  ];

  const filteredPlaces = MOCK_PLACES.filter(p => {
    if (filter === 'all') return true;
    return p.type === filter;
  });

  return (
    <div className="min-h-screen bg-[#18191B] text-[#ECEEF3] flex flex-col max-w-md mx-auto pb-24">
      <div className="gradient-bar w-full fixed top-0 left-0 right-0 z-10" />

      {/* Screen Header */}
      <div className="p-4 pt-6">
        <h1 className="text-2xl font-black text-[#ECEEF3]">
          Nearby Night Services
        </h1>
        <p className="text-xs text-[#A3A8B0] mt-1">
          Open-status confidence verified against night registries
        </p>

        {/* Filter Scrollable Pill List */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3.5 pb-1 no-scrollbar">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = filter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setFilter(cat.id);
                  setSelectedPlace(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-[#232629] text-[#A3A8B0] border border-zinc-800 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Map */}
      <div className="px-4">
        <div className="h-56 rounded-3xl overflow-hidden border border-zinc-800 shadow-xl">
          <MapView
            className="h-full w-full"
            places={filteredPlaces}
            onSelectPlace={p => setSelectedPlace(p)}
            center={[72.8700, 19.0700]}
            zoom={14}
          />
        </div>
      </div>

      {/* Places List */}
      <div className="p-4 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#A3A8B0] flex items-center justify-between">
          <span>Available Within 2 km ({filteredPlaces.length})</span>
          <span className="text-[11px] text-emerald-400">Night Verified</span>
        </div>

        {filteredPlaces.map(place => (
          <div
            key={place.id}
            onClick={() => setSelectedPlace(place)}
            className={`rounded-2xl p-4 border transition-all cursor-pointer ${
              selectedPlace?.id === place.id
                ? 'bg-[#2E3236] border-emerald-500 shadow-lg'
                : 'bg-[#232629] border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-[#ECEEF3] leading-snug">
                  {place.name}
                </h3>
                <div className="text-xs text-[#A3A8B0] mt-0.5">
                  {place.opening_hours} · {place.distanceKm} km away
                </div>
              </div>
              <TrustChip
                status={place.staffed_24h ? 'KNOWN' : 'PROBABLE'}
                label={place.staffed_24h ? 'Verified 24/7' : 'Probable'}
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/80">
              <span className="text-[11px] font-medium text-emerald-400">
                {place.staffed_24h ? '🛡️ Guard & CCTV on site' : '☕ Open night stand'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToPlace(place);
                }}
                className="flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Navigation className="h-3 w-3" />
                <span>Directions</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

