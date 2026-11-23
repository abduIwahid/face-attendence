# Prompt — New feature

Read first: brain/00-START-HERE.md, brain/changes/current-state.md, last 3 session files, brain/PRD.md (scope), brain/DESIGN.md, brain/SECURITY.md + brain/ETHICS_PRIVACY.md if the feature touches faces, photos, location or teacher data.

Feature: <name + one-line description>

Rules:
- Confirm the feature is in PRD scope (MUST/SHOULD/COULD). If not, stop and flag it — do not build out-of-scope work.
- Mock-first: UI complete on stubbed data (all DESIGN.md states), then wire the real API/data.
- One task ≤ ~30 min; split if bigger. Respect the dependency freeze (BUILD_PLAN.md) — no new packages without Wadi's approval.
- Validate all new input with Zod; use the standard API error format.
- Test on a real phone if camera/GPS is involved.
- Finish by logging: new session file, changelog entry, current-state update, BUILD_PLAN checkbox.
