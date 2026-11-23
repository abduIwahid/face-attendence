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

## ADR-010 — 2026-11-23 — Full frontend pass: DESIGN.md applied as a system; motion + component layer added, palette/fonts NOT replaced
- **Trigger:** Wadi's scope expansion mid-Phase-3 (2026-11-23 21:22 PKT): "full detailed frontend banna chaye" — landing page, multiple pages, animations/transitions, hover depth, a CSS component layer (grid/flex/media queries), responsive + touch, palette + fonts.
- **Decision:**
  1. **Palette and fonts stay exactly as DESIGN.md fixes them** (stone neutrals + one green accent, solid colours only, system font stack). DESIGN.md is the project's binding design source and its choices are deliberate (the system stack keeps the camera pages fast; the green carries "present/verified" semantics). The expansion brief asked for a palette/fonts decision — the decision is to apply the existing system completely and consistently rather than invent a second one. No gradients, no glassmorphism (also Wadi's standing anti-AI-fingerprint rule).
  2. **Landing page** at `/`: hero-landing layout (layout-vocabulary), Z-pattern read — promise, a double-check proof card (labelled as an illustration; the real distance is measured per attempt), 3-step how-it-works, 4 feature cards, students/teachers split, an honest-limits section (no liveness in v1, GPS = evidence not proof, deletion path), footer. Copy is factual only — no invented stats, users or testimonials.
  3. **Motion layer in globals.css** (the "CSS component layer" is Tailwind utilities + these shared classes): `.animate-rise` — one 480 ms fade+rise entrance with a per-element `--rise-delay` stagger (his approved one-by-one reveal pattern; motion principles: <400 ms feel, ease-out, staggering); `.hover-lift` — hover depth from shadow growth + a 3 px lift, pointer devices only (depth from shadows is DESIGN.md's only depth cue). `prefers-reduced-motion` disables both and flattens transitions globally.
  4. **Responsive method:** mobile-first single columns, `clamp()` fluid hero type, flex-wrap on every multi-item row, the log table scrolls inside its own `overflow-x-auto` region below its natural width, all tap targets ≥ 44 px (DESIGN.md + standing responsiveness rule).
  5. **Reference material reused:** hero-landing/Z-pattern naming (brain/general/layout-vocabulary.md), the staggered-reveal + purposeful-motion rules (brain/general/frontend-preferences.md), the motion principles — staggering, ease-out, reduced-motion (brain/general/ui-layouts-library.md notes). The WhyRisk watermelon template contributed only its section *order* idea (hero → features → how-it-works → CTA); no WhyRisk branding, colours or code were imported.

## ADR-011 — 2026-11-23 — Frontend rebuilt from scratch in the Aurora design system (supersedes ADR-010's design direction)
- **Trigger:** Wadi's order (2026-11-23 22:12 PKT): "face-attendance waly website ka frontend scratch se new bnaya, ye aurora ki puri library ko use kr ke; jo jo face attendance waly website pe use ho sky wo lgao; or baqi brain ko bhi apni jagha use krna" — after he picked ThemeWagon's Aurora as his highest-priority frontend reference and the full Aurora library was captured (`~/workspace/aurora-library/`).
- **Decision:**
  1. **Aurora's system replaces the Phase 3 stone/green system wholesale.** Tokens (accent #3385F0, hover #2B71CC, text #1B2124, secondary #4D595E, card border #E5E7EB, filled-input pale #EDF2F8, 8px radii, the one soft layered shadow, Aurora spacing rhythm) live in `app/globals.css`; DESIGN.md rewritten to match. Status colours (success/warning/danger) stay semantic and unchanged in role — PRESENT/FAILED are statuses, not brand.
  2. **Typeface:** Plus Jakarta Sans for everything, self-hosted via `next/font/google` (ADR-010's "no webfont, camera pages must load fast" reasoning is overridden by Wadi's Aurora order; next/font self-hosts the files, so there is no runtime font CDN and the camera pages still load the font from the app itself).
  3. **Recreated in this stack, never copied:** no MUI, no Aurora code or illustration assets — the library is a reference. Pages map to library pages: `/` → Aurora landing homepage (nav, rotating-word hero, trust strip → the four real checks, features grid, showcase cards → the student/teacher flows); `/login` → the JWT auth split-screen (branding panel + open form column; the demo's social buttons/demo-credentials/sign-up map to nothing real and are absent — the "no account?" line points students to /verify); `/teacher` + `/teacher/settings` → the dashboard app shell (sidenav + topbar, stat cards, MUI-style table with status chips); `/register` + `/verify` → Aurora form styling (filled inputs, floating labels via `components/FloatingInput.tsx`) around the untouched camera/GPS components.
  4. **Presentation only.** No API route, no `lib/` logic, no schema/RLS, no flow behaviour changed; all 35 tests pass untouched. The ADR-010 motion layer (rise stagger + hover-lift + reduced-motion stop) is kept and retuned to Aurora's softer shadow.
- **Supersedes:** ADR-010 point 1 (palette/fonts stay stone/green/system stack). ADR-010's landing structure, motion and responsive method stand, restyled.

## Open decisions
- Teacher auth: Supabase Auth email/password vs simple PIN — TBD (needs human decision).
- Photo retention: keep registration photos (private bucket) vs descriptor-only after registration — TBD (needs human decision; ETHICS_PRIVACY.md leans descriptor-only).
- Final product name + license — TBD (needs human decision).
