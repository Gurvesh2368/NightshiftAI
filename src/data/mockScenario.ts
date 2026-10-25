import { TripPlan } from '../engine/types';
import { OfflinePlace } from '../lib/db';

export const INITIAL_PLANS: TripPlan[] = [
  {
    id: 'plan_safest_109',
    mode: 'safest',
    name: 'Bus 109 + 4 min walk',
    summary: 'Night Express 109 via Central Arterial Road',
    safetyScore: 82,
    safetyTier: 'Good',
    etaP50Min: 38,
    etaP90Min: 44,
    departureTime: '02:05 AM',
    arrivalTime: '02:43 AM',
    fareInr: 25,
    feasible: true,
    overallStatus: 'KNOWN',
    statusChip: {
      status: 'KNOWN',
      label: 'Verified 5 min ago',
      detail: 'Live vehicle telemetry (BEST bus MH-01-9821 at 34 km/h)'
    },
    whyThisScore: [
      'Direct Night Express bus with verified live GPS tracking',
      'Continuous white LED lighting on arterial road corridor',
      'Route passes 24/7 staffed City Hospital & Police Chowki',
      'Minimal 4-minute walk on well-traveled lit pavement'
    ],
    legs: [
      {
        seq: 1,
        kind: 'walk',
        fromName: 'Tech Park North Gate',
        toName: 'Tech Park Bus Bay 1',
        fromCoords: [72.8625, 19.0640],
        toCoords: [72.8638, 19.0645],
        durationMin: 2,
        waitMin: 3,
        distanceKm: 0.15,
        lighting: 'good',
        instructions: [
          {
            text: 'Walk 150m straight from North Gate to illuminated Bus Bay 1',
            textHi: 'उत्तर गेट से सीधे 150 मीटर चलकर रोशन बस बे 1 तक जाएं',
            textMr: 'उत्तर गेटवरून 150 मीटर सरळ जाऊन प्रकाशित बस बे 1 कडे जा',
            distanceM: 150,
            action: 'straight'
          }
        ]
      },
      {
        seq: 2,
        kind: 'bus',
        serviceId: 'BUS_109',
        fromName: 'Tech Park Bus Bay 1',
        toName: 'Shivneri Nagar Crossing',
        fromCoords: [72.8638, 19.0645],
        toCoords: [72.8755, 19.0745],
        durationMin: 32,
        waitMin: 0,
        distanceKm: 4.8,
        lighting: 'good',
        safetyNote: 'Vehicle MH-01-9821 has onboard emergency button & CCTV',
        instructions: [
          {
            text: 'Board Night Express 109 towards Kurla Depot',
            textHi: 'कुर्ला डेपोकडे जाणाऱ्या नाईट एक्सप्रेस 109 मध्ये चढा',
            textMr: 'कुर्ला डेपोकडे जाणाऱ्या नाईट एक्सप्रेस 109 मध्ये चढा',
            distanceM: 4800,
            action: 'board_transit'
          },
          {
            text: 'Ride 5 stops; pass Central Hospital safely',
            textHi: '5 स्टॉप प्रवास करा; सेंट्रल हॉस्पिटल सुरक्षितपणे पार करा',
            textMr: '5 थांबे प्रवास करा; सेंट्रल हॉस्पिटल सुरक्षितपणे ओलांडा',
            distanceM: 3200,
            action: 'transit_progress'
          },
          {
            text: 'Prepare to alight at Shivneri Nagar Crossing',
            textHi: 'शिवनेरी नगर क्रॉसिंगवर उतरण्यासाठी तयार व्हा',
            textMr: 'शिवनेरी नगर क्रॉसिंगवर उतरण्यासाठी तयार व्हा',
            distanceM: 200,
            action: 'alight_transit'
          }
        ]
      },
      {
        seq: 3,
        kind: 'walk',
        fromName: 'Shivneri Nagar Crossing',
        toName: 'Home (Block B, Shivneri)',
        fromCoords: [72.8755, 19.0745],
        toCoords: [72.8775, 19.0760],
        durationMin: 4,
        waitMin: 0,
        distanceKm: 0.3,
        lighting: 'good',
        instructions: [
          {
            text: 'Walk 200m north on Main Road towards apartment gate',
            textHi: 'अपार्टमेंट गेटकडे मेन रोडवर 200 मीटर उत्तरेकडे चाला',
            textMr: 'अपार्टमेंट गेटकडे मुख्य रस्त्यावरून 200 मीटर उत्तरेकडे चाला',
            distanceM: 200,
            action: 'straight'
          },
          {
            text: 'Turn right into society gate — safe arrival zone',
            textHi: 'सोसायटीच्या गेटमध्ये उजवीकडे वळा — सुरक्षित आगमन क्षेत्र',
            textMr: 'सोसायटीच्या गेटमध्ये उजवीकडे वळा — सुरक्षित आगमन क्षेत्र',
            distanceM: 100,
            action: 'turn_right'
          }
        ]
      }
    ],
    dataPoints: [
      {
        key: 'live_bus_gps',
        value: { bus: 'MH-01-9821', speed_kmh: 34 },
        source: 'BEST Transit Realtime Telemetry',
        observedAt: new Date(Date.now() - 3 * 60000).toISOString(),
        verified: true,
        ttlKnownSec: 600,
        ttlProbableSec: 1800,
        isCritical: true
      },
      {
        key: 'corridor_lighting',
        value: 'Continuous white LED; CCTV active',
        source: 'Municipal Smart City Lighting Grid',
        observedAt: new Date(Date.now() - 22 * 60000).toISOString(),
        verified: true,
        ttlKnownSec: 3600,
        ttlProbableSec: 14400,
        isCritical: true
      },
      {
        key: 'weather_radar',
        value: 'Light drizzle expected near 1:30 AM',
        source: 'Open-Meteo Night Radar',
        observedAt: new Date(Date.now() - 12 * 60000).toISOString(),
        verified: false,
        ttlKnownSec: 900,
        ttlProbableSec: 3600,
        isCritical: false
      }
    ],
    uncertainties: [
      'Rain probability 65% between 1:30 AM and 2:30 AM may cause wet sidewalks'
    ],
    fallbackPlan: 'If Bus 109 cancels, auto stand is 80m away with prepaid token booth',
    polyline: [
      [72.8625, 19.0640],
      [72.8638, 19.0645],
      [72.8660, 19.0658],
      [72.8685, 19.0680],
      [72.8710, 19.0705],
      [72.8735, 19.0728],
      [72.8755, 19.0745],
      [72.8765, 19.0752],
      [72.8775, 19.0760]
    ]
  },
  {
    id: 'plan_fastest_auto',
    mode: 'fastest',
    name: 'Direct Auto / Night Cab',
    summary: 'Point-to-point auto-rickshaw via Eastern Link',
    safetyScore: 74,
    safetyTier: 'Moderate',
    etaP50Min: 22,
    etaP90Min: 28,
    departureTime: '02:05 AM',
    arrivalTime: '02:27 AM',
    fareInr: 140,
    feasible: true,
    overallStatus: 'PROBABLE',
    statusChip: {
      status: 'PROBABLE',
      label: 'Probable standby',
      detail: 'Night auto stand active with 4 vehicles observed'
    },
    whyThisScore: [
      'Fastest trip home (22 min) — arrives well ahead of deadline',
      'Zero walking along secluded night side streets',
      'Price fluctuates late night (night meter rate 1.5x)'
    ],
    legs: [
      {
        seq: 1,
        kind: 'auto',
        fromName: 'Tech Park Gate Auto Stand',
        toName: 'Home Gate',
        fromCoords: [72.8625, 19.0640],
        toCoords: [72.8775, 19.0760],
        durationMin: 22,
        waitMin: 2,
        distanceKm: 5.2,
        instructions: [
          {
            text: 'Board auto at designated lighted stand with security token',
            textHi: 'सुरक्षा टोकन असलेल्या नियुक्त प्रकाशित स्टँडवर ऑटोमध्ये बसा',
            textMr: 'सुरक्षा टोकन असलेल्या नियुक्त प्रकाशित स्टँडवर ऑटोमध्ये बसा',
            distanceM: 5200,
            action: 'board_auto'
          }
        ]
      }
    ],
    dataPoints: [
      {
        key: 'auto_stand_queue',
        value: '4 vehicles queued at gate',
        source: 'Security Gate Log',
        observedAt: new Date(Date.now() - 14 * 60000).toISOString(),
        verified: false,
        ttlKnownSec: 600,
        ttlProbableSec: 1800,
        isCritical: true
      }
    ],
    uncertainties: ['Fare may vary slightly depending on night meter rate'],
    polyline: [
      [72.8625, 19.0640],
      [72.8655, 19.0650],
      [72.8690, 19.0675],
      [72.8730, 19.0710],
      [72.8775, 19.0760]
    ]
  },
  {
    id: 'plan_cheapest_204',
    mode: 'cheapest',
    name: 'Feeder Bus 204 + 12 min walk',
    summary: 'Feeder route with longer walking connection',
    safetyScore: 68,
    safetyTier: 'Moderate',
    etaP50Min: 52,
    etaP90Min: 60,
    departureTime: '02:15 AM',
    arrivalTime: '03:07 AM',
    fareInr: 15,
    feasible: true,
    overallStatus: 'PROBABLE',
    statusChip: {
      status: 'PROBABLE',
      label: 'Scheduled',
      detail: 'Scheduled timetable only; GPS telemetry intermittent'
    },
    whyThisScore: [
      'Lowest fare (₹15) fitting low night budget',
      'Feeder bus departure at 2:15 AM',
      'Requires 12 min walk with unstaffed sections near flyover'
    ],
    legs: [
      {
        seq: 1,
        kind: 'bus',
        serviceId: 'BUS_204',
        fromName: 'Tech Park Gate 3',
        toName: 'Old Railway Colony',
        fromCoords: [72.8625, 19.0640],
        toCoords: [72.8720, 19.0700],
        durationMin: 38,
        waitMin: 5,
        distanceKm: 4.1,
        instructions: [
          {
            text: 'Board Feeder 204 at Gate 3',
            textHi: 'गेट 3 वरून फीडर 204 मध्ये बसा',
            textMr: 'गेट 3 वरून फीडर 204 मध्ये बसा',
            distanceM: 4100,
            action: 'board_transit'
          }
        ]
      },
      {
        seq: 2,
        kind: 'walk',
        fromName: 'Old Railway Colony',
        toName: 'Home',
        fromCoords: [72.8720, 19.0700],
        toCoords: [72.8775, 19.0760],
        durationMin: 12,
        waitMin: 0,
        distanceKm: 0.9,
        lighting: 'moderate',
        instructions: [
          {
            text: 'Walk 900m via Colony Lane (moderate lighting)',
            textHi: 'कॉलनी लेनवरून 900 मीटर चाला (मध्यम प्रकाश)',
            textMr: 'कॉलनी लेनवरून 900 मीटर चाला (मध्यम प्रकाश)',
            distanceM: 900,
            action: 'walk'
          }
        ]
      }
    ],
    dataPoints: [
      {
        key: 'feeder_schedule',
        value: 'Scheduled headway 25m',
        source: 'Timetable DB',
        observedAt: new Date(Date.now() - 48 * 60000).toISOString(),
        verified: false,
        ttlKnownSec: 600,
        ttlProbableSec: 3600,
        isCritical: true
      }
    ],
    uncertainties: ['Walking route passes dim section under old flyover'],
    polyline: [
      [72.8625, 19.0640],
      [72.8640, 19.0660],
      [72.8680, 19.0680],
      [72.8720, 19.0700],
      [72.8750, 19.0730],
      [72.8775, 19.0760]
    ]
  }
];

export const MOCK_PLACES: OfflinePlace[] = [
  {
    id: 'p1',
    name: 'City Hospital Emergency & Trauma',
    type: 'hospital',
    lat: 19.0690,
    lng: 72.8680,
    staffed_24h: true,
    opening_hours: '24/7 Open',
    distanceKm: 1.2,
    fetchedAt: Date.now()
  },
  {
    id: 'p2',
    name: 'Apollo 24/7 Pharmacy',
    type: 'pharmacy',
    lat: 19.0710,
    lng: 72.8715,
    staffed_24h: true,
    opening_hours: '24/7 Open',
    distanceKm: 0.8,
    fetchedAt: Date.now()
  },
  {
    id: 'p3',
    name: 'Kurla Police Chowki (Night Desk)',
    type: 'police',
    lat: 19.0680,
    lng: 72.8745,
    staffed_24h: true,
    opening_hours: '24/7 Staffed',
    distanceKm: 1.6,
    fetchedAt: Date.now()
  },
  {
    id: 'p4',
    name: 'Staffed Metro Station Waiting Bay',
    type: 'waiting_spot',
    lat: 19.0665,
    lng: 72.8650,
    staffed_24h: true,
    opening_hours: '24/7 Security Guard on Duty',
    distanceKm: 0.5,
    fetchedAt: Date.now()
  },
  {
    id: 'p5',
    name: 'Night Owl Safe Water & Chai Stand',
    type: 'food',
    lat: 19.0675,
    lng: 72.8720,
    staffed_24h: false,
    opening_hours: 'Open until 4:00 AM',
    distanceKm: 0.9,
    fetchedAt: Date.now()
  }
];

export const MOCK_AREA_ZONES = [
  {
    zone_id: 'Zone A (BKC North Tech Sector)',
    active_count: 240,
    transport_verified_count: 210,
    n_reports: 180,
    hidden: false,
    confidence: 'high',
    source: 'opt-in worker check-ins'
  },
  {
    zone_id: 'Zone B (Kurla West Station Belt)',
    active_count: 160,
    transport_verified_count: 140,
    n_reports: 120,
    hidden: false,
    confidence: 'medium',
    source: 'opt-in worker check-ins'
  },
  {
    zone_id: 'Zone C (Chunabhatti Transit Corridor)',
    active_count: 90,
    transport_verified_count: 45,
    n_reports: 65,
    hidden: false,
    confidence: 'medium',
    source: 'opt-in worker check-ins',
    hasGapFlag: true,
    gapDetail: 'Possible night-mobility gap in Zone C — Probable (50% transport drop)'
  },
  {
    zone_id: 'Zone D (Industrial Pocket)',
    active_count: null,
    transport_verified_count: null,
    n_reports: null,
    hidden: true,
    confidence: 'low',
    source: 'opt-in worker check-ins',
    hiddenReason: 'Hidden. Too few reports to show safely (k-anonymity protection).'
  }
];

