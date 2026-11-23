# Prompt — UI polish

Read first: brain/DESIGN.md (tokens are law), brain/changes/current-state.md, the page/component's session file.

Target: <page/component + what looks/feels off>

Rules:
- Tokens only — if a needed value isn't in DESIGN.md, add it there first, then use it.
- No gradients, no glassmorphism, no new colours, no new fonts, no new icon library.
- Check every state of the touched components (hover/focus/disabled/loading/empty/error) — polish that only fixes the default state is not done.
- Verify at phone width first, then the full width range (320–1920, no overflow, tap targets ≥ 44px).
- Before/after screenshot in the session file where possible.
- Finish by logging: session file, changelog entry, current-state update.
