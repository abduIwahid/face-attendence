# DEPLOYMENT — Face Attendance System

## Targets
| Service | What runs there |
|---|---|
| Vercel | Next.js app + API routes (production = `main` branch) |
| Supabase | Postgres, Storage bucket, teacher Auth |

## One-time setup
1. Supabase: create project → run migrations (DATA_MODEL.md) → create private bucket `registration-photos` → create teacher user (Auth dashboard) → seed `class_settings` row 1.
2. Vercel: import the GitHub repo → set env vars (below) → deploy.
3. Confirm the production URL loads over HTTPS on a phone (camera/GPS require HTTPS).

## Env vars (values in Vercel dashboard + local `.env.local` only)
| Var | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | Safe client-side only with RLS on |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + local | Server only — never `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_CLASS_RADIUS_METERS` | Vercel + local | Default 100; DB setting overrides per class |

Full detail: ENV.md.

## Deploy flow (every time)
1. `npm run build` + `npm run lint` pass locally.
2. Push to `main` → Vercel auto-deploys. (Preview deployments on push are fine; production is `main` only — solo workflow, no PR branches.)
3. Post-deploy smoke test (below) on the production URL, on a phone.

## Post-deploy smoke test
- [ ] Landing page loads; no console errors
- [ ] Register page opens the camera (HTTPS permission prompt works)
- [ ] Verify page gets a GPS fix and shows accuracy
- [ ] Teacher login works; log page loads; export downloads a valid .xlsx
- [ ] Anon Supabase key cannot read `students` (RLS spot-check)

## Rollback
- Vercel dashboard → Deployments → promote the previous deployment (instant). DB migrations are additive in v1 — no destructive rollback expected; if a migration must be reversed, write the down-migration in the same session file that introduced it.

## Gotchas
- Free Supabase projects may pause on inactivity (verify current behaviour — TOOLS.md): open the dashboard / make a request before a demo.
- Model weights in `public/models/` deploy with the app; confirm they are in the build output after the first deploy (face pages fail silently without them).
- Custom domain: SKIP for v1 — the `*.vercel.app` URL is the demo link. TBD (needs human decision) if Wadi wants a subdomain later.
