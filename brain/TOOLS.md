# TOOLS — Face Attendance System

Rule: fewest services possible. This project needs exactly **two** accounts beyond GitHub.

## Picks
| Category | Tool | Purpose | Env vars | Setup | Fallback |
|---|---|---|---|---|---|
| Hosting | Vercel (Hobby) | Next.js app + API routes | — (Git-connected) | ~10 min | Netlify (worse Next.js fit — last resort) |
| DB + Auth + Storage | Supabase (Free) | Postgres, RLS, private photo bucket, teacher login | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | ~15 min | Neon + separate storage (more moving parts — avoid) |
| Face recognition | face-api.js (npm, self-hosted weights) | Detection + 128-d descriptors in the browser | — | ~20 min incl. model download | FastAPI + DeepFace service (ADR-005) |
| Location | Browser Geolocation API | Live position + accuracy | — | built-in | None — core requirement; HTTPS mandatory |
| Export | SheetJS `xlsx` (npm) | .xlsx generation client-side | — | 5 min | CSV download (one-line change) |
| Icons | Lucide (`lucide-react`) | UI icons | — | 2 min | — |
| Repo | GitHub | Code + this brain | — | existing account | — |

## Free-tier limits — VERIFY on the official page at setup (never guess)
| Service | What to verify | Where |
|---|---|---|
| Vercel Hobby | Function execution limits, commercial-use terms, bandwidth | vercel.com/pricing |
| Supabase Free | DB size, Storage size, MAU, **project pausing on inactivity** | supabase.com/pricing |
- ⚠ Known class of gotcha (verify, don't assume): free Supabase projects can pause after inactivity — for a portfolio demo, wake the project before showing it; note the observed behaviour in the Phase 0 session file.
- ⚠ Vercel Hobby is for personal/non-commercial use — fine for a portfolio project; a real classroom deployment needs a plan review.
- face-api.js weights: ~6–7 MB for the three nets used — confirm exact size at setup; host in `public/models/`, lazy-load on camera pages only.

## Accounts to create first
- [ ] None new: GitHub, Vercel and Supabase accounts already exist (Wadi's stack). Create only the new Supabase **project** + Vercel **project** for this app.

## Cost / scaling note
- $0 at demo scale. Beyond free tier the first pressure points are Supabase Storage (photos) and DB size — both shrink dramatically if photo retention is dropped (descriptor-only, see ETHICS_PRIVACY.md).
