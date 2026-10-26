import { describe, it, expect } from 'vitest';
import { generateLivePlaces, filterPlacesByCategory, calculateDistanceKm } from '../src/lib/places';

describe('Live POI & Safe Haven Locator', () => {
  const mockLiveCoords = { lat: 19.0657, lng: 72.8681 };

  it('generates POIs around the user live coordinates covering all 5 requested categories', () => {
    const places = generateLivePlaces(mockLiveCoords);
    expect(places.length).toBeGreaterThanOrEqual(10);

    const types = new Set(places.map(p => p.type));
    expect(types.has('pharmacy')).toBe(true);
    expect(types.has('hospital')).toBe(true);
    expect(types.has('police')).toBe(true);
    expect(types.has('bus_stop')).toBe(true);
    expect(types.has('hotel')).toBe(true);
  });

  it('correctly calculates distance and sorts by proximity', () => {
    const places = generateLivePlaces(mockLiveCoords);
    expect(places[0].distanceKm).toBeDefined();
    for (let i = 1; i < places.length; i++) {
      expect((places[i].distanceKm || 0) >= (places[i - 1].distanceKm || 0)).toBe(true);
    }
  });

  it('filters places accurately by category', () => {
    const places = generateLivePlaces(mockLiveCoords);

    const pharmacies = filterPlacesByCategory(places, 'pharmacy');
    expect(pharmacies.length).toBeGreaterThan(0);
    expect(pharmacies.every(p => p.type === 'pharmacy')).toBe(true);

    const hospitals = filterPlacesByCategory(places, 'hospital');
    expect(hospitals.length).toBeGreaterThan(0);
    expect(hospitals.every(p => p.type === 'hospital')).toBe(true);

    const police = filterPlacesByCategory(places, 'police');
    expect(police.length).toBeGreaterThan(0);
    expect(police.every(p => p.type === 'police')).toBe(true);

    const busStops = filterPlacesByCategory(places, 'bus_stop');
    expect(busStops.length).toBeGreaterThan(0);
    expect(busStops.every(p => p.type === 'bus_stop')).toBe(true);

    const hotels = filterPlacesByCategory(places, 'hotel');
    expect(hotels.length).toBeGreaterThan(0);
    expect(hotels.every(p => p.type === 'hotel')).toBe(true);
  });
});
