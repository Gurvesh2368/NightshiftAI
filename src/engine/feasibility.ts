export interface FeasibilityInput {
  departureTimeMin: number;       // Minutes from midnight, e.g. 2:00 AM = 120
  deadLineMin: number;            // e.g. 3:30 AM = 210
  lastServiceDepartureMin?: number; // e.g. last bus at 3:10 AM = 190
  legDurationsMin: number[];
  waitTimesMin: number[];
}

export interface FeasibilityResult {
  feasible: boolean;
  etaP50Min: number;
  etaP90Min: number;
  arrivalP50Min: number;
  arrivalP90Min: number;
  confidence: 'likely' | 'possible' | 'infeasible';
  reason?: string;
}

export function evaluateFeasibility(input: FeasibilityInput): FeasibilityResult {
  const sumLegs = input.legDurationsMin.reduce((a, b) => a + b, 0);
  const sumWaits = input.waitTimesMin.reduce((a, b) => a + b, 0);

  // Check last service cutoff
  if (
    input.lastServiceDepartureMin !== undefined &&
    input.departureTimeMin > input.lastServiceDepartureMin
  ) {
    return {
      feasible: false,
      etaP50Min: sumLegs + sumWaits,
      etaP90Min: sumLegs + sumWaits + 15,
      arrivalP50Min: input.departureTimeMin + sumLegs + sumWaits,
      arrivalP90Min: input.departureTimeMin + sumLegs + sumWaits + 15,
      confidence: 'infeasible',
      reason: `Departure at ${formatMinutes(input.departureTimeMin)} is after last service (${formatMinutes(input.lastServiceDepartureMin)})`
    };
  }

  // p50 is expected time
  const etaP50Min = sumLegs + sumWaits;
  // p90 adds night jitter / variance
  const etaP90Min = Math.round(etaP50Min * 1.25);

  const arrivalP50Min = input.departureTimeMin + etaP50Min;
  const arrivalP90Min = input.departureTimeMin + etaP90Min;

  if (arrivalP90Min <= input.deadLineMin) {
    return {
      feasible: true,
      etaP50Min,
      etaP90Min,
      arrivalP50Min,
      arrivalP90Min,
      confidence: 'likely',
      reason: 'On time arrival before deadline'
    };
  } else if (arrivalP50Min <= input.deadLineMin) {
    return {
      feasible: true,
      etaP50Min,
      etaP90Min,
      arrivalP50Min,
      arrivalP90Min,
      confidence: 'possible',
      reason: `Tight margin: expected arrival ${formatMinutes(arrivalP50Min)} vs deadline ${formatMinutes(input.deadLineMin)}`
    };
  } else {
    return {
      feasible: false,
      etaP50Min,
      etaP90Min,
      arrivalP50Min,
      arrivalP90Min,
      confidence: 'infeasible',
      reason: `Arrival by ${formatMinutes(arrivalP50Min)} exceeds deadline ${formatMinutes(input.deadLineMin)}`
    };
  }
}

export function formatMinutes(totalMin: number): string {
  const hours = Math.floor(totalMin / 60) % 24;
  const minutes = Math.floor(totalMin % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const ampm = hours >= 12 && hours < 24 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${pad(minutes)} ${ampm}`;
}

