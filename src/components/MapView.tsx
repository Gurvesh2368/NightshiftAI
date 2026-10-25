import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { OfflinePlace } from '../lib/db';
import { getStoredCoords } from '../lib/geo';

interface MapViewProps {
  routeCoordinates?: [number, number][]; // [[lng, lat], ...]
  currentPosition?: [number, number] | null; // [lng, lat]
  places?: OfflinePlace[];
  onSelectPlace?: (place: OfflinePlace) => void;
  className?: string;
  zoom?: number;
  center?: [number, number];
  interactive?: boolean;
}

const MAP_API_KEY = import.meta.env.VITE_MAP_API_KEY || 'd66cc14691a444479868628a72658fb3';

export const MapView: React.FC<MapViewProps> = ({
  routeCoordinates,
  currentPosition,
  places = [],
  onSelectPlace,
  className = 'h-64 w-full',
  zoom = 14,
  center,
  interactive = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const placeMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [mapTheme, setMapTheme] = useState<'spinal' | 'osm'>('spinal');

  const defaultCoords = getStoredCoords();
  const effectiveCenter: [number, number] = currentPosition || center || [defaultCoords.lng, defaultCoords.lat];

  const buildStyle = (theme: 'spinal' | 'osm'): maplibregl.StyleSpecification => {
    if (theme === 'spinal') {
      return {
        version: 8,
        sources: {
          'tf-spinal-tiles': {
            type: 'raster',
            tiles: [
              `https://tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=${MAP_API_KEY}`
            ],
            tileSize: 256,
            attribution: '© Thunderforest, © OpenStreetMap contributors'
          },
          'tf-transit-overlay': {
            type: 'raster',
            tiles: [
              `https://tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=${MAP_API_KEY}`
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'tf-spinal-layer',
            type: 'raster',
            source: 'tf-spinal-tiles',
            minzoom: 0,
            maxzoom: 22
          },
          {
            id: 'tf-transit-layer',
            type: 'raster',
            source: 'tf-transit-overlay',
            minzoom: 0,
            maxzoom: 22,
            paint: {
              'raster-opacity': 0.75
            }
          }
        ]
      };
    } else {
      return {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      };
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const initialCenter = effectiveCenter;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: buildStyle(mapTheme),
      center: initialCenter,
      zoom: zoom,
      interactive: interactive,
      attributionControl: false
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    if (interactive) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true
      });
      map.addControl(geolocate, 'top-right');
    }

    const addRoutePolylines = () => {
      if (routeCoordinates && routeCoordinates.length > 1 && !map.getSource('route-corridor')) {
        map.addSource('route-corridor', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates
            }
          }
        });

        // Outer illuminated neon glow
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route-corridor',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#2F7D4A',
            'line-width': 12,
            'line-opacity': 0.7
          }
        });

        // Core bright green route line
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route-corridor',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#4ade80',
            'line-width': 5
          }
        });

        // Fit bounds
        const bounds = new maplibregl.LngLatBounds();
        routeCoordinates.forEach(coord => bounds.extend(coord as [number, number]));
        map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      }
    };

    map.on('load', () => {
      map.resize();
      addRoutePolylines();
    });

    // Auto-fallback if Thunderforest tiles encounter network/auth issues
    map.on('error', (e) => {
      console.warn('[NightShift MapView] MapLibre notice:', e);
      if (mapTheme === 'spinal' && e && e.error && (e.error as any).status === 401) {
        console.info('[NightShift MapView] Falling back to high-reliability OSM tiles.');
        setMapTheme('osm');
        map.setStyle(buildStyle('osm'));
      }
    });

    // ResizeObserver ensures map expands immediately to parent dimensions
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainer.current) {
      ro = new ResizeObserver(() => {
        try {
          map.resize();
        } catch (_) {}
      });
      ro.observe(mapContainer.current);
    }

    // Backup timers for layout settle
    const t1 = setTimeout(() => map.resize(), 100);
    const t2 = setTimeout(() => map.resize(), 500);

    mapRef.current = map;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (ro) ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Dynamic Re-center when live user position or center updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const target = currentPosition || center;
    if (target && target[0] && target[1]) {
      if (!routeCoordinates || routeCoordinates.length <= 1) {
        map.flyTo({
          center: target,
          zoom: zoom || 15,
          essential: true
        });
      }
    }
  }, [currentPosition?.[0], currentPosition?.[1], center?.[0], center?.[1]]);

  // Update Route Polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('route-corridor') as maplibregl.GeoJSONSource | undefined;
    if (source && routeCoordinates && routeCoordinates.length > 1) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates
        }
      });
    }
  }, [routeCoordinates]);

  // Update User Blue Dot Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (currentPosition) {
      if (!userMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'blue-dot';
        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat(currentPosition)
          .addTo(map);
      } else {
        userMarkerRef.current.setLngLat(currentPosition);
      }
    }
  }, [currentPosition]);

  // Update Safe Places Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    placeMarkersRef.current.forEach(m => m.remove());
    placeMarkersRef.current = [];

    places.forEach(place => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer flex items-center justify-center';

      let bg = 'bg-emerald-600';
      let icon = '📍';

      if (place.type === 'hospital') {
        bg = 'bg-rose-600';
        icon = '🏥';
      } else if (place.type === 'pharmacy') {
        bg = 'bg-teal-600';
        icon = '💊';
      } else if (place.type === 'police') {
        bg = 'bg-blue-600';
        icon = '👮';
      } else if (place.type === 'waiting_spot') {
        bg = 'bg-indigo-600';
        icon = '🛡️';
      }

      el.innerHTML = `
        <div class="${bg} text-white p-1.5 rounded-full shadow-lg border-2 border-white text-xs hover:scale-125 transition-transform" title="${place.name}">
          ${icon}
        </div>
      `;

      el.addEventListener('click', () => {
        if (onSelectPlace) onSelectPlace(place);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
            <div style="color: #18191B; padding: 4px; font-family: sans-serif;">
              <strong style="font-size: 12px;">${place.name}</strong>
              <div style="font-size: 10px; color: #555; margin-top: 2px;">${place.opening_hours}</div>
            </div>
          `)
        )
        .addTo(map);

      placeMarkersRef.current.push(marker);
    });
  }, [places, onSelectPlace]);

  // Theme switch handler
  const handleToggleTheme = (theme: 'spinal' | 'osm') => {
    setMapTheme(theme);
    const map = mapRef.current;
    if (map) {
      map.setStyle(buildStyle(theme));
      map.once('styledata', () => {
        map.resize();
        if (routeCoordinates && routeCoordinates.length > 1 && !map.getSource('route-corridor')) {
          map.addSource('route-corridor', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: routeCoordinates }
            }
          });
          map.addLayer({
            id: 'route-glow',
            type: 'line',
            source: 'route-corridor',
            paint: { 'line-color': '#2F7D4A', 'line-width': 12, 'line-opacity': 0.7 }
          });
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route-corridor',
            paint: { 'line-color': '#4ade80', 'line-width': 5 }
          });
        }
      });
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-zinc-800 shadow-xl ${className}`}
      style={{ minHeight: '260px' }}
    >
      <div ref={mapContainer} className="h-full w-full" style={{ minHeight: '260px' }} />

      {/* Layer Switcher & Active Style Pill */}
      <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-black/85 backdrop-blur-md border border-zinc-700/80 rounded-xl p-1 text-[10px] font-mono shadow-2xl">
        <span className="text-emerald-400 font-bold px-1.5 py-0.5">
          {mapTheme === 'spinal' ? 'Thunderforest Dark' : 'OSM Standard'}
        </span>
        <button
          onClick={() => handleToggleTheme('spinal')}
          className={`px-2 py-0.5 rounded-lg transition-all ${
            mapTheme === 'spinal'
              ? 'bg-emerald-600 text-white font-bold shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Night
        </button>
        <button
          onClick={() => handleToggleTheme('osm')}
          className={`px-2 py-0.5 rounded-lg transition-all ${
            mapTheme === 'osm'
              ? 'bg-emerald-600 text-white font-bold shadow'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          OSM
        </button>
      </div>
    </div>
  );
};
