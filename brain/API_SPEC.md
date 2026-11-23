# API SPEC — Face Attendance System

All student/teacher data moves through Next.js route handlers. The browser never talks to Supabase tables directly (DATA_MODEL.md).

## Conventions
- Base: same origin, `/api/*`. JSON in/out.
- Success: `{ "ok": true, "data": { ... } }`
- Error (the ONE format): `{ "ok": false, "error": { "code": "STRING_CODE", "message": "Human-readable sentence." } }`
- All bodies validated with the shared Zod schemas (`lib/validation.ts`). Unknown fields are stripped, never trusted.
- Dates/times: server clock, Asia/Karachi for the `date` column.

## Endpoints

### POST /api/register
Register a student.
- Body: `{ name, roll_number, descriptor: number[128], photo?: base64 jpeg, consent: true }`
- Checks: roll number unique; descriptor length exactly 128, all finite numbers; photo (if sent) is a real JPEG by magic bytes, ≤ 2 MB.
- 201: `{ student: { id, name, roll_number } }`
- Errors: `ROLL_TAKEN` (409), `INVALID_DESCRIPTOR` (400), `INVALID_PHOTO` (400), `CONSENT_REQUIRED` (400)

### GET /api/students/:roll_number/descriptor
Fetch one registered descriptor for client-side matching.
- 200: `{ descriptor: number[128], name }`
- Errors: `NOT_REGISTERED` (404)
- Rate limit: see below (this endpoint is the enumeration surface — SECURITY.md).

### GET /api/class-settings
Public class location for the distance check.
- 200: `{ class_name, latitude, longitude, radius_meters }`

### POST /api/verify
Submit a verification attempt.
- Body: `{ roll_number, descriptor: number[128], latitude, longitude, gps_accuracy_meters }`
- Server computes: face match (euclidean vs stored descriptor — server-side compare is the v1 default per ARCHITECTURE.md hardening note; if client-side compare is used in the first cut, this body carries `face_result` instead and the deviation is logged in DECISIONS.md), haversine distance, radius pass (on the accuracy-aware effective distance `max(0, raw − accuracy)`, ADR-009), accuracy cap (reject if `gps_accuracy_meters` > 250), duplicate-PRESENT check.
- Writes the attendance row either way (PRESENT or FAILED + reason) if SHOULD-scope logging is in.
- 200: `{ status: "PRESENT" | "FAILED", face_match, distance_meters, reason? }`
- Errors: `NOT_REGISTERED` (404), `ALREADY_MARKED` (409), `GPS_INACCURATE` (422), `RATE_LIMITED` (429)

### GET /api/log?date=YYYY-MM-DD  (teacher session required)
- 200: `{ rows: [{ name, roll_number, date, time, face_match, distance_meters, status }] }`
- Errors: `UNAUTHORIZED` (401)

### PATCH /api/class-settings  (teacher session required)
- Body: `{ latitude, longitude, radius_meters, class_name }` — radius 10–1000 m.
- 200: updated settings. Errors: `UNAUTHORIZED` (401), `INVALID_RADIUS` (400)

## Rate limits
| Endpoint | Limit | Why |
|---|---|---|
| POST /api/verify | 10 attempts / roll number / 10 min | stops code-guessing/brute-force of the verify flow (sweep #9) |
| GET descriptor | 30 / IP / 10 min | slows descriptor harvesting |
| POST /api/register | 5 / IP / hour | registration spam |

Implementation: simple in-memory or Supabase counter in v1 — TBD at build time (log choice in DECISIONS.md); limits above are the contract either way.

## Export
No endpoint: the teacher page generates the .xlsx client-side (SheetJS) from the `GET /api/log` response.
