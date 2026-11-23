# Prompt — Refactor

Read first: brain/00-START-HERE.md, brain/changes/current-state.md, brain/ARCHITECTURE.md (conventions).

Refactor target: <files/module + why>

Rules:
- Behaviour must not change. No API, schema or UI changes in a refactor commit.
- State the before/after structure in the session file before starting.
- Build + lint + the TESTING.md items for the touched area must pass after; run the phone check if camera/GPS code moved.
- If the refactor reveals a needed architecture change, stop and log it in DECISIONS.md for Wadi's approval instead of doing it.
- Finish by logging: session file, changelog entry, current-state update.
