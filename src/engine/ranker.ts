import { TripPlan } from './types';

export interface RankedPlans {
  safest?: TripPlan;
  fastest?: TripPlan;
  cheapest?: TripPlan;
  allFeasible: TripPlan[];
  noFeasiblePlan: boolean;
  bestEffort?: TripPlan;
  emergencyActions?: string[];
}

export function rankPlans(plans: TripPlan[]): RankedPlans {
  const feasiblePlans = plans.filter(p => p.feasible);

  if (feasiblePlans.length === 0) {
    // Pick the best-effort plan with highest safety score
    const bestEffort = [...plans].sort((a, b) => b.safetyScore - a.safetyScore)[0];
    return {
      allFeasible: [],
      noFeasiblePlan: true,
      bestEffort,
      emergencyActions: [
        'Call 112 Emergency Dispatch',
        'Alert Trusted Emergency Contacts',
        'Navigate to Nearest 24/7 Staffed Safe Spot (Hospital / Police)'
      ]
    };
  }

  // 1. Safest: max safety score
  const safest = [...feasiblePlans].sort((a, b) => {
    if (b.safetyScore !== a.safetyScore) {
      return b.safetyScore - a.safetyScore;
    }
    return a.etaP50Min - b.etaP50Min;
  })[0];

  // 2. Fastest: min etaP50Min
  const fastest = [...feasiblePlans].sort((a, b) => {
    if (a.etaP50Min !== b.etaP50Min) {
      return a.etaP50Min - b.etaP50Min;
    }
    return b.safetyScore - a.safetyScore;
  })[0];

  // 3. Cheapest: min fare, safetyScore >= 50, no UNKNOWN critical data
  const cheapCandidates = feasiblePlans.filter(p => {
    const hasUnknownCritical = p.dataPoints.some(dp => dp.isCritical && p.overallStatus === 'UNKNOWN');
    return p.safetyScore >= 50 && !hasUnknownCritical;
  });

  const cheapest = cheapCandidates.length > 0
    ? [...cheapCandidates].sort((a, b) => {
        if (a.fareInr !== b.fareInr) {
          return a.fareInr - b.fareInr;
        }
        return b.safetyScore - a.safetyScore;
      })[0]
    : safest;

  return {
    safest,
    fastest,
    cheapest,
    allFeasible: feasiblePlans,
    noFeasiblePlan: false
  };
}

