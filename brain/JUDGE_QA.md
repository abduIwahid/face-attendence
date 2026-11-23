# JUDGE Q&A — likely interview questions about this project

The "judges" here are interviewers/recruiters (placement framing). Answer honestly — every answer below matches the shipped design; update if the build changes.

**Q1. How does the face matching actually work?**
face-api.js runs three small neural nets in the browser: TinyFaceDetector finds the face, a landmarks net aligns it, and the recognition net converts it into a 128-number descriptor — a point in face-space. At registration I store that descriptor. At verify time I compute the live descriptor and take the Euclidean distance to the stored one; below the threshold (0.6 default, tuned on my demo set) it's the same person. No images are compared pixel-by-pixel, and no server-side ML runs at all.

**Q2. Why client-side matching? What does it cost you?**
Cost and simplicity: no ML server to host or keep awake on free tiers, and the camera is already in the browser. The honest cost is trust — a tampered client could lie about the match result. My server still independently re-checks location, GPS accuracy, duplicates and rate limits, and the schema stores descriptors server-side so moving the comparison server-side later is a move, not a rewrite. For a classroom-scale v1 that trade-off is deliberate and documented.

**Q3. Can't students just spoof their GPS?**
Yes — mock-location apps exist, and I say so in the README. The system raises the cost of a proxy rather than claiming to make it impossible: the attacker now needs the real student's face AND a spoofed location at the right time, instead of just a signature on paper. I also record GPS accuracy on every row and reject fixes coarser than 250 m outright. Defeating determined spoofing would need platform attestation, which is out of scope for a web app — knowing where your system's guarantees end is part of the engineering.

**Q4. What stops someone holding up a photo of the student?**
In v1, honestly: nothing reliable — there's no liveness detection, and I list it as a known limitation. The standard next step is an active liveness challenge (blink / turn your head) using the landmarks model I already load, which is on the roadmap. A passive approach (texture analysis) needs a heavier model. I'd rather ship a documented limit than a fake "anti-spoof" claim.

**Q5. How do you handle indoor GPS drift?**
Three ways: the radius is teacher-configurable (default 100 m, not a tight 10 m); the client samples GPS fixes for a few seconds and keeps the most accurate one, and the radius is judged on the accuracy-aware effective distance (raw distance minus the fix's own accuracy), because a single indoor fix can be 100–200 m off — my own first phone test reported me 165 m from the exact spot I was sitting in; and attempts with accuracy worse than 250 m are rejected with a clear message — the UI literally suggests moving near a window and retrying, which is what the original concept this is based on does too. The raw distance in metres is stored on the record, so a teacher can see a marginal pass was marginal.

**Q6. Isn't storing face data a privacy problem?**
Yes, and it's treated as biometric data throughout: consent is captured at registration, I store descriptors rather than relying on photo comparison, photos (if kept at all) sit in a private bucket behind signed URLs, row-level security is on from the first migration, and there's a real deletion path — a student can have their row, descriptor and photo removed. The ethics doc also covers accuracy bias and why a failed check is never framed as an accusation.

**Q7. How accurate is it, really?**
face-api's recognition model is a ResNet-style network trained on a large public face dataset; in my own tuning session with the five demo students I recorded same-person vs different-person distances before locking the 0.6 threshold — the numbers are in the Phase 2 session file. It degrades with poor light, extreme angles and covered faces, which is why the retry flow and failure reasons matter more than a headline accuracy number.

**Q8. Why Next.js + Supabase instead of a Python backend, since this is an ML project?**
Because the ML runs in the browser, the backend's job is data, auth and rules — and Next.js + Supabase gives me Postgres, storage, auth and RLS in one account, deployed free on Vercel, in a stack I already ship in. If browser matching hadn't been accurate enough, my documented fallback was a FastAPI + DeepFace service behind the same API shape. Choosing the boring backend is what let a one-week solo budget go into the actual feature.
