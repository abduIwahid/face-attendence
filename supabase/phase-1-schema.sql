-- ============================================================================
-- FACE ATTENDANCE SYSTEM — PHASE 1 SCHEMA (ONE-PASTE FILE)
-- ----------------------------------------------------------------------------
-- HOW TO APPLY (one time):
--   1. Open https://supabase.com/dashboard → project "supabase-face-attendence"
--      (ref bwjgtbuytiemssovxrgy).
--   2. Left sidebar → SQL Editor → "New query".
--   3. Paste THIS ENTIRE FILE into the editor and press "Run".
--   4. Expected result: "Success. No rows returned" — the whole schema
--      (3 tables, RLS + teacher policies, indexes, private photo bucket)
--      is created in one go. It is safe to run again if anything interrupts.
-- Afterwards: Authentication → Users → "Add user" to create the teacher
-- account (your email + a password you choose — never share the password).
-- ============================================================================

-- ============================================================================
-- Face Attendance System — Phase 1 schema (migration)
-- Source of truth: brain/DATA_MODEL.md + brain/SECURITY.md.
-- Creates: public.students, public.class_settings, public.attendance,
-- the one-PRESENT-per-student-per-day partial unique index, RLS + teacher
-- policies on all three tables, and the private `registration-photos`
-- Storage bucket.
-- Idempotent-as-possible: safe to run more than once (tables/indexes use
-- IF NOT EXISTS, policies are dropped and recreated, grants are repeatable,
-- the bucket insert is ON CONFLICT DO NOTHING).
-- ============================================================================

-- ---------- students ----------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  roll_number text not null unique,
  descriptor jsonb not null, -- 128 floats (number[]) — biometric data, sensitive
  photo_path text,           -- path in the private `registration-photos` bucket; nullable
  consent_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ---------- class_settings (single row in v1, id = 1) ----------
create table if not exists public.class_settings (
  id int primary key check (id = 1),
  class_name text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  radius_meters int not null default 100 check (radius_meters between 10 and 1000),
  updated_at timestamptz not null default now()
);

-- ---------- attendance ----------
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id),
  date date not null, -- server date (Asia/Karachi), set by the verify route
  time timestamptz not null default now(),
  face_match text not null check (face_match in ('MATCHED', 'NOT_MATCHED', 'NO_FACE', 'MULTIPLE_FACES')),
  distance_meters int,       -- null when GPS unavailable
  gps_accuracy_meters int,   -- recorded for honesty/audit
  status text not null check (status in ('PRESENT', 'FAILED')),
  failure_reason text        -- null on PRESENT
);

-- One PRESENT row per student per day — enforced in the DB, not the UI.
create unique index if not exists attendance_one_present_per_day
  on public.attendance (student_id, date)
  where status = 'PRESENT';

create index if not exists attendance_date_idx on public.attendance (date);
create index if not exists attendance_student_idx on public.attendance (student_id);

-- ---------- Row Level Security ----------
-- RLS is ON from this first migration (brain/SECURITY.md: never "enable later").
-- Access model (brain/DATA_MODEL.md):
--   * anon (student browser): NO direct access to any table — there are
--     deliberately no policies for the anon role, so RLS denies everything.
--     All student reads/writes go through Next.js API routes (service role).
--   * authenticated (the teacher account): read students + attendance,
--     read/update class_settings.
--   * service_role (API routes, server-side only): bypasses RLS by design.
alter table public.students enable row level security;
alter table public.class_settings enable row level security;
alter table public.attendance enable row level security;

drop policy if exists "Teachers can read students" on public.students;
create policy "Teachers can read students"
  on public.students for select
  to authenticated
  using (true);

drop policy if exists "Teachers can read class settings" on public.class_settings;
create policy "Teachers can read class settings"
  on public.class_settings for select
  to authenticated
  using (true);

drop policy if exists "Teachers can update class settings" on public.class_settings;
create policy "Teachers can update class settings"
  on public.class_settings for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Teachers can read attendance" on public.attendance;
create policy "Teachers can read attendance"
  on public.attendance for select
  to authenticated
  using (true);

-- Table privileges for the API roles (RLS above still governs which rows).
grant select on public.students to authenticated;
grant select, update on public.class_settings to authenticated;
grant select on public.attendance to authenticated;
grant all on public.students, public.class_settings, public.attendance to service_role;

-- ---------- Storage: private `registration-photos` bucket ----------
-- Private on purpose: photos are served only via short-lived signed URLs
-- generated server-side (service role), so no public storage policies are
-- created here.
insert into storage.buckets (id, name, public)
values ('registration-photos', 'registration-photos', false)
on conflict (id) do nothing;

-- ---------- Seed: class_settings row 1 — NOT executed here ----------
-- The demo-class coordinates must be captured on site at COMSATS Attock
-- (brain/DEMO_DATA.md, TBD-verify) — placeholder coordinates are never
-- seeded. After capturing them, run this once:
--
-- insert into public.class_settings (id, class_name, latitude, longitude, radius_meters)
-- values (1, 'FA24-BAI — Demo Class', <LATITUDE>, <LONGITUDE>, 100)
-- on conflict (id) do update
--   set class_name = excluded.class_name,
--       latitude = excluded.latitude,
--       longitude = excluded.longitude,
--       radius_meters = excluded.radius_meters,
--       updated_at = now();
