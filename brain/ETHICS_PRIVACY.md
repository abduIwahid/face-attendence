# ETHICS & PRIVACY — Face Attendance System

This app processes **biometric data** (face descriptors) and **location data**. Both are sensitive. These rules bind every phase. (Not legal advice — for a real institutional deployment, the institution's own policy and Pakistan's applicable data-protection law must be checked first.)

## Principles
1. **Consent first.** Registration shows a plain-language consent line before the camera opens: what is captured (a photo + a mathematical face descriptor), why (attendance only), and how to get it deleted. `consent_at` is stored on the student row. No consent → no registration.
2. **Descriptors over photos.** The system matches on 128-number descriptors, not on stored face images. A descriptor is still biometric data (it can identify a person and can be compared against other systems' descriptors) — it is NOT anonymous, and is never described as such.
3. **Classroom-only purpose.** Data collected for attendance is used for attendance. No sharing, no selling, no training other models on it, no use in any other project.
4. **Deletion path.** Any student can ask the teacher/Wadi to delete their record: one action removes the `students` row, its descriptor and the stored photo. Deletion is real deletion, not a "deleted" flag. This path is stated at registration.
5. **Minimum retention.** Demo data (DEMO_DATA.md) is deleted or anonymised when the project stops being demoed. A real class's data should not outlive the course.

## Photo retention — open decision
- Keeping the registration photo helps a teacher eyeball disputes, but it is the most sensitive artefact in the system.
- **This doc leans descriptor-only:** delete the photo right after the descriptor is computed, keep the photo only if a dispute flow genuinely needs it.
- Status: TBD (needs human decision) — also CUT LIST item 3 in BUILD_PLAN.md.

## Honest limits (say these out loud — in the demo, the README and interviews)
- **GPS is not proof of presence.** Phone GPS drifts indoors (the source reel itself warns about this: "stand near a window and retry"). Accuracy is recorded on every row; attempts with accuracy worse than 50 m are rejected rather than silently trusted.
- **GPS can be spoofed** with mock-location tools. The radius check raises the cost of a proxy; it does not make spoofing impossible. JUDGE_QA.md has the honest answer.
- **No liveness check in v1** means a photo of a face may pass the matcher. Documented, not hidden (RISKS.md).
- **Face matching is not equally accurate for everyone.** Lighting, camera quality, glasses and head coverings change results; published research shows demographic accuracy gaps in face recognition generally. Mitigations here: generous retry flow, failure reasons shown to the student, and a manual teacher override path in a real deployment (teacher can mark a present-in-person student whose check failed — v1: teacher notes it; the log stays honest).
- **A failed check is never an accusation.** The UI language is "couldn't verify — try again / ask your teacher", never "cheating detected".

## Data inventory (what exists, where, who can see it)
| Data | Where | Who can access |
|---|---|---|
| Descriptor + name + roll no. | Supabase `students` | Server routes (service role); teacher sees name/roll in the log only |
| Registration photo (if retained) | Supabase Storage, private bucket | Teacher via short-lived signed URL |
| Attendance rows (incl. distance, GPS accuracy) | Supabase `attendance` | Teacher |
| Class location | Supabase `class_settings` | Anyone using the verify flow (by design) |

## Before any real-class pilot (hard gate)
- [ ] Every student consents individually (no bulk import of a class list with photos scraped from anywhere)
- [ ] Students without a suitable phone/camera have an equal manual path
- [ ] Wadi has confirmed the institution's position — TBD (needs human decision)
