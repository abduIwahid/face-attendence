"use client";

import { AlertTriangle, CheckCircle2, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CameraCapture, { type FaceCapture } from "../../components/CameraCapture";
import LocationStatus, { type LocationState } from "../../components/LocationStatus";
import { haversineMeters } from "../../lib/geo";

interface ClassSettings {
  class_name: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
}

interface GeoFix {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

type VerifyData =
  | { status: "PRESENT"; face_match: string; distance_meters: number }
  | { status: "FAILED"; face_match: string; distance_meters: number; reason?: string };

/**
 * Verify page — Mark Attendance (brain/BUILD_PLAN.md Phase 2).
 * Roll number + live selfie + live GPS go to POST /api/verify; the server
 * re-checks everything (brain/API_SPEC.md). This page only presents the
 * outcome in plain language — a failed check is never an accusation
 * (brain/ETHICS_PRIVACY.md).
 */
export default function VerifyPage() {
  const [rollNumber, setRollNumber] = useState("");
  const [capture, setCapture] = useState<FaceCapture | null>(null);
  const [captureSession, setCaptureSession] = useState(0);
  const [location, setLocation] = useState<GeoFix | null>(null);
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [settings, setSettings] = useState<ClassSettings | null>(null);
  const [settingsMissing, setSettingsMissing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<VerifyData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/class-settings");
        const payload: unknown = await response.json().catch(() => null);
        if (cancelled) return;
        if (
          payload !== null &&
          typeof payload === "object" &&
          "ok" in payload &&
          payload.ok === true &&
          "data" in payload
        ) {
          setSettings(payload.data as ClassSettings);
        } else {
          setSettingsMissing(true);
        }
      } catch {
        if (!cancelled) setSettingsMissing(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const estimatedDistance =
    location && settings
      ? haversineMeters(
          { latitude: location.latitude, longitude: location.longitude },
          { latitude: settings.latitude, longitude: settings.longitude },
        )
      : null;

  function handleShareLocation() {
    if (!("geolocation" in navigator)) {
      setLocationState("unavailable");
      return;
    }
    setLocationState("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracyMeters = Math.max(1, Math.round(position.coords.accuracy));
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters,
        });
        setLocationState(accuracyMeters > 50 ? "inaccurate" : "ok");
      },
      (geoError) => {
        setLocationState(
          geoError.code === geoError.PERMISSION_DENIED ? "denied" : "unavailable",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  function resetAttempt() {
    setResult(null);
    setErrorMessage(null);
    setCapture(null);
    setCaptureSession((session) => session + 1);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!capture || !location) return;
    setSubmitting(true);
    setResult(null);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll_number: rollNumber,
          descriptor: capture.descriptor,
          latitude: location.latitude,
          longitude: location.longitude,
          gps_accuracy_meters: location.accuracyMeters,
        }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (
        payload !== null &&
        typeof payload === "object" &&
        "ok" in payload &&
        payload.ok === true &&
        "data" in payload
      ) {
        setResult(payload.data as VerifyData);
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
          : "Attendance could not be checked. Please try again.";
      setErrorMessage(message);
    } catch {
      setErrorMessage("Attendance could not be checked — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    !submitting &&
    capture !== null &&
    location !== null &&
    locationState === "ok" &&
    rollNumber.trim().length >= 3;

  return (
    <main className="flex flex-1 justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Mark attendance
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-primary">
          Verify it is you, here
        </h1>
        <p className="mt-2 text-base leading-relaxed text-secondary">
          Take a live selfie and share your location. Attendance is marked
          only when your face matches your registered photo{" "}
          <strong>and</strong> you are inside the class radius.
          {settings ? (
            <>
              {" "}
              Class: <strong className="text-primary">{settings.class_name ?? "Class"}</strong>{" "}
              (radius {settings.radius_meters} m).
            </>
          ) : null}
        </p>

        {settingsMissing ? (
          <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
            The class location has not been set yet, so attendance cannot be
            checked. Please ask your teacher to set it from the teacher
            dashboard.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
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

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-primary">1. Take a live selfie</p>
            <CameraCapture
              key={captureSession}
              active
              captureLabel="Capture my selfie"
              onCapture={setCapture}
              onClear={() => setCapture(null)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-primary">2. Share your location</p>
            <button
              type="button"
              onClick={handleShareLocation}
              disabled={locationState === "requesting"}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-base font-semibold text-primary transition-colors hover:bg-surface-muted disabled:opacity-60"
            >
              <MapPin className="h-5 w-5" aria-hidden />
              {location ? "Share my location again" : "Share my location"}
            </button>
            <LocationStatus
              state={locationState}
              accuracyMeters={location?.accuracyMeters}
              distanceMeters={estimatedDistance}
              radiusMeters={settings?.radius_meters}
            />
            <p className="text-xs leading-relaxed text-secondary">
              Phone GPS can be inaccurate indoors. If your fix is too rough,
              stand near a window and share your location again.
            </p>
          </div>

          {result?.status === "PRESENT" ? (
            <div role="status" className="rounded-xl border border-accent bg-accent-soft px-5 py-4">
              <p className="flex items-center gap-2 text-lg font-bold text-accent-strong">
                <CheckCircle2 className="h-6 w-6 shrink-0" aria-hidden />
                Present
              </p>
              <p className="mt-1 text-sm leading-relaxed text-accent-strong">
                Face matched, and you are {result.distance_meters} m from the
                class — inside the radius. Your attendance for today is
                recorded.
              </p>
            </div>
          ) : null}

          {result?.status === "FAILED" ? (
            <div role="alert" className="rounded-xl border border-danger bg-danger-soft px-5 py-4">
              <p className="flex items-center gap-2 text-lg font-bold text-danger">
                <AlertTriangle className="h-6 w-6 shrink-0" aria-hidden />
                {result.reason === "TOO_FAR"
                  ? "You are outside the class area"
                  : "We could not match your face"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-danger">
                {result.reason === "TOO_FAR"
                  ? `You are about ${result.distance_meters} m from the class, outside the ${settings?.radius_meters ?? ""} m radius. Attendance is only marked inside the class area — this attempt has been logged.`
                  : "Your selfie did not match the registered photo for this roll number. Try again in better light, facing the camera directly. If it keeps failing, ask your teacher — this attempt has been logged."}
              </p>
            </div>
          ) : null}

          {errorMessage ? (
            <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
              {errorMessage}
            </p>
          ) : null}

          {result ? (
            <button
              type="button"
              onClick={resetAttempt}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 text-base font-semibold text-primary transition-colors hover:bg-surface-muted"
            >
              Try again
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-base font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : null}
              {submitting ? "Checking…" : "Mark attendance"}
            </button>
          )}
          {!result ? (
            <p className="text-center text-xs text-secondary">
              {rollNumber.trim().length < 3
                ? "Enter your roll number to continue."
                : !capture
                  ? "Capture your selfie above, then share your location."
                  : locationState !== "ok"
                    ? "Share a location fix accurate to ±50 m or better."
                    : "Everything is ready — tap Mark attendance."}
            </p>
          ) : null}
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          Not registered yet?{" "}
          <Link href="/register" className="font-semibold text-accent-strong underline">
            Register your face first
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
