# RISKS — Face Attendance System

| # | Risk | Likelihood | Impact | Fallback / mitigation |
|---|---|---|---|---|
| R-01 | Browser face matching too inaccurate (false rejects in classroom light, false accepts between similar faces) | Medium | Core feature fails | Tune threshold on the demo set (ADR-006); better capture UX (oval guide, light prompt, retakes). If still bad → **ADR-005: FastAPI + DeepFace backend** (needs Wadi's approval — architecture change) |
| R-02 | Indoor GPS drift makes the radius check unusable in the actual classroom | High | Core feature fails in the real setting | Accuracy recorded per attempt; reject > 50 m accuracy with a clear retry message; radius teacher-configurable up to 1000 m; demo location verified on site before seeding (DEMO_DATA.md) |
| R-03 | GPS spoofing / mock locations used to proxy | Medium | Anti-proxy claim weakens | Accepted + documented honestly (ETHICS_PRIVACY.md, JUDGE_QA.md Q3); no fake counter-claims |
| R-04 | Tampered client lies about the face-match result (client-side matching) | Medium | A technical student can bypass | Server re-checks everything else (distance, accuracy, duplicate, rate limit); hardening path = server-side descriptor compare (ARCHITECTURE.md); accepted for v1 scope |
| R-05 | Photo-of-photo passes (no liveness) | High | Proxy still possible with effort | Documented limit; liveness challenge is first on the post-v1 roadmap; never marketed as solved |
| R-06 | Free-tier limits: Supabase project pauses on inactivity; Vercel Hobby limits | Medium | Demo link dead at the worst moment | Verify current limits at setup (TOOLS.md); wake the project before any demo; keep the fallback demo video (BUILD_PLAN Phase 6) |
| R-07 | face-api.js unmaintained / breaks with a browser update | Low–Medium | Camera pages break | Pin the version; self-host weights; DeepFace fallback (R-01) is also the exit here |
| R-08 | Scope creep (multi-class, timetables, admin panel) eats the week | Medium | Nothing ships | PRD non-goals + scope freeze at Phase 4 + CUT LIST order in BUILD_PLAN.md |
| R-09 | Camera/GPS permissions denied or unsupported browser | Medium | Individual students can't verify | Every denial has an explicit state + instructions (DESIGN.md); teacher manual note path for real use (ETHICS_PRIVACY.md) |
| R-10 | Consent mishandled for demo classmates' faces | Low | Real ethical/reputational harm | Consent before capture, fictional-labelled alternatives, demo-data cleanup rule (DEMO_DATA.md) |
