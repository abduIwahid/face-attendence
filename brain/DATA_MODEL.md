# DATA MODEL — Face Attendance System

Database: Supabase Postgres. All access through RLS + API routes (see SECURITY.md).

## Tables

### `students`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK, default `gen_random_uuid()` | |
| `name` | text, not null | 2–60 chars (Zod) |
| `roll_number` | text, unique, not null | e.g. `FA24-BAI-024`; normalised uppercase |
| `descriptor` | jsonb, not null | 128 floats (number[]) — **biometric data, sensitive** |
| `photo_path` | text | path in private Storage bucket `registration-photos`; nullable if photo retention is dropped |
| `consent_at` | timestamptz, not null | when the student consented at registration |
| `created_at` | timestamptz, default `now()` | |

Index: unique on `roll_number`.

### `class_settings` (single row in v1)
| Column | Type | Notes |
|---|---|---|
| `id` | int PK, check `id = 1` | singleton |
| `class_name` | text | e.g. "FA24-BAI — Demo Class" |
| `latitude` | double precision, not null | class location |
| `longitude` | double precision, not null | |
| `radius_meters` | int, not null, default 100 | teacher-configurable |
| `updated_at` | timestamptz | |

### `attendance`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `student_id` | uuid FK → students, not null | |
| `date` | date, not null | server date (Asia/Karachi) |
| `time` | timestamptz, not null, default `now()` | |
| `face_match` | text, check in (`MATCHED`, `NOT_MATCHED`, `NO_FACE`, `MULTIPLE_FACES`) | |
| `distance_meters` | int | null when GPS unavailable |
| `gps_accuracy_meters` | int | recorded for honesty/audit |
| `status` | text, check in (`PRESENT`, `FAILED`) | PRESENT only when face MATCHED + within radius |
| `failure_reason` | text | null on PRESENT |

Unique index: `(student_id, date)` where `status = 'PRESENT'` — one PRESENT row per student per day, enforced in the DB, not the UI.

## Storage
| Bucket | Visibility | Contents |
|---|---|---|
| `registration-photos` | **private** | one photo per student, path `registration-photos/<roll_number>.jpg`; served only via short-lived signed URLs to the teacher |

## RLS / access rules
| Table | anon (student browser) | teacher (authenticated) | service role (API routes) |
|---|---|---|---|
| `students` | no direct access | read (log joins) | full (register/verify routes) |
| `class_settings` | read `latitude/longitude/radius` via API route only | read + update | full |
| `attendance` | no direct access | read all | insert via verify route |
- All student-facing reads/writes go through Next.js API routes using the service-role key server-side; the browser never queries `students`/`attendance` directly. This keeps descriptors off the open anon API entirely.
- Teacher routes verify the Supabase session before returning anything.

## Seed data + demo account plan
Full detail in DEMO_DATA.md. Summary:
- 5 demo students (incl. Wadi) with descriptors generated from real captures during a seed session — descriptors cannot be faked in SQL; seeding = running the register flow 5 times.
- `class_settings` row 1: demo class at COMSATS Attock campus coordinates — TBD-verify on site (DEMO_DATA.md).
- Teacher demo account: created in Supabase Auth dashboard; credentials kept out of the repo (password in Wadi's vault, not in any file).
