# 00 — START HERE

**One-liner:** Attendance by live selfie + live GPS radius — face match AND location match, or no attendance.

**Current phase:** Phase 0 — setup. Brain complete; no code yet. See `changes/current-state.md`.

**Source:** Instagram reel #287 (@codingwithsagar) — see `~/workspace/user/saved-references.md`.

## Reading order
1. `PRD.md` — what we're building and why
2. `ARCHITECTURE.md` — how it's built
3. `DATA_MODEL.md` — tables, RLS, seed plan
4. `API_SPEC.md` — actions/endpoints, errors, rate limits
5. `DESIGN.md` — design system (tokens are law)
6. `BUILD_PLAN.md` — timeboxed phases, cut list
7. `DECISIONS.md` — why the stack is what it is
8. `SECURITY.md` + `ETHICS_PRIVACY.md` — biometric data rules (read before touching auth, storage, or verify)
9. `TOOLS.md`, `ENV.md`, `DEPLOYMENT.md` — services and shipping
10. `WORKFLOW.md` — how work + logging happens
11. `TESTING.md`, `RISKS.md`, `PRODUCTION_READINESS.md`
12. `TEAM.md`, `DEMO_DATA.md`, `JUDGE_QA.md`, `GLOSSARY.md`, `SUBMISSION.md`, `RETRO.md`

## Working files
- `changes/current-state.md` — what actually exists right now (read before every session)
- `changes/changelog.md` — verified changes only
- `changes/sessions/` — one file per work session
- `prompts/` — task templates (new-feature, bugfix, refactor, review, deploy-fix, ui-polish, audit-changes)

## Golden rules
- No code before reading PRD + ARCHITECTURE + the task-relevant file.
- Log every change (session file → changelog → current-state) in the same session.
- Unknowns stay "TBD (needs human decision)" — never guess.
