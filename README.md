# Face Attendance System

> Working title — final product name is an open question (see `brain/PRD.md`).

Attendance by live selfie + live location. A student marks attendance from their own phone; the record is written **only** when their face matches their registered photo **and** their GPS position is inside the class radius. No paper register, no proxy attendance.

**Live demo:** TBD (Phase 0 deploy)
**Screenshots:** TBD (add after Phase 3)

![status](https://img.shields.io/badge/status-brain--only%20(no%20code%20yet)-lightgrey)
![stack](https://img.shields.io/badge/stack-Next.js%20%2B%20Supabase%20%2B%20face--api.js-black)

## How it works

1. **Register** — name + roll number + live photo; a 128-d face descriptor is computed in the browser and stored.
2. **Verify** — live selfie → face match against the stored descriptor; browser Geolocation → haversine distance to the class location.
3. **Record** — face MATCHED + distance ≤ radius (default 100 m, teacher-configurable) → attendance row (date, time, match result, distance).
4. **Review** — teacher sees the log table and exports it as Excel (.xlsx).

## Architecture

```mermaid
flowchart LR
  Phone["Student phone (browser)"] -->|camera + face-api.js| Match["Face match (client-side)"]
  Phone -->|Geolocation API| Geo["Distance check (haversine)"]
  Match -->|descriptor + result| API["Next.js (Vercel)"]
  Geo -->|lat/lng + distance| API
  API --> DB[("Supabase Postgres")]
  API --> Store["Supabase Storage<br/>(private: registration photos)"]
  Teacher["Teacher view"] --> API
  Teacher --> XLSX[".xlsx export (SheetJS)"]
```

Full detail: `brain/ARCHITECTURE.md`. Start here if you're an agent: `AGENT.md` → `brain/00-START-HERE.md`.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase values
npm run dev
```

Env vars: see `.env.example` and `brain/ENV.md`. Database schema + RLS: `brain/DATA_MODEL.md`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint |
| `npm test` | Tests (core feature) |
| `npm run seed` | Seed demo students + demo class |

## Stack

Next.js (TypeScript) · Supabase (Postgres, Storage, RLS) · face-api.js (TinyFaceDetector + 128-d face descriptors, client-side) · Geolocation API · SheetJS (xlsx) · Vercel

## Team

Solo — Abdul Wahid (design, build, test, demo). See `brain/TEAM.md`.

## Privacy note

Face descriptors are biometric data. Consent at registration, private storage, deletion path — see `brain/ETHICS_PRIVACY.md`.

## License

TBD (needs human decision) — MIT is the default for Wadi's portfolio repos.
