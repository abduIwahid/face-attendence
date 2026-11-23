# GLOSSARY — Face Attendance System

| Term | Meaning in this project |
|---|---|
| Descriptor | The 128-number vector face-api.js computes from a face; the thing actually compared and stored. Biometric data. |
| Match threshold | Max Euclidean distance between two descriptors to call them the same person. Default 0.6, tuned in Phase 2 (ADR-006). |
| Radius | Max allowed distance (m) between the student's GPS fix and the class location. Default 100, teacher-configurable. |
| Haversine | Formula for straight-line distance between two lat/lng points on a sphere; implemented in `lib/geo.ts`. |
| GPS accuracy | The phone's own estimate of position error (m), returned with every Geolocation fix; recorded per attempt, capped at 50 m. |
| Proxy attendance | Marking an absent student present — the problem this project exists to kill. |
| Liveness | Proving a live person is in front of the camera (vs a photo). NOT in v1 — documented limit. |
| RLS | Supabase Row Level Security — database-level access rules; the second wall behind API-route checks. |
| PRESENT / FAILED | The two attendance row statuses. PRESENT requires face MATCHED **and** distance ≤ radius. |
| Demo students | The 5 seeded registrations used for testing/demo (DEMO_DATA.md) — consent or clearly-fictional labels required. |

## Naming conventions
- Roll numbers: uppercase, e.g. `FA24-BAI-024`.
- Tables: plural snake_case (`students`, `attendance`, `class_settings`).
- Error codes: `SCREAMING_SNAKE` (API_SPEC.md).
- Files: components PascalCase, libs kebab/camel per ARCHITECTURE.md.
