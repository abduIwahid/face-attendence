# ENV — Face Attendance System

Names and purposes only. Real values live in `.env.local` (local) and the Vercel dashboard (production) — never in this file, never in git.

| Var | Purpose | Used by | Secret? | Where to get it |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project endpoint | Browser + server | No | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client key; safe only because RLS is on | Browser + server | No (RLS-guarded) | Same page as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS for register/verify/log routes | Server ONLY (API routes) | **YES** | Same page as above — "service_role" key |
| `NEXT_PUBLIC_CLASS_RADIUS_METERS` | Default attendance radius (m); DB `class_settings` overrides it | Verify flow | No | Set by Wadi; default 100 |

Rules:
- Anything prefixed `NEXT_PUBLIC_` ships to the browser — never put a real secret behind that prefix.
- If a key is ever committed or pasted publicly: rotate it in the Supabase dashboard the same day (SECURITY.md sweep #13).
