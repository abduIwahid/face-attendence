# Current State — Face Attendance System

_Last updated: 2026-11-23 (session 02 — Phase 0 setup, partial)._

Phase 0 is mostly done: the app is scaffolded, deployed and live-verified. Two Phase 0 items are BLOCKED on actions only Wadi can take (below).

## What exists
- Complete project brain (session 01) — unchanged.
- **App code:** Next.js 16.4.6 + TypeScript + App Router + Tailwind CSS 4.3.3 at the project root (`app/`, `components/`, `lib/`, `public/models/`); DESIGN.md tokens in `app/globals.css`; placeholder home page (project name + "Phase 0 — Setup"); local `npm run build` passes. MIT `LICENSE` at root.
- **Vercel:** project `face-attendance` (id `prj_yX7MwvngRMdunyAMP9cIh1NVFPlD`, team abdu1wahid); production deployment READY; **live URL https://face-attendance-abdu1wahid.vercel.app/ — HTTP 200 verified by agent (curl)**; SSO protection disabled; env var `NEXT_PUBLIC_CLASS_RADIUS_METERS=100` set.
- Stack decided (DECISIONS.md ADR-001…006): Next.js (TS) + Supabase + face-api.js (browser) + Geolocation + SheetJS, on Vercel.

## What does NOT exist yet
- **No GitHub repo** — creation blocked (below); nothing pushed; no commit hashes yet.
- **No Supabase project** — creation blocked (below); no `.env.local`; Supabase env vars not set on Vercel (placeholder does not use them yet).
- No data model, no demo data, no teacher account. Phase 1 not started.

## ⛔ Blocked — needs Wadi (exact asks)
1. **GitHub repo:** either (a) create the empty public repo `face-attendance` under abduIwahid in the GitHub web UI (no README/.gitignore — the push brings everything), or (b) sign this machine's `gh` CLI in (`gh auth login`), or (c) grant the Muse GitHub App repo-creation access via https://github.com/apps/meta-muse-ai/installations/new (the connector's `create_repository` got 403 "Resource not accessible by integration"; `gh` is not signed in; the Contents-only daily PAT cannot create repos and was not used).
2. **Supabase project:** create it in the Supabase dashboard (New project → name `face-attendance`, region **ap-southeast-1 / Singapore** — same as WhyRisk, set a database password) or via the Vercel Supabase integration. The Management API create call returned 403 Forbidden (his only org is a Vercel-integration org; the saved token reads/manages existing projects fine). Once the project exists, the agent reads its ref + API keys through the connector and finishes `.env.local` + Vercel env vars + redeploy.
3. **Phone check (Phase 0 exit):** open https://face-attendance-abdu1wahid.vercel.app/ on your phone and confirm it loads.

## Open decisions (all "TBD (needs human decision)")
1. Final product name (working title in use).
2. Teacher auth: Supabase Auth email/password vs PIN.
3. Registration photo retention vs descriptor-only.
4. ~~License~~ — SETTLED 2026-11-23: MIT (LICENSE file added; Wadi's standing default).
5. Demo students 2–5: consenting classmates vs clearly-fictional labelled entries; demo class GPS coordinates to be captured on site.

## Next step
Wadi unblocks the repo + Supabase project (above) → agent pushes everything to `main` and verifies the repo file list via API → agent writes `.env.local`, sets Supabase env vars on Vercel, redeploys → Phase 1 (BUILD_PLAN.md).

## Inconsistencies
- ARCHITECTURE.md's folder plan shows a `src/` prefix; the scaffold was built with **src/ OFF** per Wadi's Phase 0 instruction (folders at root). ARCHITECTURE.md needs a docs-pass correction. (Flagged in session 02; not silently rewritten.)
- DESIGN.md's Tailwind snippet is the v3 `tailwind.config.ts` idiom; the app runs Tailwind v4 (CSS-first) with the same tokens mapped via `@theme inline` in `app/globals.css`. DESIGN.md snippet needs the same docs pass.
- The Vercel deployment was made from uploaded source files without `package-lock.json` (connector CLI argument-size limit); the lockfile exists locally and will be committed in the first repo push.
