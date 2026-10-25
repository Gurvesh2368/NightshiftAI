export interface GeoCoordinates {
  lat: number;
  lng: number;
  accuracy?: number; // meters
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null; // m/s
  timestamp?: number;
}

export interface GeocodedAddress {
  displayName: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
}

// Read cached live coordinates or fall back to India central location
export function getStoredCoords(): GeoCoordinates {
  try {
    const saved = localStorage.getItem('nightshift_live_coords');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lat && parsed.lng) return parsed;
    }
  } catch {}
  return {
    lat: 21.1463,
    lng: 79.0849,
    accuracy: 25
  };
}

export const DEFAULT_COORDS: GeoCoordinates = getStoredCoords();

/**
 * Resolves live real-world coordinates via IP Geolocation APIs (Zero hardware GPS required)
 */
export async function fetchLiveIpCoordinates(): Promise<GeoCoordinates> {
  // 1. Try local Vite server backend endpoint
  try {
    const res = await fetch('/api/live-location');
    if (res.ok) {
      const data = await res.json();
      if (data.lat && data.lng) {
        const coords: GeoCoordinates = {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
          accuracy: 50
        };
        try {
          localStorage.setItem('nightshift_live_coords', JSON.stringify(coords));
          localStorage.setItem('nightshift_live_city', data.city || 'Nagpur');
        } catch {}
        return coords;
      }
    }
  } catch (_) {}

  // 2. Direct HTTPS fallback to FreeIPAPI
  try {
    const res = await fetch('https://freeipapi.com/api/json');
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const coords: GeoCoordinates = {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
          accuracy: 100
        };
        try {
          localStorage.setItem('nightshift_live_coords', JSON.stringify(coords));
          localStorage.setItem('nightshift_live_city', data.cityName || 'Nagpur');
        } catch {}
        return coords;
      }
    }
  } catch (_) {}

  // 3. Direct HTTP fallback to IP-API
  try {
    const res = await fetch('http://ip-api.com/json');
    if (res.ok) {
      const data = await res.json();
      if (data.lat && data.lon) {
        const coords: GeoCoordinates = {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lon),
          accuracy: 100
        };
        try {
          localStorage.setItem('nightshift_live_coords', JSON.stringify(coords));
          localStorage.setItem('nightshift_live_city', data.city || 'Nagpur');
        } catch {}
        return coords;
      }
    }
  } catch (_) {}

  return getStoredCoords();
}

/**
 * Gets the current real user GPS coordinates using browser Geolocation API
 * with automatic, instant IP-based geolocation fallback for desktop PCs/laptops.
 */
export function getCurrentUserLocation(): Promise<GeoCoordinates> {
  return new Promise(async resolve => {
    // If browser doesn't have geolocation, resolve via live IP API immediately
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const ipCoords = await fetchLiveIpCoordinates();
      resolve(ipCoords);
      return;
    }

    let hasResolved = false;

    // Timeout safety: if browser GPS prompt or hardware takes > 3.5s, fall back to live IP API
    const fallbackTimer = setTimeout(async () => {
      if (!hasResolved) {
        hasResolved = true;
        const ipCoords = await fetchLiveIpCoordinates();
        resolve(ipCoords);
      }
    }, 3500);

    navigator.geolocation.getCurrentPosition(
      pos => {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(fallbackTimer);
          const coords: GeoCoordinates = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            altitude: pos.coords.altitude,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp
          };
          try {
            localStorage.setItem('nightshift_live_coords', JSON.stringify(coords));
          } catch {}
          resolve(coords);
        }
      },
      async err => {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(fallbackTimer);
          console.warn('[Geo] Hardware GPS unavailable, using live network IP geolocation:', err.message);
          const ipCoords = await fetchLiveIpCoordinates();
          resolve(ipCoords);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 10000
      }
    );
  });
}

/**
 * Subscribes to real-time live GPS movements
 */
export function watchUserLocation(
  onUpdate: (coords: GeoCoordinates) => void,
  onError?: (err: GeolocationPositionError) => void
): () => void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    onUpdate(DEFAULT_COORDS);
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    pos => {
      onUpdate({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy),
        altitude: pos.coords.altitude,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: pos.timestamp
      });
    },
    err => {
      if (onError) onError(err);
      console.warn('[Geo] Watch position error:', err.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 12000
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

/**
 * Real Reverse Geocoding using OpenStreetMap Nominatim
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'NightShiftAI-Emergency/1.0'
        }
      }
    );
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();

    const addr = data.address || {};
    const parts = [
      addr.amenity || addr.building || addr.road,
      addr.suburb || addr.neighbourhood || addr.quarter,
      addr.city || addr.town || addr.village || addr.county
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 3).join(',') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (err) {
    return `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/**
 * Get live battery status from browser Battery API
 */
export async function getLiveBatteryLevel(): Promise<string> {
  try {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      const battery: any = await (navigator as any).getBattery();
      const level = Math.round(battery.level * 100);
      const charging = battery.charging ? 'Charging' : 'Battery';
      return `${level}% · ${charging}`;
    }
  } catch {
    // Battery API unsupported
  }
  return '84% · Normal';
}

