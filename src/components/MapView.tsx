import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { OfflinePlace } from '../lib/db';
import { getStoredCoords } from '../lib/geo';

export interface AlternateRoute {
  id: string;
  mode: 'safest' | 'fastest' | 'cheapest';
  coordinates: [number, number][];
  label?: string;
  distanceKm?: number;
  durationMin?: number;
  safetyScore?: number;
}

export interface MapViewProps {
  routeCoordinates?: [number, number][]; // [[lng, lat], ...] (Preferred active route)
  alternateRoutes?: AlternateRoute[]; // 3 distinct routes
  selectedRouteMode?: 'safest' | 'fastest' | 'cheapest';
  onSelectRouteMode?: (mode: 'safest' | 'fastest' | 'cheapest') => void;
  currentPosition?: [number, number] | null; // [lng, lat]
  places?: OfflinePlace[];
  onSelectPlace?: (place: OfflinePlace) => void;
  className?: string;
  zoom?: number;
  center?: [number, number];
  interactive?: boolean;
  startLabel?: string;
  endLabel?: string;
  fitBoundsOnRoute?: boolean;
}

const MAP_API_KEY = import.meta.env.VITE_MAP_API_KEY || 'd66cc14691a444479868628a72658fb3';

export const MapView: React.FC<MapViewProps> = ({
  routeCoordinates,
  alternateRoutes,
  selectedRouteMode = 'safest',
  onSelectRouteMode,
  currentPosition,
  places = [],
  onSelectPlace,
  className = 'h-64 w-full',
  zoom = 14,
  center,
  interactive = true,
  startLabel = 'LIVE START',
  endLabel = 'FINAL DESTINATION',
  fitBoundsOnRoute = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const startMarkerRef = useRef<maplibregl.Marker | null>(null);
  const preferredBadgeRef = useRef<maplibregl.Marker | null>(null);
  const endMarkerRef = useRef<maplibregl.Marker | null>(null);
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

  // Synchronizes the preferred route and alternate routes connecting Start to End
  const syncRouteToMap = () => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.isStyleLoaded()) {
      map.once('styledata', () => syncRouteToMap());
      return;
    }

    // 1. Clean up ALL previous route layers and sources
    const allLayerIds = [
      'route-preferred-inner',
      'route-preferred-line',
      'route-preferred-glow',
      'route-preferred-casing',
      'route-line',
      'route-glow',
      'route-alt-line-0',
      'route-alt-casing-0',
      'route-alt-line-1',
      'route-alt-casing-1',
      'route-alt-line-2',
      'route-alt-casing-2',
      'route-alt-0',
      'route-alt-1',
      'route-alt-2'
    ];
    allLayerIds.forEach(id => {
      try {
        if (map.getLayer(id)) map.removeLayer(id);
      } catch (_) {}
    });

    const allSourceIds = [
      'route-preferred',
      'route-corridor',
      'route-alt-0',
      'route-alt-1',
      'route-alt-2'
    ];
    allSourceIds.forEach(id => {
      try {
        if (map.getSource(id)) map.removeSource(id);
      } catch (_) {}
    });

    // Clean markers if no valid coordinates
    if (!routeCoordinates || routeCoordinates.length < 2) {
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
      if (preferredBadgeRef.current) {
        preferredBadgeRef.current.remove();
        preferredBadgeRef.current = null;
      }
      if (endMarkerRef.current) {
        endMarkerRef.current.remove();
        endMarkerRef.current = null;
      }
      return;
    }

    // 2. Render Inactive Alternate Routes (at bottom of route stack)
    const activeMode = selectedRouteMode || 'safest';
    const otherRoutes = (alternateRoutes || []).filter(
      r => r.coordinates && r.coordinates.length > 1 && r.mode !== activeMode
    );

    otherRoutes.forEach((alt, idx) => {
      const sourceId = `route-alt-${idx}`;
      const color =
        alt.mode === 'cheapest' ? '#38bdf8' : alt.mode === 'fastest' ? '#fbbf24' : '#34d399';

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature' as const,
          properties: { mode: alt.mode, label: alt.label },
          geometry: {
            type: 'LineString' as const,
            coordinates: alt.coordinates
          }
        }
      });

      // Subtle dark casing for alternate route
      map.addLayer({
        id: `route-alt-casing-${idx}`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#050705',
          'line-width': 6,
          'line-opacity': 0.6
        }
      });

      // Alternate route line (dashed)
      map.addLayer({
        id: `route-alt-line-${idx}`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': color,
          'line-width': 4,
          'line-opacity': 0.75,
          'line-dasharray': [3, 2]
        }
      });
    });

    // 3. Render PREFERRED ROUTE (Prominently on top with 4 visual tiers)
    map.addSource('route-preferred', {
      type: 'geojson',
      data: {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: routeCoordinates
        }
      }
    });

    // Tier 1: Bold Dark Casing (Guarantees contrast on ANY map background)
    map.addLayer({
      id: 'route-preferred-casing',
      type: 'line',
      source: 'route-preferred',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#050705',
        'line-width': 11,
        'line-opacity': 0.95
      }
    });

    // Tier 2: Illuminated Emerald Neon Glow
    map.addLayer({
      id: 'route-preferred-glow',
      type: 'line',
      source: 'route-preferred',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#15803d',
        'line-width': 18,
        'line-opacity': 0.85
      }
    });

    // Tier 3: Core Tactical Corridor Line (#C8DC35 Bright Lime)
    map.addLayer({
      id: 'route-preferred-line',
      type: 'line',
      source: 'route-preferred',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#C8DC35',
        'line-width': 7,
        'line-opacity': 1.0
      }
    });

    // Tier 4: White Inner Centerline (Directional Flow)
    map.addLayer({
      id: 'route-preferred-inner',
      type: 'line',
      source: 'route-preferred',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ffffff',
        'line-width': 2.5,
        'line-opacity': 0.9,
        'line-dasharray': [2, 3]
      }
    });

    // 4. START Marker (Live Location Anchor)
    const startCoord = routeCoordinates[0];
    if (startCoord) {
      if (!startMarkerRef.current) {
        const startEl = document.createElement('div');
        startEl.className = 'route-start-marker flex flex-col items-center cursor-pointer pointer-events-auto';
        startEl.innerHTML = `
          <div style="background-color: #C8DC35; color: #0F1210; font-weight: 900; font-size: 10px; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.6); border: 2px solid #ffffff; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px; font-family: ui-monospace, monospace;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background-color: #0F1210;"></span>
            ${startLabel}
          </div>
          <div style="width: 14px; height: 14px; border-radius: 9999px; background-color: #C8DC35; border: 3px solid #ffffff; box-shadow: 0 0 14px #C8DC35; margin-top: 2px;"></div>
        `;
        startMarkerRef.current = new maplibregl.Marker({ element: startEl, anchor: 'bottom' })
          .setLngLat(startCoord)
          .addTo(map);
      } else {
        startMarkerRef.current.setLngLat(startCoord);
      }
    }

    // 5. PREFERRED ROUTE Midway Badge (Placed directly on the route line)
    const midIdx = Math.floor(routeCoordinates.length / 2);
    const midCoord = routeCoordinates[midIdx] || startCoord;
    if (midCoord) {
      const modeLabel = activeMode === 'safest' ? 'SAFEST CORRIDOR' : activeMode === 'fastest' ? 'FASTEST DIRECT' : 'TRANSIT BUS';
      if (!preferredBadgeRef.current) {
        const midEl = document.createElement('div');
        midEl.className = 'preferred-route-badge pointer-events-none';
        midEl.innerHTML = `
          <div style="background-color: #0F1210; color: #C8DC35; border: 1.5px solid #C8DC35; font-weight: 900; font-size: 9px; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(0,0,0,0.8); letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px; font-family: ui-monospace, monospace; text-transform: uppercase;">
            <span style="color: #C8DC35;">★</span>
            <span>PREFERRED ROUTE (${modeLabel})</span>
          </div>
        `;
        preferredBadgeRef.current = new maplibregl.Marker({ element: midEl, anchor: 'center' })
          .setLngLat(midCoord)
          .addTo(map);
      } else {
        preferredBadgeRef.current.setLngLat(midCoord);
        preferredBadgeRef.current.getElement().innerHTML = `
          <div style="background-color: #0F1210; color: #C8DC35; border: 1.5px solid #C8DC35; font-weight: 900; font-size: 9px; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(0,0,0,0.8); letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px; font-family: ui-monospace, monospace; text-transform: uppercase;">
            <span style="color: #C8DC35;">★</span>
            <span>PREFERRED ROUTE (${modeLabel})</span>
          </div>
        `;
      }
    }

    // 6. FINAL DESTINATION Marker (Single Destination Anchor for all routes)
    const endCoord = routeCoordinates[routeCoordinates.length - 1];
    if (endCoord) {
      if (!endMarkerRef.current) {
        const endEl = document.createElement('div');
        endEl.className = 'route-end-marker flex flex-col items-center cursor-pointer pointer-events-auto';
        endEl.innerHTML = `
          <div style="background-color: #ef4444; color: #ffffff; font-weight: 900; font-size: 10px; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.6); border: 2px solid #ffffff; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px; font-family: ui-monospace, monospace;">
            <span>🏁</span>
            ${endLabel}
          </div>
          <div style="width: 14px; height: 14px; border-radius: 9999px; background-color: #ef4444; border: 3px solid #ffffff; box-shadow: 0 0 14px #ef4444; margin-top: 2px;"></div>
        `;
        endMarkerRef.current = new maplibregl.Marker({ element: endEl, anchor: 'bottom' })
          .setLngLat(endCoord)
          .addTo(map);
      } else {
        endMarkerRef.current.setLngLat(endCoord);
      }
    }

    // 7. Auto-fit camera bounds to encompass the complete network of all 3 routes
    if (fitBoundsOnRoute) {
      try {
        const bounds = new maplibregl.LngLatBounds();
        routeCoordinates.forEach(coord => bounds.extend(coord as [number, number]));
        (alternateRoutes || []).forEach(alt => {
          alt.coordinates?.forEach(coord => bounds.extend(coord as [number, number]));
        });
        map.fitBounds(bounds, {
          padding: { top: 55, bottom: 55, left: 50, right: 50 },
          maxZoom: 16,
          duration: 600
        });
      } catch (err) {
        console.warn('[MapView] fitBounds error:', err);
      }
    }
  };

  // Map Initialization
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

    map.on('load', () => {
      map.resize();
      syncRouteToMap();
    });

    // Auto-fallback if Thunderforest tiles encounter network/auth issues
    map.on('error', (e) => {
      console.warn('[NightShift MapView] MapLibre notice:', e);
      if (mapTheme === 'spinal' && e && e.error && (e.error as any).status === 401) {
        console.info('[NightShift MapView] Falling back to high-reliability OSM tiles.');
        setMapTheme('osm');
        map.setStyle(buildStyle('osm'));
        map.once('styledata', () => {
          map.resize();
          syncRouteToMap();
        });
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

    const t1 = setTimeout(() => map.resize(), 100);
    const t2 = setTimeout(() => map.resize(), 500);

    mapRef.current = map;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (ro) ro.disconnect();
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
      if (preferredBadgeRef.current) {
        preferredBadgeRef.current.remove();
        preferredBadgeRef.current = null;
      }
      if (endMarkerRef.current) {
        endMarkerRef.current.remove();
        endMarkerRef.current = null;
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      placeMarkersRef.current.forEach(m => m.remove());
      placeMarkersRef.current = [];
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

  // Sync route coordinates, start beacon, and end beacon
  useEffect(() => {
    syncRouteToMap();
  }, [routeCoordinates, alternateRoutes, selectedRouteMode, startLabel, endLabel, fitBoundsOnRoute]);

  // Update Live User GPS Marker (Pulsing Blue Dot)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (currentPosition) {
      if (!userMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'user-live-marker flex items-center justify-center';
        el.innerHTML = `
          <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 9999px; background-color: #3b82f6; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>
          </div>
        `;
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
        syncRouteToMap();
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

      {/* 3 Different Routes Switcher Pills */}
      {alternateRoutes && alternateRoutes.length > 1 && onSelectRouteMode && (
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-black/90 backdrop-blur-md border border-zinc-700/80 rounded-xl p-1 text-[10px] font-mono shadow-2xl">
          {alternateRoutes.map(alt => {
            const isSelected = alt.mode === (selectedRouteMode || 'safest');
            const icon = alt.mode === 'safest' ? '🛡️' : alt.mode === 'fastest' ? '⚡' : '🚌';
            const label = alt.mode === 'safest' ? 'Safest' : alt.mode === 'fastest' ? 'Fastest' : 'Transit';
            return (
              <button
                key={alt.id || alt.mode}
                onClick={() => onSelectRouteMode(alt.mode)}
                className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-[#C8DC35] text-[#0F1210] font-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={`Switch to ${alt.label || label}`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
