# PRODUCTION READINESS — Face Attendance System

Tagged for THIS project's budget (1 week part-time, portfolio demo). Status starts as ☐ for all.

## Auth & data
- ☐ MUST — RLS enabled on all tables before any real data (verified by the anon-key test in TESTING.md)
- ☐ MUST — Teacher routes check session server-side; service-role key never in client code (grep the build)
- ☐ MUST — Registration photos only in the private bucket; signed URLs only
- ☐ MUST — Consent captured at registration (`consent_at` set); deletion path works (delete a test student fully)
- ☐ SHOULD — Failed attempts logged with reasons

## UX states
- ☐ MUST — Loading / empty / error states on register, verify, log (DESIGN.md list)
- ☐ MUST — Camera + GPS denial states with instructions
- ☐ MUST — Mobile layout clean 320–1920 px, no horizontal overflow (standing responsiveness rule)
- ☐ SHOULD — Skeleton on the teacher log while loading

## Backend / security
- ☐ MUST — Zod validation on every API body; standard error format everywhere
- ☐ MUST — Rate limits live (API_SPEC.md values)
- ☐ MUST — One-PRESENT-per-day enforced by the DB unique index, not just UI
- ☐ MUST — `npm audit` run; no criticals unaddressed
- ☐ SHOULD — CSP header set (self + Supabase origin)

## Observability
- ☐ SHOULD — Vercel deployment logs checked after each deploy
- ☐ SKIP-FOR-NOW — External error tracking / analytics / uptime monitor (overkill for a portfolio demo)

## Legal / compliance (not legal advice)
- ☐ MUST — ETHICS_PRIVACY.md rules implemented: consent copy live, purpose stated, deletion path real
- ☐ SKIP-FOR-NOW — Formal privacy policy page (add before any real-class pilot — hard gate in ETHICS_PRIVACY.md)

## Accessibility & SEO basics
- ☐ MUST — WCAG AA contrast + visible focus + ≥44px tap targets (DESIGN.md)
- ☐ SHOULD — Title/meta description + favicon; OG tags on the landing page
- ☐ SKIP-FOR-NOW — Sitemap/robots polish, custom domain

## Hygiene
- ☐ MUST — `.env.local` gitignored; repo history contains no keys (check before first push)
- ☐ MUST — README has live link + screenshots; LICENSE decided (TBD — human decision)
- ☐ SHOULD — Fallback demo video recorded (BUILD_PLAN Phase 6)
