import { describe, it, expect } from 'vitest';
import { trust_status_of, formatTrustChip } from '../src/engine/trust';
import { calculateSafetyScore } from '../src/engine/safety';
import { evaluateFeasibility } from '../src/engine/feasibility';
import { rankPlans } from '../src/engine/ranker';
import { TripPlan } from '../src/engine/types';

describe('NightShift Decision Engine — Truth Layer (trust_status_of)', () => {
  const now = new Date('2026-10-25T02:00:00Z');

  it('returns UNKNOWN for missing or invalid timestamps', () => {
    expect(trust_status_of(null, true, 300, 1800, now)).toBe('UNKNOWN');
    expect(trust_status_of(undefined, false, 300, 1800, now)).toBe('UNKNOWN');
    expect(trust_status_of('invalid-date', true, 300, 1800, now)).toBe('UNKNOWN');
  });

  it('returns KNOWN when verified and within ttl_known', () => {
    // 2 minutes ago = 120s <= 300s
    const observed = new Date('2026-10-25T01:58:00Z');
    expect(trust_status_of(observed, true, 300, 1800, now)).toBe('KNOWN');
  });

  it('returns PROBABLE when within ttl_probable but unverified or past ttl_known', () => {
    // 10 minutes ago = 600s > 300s, but <= 1800s
    const observed = new Date('2026-10-25T01:50:00Z');
    expect(trust_status_of(observed, true, 300, 1800, now)).toBe('PROBABLE');
    expect(trust_status_of(observed, false, 300, 1800, now)).toBe('PROBABLE');
  });

  it('returns OUTDATED when age exceeds ttl_probable', () => {
    // 40 minutes ago = 2400s > 1800s
    const observed = new Date('2026-10-25T01:20:00Z');
    expect(trust_status_of(observed, true, 300, 1800, now)).toBe('OUTDATED');
  });

  it('correctly formats trust chips with tones and human labels', () => {
    const chipKnown = formatTrustChip('KNOWN', new Date('2026-10-25T01:55:00Z'), now);
    expect(chipKnown.tone).toBe('green');
    expect(chipKnown.label).toContain('Verified 5 min ago');

    const chipUnknown = formatTrustChip('UNKNOWN', null, now);
    expect(chipUnknown.tone).toBe('gray');
    expect(chipUnknown.label).toBe('Unknown');
  });
});

describe('Safety Score Calculation & UNKNOWN Cap Rule', () => {
  const now = new Date('2026-10-25T02:00:00Z');

  it('calculates good score when inputs are verified and corridor is safe', () => {
    const res = calculateSafetyScore({
      lightingScore: 26,
      staffedPointsScore: 22,
      transitReliability: 24,
      transferRiskPenalty: 2,
      weatherPenalty: 0,
      dataPoints: [
        {
          key: 'bus_gps',
          value: {},
          source: 'BEST',
          observedAt: new Date('2026-10-25T01:55:00Z'),
          verified: true,
          ttlKnownSec: 600,
          ttlProbableSec: 1800,
          isCritical: true
        }
      ]
    }, now);

    expect(res.score).toBeGreaterThanOrEqual(80);
    expect(res.capped).toBe(false);
    expect(res.tier).toBe('Good');
  });

  it('HARD CAPS score at 60 when any critical input is UNKNOWN', () => {
    const res = calculateSafetyScore({
      lightingScore: 30,
      staffedPointsScore: 25,
      transitReliability: 25,
      transferRiskPenalty: 0,
      weatherPenalty: 0,
      dataPoints: [
        {
          key: 'live_transit_status',
          value: null,
          source: 'Feed',
          observedAt: null, // UNKNOWN!
          verified: false,
          ttlKnownSec: 300,
          ttlProbableSec: 1200,
          isCritical: true
        }
      ]
    }, now);

    expect(res.score).toBe(60);
    expect(res.capped).toBe(true);
    expect(res.capReason).toContain('Limited data');
    expect(res.weakestStatus).toBe('UNKNOWN');
  });
});

describe('Feasibility Evaluation & Last Service Constraint', () => {
  it('marks plan infeasible if departure is after the last service (e.g. Last bus 3:10 AM vs 3:15 AM)', () => {
    const res = evaluateFeasibility({
      departureTimeMin: 195, // 3:15 AM
      deadLineMin: 240,      // 4:00 AM
      lastServiceDepartureMin: 190, // 3:10 AM!
      legDurationsMin: [20],
      waitTimesMin: [5]
    });

    expect(res.feasible).toBe(false);
    expect(res.reason).toContain('is after last service');
  });

  it('marks plan feasible when eta arrives before deadline', () => {
    const res = evaluateFeasibility({
      departureTimeMin: 120, // 2:00 AM
      deadLineMin: 210,      // 3:30 AM
      lastServiceDepartureMin: 225, // 3:45 AM
      legDurationsMin: [4, 26, 8], // 38m
      waitTimesMin: [0]
    });

    expect(res.feasible).toBe(true);
    expect(res.arrivalP50Min).toBe(158); // 2:38 AM <= 3:30 AM
    expect(res.confidence).toBe('likely');
  });
});

describe('Plan Ranker (Safest, Fastest, Cheapest)', () => {
  const dummyPlan = (id: string, mode: any, safetyScore: number, etaP50: number, fare: number, feasible = true): TripPlan => ({
    id,
    mode,
    name: id,
    summary: id,
    safetyScore,
    safetyTier: safetyScore >= 80 ? 'Good' : 'Moderate',
    etaP50Min: etaP50,
    etaP90Min: etaP50 + 10,
    departureTime: '2:00 AM',
    arrivalTime: '2:38 AM',
    fareInr: fare,
    feasible,
    overallStatus: 'KNOWN',
    statusChip: { status: 'KNOWN', label: 'Verified', detail: '' },
    whyThisScore: [],
    legs: [],
    dataPoints: [],
    uncertainties: [],
    polyline: []
  });

  it('ranks Bus 109 as Safest (score 82) and handles Fastest & Cheapest properly', () => {
    const bus109 = dummyPlan('Bus 109', 'safest', 82, 38, 25);
    const metroFast = dummyPlan('Auto + Metro', 'fastest', 74, 22, 140);
    const bus204 = dummyPlan('Night Feeder 204', 'cheapest', 68, 52, 15);

    const ranked = rankPlans([bus109, metroFast, bus204]);

    expect(ranked.safest?.id).toBe('Bus 109');
    expect(ranked.safest?.safetyScore).toBe(82);

    expect(ranked.fastest?.id).toBe('Auto + Metro');
    expect(ranked.fastest?.etaP50Min).toBe(22);

    expect(ranked.cheapest?.id).toBe('Night Feeder 204');
    expect(ranked.cheapest?.fareInr).toBe(15);
  });

  it('triggers emergency actions when no feasible plan exists', () => {
    const infeasible1 = dummyPlan('Missed Bus', 'safest', 80, 70, 20, false);
    const infeasible2 = dummyPlan('Cancelled Train', 'fastest', 60, 50, 40, false);

    const ranked = rankPlans([infeasible1, infeasible2]);

    expect(ranked.noFeasiblePlan).toBe(true);
    expect(ranked.emergencyActions?.length).toBeGreaterThan(0);
    expect(ranked.emergencyActions?.[0]).toContain('Call 112');
  });
});

