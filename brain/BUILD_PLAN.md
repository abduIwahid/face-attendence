# BUILD PLAN — 1 week part-time (solo: Wadi)

Budget ≈ 7 days part-time. Percentages are of total effort. Owner = Wadi for every item (solo).

## Phase 0 — Setup (0–8%)
- [x] Create GitHub repo `face-attendance`; push this brain — DONE 2026-11-23 (session 03): Wadi created the repo as **`face-attendence`** (typo; rename pending his dashboard action); all 52 files pushed to `main` (`0562beff…`, `b70e412b…`), tree read-back verified
- [x] Scaffold Next.js (TS, App Router, Tailwind) — `create-next-app` (Next 16.4.6, Tailwind v4, src/ OFF — session 02)
- [x] Create Supabase project; save keys to `.env.local` (from `.env.example`) — DONE 2026-11-23 (session 04): Wadi connected the Vercel-provisioned database `supabase-face-attendence` (ref `bwjgtbuytiemssovxrgy`) via Vercel Storage; all 16 Supabase env vars set on Vercel with standard names (Production + Preview); `.env.local` written (real URL + radius; the two key values are write-only in Vercel and unreadable by the Supabase connector — 403 — so they are marked placeholders to paste once from the Supabase dashboard; see session 04)
- [x] Deploy the EMPTY app to Vercel; confirm the URL loads on Wadi's phone — deployed + HTTP 200 verified by agent 2026-11-23 (https://face-attendance-abdu1wahid.vercel.app/); Wadi's phone open is still the exit check
- [x] Add DESIGN.md tokens to globals.css + Tailwind config — done via CSS vars + Tailwind v4 `@theme inline` (session 02)
- **Exit check:** empty app live on a real URL, opened on a phone.

## Phase 1 — Data model + settings + seed skeleton (8–25%)
- [x] Migrations: `students`, `class_settings`, `attendance` + RLS on (DATA_MODEL.md) — SQL written in session 05; **APPLIED by Wadi 2026-11-23** (dashboard paste) and verified (Phase 1 exit check passed; teacher sign-in works)
- [x] Private Storage bucket `registration-photos` — went live with the same paste; register route uploads to it (session 06)
- [x] `lib/`: supabase clients, `geo.ts` (haversine) + unit test, Zod schemas — DONE 2026-11-23 (session 05): `lib/supabase/{client,server,admin}.ts`, `lib/geo.ts` + `lib/geo.test.ts` (5/5 passing), `lib/validation.ts`
- [x] `class_settings` row 1 seeded (demo location — DEMO_DATA.md) — no SQL seed (coordinates are TBD-verify on site); the teacher setter on `/teacher` (session 06) writes this row from the device's GPS — DONE 2026-11-23: Wadi set it during his phone test and re-saved it with the sampled setter in the session 07 retest (verified live via GET /api/class-settings)
- [x] Teacher auth wired (decision in DECISIONS.md) + empty teacher page behind it — DONE 2026-11-23 (session 05): Supabase Auth email/password; `/login` page; `/teacher` placeholder dashboard behind the server-side session guard (layout); logout. DECISIONS.md open question to be marked settled by Wadi.
- **Exit check:** ✅ tables exist, RLS verified (anon key cannot read `students`), teacher sign-in confirmed by Wadi 2026-11-23.

## Phase 2 — Core feature (25–60%) — mock-first, then wire
- [x] Register page UI on stubbed capture → then real camera + face-api.js descriptor — DONE 2026-11-23 (session 06): consent-gated CameraCapture, descriptor + photo, success panel
- [x] POST /api/register (descriptor + photo validation) — DONE (session 06): spec error codes, duplicate + JPEG magic-byte checks, private-bucket upload, 5/IP/hour rate limit
- [x] Verify page UI (camera oval, location states) on stubbed results — DONE (session 06): /verify with FaceStatus/LocationStatus states + plain-language result panels
- [x] Verify flow wired: descriptor fetch → match → geolocation → POST /api/verify — DONE with a strengthening (session 06, ADR-008): the descriptor goes TO the server and the match is decided server-side; no descriptor is ever fetched to a browser
- [x] Server re-checks: haversine, accuracy cap, duplicate-per-day, rate limit — DONE (session 06): `lib/verify.ts` ordered decision + tests; DB partial unique index is the race backstop
- [ ] Threshold tuning session with demo students; record distances (ADR-006) — pending real faces (Phase 4 seed session); 0.6 default ships meanwhile
- **Exit check:** ✅ CLOSED 2026-11-23 — Wadi's retest after the session 07 fix passed: class location re-saved with the sampled setter, then PRESENT confirmed on his phone from the same spot ("ho gya", 21:19 PKT). Note: the minimal teacher class-location setter (Phase 3 settings scope) was pulled forward into Phase 2 — /verify cannot be exercised without a class location; the full settings page stayed in Phase 3 (delivered session 08).

## Phase 3 — Secondary features + polish (60–75%) — ✅ DONE 2026-11-23 (session 08)
- [x] Teacher log table (date filter) + SheetJS .xlsx export — GET /api/log (session + RLS read) + AttendanceLog UI + client-side workbook from the on-screen rows; round-trip unit-verified
- [x] Teacher settings page (location + radius) — /teacher/settings hosts the full ClassLocationSettings control + how-the-check-works card; the dashboard keeps the same control; teacher nav added
- [x] Failed-attempt logging (SHOULD) if Phase 2 finished clean — shipped in Phase 2 (session 06); the Phase 3 log makes FAILED rows + reasons visible
- [x] All loading / empty / error states per DESIGN.md — log + students (skeleton / empty / error-with-retry), export error state, settings last-saved state
- [x] Registered-students view + ETHICS_PRIVACY deletion path (session 08 addition within the plan's teacher-view scope) — GET/DELETE /api/students; real deletion (photo → attendance → student row)
- [x] **Frontend expansion (Wadi, 2026-11-23 21:22 PKT, same round):** full landing page + design-system/motion layer across all pages (ADR-010) — DESIGN.md palette/fonts applied as a system, `.animate-rise` / `.hover-lift` in globals.css, reduced-motion respected, width-matrix audit clean
- **⚠ DEPENDENCY FREEZE at 75%** — no new packages/services after this point without Wadi's approval. (`xlsx` was added inside Phase 3, ahead of the freeze, as the PRD/API_SPEC always planned.)

## Phase 4 — Seed + demo data (75–82%) — hard deadline
- [ ] 5 demo students registered through the real flow (DEMO_DATA.md)
- [ ] Demo teacher account confirmed working
- [ ] Attendance rows for demo day present in the log

## Phase 5 — Production readiness (82–90%)
- [ ] PRODUCTION_READINESS.md MUSTs cleared
- [ ] Full TESTING.md manual checklist on the phone (mobile data, not Wi-Fi only)
- [ ] Security self-check against SECURITY.md sweep table; `npm audit`

## Phase 6 — Final (90–100%)
- [ ] Final deploy + smoke test on the production URL
- [ ] Record a 60–90s fallback demo video (register → verify → log → export)
- [ ] README screenshots + live link filled in
- [ ] Portfolio/interview notes updated (JUDGE_QA.md answers still match the shipped build)

## CUT LIST (drop in this order when a phase runs >20% over)
1. Failed-attempt logging (SHOULD) — keep only PRESENT rows + on-screen failure reasons
2. Student's own history view (SHOULD)
3. Registration photo retention — go descriptor-only (also settles the ETHICS open point)
4. Date filter on the teacher log (export-all only)
5. Settings page — hardcode class location in `class_settings` via SQL for the demo

## Phase-end reporting
At each phase end, note in the session file: on track / behind / cut list applied (which items).
Keep the deployed app working at all times — a broken deploy is fixed before new features.
