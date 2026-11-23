# Prompt — Deploy fix

Read first: brain/DEPLOYMENT.md, brain/changes/current-state.md, the last session file.

Problem: <what is broken in production / the deploy>

Rules:
- Read the actual Vercel build/runtime logs before changing anything; quote the failing line in the session file.
- Fix the smallest thing that restores production. No features, no refactors in a deploy fix.
- Re-deploy, then run the full post-deploy smoke test (DEPLOYMENT.md) on a phone.
- If the root cause is a free-tier limit or a paused Supabase project, say so plainly and note the wake-up step — do not paper over it with code.
- Finish by logging: session file (cause + fix + smoke-test result), changelog entry, current-state update.
