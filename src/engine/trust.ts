import { TrustStatus } from './types';

export function trust_status_of(
  observedAt: Date | string | null | undefined,
  verified: boolean,
  ttlKnownSec: number,
  ttlProbableSec: number,
  now: Date = new Date()
): TrustStatus {
  if (!observedAt) {
    return 'UNKNOWN';
  }

  const observed = typeof observedAt === 'string' ? new Date(observedAt) : observedAt;
  if (isNaN(observed.getTime())) {
    return 'UNKNOWN';
  }

  const ageSec = Math.max(0, Math.floor((now.getTime() - observed.getTime()) / 1000));

  if (verified && ageSec <= ttlKnownSec) {
    return 'KNOWN';
  }
  if (ageSec <= ttlProbableSec) {
    return 'PROBABLE';
  }
  return 'OUTDATED';
}

export function formatTrustChip(
  status: TrustStatus,
  observedAt?: Date | string | null,
  now: Date = new Date()
): { label: string; tone: 'green' | 'amber' | 'red' | 'gray'; description: string } {
  if (status === 'UNKNOWN' || !observedAt) {
    return {
      label: 'Unknown',
      tone: 'gray',
      description: 'No verified recent observation available'
    };
  }

  const observed = typeof observedAt === 'string' ? new Date(observedAt) : observedAt;
  const ageMin = Math.max(1, Math.round((now.getTime() - observed.getTime()) / 60000));

  switch (status) {
    case 'KNOWN':
      return {
        label: `Verified ${ageMin} min ago`,
        tone: 'green',
        description: 'Directly verified from live GPS/service telemetry'
      };
    case 'PROBABLE':
      return {
        label: `Probable (${ageMin}m)`,
        tone: 'amber',
        description: 'Recent scheduled or crowd-correlated data'
      };
    case 'OUTDATED':
      return {
        label: `Outdated (${ageMin}m ago)`,
        tone: 'red',
        description: 'Exceeded fresh TTL window; do not rely blindly'
      };
    default:
      return {
        label: 'Unknown',
        tone: 'gray',
        description: 'Unverified input'
      };
  }
}

