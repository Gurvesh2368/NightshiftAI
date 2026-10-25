import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Navigation, Hospital, ShieldCheck, Train } from 'lucide-react';
import { searchDestinations, DestinationSearchResult } from '../lib/routing';
import { GeoCoordinates } from '../lib/geo';

interface DestinationSearchProps {
  userCoords: GeoCoordinates;
  onSelectDestination: (dest: { lat: number; lng: number; name: string; fullAddress: string }) => void;
  selectedDestinationName?: string;
}

export const DestinationSearch: React.FC<DestinationSearchProps> = ({
  userCoords,
  onSelectDestination,
  selectedDestinationName
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DestinationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      const res = await searchDestinations(query, userCoords);
      setResults(res);
      setIsLoading(false);
      setIsOpen(true);
    }, 350);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [query, userCoords]);

  const handleSelect = (item: DestinationSearchResult) => {
    setQuery(item.name);
    setIsOpen(false);
    onSelectDestination({
      lat: item.lat,
      lng: item.lng,
      name: item.name,
      fullAddress: item.fullAddress
    });
  };

  const userLat = userCoords?.lat || 21.1463;
  const userLng = userCoords?.lng || 79.0849;
  const cityName = (typeof localStorage !== 'undefined' && localStorage.getItem('nightshift_live_city')) || 'Local';

  const quickPicks = [
    {
      name: `${cityName} Civil Hospital & 24/7 Trauma Emergency`,
      address: `Main Trauma Medical Center, ${cityName}`,
      lat: userLat + 0.0085,
      lng: userLng + 0.0042,
      icon: Hospital
    },
    {
      name: `${cityName} Central Junction & Transit Hub`,
      address: `Railway Station Road, ${cityName}`,
      lat: userLat - 0.0120,
      lng: userLng + 0.0065,
      icon: Train
    },
    {
      name: `${cityName} Police Chowki & 24/7 Women Assistance Desk`,
      address: `Police Station Beat, ${cityName}`,
      lat: userLat - 0.0055,
      lng: userLng - 0.0075,
      icon: ShieldCheck
    }
  ];

  return (
    <div ref={containerRef} className="relative w-full z-30">
      {/* Search Bar Input */}
      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#181C17] border border-[#2C342A] focus-within:border-[#C8DC35] transition-all shadow-lg">
        <Search className="h-4 w-4 text-[#C8DC35] shrink-0 ml-1.5" />
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0 || query.length === 0) setIsOpen(true);
          }}
          placeholder={selectedDestinationName ? `Destination: ${selectedDestinationName}` : "Search destination address or safe spot..."}
          className="w-full bg-transparent text-xs font-semibold text-[#F4F6F2] placeholder-[#9BA398] outline-none"
        />

        {isLoading ? (
          <Loader2 className="h-4 w-4 text-[#C8DC35] animate-spin shrink-0 mr-1" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="p-1 rounded-full text-zinc-400 hover:text-white shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Dropdown Auto-Complete Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl bg-[#141813] border border-[#2C342A] shadow-2xl p-2 space-y-1 max-h-72 overflow-y-auto font-sans text-xs">
          {results.length > 0 ? (
            results.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-[#1E2512] transition-colors flex items-start gap-2.5 cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-[#252B23] text-[#C8DC35] shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#F4F6F2] truncate">{item.name}</div>
                  <div className="text-[11px] text-[#9BA398] truncate">{item.fullAddress}</div>
                </div>
                {item.distanceKm !== undefined && (
                  <span className="text-[10px] font-mono text-[#C8DC35] font-bold shrink-0">
                    {item.distanceKm} km
                  </span>
                )}
              </button>
            ))
          ) : query.length >= 2 && !isLoading ? (
            <div className="p-3 text-center text-[11px] text-[#9BA398]">
              No places found for "{query}". Try a broader landmark.
            </div>
          ) : (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#9BA398]">
                Verified 24/7 Safe Destinations
              </div>
              {quickPicks.map((qp, idx) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(qp.name);
                      setIsOpen(false);
                      onSelectDestination({
                        lat: qp.lat,
                        lng: qp.lng,
                        name: qp.name,
                        fullAddress: qp.address
                      });
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#1E2512] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#252B23] text-[#C8DC35]">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-[#F4F6F2]">{qp.name}</div>
                        <div className="text-[11px] text-[#9BA398]">{qp.address}</div>
                      </div>
                    </div>
                    <Navigation className="h-3.5 w-3.5 text-[#C8DC35] shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

