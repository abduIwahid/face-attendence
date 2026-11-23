# Current State — Face Attendance System

_Last updated: 2026-11-23 (session 03 — repo pushed; Supabase wiring still blocked)._

Phase 0 is one step from closed: the code is on GitHub and the app is live. The only open item is Supabase wiring — Wadi created his project, but it is not reachable by the saved connector credential (org mismatch, below).

## What exists
- Complete project brain (session 01) — unchanged.
- **App code:** Next.js 16.4.6 + TypeScript + App Router + Tailwind CSS 4.3.3 at the project root (`app/`, `components/`, `lib/`, `public/models/`); DESIGN.md tokens in `app/globals.css`; placeholder home page (project name + "Phase 0 — Setup"); local `npm run build` passes. MIT `LICENSE` at root.
- **GitHub:** repo https://github.com/abduIwahid/face-attendence — ⚠️ the name carries Wadi's typo ("attendence" for "attendance"). All 52 files pushed to `main` (commits `0562beff…` init + `b70e412b…` Phase 0), verified by recursive tree read-back (52 blobs, zero missing, `package-lock.json` included).
- **Vercel:** project `face-attendance` (id `prj_yX7MwvngRMdunyAMP9cIh1NVFPlD`, team abdu1wahid); production deployment READY; **live URL https://face-attendance-abdu1wahid.vercel.app/ — HTTP 200 re-verified 2026-11-23 (session 03)**; SSO protection disabled; env var `NEXT_PUBLIC_CLASS_RADIUS_METERS=100` set. Deployment is from uploaded source (not yet git-connected to the repo).
- Stack decided (DECISIONS.md ADR-001…006): Next.js (TS) + Supabase + face-api.js (browser) + Geolocation + SheetJS, on Vercel.

## What does NOT exist yet
- **No `.env.local`** and **no Supabase env vars on Vercel** — the keys could not be fetched (below). The placeholder does not use them yet, so the deploy is unaffected.
- No data model, no demo data, no teacher account. Phase 1 not started.

## ⛔ Blocked — Supabase wiring (needs Wadi, ONE of these)
Wadi created the Supabase project (2026-11-23), but the saved connector credential cannot see it: the Management API lists only WhyRisk (org `vercel_icfg_EnjO2tYxYqWu9LLs4zgZ0wv0`), the Vercel project has no Supabase env vars, and no new Vercel integration resource exists. His project is in a different Supabase organization (most likely his personal dashboard org). Options:
1. **Keys route (cleanest):** in the new project's dashboard → Project Settings → API — share the project URL + `anon` key + `service_role` key via the secure vault route (never plain chat). The agent then writes `.env.local`, sets the 3 Vercel env vars, redeploys, and Phase 0 closes.
2. **Vercel-org route:** Vercel → `face-attendance` → Storage → Connect Database → Supabase — provisions/links a project inside the Vercel-managed org and auto-sets env vars (creates a second project if his dashboard one already exists).
3. **Repo rename:** GitHub repo Settings → rename `face-attendence` → `face-attendance` (old URL redirects). Or confirm the typo name stays.

## Remaining Phase 0 exit check
- Wadi opens https://face-attendance-abdu1wahid.vercel.app/ on his phone and confirms it loads.

## Open decisions (all "TBD (needs human decision)")
1. Final product name (working title in use).
2. Teacher auth: Supabase Auth email/password vs PIN.
3. Registration photo retention vs descriptor-only.
4. ~~License~~ — SETTLED 2026-11-23: MIT (LICENSE file added; Wadi's standing default).
5. Demo students 2–5: consenting classmates vs clearly-fictional labelled entries; demo class GPS coordinates to be captured on site.

## Next step
Wadi picks a Supabase option (above) → agent writes `.env.local`, sets Supabase env vars on Vercel, redeploys, re-verifies live → Phase 0 closed → Phase 1 (BUILD_PLAN.md).

## Inconsistencies
- ARCHITECTURE.md's folder plan shows a `src/` prefix; the scaffold was built with **src/ OFF** per Wadi's Phase 0 instruction (folders at root). ARCHITECTURE.md needs a docs-pass correction. (Flagged in session 02; not silently rewritten.)
- DESIGN.md's Tailwind snippet is the v3 `tailwind.config.ts` idiom; the app runs Tailwind v4 (CSS-first) with the same tokens mapped via `@theme inline` in `app/globals.css`. DESIGN.md snippet needs the same docs pass.
- Repo name typo: `face-attendence` vs the project's `face-attendance` everywhere else (folder, Vercel project, brain). Rename pending Wadi.
