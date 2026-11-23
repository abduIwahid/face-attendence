# DECISIONS — ADR log (newest last)

## ADR-001 — 2026-11-23 — Default stack A variant: Next.js + Supabase, no separate backend
- **Options:** (A) Next.js + Supabase on Vercel · (B) React/Vite + FastAPI backend (the reel's Python framing) · (C) Next.js + FastAPI + Supabase.
- **Decision:** A.
- **Why:** Matches the reel's phone-web flow (camera + GPS live in the browser anyway); zero backend hosting cost; free tiers only; it's Wadi's existing stack (WhyRisk, Study Hub) so the 1-week part-time budget goes to the feature, not to learning a new deploy path. The Python/DeepFace route stays as a documented fallback (ADR-005).

## ADR-002 — 2026-11-23 — face-api.js, matching in the browser
- **Options:** face-api.js client-side · DeepFace/FaceNet server-side · cloud face API (paid).
- **Decision:** face-api.js (TinyFaceDetector + 128-d recognition net), descriptors computed and matched client-side; only descriptors + metadata stored server-side.
- **Why:** No ML server to host/keep awake; the camera is in the browser, so the descriptor can be too; descriptors are ~1 KB, cheap to store in Postgres jsonb. Known cost: client-side results are spoofable by a tampered client — accepted for v1, documented in RISKS.md R-04, with a server-side-compare hardening path (API_SPEC.md already shapes /api/verify for it).

## ADR-003 — 2026-11-23 — Supabase for DB + Storage + teacher auth
- **Why:** One account covers Postgres, the private photo bucket and teacher login; RLS gives a second wall behind the API routes. Wadi already has a Supabase account (WhyRisk).

## ADR-004 — 2026-11-23 — Haversine + radius, default 100 m, teacher-configurable
- **Why:** Straight-line distance is the honest check for "in the classroom"; the radius lives in `class_settings` (not code) because classroom size and GPS quality vary. Default 100 m follows the reel/task spec. GPS accuracy is recorded on every row and attempts with accuracy worse than 50 m are rejected (the reel itself warns indoor GPS is unreliable).

## ADR-005 — 2026-11-23 — Fallback: FastAPI + DeepFace backend
- **Trigger:** browser matching accuracy disappoints in Phase 2 testing (e.g. false rejects of the same person under normal classroom light, or false accepts between similar faces at the chosen threshold).
- **Plan if triggered:** small FastAPI service exposing `POST /match { descriptor-or-image }` using DeepFace (Facenet512/ArcFace); Next.js calls it server-side. Cost: a backend host (free tier that sleeps is acceptable for a demo; note the cold-start in the demo script). Needs Wadi's approval — it's an architecture change (AGENT.md hard rule).

## ADR-006 — 2026-11-23 — Match threshold: face-api.js default 0.6 euclidean, tune in Phase 2
- **Why:** 0.6 is the library's documented default for "same person". Phase 2 tests with the 5 demo students and records the observed same-person / different-person distances in the session file before locking the value.

## ADR-007 — 2026-11-23 — Rate limiting: in-memory fixed-window counters (v1)
- **Options:** in-memory counters in the route process · a Supabase counter table · an external rate-limit service.
- **Decision:** in-memory fixed-window counters (`lib/rateLimit.ts`), keyed per roll number (verify) and per IP (register).
- **Why:** The API_SPEC.md limit numbers (verify 10/roll/10 min, register 5/IP/hour) are the contract; the storage behind them was explicitly TBD. In-memory is zero-setup and honest at classroom scale. Known limit: Vercel serverless instances do not share memory, so the effective limit is per-instance — accepted for v1, upgrade path is a Supabase counter table if abuse ever matters.

## ADR-008 — 2026-11-23 — Package: @vladmandic/face-api; verify matching decided server-side
- **Package:** the brain names "face-api.js"; the shipped package is **@vladmandic/face-api 1.7.15**, the maintained fork of face-api.js with the same API and the same model weights (self-hosted in `public/models/`). The original package is unmaintained.
- **Matching:** ADR-002 put the match decision in the browser. Phase 2 instead follows API_SPEC.md's stated v1 default (the ARCHITECTURE.md hardening path): the browser computes the live descriptor, and **the server recomputes the euclidean distance against the stored descriptor and applies the ADR-006 threshold itself**. A tampered client can no longer assert its own match result.
- **Consequence:** `GET /api/students/:roll_number/descriptor` is NOT built — with server-side compare, no descriptor ever needs to leave the server, which also removes the enumeration surface SECURITY.md flags. API_SPEC.md's descriptor-endpoint section is superseded by this ADR.
- **Still client-side, honestly:** face *detection* (exactly-one-face) happens in the browser before a descriptor exists; liveness is still out of scope (RISKS.md).

## ADR-009 — 2026-11-23 — GPS: best-of-several sampling + accuracy-aware radius decision; cap raised to 250 m
- **Trigger:** Wadi's real phone test (2026-11-23 ~21:08 PKT): sitting in the exact spot where he had set the class location from the teacher dashboard, /verify reported him ~160–170 m away. A single-shot browser geolocation fix indoors is routinely off by 100–200 m (first answer is often a Wi-Fi/cell fix), so the Phase 2 semantics — single-shot fix, raw haversine vs radius, 50 m accuracy cap (ADR-004) — made the core feature fail in the normal classroom case it was built for.
- **Decision:**
  1. **Client sampling:** both /verify and the teacher "Use my current location" setter now use a shared routine (`lib/geolocation.ts`): `watchPosition` for up to ~10 s, keep the reading with the smallest reported accuracy, stop early at ≤ 20 m. The UI shows live sampling status ("Improving location accuracy… ±X m"). Both sides of the comparison are measured the same way.
  2. **Accuracy-aware decision (server):** the radius check in `lib/verify.ts` uses the **effective distance** `max(0, raw distance − GPS accuracy)`. TOO_FAR only when the effective distance exceeds the radius.
  3. **Cap raised:** the hard GPS-accuracy cap goes from 50 m to **250 m**. Above 250 m a fix is meaningless and is still rejected as GPS_INACCURATE, writing no attendance row.
- **Why:** Indoor GPS drift is the normal classroom case, not an edge case. The phone's own accuracy figure is the honest measure of how much the raw distance can be trusted; subtracting it (floored at 0) is the standard way to ask "could this student actually be inside the radius?". Sampling first means most real fixes arrive far better than the worst case, so the accuracy subtraction is usually small.
- **Auditability preserved:** attendance rows still store the **raw** distance + accuracy exactly as before — only the decision changed — so a teacher can see and question a marginal pass.
- **Trade-off (accepted for v1, RISKS.md R-11):** a student genuinely just outside the radius whose fix is terrible (e.g. raw 300 m at ±250 m accuracy → effective 50 m) can pass. Accepted because the alternative — rejecting genuine in-room students — breaks the core feature in its primary setting; the raw values on the row keep the pass auditable, and the face match + one-PRESENT-per-day rules are unaffected.
- **Amends:** ADR-004's 50 m accuracy cap. Everything else in ADR-004 (haversine, teacher-configurable radius, default 100 m) stands.

## Open decisions
- Teacher auth: Supabase Auth email/password vs simple PIN — TBD (needs human decision).
- Photo retention: keep registration photos (private bucket) vs descriptor-only after registration — TBD (needs human decision; ETHICS_PRIVACY.md leans descriptor-only).
- Final product name + license — TBD (needs human decision).
