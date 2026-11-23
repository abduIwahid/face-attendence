# SECURITY — Face Attendance System

Biometric data is in scope: face descriptors can identify a person. Treat this file as a gate, not advice. (Not legal advice.)

## Data classification
| Data | Class | Handling |
|---|---|---|
| Face descriptor (128 floats) | **Sensitive — biometric** | Server-side storage only via API routes; never exposed on the anon Supabase API; never logged in plaintext in app logs |
| Registration photo | **Sensitive — biometric** | Private Storage bucket only; signed URLs, short expiry, teacher-only |
| Name + roll number | Personal | Shown in teacher log only |
| GPS coordinates of attempts | Personal | Stored on the attendance row; teacher-only read |
| Class location | Internal | Readable via API (needed by the verify flow) |

## The 14-point vibe-code sweep (standing checklist — brain/general/website-audit-playbook.md), applied
| # | Sweep item | This project |
|---|---|---|
| 1 | /admin route unguarded | Teacher pages + `/api/log` + settings check the Supabase session server-side on every request — no security by URL obscurity |
| 2 | IDOR (change the ID in the URL) | Students are addressed by roll number, but the verify route re-derives everything server-side (descriptor compare, distance, duplicate); a guessed roll number alone grants nothing without the matching face |
| 3 | API key in the browser | Service-role key is server-only env; client gets the anon key + RLS. No secret in any client bundle — grep the build before deploy |
| 4 | Edit the price | N/A — no payments |
| 5 | Order −1 items | Analogue: negative/absurd inputs — radius, coordinates and descriptor values are range-validated with Zod (lat −90..90, lng −180..180, radius 10–1000, descriptor length exactly 128) |
| 6 | Fake a payment | N/A — analogue: fake a "PRESENT" — prevented by server-side re-checks (distance recomputed, accuracy cap, duplicate rule in the DB) |
| 7 | Redeem 100 times | Analogue: mark attendance 100 times — unique partial index: one PRESENT row per student per day |
| 8 | Admin at signup | No student accounts exist; the teacher account is created by Wadi in the Supabase dashboard only. No role field is accepted from any client payload |
| 9 | Guess the login code | Verify attempts rate-limited per roll number (API_SPEC.md); teacher login uses Supabase Auth (its own throttling) |
| 10 | Prompt-inject the AI | N/A — no LLM in the product. face-api.js is a fixed model, not instruction-following |
| 11 | Script in the username (XSS) | Names/roll numbers render through React escaping; no `dangerouslySetInnerHTML` anywhere; validate name charset at registration |
| 12 | Upload a non-photo | Registration photo validated by magic bytes (JPEG), ≤ 2 MB, stored in a private bucket, never executed, served only via signed URL |
| 13 | Find your ENV | `.env.local` gitignored; only `.env.example` (names) tracked; keys rotated if ever committed |
| 14 | SQL injection | Supabase client parameterises everything; no string-built SQL anywhere |

## Auth & access
- Students: no accounts by design (roll number + face is the identity factor).
- Teacher: Supabase Auth session (or PIN — TBD, DECISIONS.md). Every teacher route checks the session server-side; RLS policies are the second wall (DATA_MODEL.md).
- RLS is ON for all tables from the first migration — never "enable later".

## Validation & limits
- Zod schemas in `lib/validation.ts` are the single source; API routes reject on first failed parse with the standard error format.
- Rate limits per API_SPEC.md (verify 10/roll/10 min; descriptor fetch 30/IP/10 min; register 5/IP/hour).
- GPS accuracy cap: attempts with `gps_accuracy_meters > 50` are rejected as GPS_INACCURATE — a coarse fix is not a location proof.

## Headers & platform
- Next.js defaults + `Content-Security-Policy` allowing self + Supabase origin only; camera requires HTTPS (Vercel provides it; localhost exempt for dev).
- `getUserMedia` and Geolocation both fail on non-HTTPS origins — the deployed URL is the test target, not a LAN IP.

## Dependency hygiene
- `npm audit` at Phase 0 and before final deploy; face-api.js model weights self-hosted (no runtime CDN fetch).
- Known watch item: face-api.js is community-maintained (tfjs-based) — pin the version; the DeepFace fallback (ADR-005) is the exit if it breaks.
