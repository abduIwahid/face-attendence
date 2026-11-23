# DEMO DATA — Face Attendance System

Descriptors cannot be invented in SQL — a descriptor only exists after a real face passes through face-api.js. So "seeding" = running the real register flow for each demo student (5 × ~2 minutes), then confirming the log with test verifies.

## Demo students (5)
| # | Name | Roll number | Notes |
|---|---|---|---|
| 1 | Abdul Wahid | FA24-BAI-024 | Wadi himself — primary demo face |
| 2–5 | TBD (needs human decision) | TBD | 4 classmates **with their explicit consent** (ETHICS_PRIVACY.md), or additional captures of Wadi under different light/glasses registered under clearly-fictional names (e.g. "Demo Student 2") if consent isn't practical. Fictional entries must be labelled demo data, never presented as real users. |

## Demo class
| Field | Value |
|---|---|
| `class_name` | FA24-BAI — Demo Class |
| Location | COMSATS University Islamabad, Attock Campus — **coordinates TBD-verify**: stand at the demo classroom/building entrance, take a GPS reading on the phone (Google Maps long-press), record lat/lng + the phone's reported accuracy in the Phase 1 session file, then seed `class_settings` |
| `radius_meters` | 100 (default) |

## Demo accounts
| Account | How created | Credentials |
|---|---|---|
| Teacher | Supabase Auth dashboard → Add user (email + password) | Password in Wadi's vault — never in this repo |
| Students | No accounts exist by design | — |

## Seed procedure (Phase 4, hard deadline at 82% of budget)
1. Confirm `class_settings` row 1 = demo class above.
2. For each demo student: open `/register` on a phone → consent → capture → confirm the row in `students`.
3. Run one verify at the class location per student → confirm PRESENT rows.
4. Run the two failure demos once (wrong face; right face from outside the radius) → confirm the reasons display.
5. Teacher login → log shows all rows → export .xlsx → open it and check columns.
6. Record outcomes in the Phase 4 session file.

## Cleanup
Demo descriptors/photos are real biometric data even for demos: delete the demo students' rows + photos when the project is retired or before handing the repo/demo to anyone else.
