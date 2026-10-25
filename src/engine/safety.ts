import { DataPoint, TrustStatus } from './types';
import { trust_status_of } from './trust';

export interface SafetyScoreInput {
  lightingScore: number;       // 0 to 30
  staffedPointsScore: number;  // 0 to 25
  transitReliability: number;  // 0 to 25
  transferRiskPenalty: number; // 0 to 20 deduction
  weatherPenalty: number;      // 0 to 15 deduction
  dataPoints: DataPoint[];
}

export interface SafetyScoreResult {
  score: number;
  capped: boolean;
  capReason?: string;
  tier: 'High' | 'Good' | 'Moderate' | 'Low';
  bullets: string[];
  weakestStatus: TrustStatus;
}

export function calculateSafetyScore(
  input: SafetyScoreInput,
  now: Date = new Date()
): SafetyScoreResult {
  // 1. Evaluate trust status of all data points
  let weakestStatus: TrustStatus = 'KNOWN';
  let hasUnknownCritical = false;

  for (const dp of input.dataPoints) {
    const status = trust_status_of(
      dp.observedAt,
      dp.verified,
      dp.ttlKnownSec,
      dp.ttlProbableSec,
      now
    );

    if (status === 'UNKNOWN') {
      weakestStatus = 'UNKNOWN';
      if (dp.isCritical) {
        hasUnknownCritical = true;
      }
    } else if (status === 'OUTDATED' && weakestStatus !== 'UNKNOWN') {
      weakestStatus = 'OUTDATED';
    } else if (status === 'PROBABLE' && weakestStatus === 'KNOWN') {
      weakestStatus = 'PROBABLE';
    }
  }

  // 2. Base raw score calculation
  const rawScore = Math.max(
    0,
    Math.min(
      100,
      input.lightingScore +
        input.staffedPointsScore +
        input.transitReliability -
        input.transferRiskPenalty -
        input.weatherPenalty +
        20 // baseline constant
    )
  );

  // 3. Apply Hard Cap for UNKNOWN critical inputs
  let finalScore = rawScore;
  let capped = false;
  let capReason: string | undefined = undefined;

  if (hasUnknownCritical) {
    if (finalScore > 60) {
      finalScore = 60;
      capped = true;
      capReason = 'Limited data: critical road or transit status is UNKNOWN';
    }
  }

  // 4. Determine tier
  let tier: 'High' | 'Good' | 'Moderate' | 'Low' = 'Low';
  if (finalScore >= 80) tier = 'Good'; // or High
  else if (finalScore >= 65) tier = 'Moderate';
  else if (finalScore >= 50) tier = 'Moderate';
  else tier = 'Low';

  if (finalScore >= 80) {
    tier = 'Good';
  }

  // 5. Build explanatory bullets
  const bullets: string[] = [];
  if (input.lightingScore >= 22) {
    bullets.push('Well-lit arterial corridor with continuous streetlights');
  } else if (input.lightingScore < 15) {
    bullets.push('Sections with dim or uneven night lighting');
  }

  if (input.staffedPointsScore >= 18) {
    bullets.push('Passes 2 staffed waiting spots & 24/7 hospital');
  }

  if (input.transferRiskPenalty <= 5) {
    bullets.push('Direct route or low transfer risk');
  } else {
    bullets.push('Requires waiting at night transfer stop');
  }

  if (capped) {
    bullets.push('Score capped at 60 due to unverified inputs');
  }

  return {
    score: Math.round(finalScore),
    capped,
    capReason,
    tier,
    bullets,
    weakestStatus
  };
}

