# NightShift AI — Development & Governance Rules

## Immutable Engineering Principles
1. **Never fabricate or invent data:**
   - When a data source is missing, stale, or unreliable, return `UNKNOWN`.
   - Never extrapolate confidence without an observed source timestamp.
2. **Cheapest never beats safest when risk or data is bad:**
   - Safety thresholds take precedence over cost optimization.
   - If any critical input is `UNKNOWN`, the safety score is strictly capped at `60` with a `"limited data"` disclosure.
3. **Privacy by default & differential privacy:**
   - User home locations, contact phone numbers, and health records are encrypted at rest.
   - Aggregated worker density (`area_zones()`) masks any zone with fewer than `K = 20` reports (k-anonymity).
   - Temporary trip GPS pings are purged after arrival or 24 hours.
4. **Emergency actions require zero typing:**
   - SOS trigger is a 2-second hold button with tactile feedback.
   - 112 emergency calling is a 1-tap direct action.
   - Offline fallback sends a prefilled SMS containing last known GPS coordinates.
5. **Sample Data Labeling:**
   - All seeded demo feeds are clearly flagged with `source = sample` or `SAMPLE`.

