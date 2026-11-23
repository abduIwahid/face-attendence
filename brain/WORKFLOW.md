# WORKFLOW — Face Attendance System

Solo project: Wadi plays all three roles, in separate passes.

## Roles
| Role | Does | Never |
|---|---|---|
| Planner | Updates PRD / BUILD_PLAN / DECISIONS before building | Codes in the same pass |
| Builder | One task (≤ ~30 min), mock-first, commits after | Starts a second task before logging the first |
| Reviewer | Checks the result against PRD, DESIGN.md, SECURITY.md | Approves own shortcuts silently — deviations go in DECISIONS.md |

## Task loop
1. Read `00-START-HERE.md` → `changes/current-state.md` → last 3 session files.
2. Pick ONE task from BUILD_PLAN.md (respect the phase order + freeze point).
3. Build (UI on stubs first, then wire).
4. Test on a real phone for anything touching camera/GPS.
5. Log: session file → changelog → current-state → BUILD_PLAN checkbox.
6. Commit (Conventional Commits, reference the session file).

## Branching & commits
- Work directly on `main` (Wadi's standing git rule). Small, frequent commits.
- Format: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:` + short summary, e.g. `feat: verify flow with haversine radius check (session 2026-11-24-01)`.
- Deploy at least once per phase; the live URL must always work.

## Freeze rules
- **75% of budget = dependency freeze.** After it: no new packages or services without Wadi's explicit approval.
- Scope freeze at Phase 4: MUST list is fixed; new ideas go to PRD roadmap, not the build.

## Logging rules (hard)
- Session file per work session: `changes/sessions/YYYY-MM-DD-NN-short-title.md` — goal, files changed, decisions + reasoning, problems + fixes, status (Done/Partial/Blocked), next steps, commit hash.
- `changelog.md`: verified changes only, format `Change → Reason → Affected Area → Impact → Evidence → Status`.
- `current-state.md`: what exists NOW — update it in the same session as the change.
- Never invent history. Tag claims **Verified / Inferred / Unknown**.
- Every brain file stays under ~300 lines; read only task-relevant files + the mandatory start files.
