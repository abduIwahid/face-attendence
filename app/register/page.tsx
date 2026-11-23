"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CameraCapture, { type FaceCapture } from "../../components/CameraCapture";

/**
 * Registration page — Phase 2, live (brain/BUILD_PLAN.md).
 * Consent is shown and ticked BEFORE the camera opens (brain/ETHICS_PRIVACY.md
 * principle 1). The browser computes the face descriptor; the server stores
 * it via POST /api/register (brain/API_SPEC.md).
 */
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [consent, setConsent] = useState(false);
  const [capture, setCapture] = useState<FaceCapture | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredName, setRegisteredName] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!capture) {
      setError("Please capture your selfie first — the Register button needs a face to store.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          roll_number: rollNumber,
          descriptor: capture.descriptor,
          photo: capture.photoBase64,
          consent: true,
        }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (
        payload !== null &&
        typeof payload === "object" &&
        "ok" in payload &&
        payload.ok === true
      ) {
        setRegisteredName(name.trim());
        return;
      }
      const message =
        payload !== null &&
        typeof payload === "object" &&
        "error" in payload &&
        payload.error !== null &&
        typeof payload.error === "object" &&
        "message" in payload.error &&
        typeof payload.error.message === "string"
          ? payload.error.message
          : "Registration failed. Please try again.";
      setError(message);
    } catch {
      setError("Registration failed — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (registeredName) {
    return (
      <main className="flex flex-1 justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-md">
            <CheckCircle2 className="mx-auto h-12 w-12 text-accent-strong" aria-hidden />
            <h1 className="mt-4 text-2xl font-bold leading-tight text-primary">
              You are registered, {registeredName}
            </h1>
            <p className="mt-2 text-base leading-relaxed text-secondary">
              Your face is on record for roll number{" "}
              <strong className="text-primary">{rollNumber.trim().toUpperCase()}</strong>.
              From now on, a selfie inside the class radius marks your
              attendance. You can ask your teacher to delete your record at
              any time.
            </p>
            <Link
              href="/verify"
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-accent px-4 text-base font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Mark attendance
            </Link>
          </div>
        </div>
      </main>
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
              I agree to store my face data (a photo and a mathematical
              descriptor, not a video) so the system can recognise me for
              attendance. It is used for attendance only, and I can ask the
              teacher to delete it at any time.
            </span>
          </label>

          <CameraCapture
            active={consent}
            inactiveMessage="Tick the consent box above to open the camera. Centre your face in the oval, then tap Capture."
            captureLabel="Capture my selfie"
            onCapture={setCapture}
            onClear={() => setCapture(null)}
          />

          {error ? (
            <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !consent || !capture}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-base font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : null}
            {submitting ? "Registering…" : "Register"}
          </button>
          <p className="text-center text-xs text-secondary">
            {!consent
              ? "Consent is required before the camera opens."
              : !capture
                ? "Capture your selfie above, then tap Register."
                : "Your selfie is ready — tap Register to save it."}
          </p>
        </form>
      </div>
    </main>
  );
}
