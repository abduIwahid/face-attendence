"use client";

import { Camera } from "lucide-react";
import { useState } from "react";

/**
 * Registration page — Phase 1 skeleton (mock-first, brain/BUILD_PLAN.md).
 * The form and camera area are in place; live selfie capture, face-api.js
 * descriptor extraction and the POST /api/register wiring arrive in Phase 2,
 * once the database schema has been applied.
 */
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [consent, setConsent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      "Registration is not open yet. It arrives in Phase 2, once the database schema is applied — your details were not saved.",
    );
  }

  return (
    <main className="flex flex-1 justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Student registration
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-primary">
          Register your face
        </h1>
        <p className="mt-2 text-base leading-relaxed text-secondary">
          Register once with your name, roll number and a live photo. After
          that, your face plus your location is all you need to mark
          attendance.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* Camera placeholder — the live capture component lands in Phase 2. */}
          <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface-muted px-6 text-center">
            <div className="flex h-56 w-44 items-center justify-center rounded-full border-2 border-dashed border-border-strong">
              <Camera className="h-10 w-10 text-secondary" aria-hidden />
            </div>
            <p className="text-sm font-medium text-primary">Live selfie capture</p>
            <p className="max-w-xs text-sm text-secondary">
              The camera preview will appear here in Phase 2. Centre your face
              in the oval, then tap Capture.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-primary">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="min-h-11 rounded-lg border border-border bg-surface px-3 text-base text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent"
              placeholder="e.g. Abdul Wahid"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="rollNumber" className="text-sm font-medium text-primary">
              Roll number
            </label>
            <input
              id="rollNumber"
              type="text"
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value)}
              className="min-h-11 rounded-lg border border-border bg-surface px-3 text-base uppercase text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent"
              placeholder="e.g. FA24-BAI-024"
            />
          </div>

          <label className="flex items-start gap-3 text-sm leading-relaxed text-secondary">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-accent-strong"
            />
            <span>
              I agree to store my face data (a mathematical descriptor, not a
              video) so the system can recognise me for attendance. I can ask
              the teacher to delete it at any time.
            </span>
          </label>

          {notice ? (
            <p role="status" className="rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent-strong">
              {notice}
            </p>
          ) : null}

          <button
            type="submit"
            className="min-h-11 rounded-lg bg-accent px-4 text-base font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            Register
          </button>
          <p className="text-center text-xs text-secondary">
            Registration opens in Phase 2 — this form is a preview and does not
            save anything yet.
          </p>
        </form>
      </div>
    </main>
  );
}
