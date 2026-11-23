# AGENT.md — Face Attendance System

## Project summary (5 lines)
- A phone-web app where a student marks attendance with a live selfie.
- Attendance is written ONLY when the face matches the registered photo AND live GPS is within the class radius.
- Built to kill proxy attendance (a friend marking you present) and slow paper registers.
- Solo project by Abdul Wahid ("Wadi") — portfolio/resume build, 1 week part-time.
- Stack: Next.js (TS) + Supabase + face-api.js in the browser, deployed on Vercel.

- **Core feature:** live selfie → face match + GPS radius check → attendance row (date, time, match result, distance in m).
- **Wow factor:** the double check — face AND location together; either one alone can be proxied, both together can't (cheaply).
- **Current phase:** Phase 0 — brain created, no code yet. Next: setup (see brain/BUILD_PLAN.md).

## Read first
1. `brain/00-START-HERE.md`
2. `brain/changes/current-state.md`
3. Last 3 files in `brain/changes/sessions/`
4. Then only the brain file(s) relevant to the task.

## Hard rules
- DESIGN.md tokens only — no hardcoded colours, no gradients, no glassmorphism.
- Never commit secrets. `.env.local` is gitignored; only `.env.example` is tracked.
- Validate ALL input at the boundary (Zod) — names, roll numbers, descriptors, coordinates.
- Face descriptors are biometric data — treat as sensitive (see brain/ETHICS_PRIVACY.md, brain/SECURITY.md).
- Keep the deployed app working at all times — deploy early, deploy often.
- Mock-first: UI on stubbed data first, then wire real services.
- Log every change per brain/WORKFLOW.md (session file + changelog + current-state).
- Tasks under ~30 minutes; commit after each task.
- **Dependency freeze at 75% of budget** — after that, no new packages/services without Wadi's approval.
- Ask before: adding a dependency, adding a service, changing architecture.

## Commands (once scaffolded — Phase 0)
| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Local dev server |
| `npm run build` | Production build (must pass before deploy) |
| `npm run lint` | Lint |
| `npm test` | Automated tests (core feature only) |
| `npm run seed` | Seed demo data (see brain/DEMO_DATA.md) |
| `npx vercel --prod` | Deploy to production |

## Definition of done (any task)
- [ ] Works on a real phone browser (camera + GPS are phone features — desktop-only testing is not done)
- [ ] Build + lint pass
- [ ] Matches DESIGN.md tokens; loading / empty / error states present
- [ ] Session file written; changelog + current-state updated
- [ ] Committed with a Conventional Commit message
