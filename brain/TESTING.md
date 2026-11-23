# TESTING — Face Attendance System

## Strategy
Manual critical-path testing on a **real phone** is the primary gate (camera + GPS don't exist meaningfully on desktop). Automated tests cover pure logic only.

## Critical-path manual checklist (run before every deploy)
- [ ] Register a new student: consent shown → camera opens → descriptor saved → success state
- [ ] Register the same roll number again → `ROLL_TAKEN` message, no duplicate row
- [ ] Verify as that student at the class location → PRESENT row with MATCHED + distance
- [ ] Verify a second time the same day → `ALREADY_MARKED`, no second PRESENT row
- [ ] Verify with an unregistered face → fails with reason shown
- [ ] Verify with a photo of another registered student held to the camera → record the outcome honestly (v1 has no liveness — RISKS.md R-05)
- [ ] Verify from outside the radius → fails, distance shown
- [ ] Deny GPS permission → clear instructions state, no crash, no row
- [ ] GPS accuracy poor (indoors, deep in building) → `GPS_INACCURATE` path or recorded accuracy on the row
- [ ] Teacher login → log table correct → .xlsx export opens with all columns
- [ ] Teacher settings change (radius) → next verify honours it
- [ ] Anon access: paste the anon key in a REST call → `students` unreadable (RLS)

## Minimal automated tests (core logic only)
- `geo.ts`: haversine known-distance pairs (0 m same point; a known city pair within tolerance); radius boundary cases
- `face.ts`: euclidean distance of identical descriptors = 0; threshold comparison at the boundary
- `validation.ts`: schemas reject bad roll numbers, wrong-length descriptors, out-of-range coordinates/radius

## Performance targets (mobile, production URL)
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95, LCP < 2.5 s on non-camera pages
- Camera pages: models lazy-loaded with a visible loading state; time-to-camera-preview is the metric that matters — note it in the Phase 2 session file

## Definition of done
A feature is done when: the relevant checklist items pass on Wadi's phone over mobile data, build + lint pass, states (loading/empty/error) exist, and the change is logged (WORKFLOW.md).
