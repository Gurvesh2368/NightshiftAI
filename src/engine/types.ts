export type TrustStatus = 'KNOWN' | 'PROBABLE' | 'OUTDATED' | 'UNKNOWN';

export type PlanMode = 'safest' | 'cheapest' | 'fastest';

export interface DataPoint {
  key: string;
  value: any;
  source: string;
  observedAt: string | Date | null;
  verified: boolean;
  ttlKnownSec: number;
  ttlProbableSec: number;
  isCritical?: boolean;
}

export interface RouteLeg {
  id?: string;
  seq: number;
  kind: 'walk' | 'bus' | 'metro' | 'auto';
  serviceId?: string;
  fromName: string;
  toName: string;
  fromCoords: [number, number]; // [lng, lat]
  toCoords: [number, number];
  durationMin: number;
  waitMin: number;
  distanceKm: number;
  instructions: {
    text: string;
    textHi?: string;
    textMr?: string;
    distanceM: number;
    action: string;
  }[];
  lighting?: 'good' | 'moderate' | 'dark';
  safetyNote?: string;
}

export interface TripPlan {
  id: string;
  mode: PlanMode;
  name: string;
  summary: string;
  safetyScore: number;
  safetyTier: 'High' | 'Good' | 'Moderate' | 'Low';
  scoreCapReason?: string;
  etaP50Min: number;
  etaP90Min: number;
  departureTime: string;
  arrivalTime: string;
  fareInr: number;
  feasible: boolean;
  feasibilityReason?: string;
  overallStatus: TrustStatus;
  statusChip: {
    status: TrustStatus;
    label: string;
    detail: string;
  };
  whyThisScore: string[];
  legs: RouteLeg[];
  dataPoints: DataPoint[];
  uncertainties: string[];
  fallbackPlan?: string;
  polyline: [number, number][]; // [[lng, lat], ...]
}

