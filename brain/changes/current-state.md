# Current State — Face Attendance System

_Last updated: 2026-11-23 (session 07 — GPS accuracy fix (ADR-009) built, deployed and live-verified after Wadi's phone test exposed indoor GPS drift; his retest is the remaining Phase 2 exit check)._

**Phase 0 and Phase 1 are closed. Phase 2 is built and deployed** — registration and verification run end-to-end against the real database. What remains of Phase 2 is Wadi's phone test (register himself → set class location → mark PRESENT) and the ADR-006 threshold tuning with demo students (Phase 4).

## What exists
- Complete project brain (sessions 01–06).
- **App code:** Next.js 16.4.6 + TypeScript + App Router + Tailwind CSS 4.3.3 at the project root; DESIGN.md tokens in `app/globals.css`. Pages: `/` (entry links), `/login` (teacher sign-in), `/teacher` (session-guarded dashboard: overview cards + the class-location setter), `/register` (**live**: consent-gated camera capture → descriptor + photo → POST /api/register), `/verify` (**live**: roll number + selfie + GPS → POST /api/verify → plain-language result). API routes: `POST /api/register`, `POST /api/verify`, `GET|PATCH /api/class-settings`. Components: `CameraCapture`, `FaceStatus`, `LocationStatus`, `ClassLocationSettings`, `LogoutButton`. `lib/`: `supabase/{client,server,admin}.ts`, `geo.ts`, `geolocation.ts` (best-of-several GPS sampling, ADR-009), `matching.ts` (euclidean + 0.6 threshold), `verify.ts` (ordered verify decision, accuracy-aware), `rateLimit.ts` (in-memory, ADR-007), `face.ts` (browser face-api loader/descriptor), `validation.ts` (Zod), `http.ts` (the one API response format). Tests: `npm test` = 25/25 (geo 5, matching 5, verify 15). Local build + lint pass.
- **Face models:** `@vladmandic/face-api` 1.7.15 (ADR-008); weights for the three nets self-hosted in `public/models/` (6.8 MB), served from the app itself — verified live (manifest → 200).
- **Database:** schema APPLIED by Wadi 2026-11-23 (dashboard paste of `supabase/phase-1-schema.sql`); RLS verified (anon cannot read `students`); teacher account exists and `/login` sign-in works (Wadi-confirmed). `class_settings` row 1 is **not set yet** — the teacher setter on `/teacher` writes it from the device GPS (part of Wadi's phone test). Until it is set, /verify honestly reports CLASS_LOCATION_NOT_SET.
- **Verify semantics (as built):** the server decides everything (ADR-008) — descriptor compare at threshold 0.6 (strict), haversine vs `class_settings`, one PRESENT per student per day (route check + DB partial unique index backstop), rate limits per API_SPEC (storage: in-memory, ADR-007). PRESENT and FAILED (face mismatch / too far) attempts are written to `attendance` with distance + accuracy + failure_reason; GPS_INACCURATE writes no row. **GPS (ADR-009, session 07):** the client samples fixes for up to ~10 s and submits the most accurate one (both /verify and the teacher setter); the radius is judged on the effective distance `max(0, raw distance − GPS accuracy)`; the hard accuracy cap is 250 m (was 50 m in ADR-004). Rows still store the RAW distance + accuracy.
- **GitHub:** repo https://github.com/abduIwahid/face-attendence — ⚠️ the name carries Wadi's typo ("attendence"); rename to `face-attendance` is an optional dashboard action (old URL redirects). `.env.local` and `node_modules` are NOT in the repo.
- **Vercel:** project `face-attendance` (id `prj_yX7MwvngRMdunyAMP9cIh1NVFPlD`, team abdu1wahid); latest production deployment `dpl_FHyWXqqjbcu15WehgbunNSH9Thnd` (2026-11-23, session 07) READY; **live URLs https://face-attendance-abdu1wahid.vercel.app/ and https://face-attendance-ai.vercel.app/** — routes `/`, `/login`, `/register`, `/verify` HTTP 200 verified 2026-11-23 (session 07), plus a designed-error probe on /api/verify (NOT_REGISTERED 404, no 500) and the new sampling string confirmed in the served /verify bundle. Deployment is from uploaded source via the Vercel REST API (binary digest uploads — the connector's base64 route hits argument-size limits on the model weights); not yet git-connected. **17 env vars set** (full Supabase set with standard names, Production + Preview, plus `NEXT_PUBLIC_CLASS_RADIUS_METERS=100`).
- **Supabase:** project `supabase-face-attendence`, **ref `bwjgtbuytiemssovxrgy`**, URL https://bwjgtbuytiemssovxrgy.supabase.co — provisioned through the Vercel integration (store `store_199ZcTBHUyFg86S8`, Free plan).
- **`.env.local`:** real `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_CLASS_RADIUS_METERS=100`; the two key values are placeholders (below). Gitignored, confirmed absent from the repo.

## What does NOT exist yet
- No attendance rows and no registered students yet — the first ones come from Wadi's phone test.
- No teacher log table / Excel export, no full settings page — Phase 3 (a minimal class-location setter already lives on `/teacher`).
- No threshold tuning data (ADR-006) — Phase 4 demo-student session.
- No liveness check (documented v1 limit, RISKS.md).

## Caveats / known limitations
- **`.env.local` key values are placeholders.** The real anon + service_role values live in Vercel as write-only "sensitive" integration vars — neither the Vercel APIs nor the Supabase connector can export them. Production runs on the real values; only local development needs Wadi's one-time paste (Supabase dashboard → project `bwjgtbuytiemssovxrgy` → Settings → API).
- **The Supabase connector cannot reach this project** (403 — sessions 03/04). SQL/migrations for this project run in the dashboard SQL editor, not through the connector.
- **Rate limits are per-instance in-memory** (ADR-007) — Vercel serverless instances do not share them; fine at classroom scale, documented upgrade path exists.
- **Client-side face detection is a gate, not proof:** the browser enforces exactly-one-face before a descriptor exists; the match decision itself is server-side (ADR-008). A photo of a face may still pass (no liveness in v1 — RISKS.md).

## Open decisions (all "TBD (needs human decision)")
1. Final product name (working title in use).
2. Teacher auth — implemented as Supabase Auth email/password (Phase 1); DECISIONS.md entry to be marked settled by Wadi.
3. Registration photo retention vs descriptor-only (photo retention is what shipped, per DATA_MODEL; descriptor-only remains CUT LIST item 3).
4. ~~License~~ — SETTLED 2026-11-23: MIT.
5. Demo students 2–5: consenting classmates vs clearly-fictional labelled entries; demo class GPS coordinates to be captured on site (now via the teacher setter).

## Next step
**Wadi's retest after the session 07 GPS fix (Phase 2 exit check):** (1) `/teacher` → sign in → "Use my current location" (it now samples for a few seconds — hold still) standing where the class is → radius 100 m → Save — re-saving matters: the stored class point should also come from a sampled fix, not the old single-shot one. (2) `/register` → consent → register himself with a live selfie (if not already registered). (3) `/verify` → roll number → selfie + share location (sampling runs; watch the ± accuracy improve) → expect **PRESENT**. His first test's attempts are logged; a PRESENT row for today, if any partial attempt created one, correctly yields ALREADY_MARKED. Then Phase 3 (log table + export + settings page + polish).

## Inconsistencies
- Repo name typo: `face-attendence` vs `face-attendance` everywhere else. Rename pending Wadi. (The Supabase database name carries the same typo — internal only.)
- API_SPEC.md still documents `GET /api/students/:roll_number/descriptor` — superseded by ADR-008 (never built; descriptors never leave the server). API_SPEC to be refreshed when next edited.
