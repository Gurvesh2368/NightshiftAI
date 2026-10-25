import pg from 'pg';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);
const { Client } = pg;

const poolerUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

async function seed() {
  const client = new Client({ connectionString: poolerUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to seed database...');

  try {
    // 1. Data sources
    await client.query(`
      INSERT INTO data_sources (id, name, kind, reliability, is_sample, last_ok_at)
      VALUES 
        (1, 'City Transit Feed (BEST)', 'transit', 0.92, true, NOW()),
        (2, 'Police Safe Spots Registry', 'safety', 0.98, true, NOW()),
        (3, 'Night Weather Radar', 'weather', 0.88, true, NOW()),
        (4, 'Night Worker Crowd Ping', 'crowd', 0.75, true, NOW())
      ON CONFLICT (id) DO UPDATE SET last_ok_at = NOW();
    `);

    // 2. Places (hospitals, pharmacies, police, safe waiting spots)
    // Coordinates around Mumbai (e.g., BKC to Kurla / Dadar corridor: ~19.06 to 19.08 lat, 72.86 to 72.88 lng)
    await client.query(`
      DELETE FROM places;
      INSERT INTO places (name, type, geo, staffed_24h, opening_hours)
      VALUES
        ('City Hospital Emergency & Trauma', 'hospital', ST_SetSRID(ST_MakePoint(72.8680, 19.0690), 4326), true, '24/7'),
        ('Apollo 24/7 Pharmacy', 'pharmacy', ST_SetSRID(ST_MakePoint(72.8715, 19.0710), 4326), true, 'Open 24 Hours'),
        ('Kurla Police Chowki (Night Desk)', 'police', ST_SetSRID(ST_MakePoint(72.8745, 19.0680), 4326), true, '24/7 Staffed'),
        ('Staffed Metro Station Waiting Bay', 'waiting_spot', ST_SetSRID(ST_MakePoint(72.8650, 19.0665), 4326), true, 'Well-lit & CCTV monitored'),
        ('Night Owl Safe Water & Chai Station', 'food', ST_SetSRID(ST_MakePoint(72.8720, 19.0675), 4326), false, 'Until 4:00 AM');
    `);

    // 3. Transport Stops & Services
    await client.query(`
      DELETE FROM service_stops;
      DELETE FROM transport_services;
      DELETE FROM transport_stops;

      INSERT INTO transport_stops (id, name, mode, geo, has_shelter, staffed, step_free)
      VALUES
        ('STOP_TECH_PARK', 'Tech Park North Gate', 'bus', ST_SetSRID(ST_MakePoint(72.8625, 19.0640), 4326), true, true, true),
        ('STOP_DEPOT', 'BKC Central Interchange', 'bus', ST_SetSRID(ST_MakePoint(72.8690, 19.0685), 4326), true, true, true),
        ('STOP_METRO', 'Kurla Metro Station', 'metro', ST_SetSRID(ST_MakePoint(72.8730, 19.0715), 4326), true, true, true),
        ('STOP_HOME', 'Shivneri Nagar Crossing', 'bus', ST_SetSRID(ST_MakePoint(72.8775, 19.0760), 4326), true, false, true);

      INSERT INTO transport_services (id, route_name, mode, fare_inr, first_departure, last_departure, headway_min, operator)
      VALUES
        ('BUS_109', 'Night Express 109', 'bus', 25, '00:15:00', '03:45:00', 15, 'BEST Night Service'),
        ('BUS_204', 'Feeder 204', 'bus', 15, '01:00:00', '04:00:00', 25, 'BEST Feeder'),
        ('METRO_L1', 'Line 1 Metro Night Run', 'metro', 40, '05:30:00', '01:30:00', 10, 'Metro One');

      INSERT INTO service_stops (service_id, stop_id, seq, offset_min)
      VALUES
        ('BUS_109', 'STOP_TECH_PARK', 1, 0),
        ('BUS_109', 'STOP_DEPOT', 2, 12),
        ('BUS_109', 'STOP_HOME', 3, 26),
        ('BUS_204', 'STOP_TECH_PARK', 1, 0),
        ('BUS_204', 'STOP_DEPOT', 2, 18),
        ('BUS_204', 'STOP_HOME', 3, 38);
    `);

    // 4. Worker Index Aggregates (Window start = today at 2:00 AM)
    const windowStart = new Date();
    windowStart.setHours(2, 0, 0, 0);

    await client.query('DELETE FROM worker_index_aggregates;');
    await client.query(`
      INSERT INTO worker_index_aggregates (zone_id, window_start, active_count, n_reports, transport_verified_count, source, confidence)
      VALUES
        ('Zone A (BKC North)', $1, 240, 180, 210, 'opt-in check-ins', 'high'),
        ('Zone B (Kurla West)', $1, 160, 120, 140, 'opt-in check-ins', 'medium'),
        ('Zone C (Chunabhatti)', $1, 90, 65, 45, 'opt-in check-ins', 'medium'),
        ('Zone D (Low Coverage Pocket)', $1, 14, 8, 5, 'opt-in check-ins', 'low');
    `, [windowStart]);

    // 5. Service Gap Flags
    await client.query('DELETE FROM service_gap_flags;');
    await client.query(`
      INSERT INTO service_gap_flags (zone_id, window_start, gap_type, status, basis, sample_size)
      VALUES
        ('Zone C (Chunabhatti)', $1, 'Night mobility gap', 'PROBABLE', 'Transport availability drop > 50% between 2:00 AM - 3:30 AM', 65);
    `, [windowStart]);

    // 6. Data Points (Truth Layer)
    await client.query(`
      DELETE FROM data_points;
      INSERT INTO data_points (subject_type, subject_id, key, value, source_id, observed_at, verified, ttl_known_s, ttl_probable_s)
      VALUES
        ('service', 'BUS_109', 'live_tracking', '{"status":"on_schedule","vehicle_id":"MH-01-9821","speed_kmh":34}'::jsonb, 1, NOW() - INTERVAL '3 minutes', true, 600, 1800),
        ('weather', 'BKC_ZONE', 'rain_forecast', '{"prob":0.65,"intensity":"light_drizzle","time":"01:30 AM"}'::jsonb, 3, NOW() - INTERVAL '8 minutes', false, 900, 3600),
        ('road', 'BKC_MAIN_ROAD', 'lighting', '{"lit":"continuous_white_led","cctv":true,"police_patrol":true}'::jsonb, 2, NOW() - INTERVAL '20 minutes', true, 3600, 14400),
        ('service', 'BUS_204', 'live_tracking', '{"status":"scheduled_only"}'::jsonb, 1, NOW() - INTERVAL '45 minutes', false, 600, 1800);
    `);

    console.log('Seed data successfully inserted!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await client.end();
  }
}

seed();
