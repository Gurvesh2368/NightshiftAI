-- NightShift AI — Supabase schema (Postgres 15, PostGIS). Status is computed at read time.
create extension if not exists postgis;
create extension if not exists pgcrypto;
create extension if not exists pg_cron;
create extension if not exists pg_net;

create type trust_status as enum ('KNOWN','PROBABLE','OUTDATED','UNKNOWN');
create type plan_mode as enum ('safest','cheapest','fastest');

-- Truth layer: status derived from age, never stored
create or replace function trust_status_of(observed timestamptz, verified boolean, ttl_known int, ttl_probable int)
returns trust_status language sql stable as $$
  select case
    when observed is null then 'UNKNOWN'::trust_status
    when verified and now() - observed <= make_interval(secs => ttl_known) then 'KNOWN'
    when now() - observed <= make_interval(secs => ttl_probable) then 'PROBABLE'
    else 'OUTDATED' end $$;

-- ===== Identity / profile (auth.users managed by Supabase) =====
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text, occupation text, language text default 'en' check (language in ('en','hi','mr')),
  home_geo_enc bytea, workplace_name text, workplace_geo geography(Point,4326),
  budget_inr numeric, mode_prefs text[], accessibility text[], fatigue_prefs jsonb,
  escalation_plan jsonb default '{"grace_min":15,"order":["user","contact1","contact2"]}',
  onboarded boolean default false, created_at timestamptz default now()
);
create table health_info (id uuid primary key references auth.users on delete cascade, data_enc bytea not null);
create table consents (
  user_id uuid references auth.users on delete cascade,
  purpose text check (purpose in ('location','checkin_sharing','aggregate_contribution','health')),
  granted boolean not null, updated_at timestamptz default now(), primary key (user_id, purpose)
);
create table trusted_contacts (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade,
  label text, relation text, phone_enc bytea not null, priority int default 1,
  status text default 'invited' check (status in ('invited','accepted','declined')), token_hash text
);
create table shifts (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade,
  weekdays int[], start_time time, end_time time, home_by time
);
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade,
  endpoint text unique, keys jsonb
);

-- ===== Truth layer data =====
create table data_sources (
  id serial primary key, name text unique, kind text, reliability real default 0.5,
  is_sample boolean default false, last_ok_at timestamptz
);
create table data_points (
  id bigserial primary key, subject_type text not null, subject_id text not null, key text not null,
  value jsonb, source_id int references data_sources, observed_at timestamptz not null,
  verified boolean default false, ttl_known_s int not null, ttl_probable_s int not null
);
create index on data_points (subject_type, subject_id, key, observed_at desc);
create view data_points_status as
  select d.*, trust_status_of(d.observed_at, d.verified, d.ttl_known_s, d.ttl_probable_s) as status from data_points d;

-- ===== City reference =====
create table transport_stops (
  id text primary key, name text, mode text, geo geography(Point,4326),
  has_shelter boolean, staffed boolean, step_free boolean
);
create table transport_services (
  id text primary key, route_name text, mode text, fare_inr numeric,
  first_departure time, last_departure time, headway_min int, operator text
);
create table service_stops (
  service_id text references transport_services, stop_id text references transport_stops,
  seq int, offset_min int, primary key (service_id, stop_id)
);
create table places (
  id uuid primary key default gen_random_uuid(), osm_id bigint, name text,
  type text check (type in ('hospital','pharmacy','clinic','police','food','water','toilet','fuel','waiting_spot')),
  geo geography(Point,4326), staffed_24h boolean, opening_hours text
);
create index on places using gist (geo);
create table road_segments (id bigint primary key, geom geography(LineString,4326), lit text, isolation_idx real);
create table safety_cells (cell_id text primary key, incident_density real, period text, source_id int references data_sources, updated_at timestamptz);
create table road_closures (
  id bigserial primary key, geom geography(LineString,4326), reason text, reported_at timestamptz default now(),
  source_id int references data_sources, confirmations int default 1, cleared_at timestamptz
);
create table weather_snapshots (id bigserial primary key, zone_id text, observed_at timestamptz, rain_prob real, flood_risk text, source_id int references data_sources);

-- ===== Trips and plans =====
create table trips (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade,
  origin_geo geography(Point,4326), shift_end timestamptz, deadline timestamptz, home_by timestamptz,
  state text default 'planning' check (state in ('planning','active','arrived','abandoned','escalated')),
  chosen_plan_id uuid, started_at timestamptz, arrived_at timestamptz, share_location boolean default false
);
create table plans (
  id uuid primary key default gen_random_uuid(), trip_id uuid references trips on delete cascade,
  version int default 1, mode plan_mode, safety_score int check (safety_score between 0 and 100),
  eta_p50_min int, eta_p90_min int, fare_inr numeric, feasibility text, overall_status trust_status,
  replaced_by uuid, change_reason text, explanation jsonb, created_at timestamptz default now()
);
create table plan_legs (
  id bigserial primary key, plan_id uuid references plans on delete cascade, seq int, kind text, service_id text,
  from_geo geography(Point,4326), to_geo geography(Point,4326), duration_min int, wait_min int,
  geom geography(LineString,4326), instructions jsonb      -- turn-by-turn steps for live navigation
);
create table trust_receipts (
  plan_id uuid references plans on delete cascade, data_point_id bigint, key text,
  status_at_decision trust_status, source text, observed_at timestamptz, note text
);
create table plan_events (id bigserial primary key, trip_id uuid references trips on delete cascade, type text, detail jsonb, created_at timestamptz default now());

-- ===== Check-in, SOS, location =====
create table checkins (
  id bigserial primary key, user_id uuid references auth.users on delete cascade, trip_id uuid references trips,
  kind text check (kind in ('pre_travel','arrival','scheduled')), answer text check (answer in ('ok','need_help','missed')),
  created_at timestamptz default now()
);
create table sos_events (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users, trip_id uuid references trips,
  trigger text check (trigger in ('hold','voice','offline_sms','timer_escalation')),
  state text default 'active' check (state in ('active','cancelled_safe','resolved')),
  last_geo geography(Point,4326), share_token_hash text, started_at timestamptz default now(), ended_at timestamptz
);
create table sos_actions (
  id bigserial primary key, sos_id uuid references sos_events on delete cascade,
  action text, contact_id uuid references trusted_contacts, status text, at timestamptz default now()
);
create table location_pings (
  id bigserial primary key, user_id uuid references auth.users on delete cascade, trip_id uuid, sos_id uuid,
  geo geography(Point,4326), accuracy_m real, at timestamptz default now()
);

-- ===== Reports and aggregates =====
create table reports (          -- anonymous: no user_id
  id bigserial primary key, kind text, subject_type text, subject_id text, geo geography(Point,4326),
  value jsonb, reported_at timestamptz default now()
);
create table worker_index_aggregates (
  zone_id text, window_start timestamptz, active_count int, n_reports int, transport_verified_count int,
  source text, confidence text check (confidence in ('low','medium','high')), primary key (zone_id, window_start)
);
create table service_gap_flags (
  id bigserial primary key, zone_id text, window_start timestamptz, gap_type text,
  status trust_status, basis text, sample_size int, created_at timestamptz default now()
);
create table audit_log (id bigserial primary key, actor text, action text, target text, at timestamptz default now());

-- k-anonymous zone read (hidden when too few reports)
create or replace function area_zones(w timestamptz)
returns table (zone_id text, active_count int, transport_verified_count int, hidden boolean, source text, confidence text, n_reports int)
language sql stable security definer set search_path = public as $$
  select zone_id,
         case when n_reports >= 20 then active_count end,
         case when n_reports >= 20 then transport_verified_count end,
         n_reports < 20, source, confidence,
         case when n_reports >= 20 then n_reports end
  from worker_index_aggregates where window_start = w $$;

-- ===== Row Level Security =====
do $$ declare t text; begin
  foreach t in array array['profiles','health_info','consents','trusted_contacts','shifts','push_subscriptions',
    'trips','plans','plan_legs','trust_receipts','plan_events','checkins','sos_events','sos_actions','location_pings',
    'reports','data_sources','data_points','transport_stops','transport_services','service_stops','places',
    'road_segments','safety_cells','road_closures','weather_snapshots','worker_index_aggregates','service_gap_flags','audit_log']
  loop execute format('alter table %I enable row level security', t); end loop; end $$;

-- owner-only tables (column = user_id or id)
create policy own_profile on profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy own_health  on health_info for all using (id = auth.uid()) with check (id = auth.uid());
create policy own_consents on consents for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_contacts on trusted_contacts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_shifts on shifts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_push on push_subscriptions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_trips on trips for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_plans on plans for select using (exists (select 1 from trips t where t.id = trip_id and t.user_id = auth.uid()));
create policy own_legs on plan_legs for select using (exists (select 1 from plans p join trips t on t.id = p.trip_id where p.id = plan_id and t.user_id = auth.uid()));
create policy own_receipts on trust_receipts for select using (exists (select 1 from plans p join trips t on t.id = p.trip_id where p.id = plan_id and t.user_id = auth.uid()));
create policy own_events on plan_events for select using (exists (select 1 from trips t where t.id = trip_id and t.user_id = auth.uid()));
create policy own_checkins on checkins for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_sos on sos_events for select using (user_id = auth.uid());
create policy own_sos_actions on sos_actions for select using (exists (select 1 from sos_events s where s.id = sos_id and s.user_id = auth.uid()));
create policy own_pings on location_pings for insert with check (user_id = auth.uid());
create policy read_own_pings on location_pings for select using (user_id = auth.uid());
-- writes to plans/sos/audit happen only in Edge Functions (service role bypasses RLS)

-- public reference data: authenticated read only
create policy ref_read on transport_stops for select to authenticated using (true);
create policy ref_read2 on transport_services for select to authenticated using (true);
create policy ref_read3 on service_stops for select to authenticated using (true);
create policy ref_read4 on places for select to authenticated using (true);
create policy ref_read5 on road_segments for select to authenticated using (true);
create policy ref_read6 on road_closures for select to authenticated using (true);
create policy ref_read7 on weather_snapshots for select to authenticated using (true);
create policy ref_read8 on data_points for select to authenticated using (true);
create policy ref_read9 on data_sources for select to authenticated using (true);
-- anonymous crowd reports: insert only
create policy report_insert on reports for insert to authenticated with check (true);
-- aggregates are NOT directly readable; use area_zones() RPC
revoke all on worker_index_aggregates, service_gap_flags, safety_cells from anon, authenticated;
grant execute on function area_zones(timestamptz) to authenticated;

-- ===== Realtime =====
alter publication supabase_realtime add table plans, plan_events, sos_actions, checkins;

-- ===== Scheduled jobs (replace URLs/keys with your project; use Vault for secrets) =====
-- select cron.schedule('checkin-timer','* * * * *', $$select net.http_post(url:='https://<ref>.functions.supabase.co/checkin-timer', headers:='{"Authorization":"Bearer <service_key>"}'::jsonb)$$);
-- select cron.schedule('ingest-weather','*/15 * * * *', $$ ...ingest-weather... $$);
-- select cron.schedule('aggregate-zones','5 * * * *', $$ ...aggregate-zones... $$);
select cron.schedule('purge-pings','30 * * * *', $$delete from location_pings where at < now() - interval '24 hours' and sos_id is null$$);
