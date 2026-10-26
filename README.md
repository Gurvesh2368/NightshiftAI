# 🌃 NightShift AI — Tactical Emergency Navigation & Decision Engine

[![React](https://img.shields.io/badge/React-19.3.1-blue?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.3.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MapLibre](https://img.shields.io/badge/MapLibre_GL-6.15.0-396B94?logo=maplibre&logoColor=white)](https://maplibre.org)
[![Tests](https://img.shields.io/badge/Tests-15%20Passed-success?logo=vitest&logoColor=white)](https://vitest.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Tactical, safety-first urban navigation and emergency decision-support engine engineered specifically for night shift workers, late-night commuters, emergency responders, and solitary travelers.**

---

## ⚡ Executive Summary

Urban navigation systems are typically optimized for one variable: **speed**. For night shift healthcare professionals, factory workers, hospitality staff, and late-night travelers, the fastest route often crosses poorly illuminated alleys, unmonitored sectors, or shuttered transit corridors. 

**NightShift AI** flips the paradigm: it optimizes for **survival, illumination, verified human presence, and immediate emergency escalation**. Built on an uncompromising **Truth Architecture**, NightShift AI never fabricates certainty. If telemetry is stale or unmonitored, safety scores are hard-capped and flagged with real-time honesty chips.

```
+-----------------------------------------------------------------------------------------+
|                                    NIGHTSHIFT AI                                        |
|  [Tactical Pear #C8DC35]                        [Safety Red #DC2626]                   |
|  Verified Illumination & Waypoints              Emergency Escalation & SOS Triggers     |
|                                                                                         |
|  +------------------------+  +------------------------+  +---------------------------+  |
|  |     TRUTH LAYER        |  |   LIVE NAVIGATION      |  |     EMERGENCY DISPATCH    |  |
|  | Hard-Capped Confidence |  | MapLibre GL Vector Map |  | In-Place Auto Dispatch   |  |
|  | Verified / Outdated    |  | Route Illumination     |  | Live Family GPS Portal    |  |
|  +------------------------+  +------------------------+  +---------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

## 🎯 Key Capabilities & Architectural Pillars

### 1. 🛡️ The Truth Layer & Honesty Engine
Generic AI navigation systems often present unverified estimates with smooth, confident visual graphs. NightShift AI strictly implements an algorithmic **Truth Policy**:
- **Hard Rule**: Any route or waypoint relying on unverified or outdated data sources cannot exceed a composite safety score of **60/100**.
- **Real-Time Honesty Chips**:
  - `KNOWN`: Field-verified with active telemetry within the past 15 minutes. Full score eligibility.
  - `PROBABLE`: Algorithmic interpolation backed by recent multi-source historical safety patterns.
  - `OUTDATED`: Telemetry data older than 60 minutes; triggers the **hard 60 cap rule** and alerts the user.
  - `UNKNOWN`: Uninstrumented sector; explicit zero-confidence indicator.

### 2. 🎨 Tactical High-Contrast Non-AI UI
NightShift AI rejects generic SaaS gradients, translucent purple bubbles, and distracting decorative animations in favor of a utilitarian, field-ready tactile system:
- **Tactical Pear (`#C8DC35`)**: High visibility under extreme low-light and night glare conditions. Used for verified safe corridors, optimal routing, and active telemetry.
- **Safety Red (`#DC2626`)**: Reserved strictly for high-urgency states: SOS active triggers, emergency dispatches, and hazard warnings.
- **Deep Obsidian Surface (`#0A0D10` / `#12161C`)**: Minimizes OLED battery drain and prevents night vision impairment.
- **Sub-Millimeter Tactile Controls**: Physical button feel with immediate tactile micro-press feedback.

### 3. 🚨 Instant In-Place SOS & Automated Situational Report Dispatch
When seconds matter, users cannot be forced to navigate new browser tabs, fill out captcha forms, or verify external email services.
- **2-Second Hold-to-Activate SOS**: Deliberate touch-and-hold trigger eliminates accidental triggers while remaining effortless under panic or duress.
- **Safe Arrival Countdown**: Autonomous safety timer. If not checked in prior to countdown expiration, automatically triggers escalation.
- **Zero-Redirection Direct Dispatch**: A single tactile button dispatches the situational report directly in the background via internal mailer services without navigating away from the live SOS screen.
- **Standardized Emergency Alert Format**: Dynamically targets the affected user's registered email (`patilgurveshp@gmail.com`) with high-priority RFC headers and strict `'🚨EMERGENCY'` subject:

```text
🚨EMERGENCY ALERT
==================================================
HAZARD TYPE: CRITICAL IMMINENT THREAT / SEVERE NIGHT HAZARD
INCIDENT STATUS: ACTIVE CRITICAL TELEMETRY BROADCAST

AFFECTED USER & CONTACT
--------------------------------------------------
• Affected User: Gurvesh Patil
• Registered User Email: patilgurveshp@gmail.com
• Emergency Phone: +91 98765 43210
• Incident Time: [Live Timestamp]

AFFECTED USER LOCATION & TELEMETRY
--------------------------------------------------
• Current Area: Live Telemetry Sector · Nagpur
• GPS Coordinates: 21.14630, 79.08490
• Telemetry Status: 78% · Cellular 4G Connected
• Live Real-Time Evacuation & Tracking Map:
  http://localhost:5173/?view=contact_alert&lat=21.1463&lng=79.0849&user=Gurvesh%20Patil

MEDICAL & EMERGENCY IDENTIFICATION
--------------------------------------------------
• Blood Group: O+ (Universal Donor)
• Medical Profile: No known drug allergies
• Nearest 24/7 Safe Haven: Civil Hospital Trauma Center & Police Chowki (1.2 km away)

IMMEDIATE SAFETY & EVACUATION INSTRUCTIONS
--------------------------------------------------
1. EVACUATE IMMEDIATELY: Move rapidly towards nearest verified 24/7 staffed safe haven.
2. HIGH-ILLUMINATION CORRIDOR: Avoid dark alleyways, unlit paths, and isolated areas.
3. ENGAGE EMERGENCY DISPATCH: Call National Emergency Services at 112 immediately.
4. CONTINUOUS TELEMETRY: Live moving GPS stream is active and broadcasting.
5. SEEK MONITORED SHELTER: Enter nearest 24/7 commercial establishment or transport hub if pursued.

EMERGENCY DISPATCH ACTIONS
--------------------------------------------------
• Direct Call to Affected User: tel:+919876543210
• Real-Time Moving Map Tracking: http://localhost:5173/?view=contact_alert&lat=21.1463&lng=79.0849&user=Gurvesh%20Patil
• Dispatch Emergency First Responders: tel:112

This emergency transmission was generated by NightShift AI Real-Time Protection.
```

### 4. 🗺️ Live Tactical Navigation & Route Illumination
- **MapLibre GL JS**: High-performance WebGL vector rendering with zero frame drop during rapid panning or GPS movement.
- **Dual Map Providers**: LocationIQ dark vector tiles paired with Thunderforest Transport Dark overlays.
- **Illumination Corridors**: Routes are calculated and rendered with luminosity weighting—guiding users through continuously lit public thoroughfares, open 24/7 commercial stores, and police chowkis.
- **Emergency Safe-Haven Waypoints**: Interactive pins indicating verified 24/7 hospital trauma centers, pharmacies, open fuel stations, and monitored transit stops.

### 5. 🔊 Hardware Audio Synthesizer & Multilingual Voice Guidance
- **Web Audio API Hardware Synthesis**: Direct procedural oscillator waveform synthesis (Sine/Square dual-tone alerts at 880 Hz / 1760 Hz) bypassing OS audio latency.
- **Multilingual Voice Guidance**: Intelligent speech synthesis providing vocal distance and safety turn alerts in English with native Hindi (`hi-IN`) and Marathi (`mr-IN`) phonetic fallbacks.

### 6. 💾 Offline-First Architecture with Supabase Cloud Sync
- **Dexie (IndexedDB) Local Engine**: Full offline functionality. Waypoints, downloaded corridor segments, emergency contacts, and cached medical profiles are queryable with zero network latency.
- **Supabase Cloud Synchronization**: Automatically reconciles route history, real-time safety telemetry, and verified safe havens when connectivity resumes.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev) + [TypeScript 6](https://www.typescriptlang.org) + [Vite 8](https://vitejs.dev) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com) + Custom Tactical Pear & Safety Red Tokens |
| **Geospatial & Vector Mapping** | [MapLibre GL](https://maplibre.org) + [Turf.js](https://turfjs.org) + LocationIQ + Thunderforest |
| **Database & Persistence** | [Dexie.js (IndexedDB)](https://dexie.org) (Offline) + [Supabase](https://supabase.com) (PostgreSQL) |
| **Audio Engine** | Web Audio API (Hardware Synthesis) + Web SpeechSynthesis API (Bilingual) |
| **Emergency Dispatch** | Vite Internal Node.js Dispatcher + [Nodemailer](https://nodemailer.com) + Ethereal Fallback |
| **Testing & Quality** | [Vitest](https://vitest.dev) (Unit & Integration Tests) + [Oxlint](https://oxc.rs) |

---

## 📁 Repository Structure

```
nightshift-ai/
├── public/                       # Static PWA manifests, icons, and audio assets
├── scripts/                      # Database migrations and seeding utilities
│   └── seed_supabase.ts          # Supabase waypoint, route, and profile seeder
├── src/
│   ├── components/               # Tactical UI Components
│   │   ├── BottomNav.tsx         # High-contrast tactical navigation bar
│   │   ├── Header.tsx            # Status bar with telemetry & active route indicator
│   │   ├── HonestyChip.tsx       # Truth engine chips (KNOWN, PROBABLE, OUTDATED)
│   │   ├── MapView.tsx           # MapLibre GL vector canvas & layer switcher
│   │   ├── PlanCard.tsx          # Route comparative decision card with score breakdown
│   │   ├── RouteCard.tsx         # Step-by-step illuminated corridor directions
│   │   ├── ScoreRing.tsx         # Tactical score visualizer with 60-cap threshold
│   │   └── TrustChip.tsx         # Verification confidence pill
│   ├── lib/                      # Core Engines & Services
│   │   ├── audio.ts              # Web Audio API tone synthesizer & bilingual TTS
│   │   ├── db.ts                 # Dexie IndexedDB client & offline storage
│   │   ├── emergencyEmail.ts     # Standardized situation report & dispatcher
│   │   ├── engine.ts             # Truth scoring, penalty calculation & route planner
│   │   └── supabase.ts           # Supabase client & real-time telemetry channel
│   ├── screens/                  # Application Screens
│   │   ├── FamilyAlertView.tsx   # Live moving GPS stream for family members
│   │   ├── HomeScreen.tsx        # Tactical dashboard, destination picker & plans
│   │   ├── LiveNavigationScreen  # Turn-by-turn route tracking with audio synthesis
│   │   ├── ProfileScreen.tsx     # Worker profile, contacts & medical ID card
│   │   ├── SafeHavensScreen.tsx  # 24/7 verified safe havens list and map view
│   │   └── SosActiveScreen.tsx   # Emergency SOS screen with in-place auto email
│   ├── App.tsx                   # Master routing & active view manager
│   ├── index.css                 # Tactical design tokens, Pear & Red palette
│   └── main.tsx                  # React DOM mount point
├── tests/                        # Vitest Unit & Integration Test Suites
│   ├── emergency_mail.test.ts    # Situation report generation & payload validation
│   └── engine.test.ts            # Scoring algorithm, 60-cap rule & truth validation
├── .env.example                  # Environment configuration template
├── package.json                  # Dependencies and run scripts
├── tsconfig.json                 # TypeScript strict compiler configuration
├── vite.config.ts                # Vite config & internal emergency mailer middleware
└── README.md                     # System documentation & deployment guide
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **pnpm**
- Modern Web Browser with WebGL and Geolocation support

### 2. Clone Repository
```bash
git clone https://github.com/Gurvesh2368/NightshiftAI.git
cd NightshiftAI
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment
Create a `.env` file in the project root (or copy `.env.example`):
```bash
cp .env.example .env
```
Populate the required keys:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
VITE_MAP_API_KEY=your-map-api-key
VITE_EMERGENCY_EMAIL=patilgurveshp@gmail.com
VITE_FAMILY_EMAILS=shyammar12345@gmail.com
VITE_USER_NAME="Gurvesh Patil"
```

### 5. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Testing & Verification

NightShift AI includes a comprehensive Vitest test suite validating safety score computations, truth layer cap rules, and situational email payload construction:

```bash
npm test
```

### Test Suite Summary:
```text
 ✓ tests/emergency_mail.test.ts (4 tests)
   ✓ formats emergency situation report with exact required header
   ✓ populates all 4 required report sections
   ✓ embeds accurate live tracking URL with encoded coordinates
   ✓ sends dispatch payload to primary recipient with CC
 ✓ tests/engine.test.ts (11 tests)
   ✓ caps score strictly at 60 when confidence is OUTDATED
   ✓ preserves unpenalized scores for KNOWN verified data
   ✓ handles edge cases for zero illumination and night transit

 Test Files  2 passed (2)
      Tests  15 passed (15)
   Duration  1.03s
```

---

## 🔒 Security & Privacy Architecture

- **Zero Cloud Tracking**: Real-time GPS coordinates are stored locally on the client's device in IndexedDB. Coordinates are only transmitted to the emergency dispatch channel upon an active SOS trigger.
- **Confidential Telemetry Transmission**: Emergency reports are generated server-side or via authenticated middleware, protecting internal credentials from client-side exposure.
- **Fail-Safe Redundancy**: In the event of network disruption, the internal dispatch engine queues emergency alerts in IndexedDB and uses local hardware alerts (Web Audio tone beacon) to draw immediate attention.

---

## 👨‍💻 Author & Maintainer

**Gurvesh Patil**  
GitHub: [@Gurvesh2368](https://github.com/Gurvesh2368)  
Email: [patilgurveshp@gmail.com](mailto:patilgurveshp@gmail.com)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
