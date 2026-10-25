import Dexie, { Table } from 'dexie';
import { TripPlan } from '../engine/types';

export interface CachedTrip {
  id: string;
  mode: string;
  plan: TripPlan;
  fetchedAt: number; // Date.now()
}

export interface OfflinePlace {
  id: string;
  name: string;
  type: 'hospital' | 'pharmacy' | 'police' | 'food' | 'water' | 'toilet' | 'waiting_spot';
  lat: number;
  lng: number;
  staffed_24h: boolean;
  opening_hours: string;
  distanceKm?: number;
  fetchedAt: number;
}

export interface OfflineContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  priority: number;
  status: 'accepted' | 'invited' | 'declined';
}

export interface OfflineEmergencyCard {
  id: string;
  fullName: string;
  bloodGroup: string;
  allergies: string;
  medicalNotes: string;
  emergencyPhone: string;
  fetchedAt: number;
}

export interface QueuedSos {
  id: string;
  trigger: string;
  coords: { lat: number; lng: number };
  timestamp: number;
  synced: boolean;
}

export class NightShiftDatabase extends Dexie {
  cachedTrips!: Table<CachedTrip, string>;
  offlinePlaces!: Table<OfflinePlace, string>;
  offlineContacts!: Table<OfflineContact, string>;
  offlineEmergencyCard!: Table<OfflineEmergencyCard, string>;
  queuedSosAlerts!: Table<QueuedSos, string>;

  constructor() {
    super('NightShiftDB');
    this.version(1).stores({
      cachedTrips: 'id, mode, fetchedAt',
      offlinePlaces: 'id, type, fetchedAt',
      offlineContacts: 'id, priority, status',
      offlineEmergencyCard: 'id, fetchedAt',
      queuedSosAlerts: 'id, timestamp, synced'
    });
  }
}

export const offlineDb = new NightShiftDatabase();

