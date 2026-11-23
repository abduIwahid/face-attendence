# BUILD PLAN — 1 week part-time (solo: Wadi)

Budget ≈ 7 days part-time. Percentages are of total effort. Owner = Wadi for every item (solo).

## Phase 0 — Setup (0–8%)
- [ ] Create GitHub repo `face-attendance`; push this brain — ⛔ BLOCKED 2026-11-23: GitHub App 403 on create + `gh` not signed in; needs Wadi (see current-state.md)
- [x] Scaffold Next.js (TS, App Router, Tailwind) — `create-next-app` (Next 16.4.6, Tailwind v4, src/ OFF — session 02)
- [ ] Create Supabase project; save keys to `.env.local` (from `.env.example`) — ⛔ BLOCKED 2026-11-23: Management API 403 on create; needs Wadi (see current-state.md)
- [x] Deploy the EMPTY app to Vercel; confirm the URL loads on Wadi's phone — deployed + HTTP 200 verified by agent 2026-11-23 (https://face-attendance-abdu1wahid.vercel.app/); Wadi's phone open is still the exit check
- [x] Add DESIGN.md tokens to globals.css + Tailwind config — done via CSS vars + Tailwind v4 `@theme inline` (session 02)
- **Exit check:** empty app live on a real URL, opened on a phone.

## Phase 1 — Data model + settings + seed skeleton (8–25%)
- [ ] Migrations: `students`, `class_settings`, `attendance` + RLS on (DATA_MODEL.md)
- [ ] Private Storage bucket `registration-photos`
- [ ] `lib/`: supabase clients, `geo.ts` (haversine) + unit test, Zod schemas
- [ ] `class_settings` row 1 seeded (demo location — DEMO_DATA.md)
- [ ] Teacher auth wired (decision in DECISIONS.md) + empty teacher page behind it
- **Exit check:** tables exist, RLS verified (anon key cannot read `students`).

## Phase 2 — Core feature (25–60%) — mock-first, then wire
- [ ] Register page UI on stubbed capture → then real camera + face-api.js descriptor
- [ ] POST /api/register (descriptor + photo validation)
- [ ] Verify page UI (camera oval, location states) on stubbed results
- [ ] Verify flow wired: descriptor fetch → match → geolocation → POST /api/verify
- [ ] Server re-checks: haversine, accuracy cap, duplicate-per-day, rate limit
- [ ] Threshold tuning session with demo students; record distances (ADR-006)
- **Exit check:** Wadi registers and marks himself PRESENT on his phone, standing at the demo location.

## Phase 3 — Secondary features + polish (60–75%)
- [ ] Teacher log table (date filter) + SheetJS .xlsx export
- [ ] Teacher settings page (location + radius)
- [ ] Failed-attempt logging (SHOULD) if Phase 2 finished clean
- [ ] All loading / empty / error states per DESIGN.md
- **⚠ DEPENDENCY FREEZE at 75%** — no new packages/services after this point without Wadi's approval.

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
