# Current State — Face Attendance System

_Last updated: 2026-11-23 (session 04 — Phase 0 CLOSED; Supabase wired via Vercel Storage connect)._

**Phase 0 is closed.** The code is on GitHub, the app is live, and Supabase is wired into Vercel with the standard env names. One documented caveat remains (the two key values in `.env.local` are placeholders — see below) plus a Phase 1 warning (the Supabase connector cannot reach this project).

## What exists
- Complete project brain (session 01) — unchanged.
- **App code:** Next.js 16.4.6 + TypeScript + App Router + Tailwind CSS 4.3.3 at the project root (`app/`, `components/`, `lib/`, `public/models/`); DESIGN.md tokens in `app/globals.css`; placeholder home page (project name + "Phase 0 — Setup"); local `npm run build` passes. MIT `LICENSE` at root.
- **GitHub:** repo https://github.com/abduIwahid/face-attendence — ⚠️ the name carries Wadi's typo ("attendence" for "attendance"); rename to `face-attendance` is an optional 10-second dashboard action (old URL redirects). All project files pushed to `main`, verified by recursive tree read-back; `.env.local` and `node_modules` are NOT in the repo.
- **Vercel:** project `face-attendance` (id `prj_yX7MwvngRMdunyAMP9cIh1NVFPlD`, team abdu1wahid); latest production deployment `dpl_CAqsBYzFyRecvUyeG9hHA4nqmmMg` (2026-11-23, session 04) READY; **live URL https://face-attendance-abdu1wahid.vercel.app/ — HTTP 200 verified 2026-11-23 (session 04)**; SSO protection disabled. Deployment is from uploaded source (not yet git-connected to the repo). **17 env vars set**, including the full Supabase set with standard names (Production + Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`, plus `NEXT_PUBLIC_CLASS_RADIUS_METERS=100`.
- **Supabase:** project `supabase-face-attendence`, **ref `bwjgtbuytiemssovxrgy`**, URL https://bwjgtbuytiemssovxrgy.supabase.co — provisioned through the Vercel integration (store `store_199ZcTBHUyFg86S8`, status available/ready, Free plan) and connected to the Vercel project by Wadi on 2026-11-23 (session 04).
- **`.env.local`:** written — real `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_CLASS_RADIUS_METERS=100`; the two key values are placeholders (below). Gitignored (`.env*`), confirmed absent from the repo.
- Stack decided (DECISIONS.md ADR-001…006): Next.js (TS) + Supabase + face-api.js (browser) + Geolocation + SheetJS, on Vercel.

## What does NOT exist yet
- No data model, no demo data, no teacher account. Phase 1 not started.

## Caveats / known limitations
- **`.env.local` key values are placeholders.** The real anon + service_role values live in Vercel as write-only "sensitive" integration vars — neither the Vercel APIs (MCP + REST both return `decrypted: False`) nor the Supabase connector can export them. To fill them in: Supabase dashboard → project `bwjgtbuytiemssovxrgy` → Settings → API → copy `anon` and `service_role` into `.env.local` (1 minute, needed only before local Supabase development).
- **⚠️ Phase 1 warning — the Supabase connector cannot reach this project.** `GET /v1/projects` lists only WhyRisk; direct reads of ref `bwjgtbuytiemssovxrgy` (project, api-keys) return 403. So migrations/SQL for Phase 1 cannot run through the saved connector: they must run in the Supabase dashboard SQL editor (by Wadi, or pasted by him), or a credential with access to this project must be provided.
- **Remaining Phase 0 exit check (Wadi's side):** open https://face-attendance-abdu1wahid.vercel.app/ on his phone and confirm it loads (agent-side HTTP 200 already verified twice).

## Open decisions (all "TBD (needs human decision)")
1. Final product name (working title in use).
2. Teacher auth: Supabase Auth email/password vs PIN.
3. Registration photo retention vs descriptor-only.
4. ~~License~~ — SETTLED 2026-11-23: MIT (LICENSE file added; Wadi's standing default).
5. Demo students 2–5: consenting classmates vs clearly-fictional labelled entries; demo class GPS coordinates to be captured on site.

## Next step
Phase 1 (BUILD_PLAN.md): migrations (`students`, `class_settings`, `attendance` + RLS), private Storage bucket `registration-photos`, `lib/` foundations (supabase clients, `geo.ts` + test, Zod schemas), seed `class_settings` row 1. Mind the connector warning above when planning how migrations get applied.

## Inconsistencies
- ARCHITECTURE.md's folder plan shows a `src/` prefix; the scaffold was built with **src/ OFF** per Wadi's Phase 0 instruction (folders at root). ARCHITECTURE.md needs a docs-pass correction. (Flagged in session 02; not silently rewritten.)
- DESIGN.md's Tailwind snippet is the v3 `tailwind.config.ts` idiom; the app runs Tailwind v4 (CSS-first) with the same tokens mapped via `@theme inline` in `app/globals.css`. DESIGN.md snippet needs the same docs pass.
- Repo name typo: `face-attendence` vs the project's `face-attendance` everywhere else (folder, Vercel project, brain). Rename pending Wadi. (The Supabase database also carries the typo name, `supabase-face-attendence` — internal only, no action needed.)
