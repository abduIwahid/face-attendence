# PRD — Face Attendance System

**Core feature (one sentence):** A student marks attendance by taking a live selfie on their phone — attendance is recorded only when the face matches their registered photo AND their live GPS location is within the class radius.

## Problem
- Manual paper attendance is slow (minutes of every class) and error-prone.
- Proxy attendance is rampant: an absent student's friend signs/marks for them.
- A photo-only check can be proxied by carrying a photo; a location-only check can be proxied by handing over the phone. Face + location together close both holes.

## Target users
| User | Need |
|---|---|
| Student | Mark attendance in under ~30 seconds from their own phone |
| Teacher | Trustworthy log; export to Excel for records |
| (Demo audience) Recruiters / interviewers | See a real AI + CV pipeline shipped end-to-end |

## Goals
- Working end-to-end flow on a real phone: register → verify → log → export.
- Honest accuracy: show match result + distance on every record, no silent passes.
- Ship in 1 week part-time, free tiers only, deploy-ready on Vercel.

## Non-goals
- No native app (phone web only).
- No liveness detection in v1 (photo-of-photo spoof is a known, documented limit — see RISKS.md).
- No multi-class / timetable / LMS integration in v1.
- No admin panel beyond the teacher log view.
- No public leaderboard or social features.

## User stories
- As a student, I register once with my name, roll number and a live photo, so my face is on record.
- As a student, I open the verify page, take a selfie and share location, so my attendance is marked in seconds.
- As a student, if verification fails I see WHY (face not matched / too far / GPS inaccurate) and can retry.
- As a teacher, I open the log and see who was marked, when, with what match result and distance.
- As a teacher, I export the log as .xlsx for my records.
- As a teacher, I can change the class location and radius without a developer.

## Scope
### MUST
- [ ] Registration: name, roll number, live camera capture → 128-d descriptor stored (photo to private Storage bucket)
- [ ] Verify: live selfie → client-side match vs stored descriptor (threshold in DECISIONS.md)
- [ ] Verify: Geolocation → haversine distance to class location; pass only if ≤ radius (default 100 m)
- [ ] Attendance row written only on double pass: date, time, face match result, distance (m)
- [ ] One attendance row per student per day (duplicate attempts rejected with a clear message)
- [ ] Teacher view: log table (Name, Roll Number, Date, Time, Face Match, Distance) — teacher-only access
- [ ] Excel (.xlsx) export of the log (SheetJS)
- [ ] Class settings: class location (lat/lng) + radius editable by teacher
- [ ] Clear failure states: no face found, multiple faces, GPS denied, GPS inaccurate, too far

### SHOULD
- [ ] Failed attempts also logged (marked FAILED with reason) — makes the anti-proxy claim auditable
- [ ] Student sees their own attendance history
- [ ] Registration photo retake flow

### COULD
- [ ] Multiple classes per teacher
- [ ] Basic liveness hint (blink/head-turn challenge) — only if time remains after MUSTs
- [ ] QR code on the classroom door linking to the verify page

## Wow factor
The double check itself, demoed live: a registered face outside the radius fails; an unregistered face inside the radius fails; only the right person in the right place passes — and the log shows the distance in metres as proof.

## Success criteria (acceptance)
- [ ] Full flow works on Wadi's own phone over mobile data (not just localhost Wi-Fi)
- [ ] Correct face at the class location → row written with MATCHED + distance
- [ ] Wrong face / photo of another registered student → no row, reason shown
- [ ] Correct face > radius away → no row, distance shown
- [ ] Teacher export opens in Excel with all columns populated
- [ ] Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 95 (targets — see TESTING.md)

## Portfolio / interview value map (no formal evaluation)
| Feature | What it proves in an interview |
|---|---|
| face-api.js descriptors, client-side matching | Applied CV/ML: embeddings, distance thresholds, trade-offs |
| Haversine + Geolocation handling | Real-world sensor data: accuracy, drift, failure UX |
| Supabase RLS + private bucket | Security thinking about biometric data |
| Descriptor-only server storage | Privacy-by-design (ETHICS_PRIVACY.md) |
| Excel export + teacher log | Shipping a complete product, not a notebook demo |
| Documented limits (liveness, GPS spoofing) | Engineering honesty — see JUDGE_QA.md |

## Roadmap (post-v1, only if Wadi continues it)
- Liveness challenge; multi-class support; pilot with one real FA24-BAI class (consent first — ETHICS_PRIVACY.md).

## Open questions
- Product name — TBD (needs human decision). Working title: "Face Attendance System".
- License — TBD (needs human decision). Default candidate: MIT.
