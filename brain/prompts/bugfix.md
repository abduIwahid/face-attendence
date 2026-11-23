# Prompt — Bugfix

Read first: brain/00-START-HERE.md, brain/changes/current-state.md, the session file that introduced the affected feature.

Bug: <what happens, where, on what device/browser>

Rules:
- Reproduce first (phone if camera/GPS). State the root cause before changing code; if the cause is Unknown, say so and instrument instead of guessing.
- Fix the cause, not the symptom; keep the change minimal — no drive-by refactors (use refactor.md for those).
- Re-run the relevant TESTING.md checklist items and confirm the fix on the same device that reproduced it.
- Finish by logging: new session file (cause + fix + evidence), changelog entry, current-state update.
