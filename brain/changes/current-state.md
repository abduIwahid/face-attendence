# Current State — Face Attendance System

_Last updated: 2026-11-23 (session 05 — Phase 1 foundation built + deployed; schema application is the one pending Wadi action)._

**Phase 0 is closed. Phase 1 is built and deployed** — schema SQL, Supabase clients, teacher auth and the registration skeleton are live. The one outstanding item is Wadi pasting the schema into the Supabase dashboard (the connector cannot run SQL on this project — see caveats).

## What exists
- Complete project brain (session 01) — unchanged.
- **App code:** Next.js 16.4.6 + TypeScript + App Router + Tailwind CSS 4.3.3 at the project root (`app/`, `components/`, `lib/`, `public/models/`); DESIGN.md tokens in `app/globals.css`. Pages: `/` (entry links), `/login` (teacher sign-in, Supabase Auth email/password), `/teacher` (placeholder dashboard behind the server-side session guard in `app/teacher/layout.tsx`, with logout), `/register` (Phase 1 skeleton — form + camera placeholder, saves nothing yet). `lib/`: `supabase/{client,server,admin}.ts`, `geo.ts` + `geo.test.ts` (5/5 passing), `validation.ts` (Zod). Local `npm run build` passes. MIT `LICENSE` at root.
- **Database schema (written, NOT yet applied):** `supabase/migrations/20261123153000_phase_1_schema.sql` and the one-paste copy `supabase/phase-1-schema.sql` — `students`, `class_settings`, `attendance`, one-PRESENT-per-day partial unique index, RLS + teacher policies, private `registration-photos` bucket. Goes live when Wadi pastes it into the dashboard SQL Editor (session 05 has his exact steps).
- **GitHub:** repo https://github.com/abduIwahid/face-attendence — ⚠️ the name carries Wadi's typo ("attendence" for "attendance"); rename to `face-attendance` is an optional 10-second dashboard action (old URL redirects). All project files pushed to `main`, verified by recursive tree read-back; `.env.local` and `node_modules` are NOT in the repo.
- **Vercel:** project `face-attendance` (id `prj_yX7MwvngRMdunyAMP9cIh1NVFPlD`, team abdu1wahid); latest production deployment `dpl_9T5wea9WCGq8TbMAtNgVL7RoqLAo` (2026-11-23, session 05) READY; **live URLs https://face-attendance-abdu1wahid.vercel.app/ and https://face-attendance-ai.vercel.app/ — routes `/`, `/login`, `/register` HTTP 200 verified 2026-11-23 (session 05); signed-out `/teacher` redirects to `/login`**; SSO protection disabled. Deployment is from uploaded source (not yet git-connected to the repo). **17 env vars set**, including the full Supabase set with standard names (Production + Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`, plus `NEXT_PUBLIC_CLASS_RADIUS_METERS=100`.
- **Supabase:** project `supabase-face-attendence`, **ref `bwjgtbuytiemssovxrgy`**, URL https://bwjgtbuytiemssovxrgy.supabase.co — provisioned through the Vercel integration (store `store_199ZcTBHUyFg86S8`, status available/ready, Free plan) and connected to the Vercel project by Wadi on 2026-11-23 (session 04).
- **`.env.local`:** written — real `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_CLASS_RADIUS_METERS=100`; the two key values are placeholders (below). Gitignored (`.env*`), confirmed absent from the repo.
- Stack decided (DECISIONS.md ADR-001…006): Next.js (TS) + Supabase + face-api.js (browser) + Geolocation + SheetJS, on Vercel.

## What does NOT exist yet
- The database schema is **not applied** (no tables/bucket in Supabase yet) and there is **no teacher account** — both are Wadi's ~3-minute dashboard actions (session 05, "Next steps"). Until then, sign-in cannot succeed and no student data can be stored.
- No face capture/matching, no verify flow, no API routes — Phase 2.
- `class_settings` row 1 is not seeded (demo coordinates still TBD-verify on site).

## Caveats / known limitations
- **`.env.local` key values are placeholders.** The real anon + service_role values live in Vercel as write-only "sensitive" integration vars — neither the Vercel APIs (MCP + REST both return `decrypted: False`) nor the Supabase connector can export them. To fill them in: Supabase dashboard → project `bwjgtbuytiemssovxrgy` → Settings → API → copy `anon` and `service_role` into `.env.local` (1 minute, needed only before local Supabase development).
- **⚠️ Phase 1 warning — the Supabase connector cannot reach this project.** `GET /v1/projects` lists only WhyRisk; direct reads of ref `bwjgtbuytiemssovxrgy` (project, api-keys) return 403. So migrations/SQL for Phase 1 cannot run through the saved connector: they must run in the Supabase dashboard SQL editor (by Wadi, or pasted by him), or a credential with access to this project must be provided.
- **Remaining Phase 0 exit check (Wadi's side):** open https://face-attendance-abdu1wahid.vercel.app/ on his phone and confirm it loads (agent-side HTTP 200 already verified twice).

## Open decisions (all "TBD (needs human decision)")
1. Final product name (working title in use).
2. Teacher auth: Supabase Auth email/password vs PIN. — **Implemented as Supabase Auth email/password in Phase 1 (session 05); DECISIONS.md entry to be marked settled by Wadi.**
3. Registration photo retention vs descriptor-only.
4. ~~License~~ — SETTLED 2026-11-23: MIT (LICENSE file added; Wadi's standing default).
5. Demo students 2–5: consenting classmates vs clearly-fictional labelled entries; demo class GPS coordinates to be captured on site.

## Next step
**Wadi (one action, ~3 min):** Supabase dashboard → project `bwjgtbuytiemssovxrgy` → SQL Editor → paste `supabase/phase-1-schema.sql` → Run; then Authentication → Users → Add user (his email + a password he chooses) and sign in at `/login`. After that: Phase 1 exit check (anon key cannot read `students`) and Phase 2 (register/verify core feature).

## Inconsistencies
- Repo name typo: `face-attendence` vs the project's `face-attendance` everywhere else (folder, Vercel project, brain). Rename pending Wadi. (The Supabase database also carries the typo name, `supabase-face-attendence` — internal only, no action needed.)
- ~~ARCHITECTURE.md `src/` prefix~~ and ~~DESIGN.md Tailwind v3 snippet~~ — both corrected in the session 05 docs pass (as-built layout; v4 CSS-first mapping noted).
