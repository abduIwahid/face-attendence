# Prompt — Review

Read first: brain/00-START-HERE.md, brain/PRD.md, brain/DESIGN.md, brain/SECURITY.md, brain/ETHICS_PRIVACY.md, the session file(s) for the work under review.

Scope: <feature / PR range / area>

Check, in order:
1. PRD fit — does it do what the scope says, nothing extra?
2. DESIGN — tokens only, no gradients/hardcoded colours, all component states present, mobile clean?
3. SECURITY — sweep table (SECURITY.md): validation, RLS, rate limits, no secrets in client, photo handling.
4. ETHICS — consent, deletion, honest failure language (a failed check is never an accusation).
5. TESTING — which checklist items were actually run; evidence, not claims.

Output: findings list (blocker / should-fix / nit) with file references. Do not fix anything in a review pass — log findings in a session file and let a Builder pass fix them.
